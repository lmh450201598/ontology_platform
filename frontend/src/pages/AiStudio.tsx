import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { OntologyData } from '@/src/store/ontologyStore';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  Sparkles, Loader2, Database, Link as LinkIcon, ArrowRight, Plus,
  CheckCircle2, Send, RotateCcw, Download, MessageSquare, Eye, X,
  ChevronDown, ChevronRight, Key, Layers, Trash2, Clock, PenLine,
  History, Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ConversationResponse } from '@/src/api/client';
import { streamConversation } from '@/src/api/streamClient';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { cn } from '@/src/lib/utils';

// ── Mini graph components for preview ─────────────────────────────────────────

const MiniObjectNode = ({ data }: NodeProps) => (
  <div className="px-3 py-2 shadow-md rounded-lg bg-white border-2 min-w-[160px]"
    style={{ borderColor: data.color as string || '#3b82f6' }}>
    <Handle type="target" position={Position.Top} className="w-1.5 h-1.5" style={{ background: data.color as string }} />
    <Handle type="target" position={Position.Left} className="w-1.5 h-1.5" style={{ background: data.color as string }} />
    <div className="flex items-center gap-1.5 mb-1">
      <Database className="w-3 h-3" style={{ color: data.color as string }} />
      <span className="font-bold text-xs text-slate-900">{data.label as string}</span>
    </div>
    <div className="text-[10px] text-slate-400 font-mono">{data.id as string}</div>
    <div className="text-[10px] text-slate-500 mt-1">{(data.propCount as number) || 0} properties</div>
    <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5" style={{ background: data.color as string }} />
    <Handle type="source" position={Position.Right} className="w-1.5 h-1.5" style={{ background: data.color as string }} />
  </div>
);

const miniNodeTypes = { objectType: MiniObjectNode };

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function buildGraphFromOntology(ontology: any) {
  if (!ontology?.objectTypes) return { nodes: [], edges: [] };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 100 });

  ontology.objectTypes.forEach((ot: any) => {
    g.setNode(ot.id, { width: 180, height: 70 });
  });
  (ontology.linkTypes || []).forEach((lt: any) => {
    g.setEdge(lt.sourceObjectId, lt.targetObjectId);
  });

  dagre.layout(g);

  const nodes = ontology.objectTypes.map((ot: any, i: number) => {
    const pos = g.node(ot.id);
    return {
      id: ot.id,
      type: 'objectType',
      position: { x: pos?.x || i * 220, y: pos?.y || i * 120 },
      data: {
        label: ot.name,
        id: ot.id,
        propCount: ot.properties?.length || 0,
        color: COLORS[i % COLORS.length],
      },
    };
  });

  const edges: Edge[] = (ontology.linkTypes || []).map((lt: any) => ({
    id: lt.id,
    source: lt.sourceObjectId,
    target: lt.targetObjectId,
    label: `${lt.name} (${lt.cardinality})`,
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    labelStyle: { fill: '#475569', fontWeight: 500, fontSize: 10 },
    labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
    labelBgPadding: [3, 3] as [number, number],
    labelBgBorderRadius: 3,
  }));

  return { nodes, edges };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  ontology?: any;
  streaming?: boolean;
}

interface ConvRecord {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

function timeLabel(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'Z');
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

const WELCOME_MSG: ChatMessage = {
  role: 'system',
  text: '欢迎使用 AI本体建模！我是你的本体建模助手。\n\n你可以：\n• 描述你的业务领域，我来生成完整的数据本体\n• 要求我添加、修改或删除实体和关系\n• 让我为已有本体添加语义层信息\n• 提问关于本体设计的最佳实践\n\n每次对话我都会在已有本体基础上迭代改进。'
};

// ── Main Component ────────────────────────────────────────────────────────────

export function AiStudio({ data, onUpdate, embedded = false }: { data: OntologyData; onUpdate: (data: OntologyData) => void; embedded?: boolean }) {
  // History
  const [conversations, setConversations] = useState<ConvRecord[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // Conversation
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [applying, setApplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // AbortController for cancelling in-flight AI requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track pending requests per conversation (for background generation)
  const pendingConvRef = useRef<Map<string, { msgs: ChatMessage[]; ontology: any }>>(new Map());

  // Preview ontology
  const [previewOntology, setPreviewOntology] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());

  // Preview graph
  const graphData = useMemo(() => buildGraphFromOntology(previewOntology), [previewOntology]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphData.edges);

  // Save timer ref for debouncing
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [graphData, setNodes, setEdges]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Load conversation list on mount ─────────────────────────────────────────
  useEffect(() => {
    api.getConversations()
      .then(res => setConversations(res.conversations))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  // ── Auto-save conversation (debounced) ──────────────────────────────────────
  const saveConversation = useCallback((convId: string, msgs: ChatMessage[], ontology: any) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.updateConversation(convId, {
        messages: msgs,
        preview_ontology: ontology,
      }).catch(() => {});
    }, 1000);
  }, []);

  // ── Load a conversation ─────────────────────────────────────────────────────
  const loadConversation = async (convId: string) => {
    try {
      const conv = await api.getConversation(convId);
      const msgs: ChatMessage[] = JSON.parse(typeof conv.messages === 'string' ? conv.messages : JSON.stringify(conv.messages));
      const ontology = typeof conv.preview_ontology === 'string' ? JSON.parse(conv.preview_ontology) : conv.preview_ontology;
      setActiveConvId(convId);
      setMessages(msgs.length > 0 ? msgs : [WELCOME_MSG]);
      setPreviewOntology(ontology);
      setSessionId(null); // Will start new session on next message
      if (ontology) setShowPreview(true);
    } catch (err: any) {
      toast.error('加载对话失败');
    }
  };

  // ── Create new conversation ─────────────────────────────────────────────────
  const handleNewConversation = async () => {
    try {
      const conv = await api.createConversation('新对话');
      setConversations(prev => [conv, ...prev]);
      setActiveConvId(conv.id);
      setSessionId(null);
      setPreviewOntology(null);
      setMessages([WELCOME_MSG]);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Delete conversation ─────────────────────────────────────────────────────
  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setSessionId(null);
        setPreviewOntology(null);
        setMessages([WELCOME_MSG]);
      }
      toast.success('对话已删除');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Rename conversation ─────────────────────────────────────────────────────
  const handleRename = async (convId: string) => {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    try {
      await api.updateConversation(convId, { title: renameVal.trim() });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: renameVal.trim() } : c));
      setRenamingId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Auto-title from first user message ──────────────────────────────────────
  const autoTitle = (convId: string, userMsg: string) => {
    const title = userMsg.slice(0, 30) + (userMsg.length > 30 ? '…' : '');
    api.updateConversation(convId, { title }).catch(() => {});
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c));
  };

  // Stop the current in-flight request
  const handleStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setSending(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');

    // Auto-create conversation if none active
    let convId = activeConvId;
    if (!convId) {
      try {
        const conv = await api.createConversation('新对话');
        setConversations(prev => [conv, ...prev]);
        convId = conv.id;
        setActiveConvId(conv.id);
      } catch {
        toast.error('创建对话失败');
        return;
      }
    }

    const newMessages = [...messages, { role: 'user' as const, text: msg }];
    setMessages(newMessages);
    setSending(true);

    // Auto-title on first user message
    const userMsgCount = newMessages.filter(m => m.role === 'user').length;
    if (userMsgCount === 1 && convId) {
      autoTitle(convId, msg);
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Snapshot for background generation
    const capturedConvId = convId;
    const capturedSessionId = sessionId;
    const capturedOntology = previewOntology;

    try {
      // 使用流式API
      let fullResponse = '';
      let finalOntology: any = null;
      let isFirstChunk = true;

      // 添加一个临时的assistant消息用于显示流式内容
      const streamingMsg: ChatMessage = {
        role: 'assistant',
        text: '',
        streaming: true,
      };
      setMessages([...newMessages, streamingMsg]);

      for await (const chunk of streamConversation(
        msg,
        capturedSessionId || undefined,
        !capturedSessionId
      )) {
        // Check if user aborted
        if (abortController.signal.aborted) {
          break;
        }

        if (chunk.error) {
          throw new Error(chunk.error);
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          // 更新流式消息内容
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
              lastMsg.text = fullResponse;
            }
            return newMsgs;
          });
        }

        if (chunk.done) {
          finalOntology = chunk.ontology;
          break;
        }
      }

      // If user switched away, update in background and notify
      const isStillActive = activeConvId === capturedConvId;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: fullResponse,
        ontology: finalOntology,
        streaming: false,
      };
      const updatedMessages = [...newMessages, assistantMsg];

      // Always update messages (component may have re-mounted with same conv)
      if (isStillActive) {
        setMessages(updatedMessages);
      }

      let newOntology = capturedOntology;
      if (finalOntology) {
        newOntology = finalOntology;
        if (isStillActive) {
          setPreviewOntology(finalOntology);
          setShowPreview(true);
        }
      }

      // Persist regardless of whether user is still viewing
      if (capturedConvId) {
        saveConversation(capturedConvId, updatedMessages, newOntology);
      }

      // If background, show toast notification
      if (!isStillActive) {
        toast.success('后台对话已完成，点击查看结果', {
          action: { label: '查看', onClick: () => loadConversation(capturedConvId!) },
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        // User aborted — add a cancelled indicator
        const cancelledMessages = [...newMessages, {
          role: 'assistant' as const,
          text: '⏹ 已停止生成。',
        }];
        setMessages(cancelledMessages);
      } else {
        const errMessages = [...newMessages, { role: 'assistant' as const, text: `Error: ${err.message}` }];
        setMessages(errMessages);
      }
    } finally {
      abortControllerRef.current = null;
      setSending(false);
    }
  };

  const handleApply = async () => {
    if (!sessionId || !previewOntology) return;
    setApplying(true);
    try {
      const result = await api.applyConversationOntology(sessionId);
      onUpdate(result.data);
      toast.success(`已导入 ${previewOntology.objectTypes?.length || 0} 个对象类型和 ${previewOntology.linkTypes?.length || 0} 个关系到数据库。`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setApplying(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedObjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Quick action buttons
  const quickActions = [
    { label: '生成医院管理本体', prompt: '请帮我生成一个医院管理系统的完整本体，包括医生、患者、科室、病房、处方、检查报告等核心实体' },
    { label: '生成电商平台本体', prompt: '请帮我生成一个电商平台的本体，包括商品、订单、用户、店铺、评价、物流等核心实体' },
    { label: '添加语义层', prompt: '请分析当前本体，为所有实体之间添加更丰富的语义关系，并补充缺失的属性' },
    { label: '细化属性', prompt: '请检查当前本体的所有实体，为每个实体补充到至少 8 个属性，确保有主键、名称、描述、状态、创建时间和更新时间' },
  ];

  return (
    <div className={cn("flex h-full gap-0", !embedded && "-m-6")}>
      {/* ── Left: Conversation History Sidebar ────────────────────────────── */}
      <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-slate-200">
          <Button size="sm" className="w-full gap-1.5 h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={handleNewConversation}>
            <Plus className="w-3 h-3" /> 新建对话
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-3 text-slate-400">
              <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">暂无对话记录</p>
              <p className="text-[10px] mt-1">点击上方按钮开始新对话</p>
            </div>
          ) : (
            <div className="py-1">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    'group mx-1 my-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all',
                    activeConvId === conv.id
                      ? 'bg-purple-100 border border-purple-200'
                      : 'hover:bg-slate-100 border border-transparent'
                  )}
                >
                  {renamingId === conv.id ? (
                    <input
                      autoFocus
                      className="w-full text-xs px-1 py-0.5 border border-purple-300 rounded bg-white focus:outline-none"
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onBlur={() => handleRename(conv.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(conv.id); if (e.key === 'Escape') setRenamingId(null); }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <MessageSquare className={cn('w-3.5 h-3.5 shrink-0 mt-0.5',
                        activeConvId === conv.id ? 'text-purple-600' : 'text-slate-400')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium truncate',
                          activeConvId === conv.id ? 'text-purple-800' : 'text-slate-700')}>
                          {conv.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeLabel(conv.updated_at)}</p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setRenamingId(conv.id); setRenameVal(conv.title); }}
                          className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                        >
                          <PenLine className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConv(conv.id, e)}
                          className="p-0.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200 text-center">
          <span className="text-[10px] text-slate-400">{conversations.length} 个对话</span>
        </div>
      </div>

      {/* ── Middle: Chat Panel ─────────────────────────────────────────────── */}
      <div className="flex flex-col bg-white border-r border-slate-200 flex-1"
        style={{ maxWidth: showPreview && previewOntology ? '50%' : '100%', minWidth: 380 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h1 className="font-bold text-lg text-slate-900">AI本体建模</h1>
            {sessionId && (
              <Badge variant="outline" className="font-mono text-[10px] text-purple-600 border-purple-200">
                会话中
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            {previewOntology && (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"
                onClick={() => setShowPreview(!showPreview)}>
                <Eye className="w-3 h-3" /> {showPreview ? '隐藏预览' : '显示预览'}
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'system' && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800 whitespace-pre-wrap">
                  {msg.text}
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              )}
              {msg.role === 'assistant' && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-50 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                    {msg.ontology && (
                      <div className="mt-3 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                          <Layers className="w-3 h-3" />
                          生成了 {msg.ontology.objectTypes?.length || 0} 个实体，
                          {msg.ontology.linkTypes?.length || 0} 个关系
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-3 text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>思考中...</span>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-md px-2 py-0.5 transition-colors bg-white"
                >
                  <Square className="w-2.5 h-2.5" /> 停止
                </button>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick actions (show only when no messages yet) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickActions.map(qa => (
              <button key={qa.label}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                onClick={() => { setInput(qa.prompt); }}>
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          {previewOntology && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-xs text-green-700 flex-1">
                本体预览就绪 ({previewOntology.objectTypes?.length || 0} 实体, {previewOntology.linkTypes?.length || 0} 关系)
              </span>
              <Button size="sm" className="gap-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                导入数据库
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[44px] max-h-[120px] p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
              placeholder="描述你的业务领域，或要求修改当前本体..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            {sending ? (
              <Button onClick={handleStop}
                className="shrink-0 h-[44px] w-[44px] rounded-xl bg-red-500 hover:bg-red-600 p-0">
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!input.trim()}
                className="shrink-0 h-[44px] w-[44px] rounded-xl bg-purple-600 hover:bg-purple-700 p-0">
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Preview Panel ───────────────────────────────────────────── */}
      {showPreview && previewOntology && (
        <div className="flex-1 flex flex-col bg-[#FAFBFC] min-w-[360px]">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-sm text-slate-900">本体预览</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPreview(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mini Graph */}
          <div className="h-[280px] border-b border-slate-200 bg-white">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={miniNodeTypes}
              fitView
              attributionPosition="bottom-right"
              minZoom={0.3}
              maxZoom={1.5}
            >
              <Controls showInteractive={false} className="bg-white border-slate-200 shadow-sm" />
              <Background color="#e2e8f0" gap={20} />
            </ReactFlow>
          </div>

          {/* Object Types Detail List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-blue-700">{previewOntology.objectTypes?.length || 0}</div>
                <div className="text-[10px] font-medium text-blue-600">实体类型</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                <div className="text-lg font-bold text-emerald-700">{previewOntology.linkTypes?.length || 0}</div>
                <div className="text-[10px] font-medium text-emerald-600">语义关系</div>
              </div>
            </div>

            {/* Object Types Accordion */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">实体类型</h3>
              {(previewOntology.objectTypes || []).map((ot: any, i: number) => {
                const expanded = expandedObjects.has(ot.id);
                return (
                  <div key={ot.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <button
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => toggleExpand(ot.id)}>
                      {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                      <Database className="w-3.5 h-3.5" style={{ color: COLORS[i % COLORS.length] }} />
                      <span className="font-medium text-sm text-slate-900 flex-1">{ot.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{ot.properties?.length || 0}</Badge>
                    </button>
                    {expanded && (
                      <div className="px-3 pb-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 py-2">{ot.description}</p>
                        <div className="space-y-1">
                          {(ot.properties || []).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-slate-50">
                              {p.isPrimaryKey && <Key className="w-2.5 h-2.5 text-amber-500" />}
                              <span className="font-medium text-slate-700 flex-1 truncate">{p.name}</span>
                              <Badge variant="outline" className="text-[9px] font-mono h-4 px-1">{p.type}</Badge>
                              {p.typeClasses?.map((tc: string) => (
                                <Badge key={tc} variant="outline" className="text-[8px] font-mono h-4 px-1 text-purple-500 border-purple-200">{tc}</Badge>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Link Types */}
            {previewOntology.linkTypes?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">语义关系</h3>
                {previewOntology.linkTypes.map((lt: any) => {
                  const src = previewOntology.objectTypes?.find((o: any) => o.id === lt.sourceObjectId)?.name || lt.sourceObjectId;
                  const tgt = previewOntology.objectTypes?.find((o: any) => o.id === lt.targetObjectId)?.name || lt.targetObjectId;
                  return (
                    <div key={lt.id} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-medium text-sm text-slate-900">{lt.name}</span>
                        <Badge variant="outline" className="font-mono text-[10px] h-4">{lt.cardinality}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 ml-5">
                        <span>{src}</span><ArrowRight className="w-3 h-3" /><span>{tgt}</span>
                      </div>
                      {lt.description && (
                        <p className="text-xs text-slate-400 mt-1 ml-5 italic">{lt.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

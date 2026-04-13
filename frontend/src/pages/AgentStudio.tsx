import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot, Plus, Play, Pause, Trash2, RefreshCw, ChevronRight,
  AlertTriangle, TrendingUp, TrendingDown, Minus, Clock, Zap,
  FileText, ArrowRight, Activity, Target, Building2, Loader2,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, ExternalLink,
  Sparkles, Search, MessageSquare, Send, Link as LinkIcon, Network, Square,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/src/api/client';
import { streamResearchChat } from '@/src/api/streamClient';
import { cn } from '@/src/lib/utils';
import { searchStocks, StockItem } from '@/src/data/cnStocks';

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Agent {
  id: string;
  name: string;
  description: string;
  target_company: string;
  target_industry: string;
  analysis_focus: string;
  schedule_minutes: number;
  is_active: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AgentEvent {
  id: string;
  agent_id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  event_date: string;
  impact_level: 'high' | 'medium' | 'low';
  related_entities: string[];
  created_at: string;
}

interface ImpactChainItem {
  from: string;
  to: string;
  mechanism: string;
  intensity: 'high' | 'medium' | 'low';
}

interface AgentAnalysis {
  id: string;
  agent_id: string;
  event_id: string | null;
  title: string;
  content: string;
  key_findings: string[];
  impact_chain: ImpactChainItem[];
  recommendation: string;
  created_at: string;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const impactColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const impactIcons = {
  high: TrendingUp,
  medium: Minus,
  low: TrendingDown,
};

function timeAgo(dateStr: string) {
  if (!dateStr) return 'Never';
  // SQLite datetime format: "2026-04-01 06:05:33" → replace space with T and add Z
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Stock Autocomplete ───────────────────────────────────────────────────── */
function StockAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (stock: StockItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<StockItem[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (q: string) => {
    onChange(q);
    const r = searchStocks(q, 8);
    setResults(r);
    setOpen(r.length > 0);
  };

  return (
    <div ref={ref} className="relative">
      <input
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        placeholder="输入代码或名称搜索，如 688981、中芯国际"
        value={value}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map(s => (
            <button
              key={`${s.market}-${s.code}`}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm border-b border-slate-50 last:border-0"
              onClick={() => { onSelect(s); setOpen(false); }}
            >
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                s.market === 'A' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
              )}>
                {s.market === 'A' ? 'A股' : 'H股'}
              </span>
              <span className="font-mono text-xs text-slate-400 w-14 shrink-0">{s.code}</span>
              <span className="font-medium text-slate-800 truncate">{s.name}</span>
              <span className="text-xs text-slate-400 ml-auto shrink-0">{s.industry}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Create Agent Dialog ──────────────────────────────────────────────────── */
function CreateAgentForm({ onCreated, onCancel }: { onCreated: (a: Agent) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    targetCompany: '',
    targetIndustry: '半导体设备',
    analysisFocus: '',
    scheduleMinutes: 60,
  });
  const [creating, setCreating] = useState(false);

  const handleStockSelect = (stock: StockItem) => {
    const label = `${stock.name}（${stock.code}.${stock.market === 'A' ? 'SH/SZ' : 'HK'}）`;
    setForm(prev => ({
      ...prev,
      targetCompany: label,
      targetIndustry: stock.industry,
      name: prev.name || `${stock.name}投研追踪`,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.targetCompany || !form.targetIndustry) {
      toast.error('请填写必填字段');
      return;
    }
    setCreating(true);
    try {
      const res = await api.createResearchAgent(form);
      toast.success('智能体创建成功');
      onCreated(res.agent);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Bot className="w-5 h-5 text-blue-600" />
        创建投研智能体
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            目标上市公司 *
            <span className="text-slate-400 font-normal ml-1">（支持A股/H股代码或名称搜索）</span>
          </label>
          <StockAutocomplete
            value={form.targetCompany}
            onChange={v => setForm({ ...form, targetCompany: v })}
            onSelect={handleStockSelect}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">智能体名称 *</label>
          <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="如：北方华创投研追踪"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">所属行业 *</label>
          <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            value={form.targetIndustry} onChange={e => setForm({ ...form, targetIndustry: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">定时执行间隔（分钟）</label>
          <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            value={form.scheduleMinutes} onChange={e => setForm({ ...form, scheduleMinutes: +e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">研究重点</label>
          <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            placeholder="如：国产替代进展、大客户订单、产能扩张…"
            value={form.analysisFocus} onChange={e => setForm({ ...form, analysisFocus: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">描述</label>
          <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
            rows={2} placeholder="简要说明该智能体的监控目标和分析范围…"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={handleSubmit} disabled={creating} className="gap-2">
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          创建智能体
        </Button>
      </div>
    </div>
  );
}

/* ─── Event Timeline ───────────────────────────────────────────────────────── */
function EventTimeline({ events }: { events: AgentEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No events discovered yet. Run the agent to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((evt) => {
        const ImpactIcon = impactIcons[evt.impact_level] || Minus;
        return (
          <div key={evt.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 border', impactColors[evt.impact_level])}>
              <ImpactIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-900 leading-snug">{evt.title}</h4>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0', impactColors[evt.impact_level])}>
                  {evt.impact_level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.summary}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 flex-wrap">
                {evt.event_date && <span>{evt.event_date}</span>}
                {evt.source && (
                  evt.source_url
                    ? <a href={evt.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-0.5">· {evt.source} <ExternalLink className="w-2.5 h-2.5" /></a>
                    : <span>· {evt.source}</span>
                )}
                {evt.related_entities.length > 0 && (
                  <span className="flex items-center gap-1">
                    · <Target className="w-2.5 h-2.5" /> {evt.related_entities.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Analysis Report ──────────────────────────────────────────────────────── */
function AnalysisReport({ analysis }: { analysis: AgentAnalysis }) {
  const [expanded, setExpanded] = useState(true);

  // 安全解析数组字段（后端可能返回 JSON 字符串）
  const keyFindings = (() => {
    try {
      if (!analysis.key_findings) return [];
      if (Array.isArray(analysis.key_findings)) return analysis.key_findings;
      if (typeof analysis.key_findings === 'string') return JSON.parse(analysis.key_findings);
      return [];
    } catch { return []; }
  })();

  const impactChain = (() => {
    try {
      if (!analysis.impact_chain) return [];
      if (Array.isArray(analysis.impact_chain)) return analysis.impact_chain;
      if (typeof analysis.impact_chain === 'string') return JSON.parse(analysis.impact_chain);
      return [];
    } catch { return []; }
  })();

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm">{analysis.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(analysis.created_at)}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Key Findings */}
          {keyFindings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Key Findings
              </h4>
              <div className="space-y-1.5">
                {keyFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Chain */}
          {impactChain.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-500" /> Impact Chain (Ontology-based)
              </h4>
              <div className="flex flex-wrap gap-2">
                {impactChain.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100">{item.from}</span>
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className={cn('text-[9px] px-1 rounded', impactColors[item.intensity])}>{item.mechanism}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">{item.to}</span>
                    {i < impactChain.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {analysis.recommendation && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Investment Recommendation
              </h4>
              <p className="text-sm text-slate-700">{analysis.recommendation}</p>
            </div>
          )}

          {/* Full Report */}
          <details className="group">
            <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-blue-600 flex items-center gap-1">
              <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
              View Full Report
            </summary>
            <div className="mt-3 prose prose-sm prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap border-t border-slate-100 pt-3">
              {analysis.content}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

/* ─── Agent Card ───────────────────────────────────────────────────────────── */
function AgentCard({
  agent,
  selected,
  onSelect,
  onToggle,
  onRun,
  onDelete,
  running,
}: {
  agent: Agent;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onRun: () => void;
  onDelete: () => void;
  running: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
        selected ? 'border-blue-300 bg-blue-50/50 shadow-sm ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
            agent.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">{agent.name}</h3>
            <p className="text-[11px] text-slate-400">{agent.target_company}</p>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onToggle(); }}
          className="text-slate-400 hover:text-slate-600">
          {agent.is_active
            ? <ToggleRight className="w-6 h-6 text-emerald-500" />
            : <ToggleLeft className="w-6 h-6" />}
        </button>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{agent.description || agent.analysis_focus || 'No description'}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {agent.last_run_at ? timeAgo(agent.last_run_at) : 'Never run'}
          </span>
          {agent.schedule_minutes > 0 && (
            <span className="flex items-center gap-1">
              · <RefreshCw className="w-3 h-3" /> Every {agent.schedule_minutes}m
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onRun(); }}
            disabled={running} className="h-6 px-2 text-[11px] gap-1">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run
          </Button>
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); onDelete(); }}
            className="h-6 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Main Component ───────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Ontology Q&A Panel ────────────────────────────────────────────────────── */
const QA_STORAGE_KEY = 'ontology_qa_history';
interface QAMessage { role: 'user' | 'assistant'; text: string; sources?: { uri: string; title: string }[]; chain?: any[]; entities?: string[]; streaming?: boolean; }

function loadQAMessages(): QAMessage[] {
  try {
    const raw = localStorage.getItem(QA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveQAMessages(msgs: QAMessage[]) {
  try { localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}

function OntologyQAPanel({
  messages,
  setMessages,
  loading,
  setLoading,
  agentId,
}: {
  messages: QAMessage[];
  setMessages: React.Dispatch<React.SetStateAction<QAMessage[]>>;
  loading: boolean;
  setLoading: (v: boolean) => void;
  agentId: string | null;
}) {
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const SUGGESTIONS = [
    '新能源车原材料价格上涨，对产业链上下游企业业绩和股价有何影响？',
    '碳酸锂价格大幅下跌，哪些环节最受益，哪些最受损？',
    '光伏组件价格持续下跌，对整个光伏产业链估值有何重塑？',
    '半导体设备国产替代进展如何？对相关标的有何影响？',
  ];

  const addMessages = (updater: (prev: QAMessage[]) => QAMessage[]) => {
    setMessages(prev => {
      const next = updater(prev);
      saveQAMessages(next);
      return next;
    });
  };

  const send = async (q?: string) => {
    const question = (q || input).trim();
    if (!question || loading || !agentId) return;
    setInput('');
    addMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    abortRef.current = new AbortController();
    try {
      let fullResponse = '';
      
      // 添加一个临时的assistant消息用于显示流式内容
      addMessages(prev => [...prev, { role: 'assistant', text: '', streaming: true }]);

      for await (const chunk of streamResearchChat(agentId, question)) {
        // Check if aborted
        if (abortRef.current?.signal.aborted) {
          break;
        }

        if (chunk.error) {
          throw new Error(chunk.error);
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          // 更新流式消息内容
          addMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
              lastMsg.text = fullResponse;
            }
            return newMsgs;
          });
        }

        if (chunk.done) {
          break;
        }
      }

      // 完成流式输出，更新最终消息
      addMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.streaming = false;
          lastMsg.text = fullResponse;
        }
        return newMsgs;
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        addMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => { abortRef.current?.abort(); setLoading(false); };

  const clearHistory = () => {
    addMessages(() => []);
    toast.success('对话历史已清空');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-600" />
            产业图谱智能问答
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">基于本体图谱逻辑 + 实时市场数据，回答产业链开放性问题</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> 清空
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 text-center py-4">选择一个问题开始，或自己输入</p>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="w-full text-left text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white')}>
              {m.role === 'user' ? 'U' : 'AI'}
            </div>
            <div className={cn('flex-1 max-w-[85%]', m.role === 'user' ? 'items-end flex flex-col' : '')}>
              <div className={cn('rounded-xl px-4 py-3 text-sm',
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800')}>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>

              {/* Reasoning chain */}
              {m.chain && m.chain.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="text-[10px] font-semibold text-amber-700 mb-2 uppercase tracking-wider">传导路径</div>
                  <div className="space-y-1">
                    {m.chain.map((step: any, si: number) => (
                      <div key={si} className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 shrink-0">{step.step}.</span>
                        <span className="font-medium text-slate-700">{step.from}</span>
                        <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="font-medium text-slate-700">{step.to}</span>
                        <span className="text-slate-400">· {step.mechanism}</span>
                        <span className={cn('ml-auto text-[10px] px-1.5 py-0.5 rounded',
                          step.impact === 'high' ? 'bg-red-100 text-red-600' : step.impact === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600')}>
                          {step.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities + sources */}
              {(m.entities?.length || m.sources?.length) ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.entities?.map((e, ei) => (
                    <span key={ei} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                      {e}
                    </span>
                  ))}
                  {m.sources?.slice(0, 3).map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 hover:text-blue-600 flex items-center gap-0.5">
                      <LinkIcon className="w-2.5 h-2.5" />
                      {s.title?.slice(0, 20) || '来源'}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span className="text-sm text-slate-500">正在搜索和分析...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="输入产业链相关问题..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading}
          />
          {loading ? (
            <Button size="sm" variant="outline" onClick={stop} className="h-10 gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <Square className="w-3.5 h-3.5" /> 停止
            </Button>
          ) : (
            <Button size="sm" onClick={() => send()} disabled={!input.trim()} className="h-10 gap-1.5">
              <Send className="w-3.5 h-3.5" /> 发送
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function AgentStudio() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [analyses, setAnalyses] = useState<AgentAnalysis[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'events' | 'analyses'>('analyses');
  const [mainTab, setMainTab] = useState<'agents' | 'qa'>('agents');

  // Q&A state lifted here so it survives tab switches; persisted to localStorage
  const [qaMessages, setQaMessages] = useState<QAMessage[]>(loadQAMessages);
  const [qaLoading, setQaLoading] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedId) || null;

  /* ── Load agents ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    api.getResearchAgents()
      .then(res => {
        setAgents(res.agents);
        if (res.agents.length > 0) setSelectedId(res.agents[0].id);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── Load events & analyses when selection changes ───────────────────────── */
  useEffect(() => {
    if (!selectedId) { setEvents([]); setAnalyses([]); return; }
    Promise.all([
      api.getAgentEvents(selectedId),
      api.getAgentAnalyses(selectedId),
    ]).then(([evtRes, anaRes]) => {
      setEvents(evtRes.events);
      setAnalyses(anaRes.analyses);
    }).catch(err => toast.error(err.message));
  }, [selectedId]);

  /* ── Handlers ────────────────────────────────────────────────────────────── */
  const handleToggle = async (agent: Agent) => {
    try {
      const res = await api.updateResearchAgent(agent.id, { is_active: !agent.is_active });
      setAgents(prev => prev.map(a => a.id === agent.id ? res.agent : a));
      toast.success(res.agent.is_active ? 'Agent activated' : 'Agent paused');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRun = async (agentId: string) => {
    setRunning(agentId);
    try {
      const result = await api.runResearchAgent(agentId);
      toast.success(`Discovered ${result.events?.length || 0} events, generated analysis`);
      // Refresh data
      const [evtRes, anaRes] = await Promise.all([
        api.getAgentEvents(agentId),
        api.getAgentAnalyses(agentId),
      ]);
      setEvents(evtRes.events);
      setAnalyses(anaRes.analyses);
      // Update agent last_run_at
      const agentsRes = await api.getResearchAgents();
      setAgents(agentsRes.agents);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRunning(null);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      await api.deleteResearchAgent(agentId);
      setAgents(prev => prev.filter(a => a.id !== agentId));
      if (selectedId === agentId) {
        setSelectedId(agents.find(a => a.id !== agentId)?.id || null);
      }
      toast.success('Agent deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading agents...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] -m-6">
      {/* ── Top Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
        <button
          onClick={() => setMainTab('agents')}
          className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            mainTab === 'agents' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}
        >
          <Bot className="w-4 h-4" /> Research Agents
        </button>
        <button
          onClick={() => setMainTab('qa')}
          className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            mainTab === 'qa' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700')}
        >
          <MessageSquare className="w-4 h-4" /> 产业链智能问答
        </button>
      </div>

      {/* ── Q&A Panel ───────────────────────────────────────────────────────── */}
      <div className={cn('flex-1 min-h-0', mainTab !== 'qa' && 'hidden')}>
        <OntologyQAPanel
          messages={qaMessages}
          setMessages={setQaMessages}
          loading={qaLoading}
          setLoading={setQaLoading}
          agentId={selectedId}
        />
      </div>

      {/* ── Agents Panel ────────────────────────────────────────────────────── */}
      <div className={cn('flex-1 flex gap-6 min-h-0 p-6', mainTab !== 'agents' && 'hidden')}>
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Research Agents
          </h2>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setShowCreate(true)}>
            <Plus className="w-3 h-3" /> New
          </Button>
        </div>

        {showCreate && (
          <CreateAgentForm
            onCreated={(a) => {
              setAgents(prev => [a, ...prev]);
              setSelectedId(a.id);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {agents.length === 0 && !showCreate ? (
            <div className="text-center py-16 text-slate-400">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No agents yet</p>
              <p className="text-xs mt-1">Create a research agent to start tracking events</p>
              <Button size="sm" className="mt-4 gap-1" onClick={() => setShowCreate(true)}>
                <Plus className="w-3 h-3" /> Create Agent
              </Button>
            </div>
          ) : (
            agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selectedId === agent.id}
                onSelect={() => setSelectedId(agent.id)}
                onToggle={() => handleToggle(agent)}
                onRun={() => handleRun(agent.id)}
                onDelete={() => handleDelete(agent.id)}
                running={running === agent.id}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right: Agent Detail ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {selectedAgent ? (
          <>
            {/* Agent Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                    selectedAgent.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400')}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">{selectedAgent.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3 h-3" />
                      {selectedAgent.target_company} · {selectedAgent.target_industry}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium',
                    selectedAgent.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                    {selectedAgent.is_active ? '● Active' : '○ Paused'}
                  </span>
                  <Button size="sm" onClick={() => handleRun(selectedAgent.id)}
                    disabled={running === selectedAgent.id} className="gap-1.5">
                    {running === selectedAgent.id
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                      : <><Play className="w-3.5 h-3.5" /> Run Now</>}
                  </Button>
                </div>
              </div>
              {selectedAgent.analysis_focus && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium text-slate-600">Focus:</span> {selectedAgent.analysis_focus}
                </div>
              )}
              <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last run: {selectedAgent.last_run_at ? timeAgo(selectedAgent.last_run_at) : 'Never'}</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Schedule: every {selectedAgent.schedule_minutes}m</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {events.length} events · {analyses.length} analyses</span>
              </div>
            </div>

            {/* Running Banner */}
            {running === selectedAgent.id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <div>
                  <span className="font-medium">Agent is running...</span>
                  <span className="text-blue-500 ml-2">Discovering events → Analyzing with ontology context → Generating report</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setDetailTab('analyses')}
                className={cn('px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                  detailTab === 'analyses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Analyses ({analyses.length})</span>
              </button>
              <button
                onClick={() => setDetailTab('events')}
                className={cn('px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                  detailTab === 'events' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Events ({events.length})</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {detailTab === 'analyses' ? (
                analyses.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No analyses yet</p>
                    <p className="text-xs mt-1">Run the agent to generate an AI-powered research report</p>
                  </div>
                ) : (
                  analyses.map(a => <AnalysisReport key={a.id} analysis={a} />)
                )
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <EventTimeline events={events} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Select an agent to view details</p>
              <p className="text-sm mt-1">Or create a new research agent</p>
            </div>
          </div>
        )}
      </div>
    </div>{/* end agents panel */}
    </div>
  );
}

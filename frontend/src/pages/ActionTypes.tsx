import React, { useState, useEffect } from 'react';
import { OntologyData, ActionType } from '@/src/store/ontologyStore';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Search, Plus, PlayCircle, Database, Trash2, Loader2, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, Shield, Webhook, History, ArrowRight, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/api/client';
import { cn } from '@/src/lib/utils';

interface ActionExecution {
  id: string;
  action_type_id: string;
  action_name?: string;
  target_object_id: string;
  parameters: Record<string, any>;
  status: string;
  validation_errors: string[];
  side_effects: { rule: string; description: string; status: string; detail?: string }[];
  result: any;
  executed_by: string;
  created_at: string;
  completed_at: string | null;
}

// ── Execution Panel Component ───────────────────────────────────────────────

function ExecutionPanel({
  action,
  objectTypes,
  onClose,
}: {
  action: ActionType;
  objectTypes: OntologyData['objectTypes'];
  onClose: () => void;
}) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    executionId: string;
    validationErrors?: string[];
    sideEffects?: any[];
    result?: any;
  } | null>(null);
  const [executions, setExecutions] = useState<ActionExecution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'execute' | 'history'>('execute');

  const targetObject = objectTypes.find(ot => ot.id === action.targetObjectId);

  // Load execution history
  useEffect(() => {
    setLoadingHistory(true);
    api.getActionExecutions(action.id)
      .then(res => setExecutions(res.executions))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [action.id]);

  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);
    try {
      const res = await api.executeAction(action.id, params);
      setResult(res);
      if (res.status === 'completed') {
        toast.success(`动作 "${action.name}" 执行成功。`);
        // Refresh history
        api.getActionExecutions(action.id).then(r => setExecutions(r.executions));
      } else if (res.status === 'failed' && res.validationErrors) {
        toast.error(`验证失败: ${res.validationErrors.join('; ')}`);
      } else {
        toast.error(`执行失败: ${res.status}`);
      }
    } catch (err: any) {
      // 400 returns validation errors in body
      try {
        const body = JSON.parse(err.message.replace(/^.*?(\{)/, '$1'));
        setResult(body);
        if (body.validationErrors) {
          toast.error(`验证失败: ${body.validationErrors.join('; ')}`);
        } else {
          toast.error(err.message);
        }
      } catch {
        setResult({ status: 'error', executionId: '', validationErrors: [err.message] });
        toast.error(err.message);
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleReset = () => {
    setParams({});
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
      <div
        className="w-[560px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-purple-600" />
                {action.name}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{action.description}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-light">×</button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
            <Database className="w-3 h-3 text-blue-500" />
            Target: <span className="font-medium text-slate-700">{targetObject?.name || action.targetObjectId}</span>
            <span className="mx-1">·</span>
            {action.parameters.length} params
            <span className="mx-1">·</span>
            {action.rules.length} rules
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('execute')}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'execute'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50/50'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1.5" />
            执行
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'history'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50/50'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <History className="w-3.5 h-3.5 inline mr-1.5" />
            历史 ({executions.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'execute' ? (
            <div className="p-6 space-y-6">
              {/* Parameter Form */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  参数
                </h3>
                {action.parameters.length === 0 ? (
                  <div className="text-sm text-slate-400 italic">未定义参数。</div>
                ) : (
                  <div className="space-y-3">
                    {action.parameters.map((p, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <Label className="text-xs">
                          {p.name}
                          {p.required && <span className="text-red-500 ml-0.5">*</span>}
                          <span className="text-slate-400 ml-1.5 font-normal">({p.type})</span>
                        </Label>
                        {p.type === 'boolean' ? (
                          <Select
                            value={params[p.name] || ''}
                            onValueChange={v => setParams(prev => ({ ...prev, [p.name]: v }))}
                          >
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={params[p.name] || ''}
                            onChange={e => setParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                            placeholder={`Enter ${p.name}...`}
                            className="h-9"
                            type={p.type === 'integer' || p.type === 'double' ? 'number' : 'text'}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules Preview */}
              {action.rules.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Rules
                  </h3>
                  <div className="space-y-2">
                    {action.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        {rule.type === 'validation' && <Shield className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />}
                        {rule.type === 'side_effect' && <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />}
                        {rule.type === 'webhook' && <Webhook className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />}
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{rule.type}</div>
                          <div className="text-xs text-slate-600">{rule.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execute Button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  {executing ? '执行中...' : '执行动作'}
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-1.5">
                  重置
                </Button>
              </div>

              {/* Result */}
              {result && (
                <div className={cn(
                  'rounded-lg border p-4 space-y-3',
                  result.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                )}>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={cn('font-medium text-sm', result.status === 'success' ? 'text-emerald-800' : 'text-red-800')}>
                      {result.status === 'success' ? '执行成功' : '验证失败'}
                    </span>
                    {result.executionId && (
                      <span className="text-[10px] font-mono text-slate-400 ml-auto">{result.executionId}</span>
                    )}
                  </div>

                  {/* Validation errors */}
                  {result.validationErrors && result.validationErrors.length > 0 && (
                    <div className="space-y-1">
                      {result.validationErrors.map((err, i) => (
                        <div key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          {err}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Side effects */}
                  {result.sideEffects && result.sideEffects.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">副作用：</div>
                      {result.sideEffects.map((se: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs mb-1.5">
                          {se.status === 'triggered' && <Zap className="w-3 h-3 text-amber-500 mt-0.5" />}
                          {se.status === 'skipped' && <ArrowRight className="w-3 h-3 text-slate-400 mt-0.5" />}
                          {se.status === 'simulated' && <Webhook className="w-3 h-3 text-emerald-500 mt-0.5" />}
                          <div>
                            <span className={cn(
                              'font-medium',
                              se.status === 'triggered' ? 'text-amber-700' : se.status === 'skipped' ? 'text-slate-500' : 'text-emerald-700'
                            )}>
                              [{se.status}]
                            </span>{' '}
                            <span className="text-slate-600">{se.detail || se.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Success result */}
                  {result.status === 'success' && result.result?.message && (
                    <div className="text-xs text-emerald-700">{result.result.message}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* History Tab */
            <div className="p-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  加载历史...
                </div>
              ) : executions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无执行记录。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.map(exec => (
                    <div key={exec.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        {exec.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={cn(
                          'text-xs font-semibold uppercase',
                          exec.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                        )}>
                          {exec.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 ml-auto">{exec.id}</span>
                      </div>

                      {/* Parameters used */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(exec.parameters).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {k}: <span className="font-medium">{String(v)}</span>
                          </span>
                        ))}
                      </div>

                      {/* Errors or side effects */}
                      {exec.validation_errors.length > 0 && (
                        <div className="text-[10px] text-red-600 space-y-0.5">
                          {exec.validation_errors.map((e, i) => <div key={i}>• {e}</div>)}
                        </div>
                      )}
                      {exec.side_effects.length > 0 && (
                        <div className="text-[10px] text-amber-600 space-y-0.5">
                          {exec.side_effects.map((se, i) => (
                            <div key={i}>⚡ [{se.status}] {se.description}</div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(exec.created_at + 'Z').toLocaleString()}
                        <span>· 由 {exec.executed_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Parameter row editor ────────────────────────────────────────────────────

interface ParamDef { name: string; type: string; required: boolean; }
interface RuleDef { type: string; description: string; }

const PARAM_TYPES = ['string', 'integer', 'double', 'boolean', 'date', 'timestamp'];
const RULE_TYPES = [
  { value: 'validation', label: '验证', icon: Shield, color: 'text-blue-600' },
  { value: 'side_effect', label: '副作用', icon: Zap, color: 'text-amber-600' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-emerald-600' },
];

function ParamRow({ param, onChange, onRemove }: {
  param: ParamDef;
  onChange: (p: ParamDef) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={param.name}
        onChange={e => onChange({ ...param, name: e.target.value })}
        placeholder="参数名称"
        className="flex-1 h-8 text-sm"
      />
      <Select value={param.type} onValueChange={v => onChange({ ...param, type: v })}>
        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PARAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <button
        onClick={() => onChange({ ...param, required: !param.required })}
        className={cn('text-xs px-2 py-1 rounded border transition-colors', param.required ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200')}
      >
        {param.required ? '必填' : '可选'}
      </button>
      <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function RuleRow({ rule, onChange, onRemove }: {
  rule: RuleDef;
  onChange: (r: RuleDef) => void;
  onRemove: () => void;
}) {
  const ruleType = RULE_TYPES.find(rt => rt.value === rule.type);
  return (
    <div className="flex items-start gap-2">
      <Select value={rule.type} onValueChange={v => onChange({ ...rule, type: v })}>
        <SelectTrigger className="w-32 h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
        <SelectContent>
          {RULE_TYPES.map(rt => (
            <SelectItem key={rt.value} value={rt.value}>
              <span className={rt.color}>{rt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={rule.description}
        onChange={e => onChange({ ...rule, description: e.target.value })}
        placeholder="规则描述..."
        className="flex-1 h-8 text-xs"
      />
      <button onClick={onRemove} className="text-slate-400 hover:text-red-500 mt-1 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main ActionTypes Page ───────────────────────────────────────────────────

export function ActionTypes({ data, onUpdate }: { data: OntologyData, onUpdate: (data: OntologyData) => void }) {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  // New Action Type form state
  const [newActionName, setNewActionName] = useState('');
  const [newActionId, setNewActionId] = useState('');
  const [newActionTarget, setNewActionTarget] = useState('');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newParams, setNewParams] = useState<ParamDef[]>([]);
  const [newRules, setNewRules] = useState<RuleDef[]>([]);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const resetForm = () => {
    setNewActionName(''); setNewActionId(''); setNewActionTarget('');
    setNewActionDesc(''); setNewParams([]); setNewRules([]); setAiReasoning('');
  };

  const filteredActionTypes = data.actionTypes.filter(at =>
    at.name.toLowerCase().includes(search.toLowerCase()) ||
    at.id.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-fill ID from name
  const handleNameChange = (name: string) => {
    setNewActionName(name);
    if (!newActionId || newActionId === generateId(newActionName)) {
      setNewActionId(generateId(name));
    }
  };

  const generateId = (name: string) =>
    'act_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  // AI generate parameters + rules
  const handleAIGenerate = async () => {
    if (!newActionName || !newActionTarget) {
      toast.error('请先填写 Action 名称和目标对象');
      return;
    }
    setGenerating(true);
    setAiReasoning('');
    try {
      const result = await api.generateAction(newActionName, newActionDesc, newActionTarget);
      setNewParams(result.parameters.map((p: any) => ({ name: p.name, type: p.type || 'string', required: !!p.required })));
      setNewRules(result.rules.map((r: any) => ({ type: r.type || 'validation', description: r.description || '' })));
      setAiReasoning(result.reasoning || '');
      toast.success('AI 已生成参数和规则');
    } catch (err: any) {
      toast.error('AI 生成失败: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!newActionName || !newActionId || !newActionTarget) {
      toast.error('请填写名称、ID 和目标对象');
      return;
    }
    setCreating(true);
    try {
      const result = await api.createActionType({
        id: newActionId,
        name: newActionName,
        description: newActionDesc,
        targetObjectId: newActionTarget,
        parameters: newParams,
        rules: newRules,
      });
      onUpdate(result.data);
      resetForm();
      setCreateDialogOpen(false);
      toast.success(`Action type "${newActionName}" created.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, at: ActionType) => {
    e.stopPropagation();
    try {
      const result = await api.deleteActionType(at.id);
      onUpdate(result.data);
      if (selectedAction?.id === at.id) setSelectedAction(null);
      toast.success(`Action type "${at.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">动作类型</h1>
          <p className="text-slate-500 text-sm mt-1">定义和执行修改对象数据的操作。</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> 新建动作类型</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建动作类型</DialogTitle>
              <DialogDescription>定义一个新操作。使用 AI 自动生成参数和规则。</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">显示名称 *</Label>
                  <Input value={newActionName} onChange={e => handleNameChange(e.target.value)} placeholder="例如：更新设备状态" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">动作类型 ID *</Label>
                  <Input value={newActionId} onChange={e => setNewActionId(e.target.value)} placeholder="act_update_status" className="font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">描述</Label>
                <Input value={newActionDesc} onChange={e => setNewActionDesc(e.target.value)} placeholder="这个动作做什么？" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">目标对象类型 *</Label>
                <Select value={newActionTarget} onValueChange={setNewActionTarget}>
                  <SelectTrigger><SelectValue placeholder="选择目标对象" /></SelectTrigger>
                  <SelectContent>
                    {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Generate Button */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="flex-1 text-xs text-slate-600">填写名称和目标对象后，AI 可自动生成合适的参数和规则</div>
                <Button size="sm" variant="outline" onClick={handleAIGenerate} disabled={generating || !newActionName || !newActionTarget}
                  className="gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50">
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {generating ? '生成中...' : 'AI 生成'}
                </Button>
              </div>
              {aiReasoning && (
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 italic">
                  💡 {aiReasoning}
                </div>
              )}

              {/* Parameters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" /> Parameters ({newParams.length})</Label>
                  <button
                    onClick={() => setNewParams(prev => [...prev, { name: '', type: 'string', required: false }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                </div>
                {newParams.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-200 rounded-lg">
                    无参数 — 点击添加或使用 AI 生成
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newParams.map((p, i) => (
                      <ParamRow
                        key={i}
                        param={p}
                        onChange={updated => setNewParams(prev => prev.map((x, j) => j === i ? updated : x))}
                        onRemove={() => setNewParams(prev => prev.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Rules ({newRules.length})</Label>
                  <button
                    onClick={() => setNewRules(prev => [...prev, { type: 'validation', description: '' }])}
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> 添加
                  </button>
                </div>
                {newRules.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-200 rounded-lg">
                    无规则 — 点击添加或使用 AI 生成
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newRules.map((r, i) => (
                      <RuleRow
                        key={i}
                        rule={r}
                        onChange={updated => setNewRules(prev => prev.map((x, j) => j === i ? updated : x))}
                        onRemove={() => setNewRules(prev => prev.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>取消</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                创建动作
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="搜索动作类型..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>名称</TableHead>
              <TableHead>动作类型 ID</TableHead>
              <TableHead>目标对象</TableHead>
              <TableHead>参数</TableHead>
              <TableHead>规则</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActionTypes.map(at => {
              const target = data.objectTypes.find(o => o.id === at.targetObjectId);
              const isSelected = selectedAction?.id === at.id;
              return (
                <TableRow
                  key={at.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected ? 'bg-purple-50 hover:bg-purple-50' : 'hover:bg-slate-50'
                  )}
                  onClick={() => setSelectedAction(at)}
                >
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-purple-100 text-purple-600' : 'bg-purple-50 text-purple-500'
                      )}>
                        <PlayCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {at.name}
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                        {at.description && <div className="text-xs text-slate-400 font-normal">{at.description}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{at.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Database className="w-3 h-3 text-blue-500" />
                      <span className="font-medium">{target?.name || at.targetObjectId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {at.parameters.length} 个参数
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {at.rules.filter(r => r.type === 'validation').length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          <Shield className="w-2.5 h-2.5" />
                          {at.rules.filter(r => r.type === 'validation').length}
                        </span>
                      )}
                      {at.rules.filter(r => r.type === 'side_effect').length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5" />
                          {at.rules.filter(r => r.type === 'side_effect').length}
                        </span>
                      )}
                      {at.rules.filter(r => r.type === 'webhook').length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                          <Webhook className="w-2.5 h-2.5" />
                          {at.rules.filter(r => r.type === 'webhook').length}
                        </span>
                      )}
                      {at.rules.length === 0 && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                        onClick={(e) => { e.stopPropagation(); setSelectedAction(at); }}
                      >
                        <PlayCircle className="w-3 h-3" />
                        Execute
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDelete(e, at)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredActionTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No action types found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Execution Panel Slide-over */}
      {selectedAction && (
        <ExecutionPanel
          action={selectedAction}
          objectTypes={data.objectTypes}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
}

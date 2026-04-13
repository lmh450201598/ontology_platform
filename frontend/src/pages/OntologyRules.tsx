import React, { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { Search, Plus, Shield, Trash2, Pencil, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/api/client';
import { cn } from '@/src/lib/utils';

// 类型定义
interface OntologyRuleParam {
  id: string;
  ruleId: string;
  paramDirection: string;
  paramName: string;
  paramType: string;
  isRequired: number;
  description: string;
  sortOrder: number;
}

interface OntologyRule {
  id: string;
  ruleCategory: string;
  functionName: string;
  interfaceType: string;
  requestMethod: string;
  interfaceUrl: string;
  functionDescription?: string;
  createdAt: string;
  updatedAt: string;
  inputParams: OntologyRuleParam[];
  outputParams: OntologyRuleParam[];
}

// 枚举选项
const RULE_CATEGORIES = [
  { value: 'CREATE_OBJECT', label: '创建对象' },
  { value: 'UPDATE_OBJECT', label: '修改对象' },
  { value: 'DELETE_OBJECT', label: '删除对象' },
  { value: 'CREATE_LINK', label: '创建链接' },
  { value: 'DELETE_LINK', label: '删除链接' },
];

const INTERFACE_TYPES = [
  { value: 'DUBBO', label: 'Dubbo' },
  { value: 'RESTFUL', label: 'RESTful' },
];

const REQUEST_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

const PARAM_TYPES = ['string', 'number', 'boolean', 'date', 'object', 'array'];

// 参数编辑组件
function ParamEditor({
  params,
  onChange,
  direction,
}: {
  params: Partial<OntologyRuleParam>[];
  onChange: (params: Partial<OntologyRuleParam>[]) => void;
  direction: 'INPUT' | 'OUTPUT';
}) {
  const addParam = () => {
    onChange([
      ...params,
      {
        paramName: '',
        paramType: 'string',
        isRequired: 0,
        description: '',
        paramDirection: direction,
      },
    ]);
  };

  const updateParam = (index: number, field: string, value: any) => {
    const newParams = [...params];
    (newParams[index] as any)[field] = value;
    onChange(newParams);
  };

  const removeParam = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-500">
          {direction === 'INPUT' ? '入参' : '出参'}
        </Label>
        <Button type="button" variant="outline" size="sm" className="h-6 text-xs" onClick={addParam}>
          <Plus className="w-3 h-3 mr-1" /> 添加参数
        </Button>
      </div>
      {params.length === 0 ? (
        <div className="text-xs text-slate-400 py-2 text-center border border-dashed border-slate-200 rounded">
          暂无参数
        </div>
      ) : (
        <div className="space-y-2">
          {params.map((param, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 bg-slate-50 rounded text-xs">
              <div className="col-span-3">
                <Input
                  placeholder="参数名"
                  value={param.paramName || ''}
                  onChange={(e) => updateParam(index, 'paramName', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Select
                  value={param.paramType || 'string'}
                  onValueChange={(v) => updateParam(index, 'paramType', v)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center pt-1">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={param.isRequired === 1}
                    onChange={(e) => updateParam(index, 'isRequired', e.target.checked ? 1 : 0)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-slate-600">必填</span>
                </label>
              </div>
              <div className="col-span-4">
                <Input
                  placeholder="说明"
                  value={param.description || ''}
                  onChange={(e) => updateParam(index, 'description', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                  onClick={() => removeParam(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OntologyRules() {
  const [rules, setRules] = useState<OntologyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<OntologyRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  // 表单状态
  const [formData, setFormData] = useState({
    ruleCategory: '',
    functionName: '',
    interfaceType: 'RESTFUL',
    requestMethod: 'POST',
    interfaceUrl: '',
    functionDescription: '',
    inputParams: [] as Partial<OntologyRuleParam>[],
    outputParams: [] as Partial<OntologyRuleParam>[],
  });

  // 加载数据
  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await api.getOntologyRules(categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined);
      setRules(res.rules || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, [categoryFilter]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      ruleCategory: '',
      functionName: '',
      interfaceType: 'RESTFUL',
      requestMethod: 'POST',
      interfaceUrl: '',
      functionDescription: '',
      inputParams: [],
      outputParams: [],
    });
    setEditingRule(null);
  };

  // 打开新增对话框
  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const openEditDialog = (rule: OntologyRule) => {
    setEditingRule(rule);
    setFormData({
      ruleCategory: rule.ruleCategory,
      functionName: rule.functionName || '',
      interfaceType: rule.interfaceType,
      requestMethod: rule.requestMethod || 'POST',
      interfaceUrl: rule.interfaceUrl || '',
      functionDescription: rule.functionDescription || '',
      inputParams: rule.inputParams || [],
      outputParams: rule.outputParams || [],
    });
    setDialogOpen(true);
  };

  // 保存规则
  const handleSave = async () => {
    if (!formData.ruleCategory) {
      toast.error('请选择规则类别');
      return;
    }
    if (!formData.functionName) {
      toast.error('请填写函数/方法名');
      return;
    }
    if (!formData.interfaceType) {
      toast.error('请选择接口性质');
      return;
    }
    if (formData.interfaceType === 'RESTFUL' && !formData.requestMethod) {
      toast.error('请选择请求方式');
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        await api.updateOntologyRule(editingRule.id, formData);
        toast.success('规则更新成功');
      } else {
        await api.createOntologyRule(formData);
        toast.success('规则创建成功');
      }
      setDialogOpen(false);
      resetForm();
      loadRules();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 删除规则
  const handleDelete = async (rule: OntologyRule) => {
    if (!confirm(`确定要删除规则 "${rule.functionName || rule.id}" 吗？`)) {
      return;
    }
    try {
      await api.deleteOntologyRule(rule.id);
      toast.success('规则删除成功');
      loadRules();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // 展开/收起规则详情
  const toggleExpand = (ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  // 过滤规则
  const filteredRules = rules.filter((rule) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      rule.functionName?.toLowerCase().includes(query) ||
      rule.interfaceUrl?.toLowerCase().includes(query) ||
      rule.id.toLowerCase().includes(query)
    );
  });

  // 获取类别标签
  const getCategoryLabel = (value: string) => {
    return RULE_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  // 获取类别颜色
  const getCategoryColor = (value: string) => {
    const colors: Record<string, string> = {
      CREATE_OBJECT: 'bg-blue-100 text-blue-700 border-blue-200',
      UPDATE_OBJECT: 'bg-amber-100 text-amber-700 border-amber-200',
      DELETE_OBJECT: 'bg-red-100 text-red-700 border-red-200',
      CREATE_LINK: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      DELETE_LINK: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[value] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            本体规则
          </h1>
          <p className="text-slate-500 mt-1">管理本体操作规则和接口配置</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          新增规则
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="搜索规则名称、接口地址..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="全部类别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类别</SelectItem>
            {RULE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-8"></TableHead>
              <TableHead>规则类别</TableHead>
              <TableHead>函数/方法名</TableHead>
              <TableHead>接口性质</TableHead>
              <TableHead>请求方式</TableHead>
              <TableHead>接口地址</TableHead>
              <TableHead>函数描述</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  暂无规则数据
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <React.Fragment key={rule.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <button
                        onClick={() => toggleExpand(rule.id)}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        {expandedRules.has(rule.id) ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', getCategoryColor(rule.ruleCategory))}>
                        {getCategoryLabel(rule.ruleCategory)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{rule.functionName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {rule.interfaceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.interfaceType === 'RESTFUL' ? (
                        <Badge variant="outline" className="text-xs font-mono">
                          {rule.requestMethod}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 max-w-xs truncate">
                      {rule.interfaceUrl || '-'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[200px]">
                      {rule.functionDescription ? (
                        <span title={rule.functionDescription}>
                          {rule.functionDescription.length > 20
                            ? rule.functionDescription.slice(0, 20) + '......'
                            : rule.functionDescription}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400 hover:text-blue-600"
                        onClick={() => openEditDialog(rule)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(rule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {/* 展开的参数详情 */}
                  {expandedRules.has(rule.id) && (
                    <TableRow className="bg-slate-50/50">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid grid-cols-2 gap-6">
                          {/* 入参 */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              入参 ({rule.inputParams?.length || 0})
                            </h4>
                            {rule.inputParams && rule.inputParams.length > 0 ? (
                              <div className="space-y-1">
                                {rule.inputParams.map((p, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs bg-white p-2 rounded border">
                                    <span className="font-mono text-slate-700">{p.paramName}</span>
                                    <Badge variant="outline" className="text-[10px] h-4">{p.paramType}</Badge>
                                    {p.isRequired === 1 && (
                                      <Badge className="text-[10px] h-4 bg-red-100 text-red-600">必填</Badge>
                                    )}
                                    {p.description && (
                                      <span className="text-slate-400 ml-auto">{p.description}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">无入参</p>
                            )}
                          </div>
                          {/* 出参 */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              出参 ({rule.outputParams?.length || 0})
                            </h4>
                            {rule.outputParams && rule.outputParams.length > 0 ? (
                              <div className="space-y-1">
                                {rule.outputParams.map((p, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs bg-white p-2 rounded border">
                                    <span className="font-mono text-slate-700">{p.paramName}</span>
                                    <Badge variant="outline" className="text-[10px] h-4">{p.paramType}</Badge>
                                    {p.isRequired === 1 && (
                                      <Badge className="text-[10px] h-4 bg-red-100 text-red-600">必填</Badge>
                                    )}
                                    {p.description && (
                                      <span className="text-slate-400 ml-auto">{p.description}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">无出参</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? '编辑规则' : '新增规则'}</DialogTitle>
            <DialogDescription>
              配置本体操作规则和接口参数
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>规则类别 *</Label>
                <Select
                  value={formData.ruleCategory}
                  onValueChange={(v) => setFormData({ ...formData, ruleCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>函数/方法名 *</Label>
                <Input
                  placeholder="如: createObject, updateStatus"
                  value={formData.functionName}
                  onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>接口性质 *</Label>
                <Select
                  value={formData.interfaceType}
                  onValueChange={(v) => setFormData({ ...formData, interfaceType: v, requestMethod: v === 'DUBBO' ? '' : formData.requestMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERFACE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.interfaceType === 'RESTFUL' && (
                <div className="space-y-2">
                  <Label>请求方式 *</Label>
                  <Select
                    value={formData.requestMethod}
                    onValueChange={(v) => setFormData({ ...formData, requestMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label>接口地址</Label>
                <Input
                  placeholder="如: /api/objects 或 com.example.ObjectService"
                  value={formData.interfaceUrl}
                  onChange={(e) => setFormData({ ...formData, interfaceUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>函数描述</Label>
                <Input
                  placeholder="简要描述该函数的功能"
                  value={formData.functionDescription}
                  onChange={(e) => setFormData({ ...formData, functionDescription: e.target.value })}
                />
              </div>
            </div>

            {/* 参数配置 */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">参数配置</h3>
              
              <ParamEditor
                params={formData.inputParams}
                onChange={(params) => setFormData({ ...formData, inputParams: params })}
                direction="INPUT"
              />

              <ParamEditor
                params={formData.outputParams}
                onChange={(params) => setFormData({ ...formData, outputParams: params })}
                direction="OUTPUT"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '@/src/api/client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Plus, Trash2, Edit, Play, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

// 类型定义
interface ActionRule {
  id?: string;
  ruleType: 'ONTOLOGY' | 'OTHER';
  ontologyRuleCategory?: string;
  ontologyRuleId?: string;
  functionTypeId?: string;
  params?: ActionRuleParam[];
  ontologyRuleName?: string;
  functionTypeName?: string;
}

interface ActionRuleParam {
  id?: string;
  paramName: string;
  paramValue: string;
}

interface ActionEffect {
  id?: string;
  effectType: 'NOTIFICATION' | 'LINGKE' | 'EMAIL';
  content?: string;
  isEnabled?: number;
}

interface ActionType {
  id: string;
  displayName: string;
  description?: string;
  status: string;
  rules?: ActionRule[];
  effects?: ActionEffect[];
}

interface OntologyRule {
  id: string;
  ruleCategory: string;
  functionName: string;
  functionDescription?: string;
}

interface FunctionType {
  id: string;
  code: string;
  name: string;
  inputParams?: any[];
}

const RULE_CATEGORIES = [
  { value: 'CREATE_OBJECT', label: '创建对象' },
  { value: 'UPDATE_OBJECT', label: '修改对象' },
  { value: 'DELETE_OBJECT', label: '删除对象' },
  { value: 'CREATE_LINK', label: '创建链接' },
  { value: 'DELETE_LINK', label: '删除链接' },
];

const EFFECT_TYPES = [
  { value: 'NOTIFICATION', label: '通知（站内）', enabled: true },
  { value: 'LINGKE', label: '铃客消息', enabled: false },
  { value: 'EMAIL', label: '邮件推送', enabled: false },
];

export function ActionTypes({ data, onUpdate }: { data: any; onUpdate: (data: any) => void }) {
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const [ontologyRules, setOntologyRules] = useState<OntologyRule[]>([]);
  const [functionTypes, setFunctionTypes] = useState<FunctionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ActionType>>({
    displayName: '',
    description: '',
  });
  const [rules, setRules] = useState<ActionRule[]>([]);
  const [effects, setEffects] = useState<ActionEffect[]>([
    { effectType: 'NOTIFICATION', content: '', isEnabled: 1 }
  ]);

  // Execute dialog state
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executingAction, setExecutingAction] = useState<ActionType | null>(null);
  const [executeParams, setExecuteParams] = useState<Record<string, string>>({});
  const [executeLoading, setExecuteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [atRes, orRes, ftRes] = await Promise.all([
        api.getActionTypes(),
        api.getOntologyRules(),
        api.getFunctionTypes(),
      ]);
      setActionTypes(atRes.actionTypes || []);
      setOntologyRules(orRes.rules || []);
      setFunctionTypes(ftRes.functions || []);
    } catch (err: any) {
      toast.error(`加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ displayName: '', description: '' });
    setRules([]);
    setEffects([{ effectType: 'NOTIFICATION', content: '', isEnabled: 1 }]);
    setEditingAction(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (action: ActionType) => {
    setEditingAction(action);
    setFormData({
      displayName: action.displayName,
      description: action.description || '',
    });
    setRules(action.rules || []);
    setEffects(action.effects?.length ? action.effects : [{ effectType: 'NOTIFICATION', content: '', isEnabled: 1 }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.displayName) {
      toast.error('显示名称为必填项');
      return;
    }

    try {
      const saveData: {
        displayName: string;
        description?: string;
        rules: ActionRule[];
        effects: ActionEffect[];
      } = {
        displayName: formData.displayName,
        description: formData.description,
        rules,
        effects: effects.filter(e => e.effectType === 'NOTIFICATION'), // 只保存通知类型
      };

      if (editingAction) {
        await api.updateActionType(editingAction.id, saveData);
        toast.success('动作类型更新成功');
      } else {
        await api.createActionType(saveData);
        toast.success('动作类型创建成功');
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个动作类型吗？')) return;
    try {
      await api.deleteActionType(id);
      toast.success('删除成功');
      loadData();
    } catch (err: any) {
      toast.error(`删除失败: ${err.message}`);
    }
  };

  const handleOpenExecute = (action: ActionType) => {
    setExecutingAction(action);
    // 从规则的params中提取需要填写的参数
    const params: Record<string, string> = {};
    action.rules?.forEach(rule => {
      rule.params?.forEach(param => {
        if (param.paramName) {
          params[param.paramName] = param.paramValue || '';
        }
      });
    });
    setExecuteParams(params);
    setExecuteDialogOpen(true);
  };

  const handleExecute = async () => {
    if (!executingAction) return;
    
    setExecuteLoading(true);
    try {
      // 查找instanceId参数（用于通知内容）
      const instanceId = executeParams['instanceId'] || executeParams['id'] || 'unknown';
      
      const result = await api.executeAction(
        executingAction.id, 
        executeParams, 
        'user', 
        instanceId
      );
      
      toast.success(`动作执行成功: ${result.executionId}`);
      setExecuteDialogOpen(false);
      setExecutingAction(null);
      setExecuteParams({});
    } catch (err: any) {
      toast.error(`执行失败: ${err.message}`);
    } finally {
      setExecuteLoading(false);
    }
  };

  const addRule = () => {
    setRules([...rules, { ruleType: 'ONTOLOGY', params: [] }]);
  };

  const updateRule = (index: number, field: keyof ActionRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const addRuleParam = (ruleIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].params = [...(newRules[ruleIndex].params || []), { paramName: '', paramValue: '' }];
    setRules(newRules);
  };

  const updateRuleParam = (ruleIndex: number, paramIndex: number, field: keyof ActionRuleParam, value: string) => {
    const newRules = [...rules];
    if (newRules[ruleIndex].params) {
      newRules[ruleIndex].params![paramIndex] = { ...newRules[ruleIndex].params![paramIndex], [field]: value };
      setRules(newRules);
    }
  };

  const removeRuleParam = (ruleIndex: number, paramIndex: number) => {
    const newRules = [...rules];
    if (newRules[ruleIndex].params) {
      newRules[ruleIndex].params = newRules[ruleIndex].params!.filter((_, i) => i !== paramIndex);
      setRules(newRules);
    }
  };

  const updateEffect = (index: number, field: keyof ActionEffect, value: any) => {
    const newEffects = [...effects];
    newEffects[index] = { ...newEffects[index], [field]: value };
    setEffects(newEffects);
  };

  const getOntologyRulesByCategory = (category: string) => {
    return ontologyRules.filter(r => r.ruleCategory === category);
  };

  const getFunctionTypeById = (id: string) => {
    return functionTypes.find(f => f.id === id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">动作类型</h1>
          <p className="text-slate-500 mt-1">管理动作类型、规则和副作用</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          新建动作类型
        </Button>
      </div>

      <div className="grid gap-4">
        {actionTypes.map((action) => {
          const isExpanded = expandedId === action.id;
          return (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{action.displayName}</CardTitle>
                      <Badge variant={action.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {action.status === 'ACTIVE' ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    {action.description && (
                      <p className="text-sm text-slate-500 mt-2">{action.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600" 
                      onClick={() => handleOpenExecute(action)}
                      title="执行"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : action.id)}>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(action)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(action.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 border-t">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">规则 ({action.rules?.length || 0})</h4>
                      <div className="space-y-2">
                        {action.rules?.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{rule.ruleType === 'ONTOLOGY' ? '本体规则' : '其他规则'}</Badge>
                            <span>{rule.ontologyRuleName || rule.functionTypeName || '未指定'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">副作用 ({action.effects?.length || 0})</h4>
                      <div className="space-y-2">
                        {action.effects?.map((effect, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">
                              {effect.effectType === 'NOTIFICATION' ? '通知' : effect.effectType}
                            </Badge>
                            <span className="text-slate-500">{effect.isEnabled ? '启用' : '禁用'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAction ? '编辑动作类型' : '新建动作类型'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="rules">规则配置</TabsTrigger>
              <TabsTrigger value="effects">副作用配置</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label>显示名称 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="例如：创建电芯实例"
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="动作类型描述"
                />
              </div>
            </TabsContent>

            {/* Rules Config */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">规则配置</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRule}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加规则
                </Button>
              </div>

              {rules.map((rule, ruleIndex) => (
                <Card key={ruleIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>规则 #{ruleIndex + 1}</Label>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeRule(ruleIndex)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>规则类型</Label>
                        <Select
                          value={rule.ruleType}
                          onValueChange={(v) => updateRule(ruleIndex, 'ruleType', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ONTOLOGY">本体规则</SelectItem>
                            <SelectItem value="OTHER">其他规则</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {rule.ruleType === 'ONTOLOGY' && (
                        <>
                          <div className="space-y-2">
                            <Label>规则类别</Label>
                            <Select
                              value={rule.ontologyRuleCategory}
                              onValueChange={(v) => updateRule(ruleIndex, 'ontologyRuleCategory', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {RULE_CATEGORIES.map(c => (
                                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>选择函数</Label>
                            <Select
                              value={rule.ontologyRuleId}
                              onValueChange={(v) => updateRule(ruleIndex, 'ontologyRuleId', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getOntologyRulesByCategory(rule.ontologyRuleCategory || '').map(r => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.functionName} - {r.functionDescription?.substring(0, 30)}...
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {rule.ruleType === 'OTHER' && (
                        <div className="space-y-2">
                          <Label>选择函数类型</Label>
                          <Select
                            value={rule.functionTypeId}
                            onValueChange={(v) => updateRule(ruleIndex, 'functionTypeId', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {functionTypes.map(f => (
                                <SelectItem key={f.id} value={f.id}>
                                  {f.name} ({f.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Rule Params */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>入参配置</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => addRuleParam(ruleIndex)}>
                          <Plus className="w-4 h-4 mr-1" />
                          添加参数
                        </Button>
                      </div>
                      {rule.params?.map((param, paramIndex) => (
                        <div key={paramIndex} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="参数名"
                            value={param.paramName}
                            onChange={(e) => updateRuleParam(ruleIndex, paramIndex, 'paramName', e.target.value)}
                          />
                          <Input
                            placeholder="参数值"
                            value={param.paramValue}
                            onChange={(e) => updateRuleParam(ruleIndex, paramIndex, 'paramValue', e.target.value)}
                          />
                          <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeRuleParam(ruleIndex, paramIndex)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Effects Config */}
            <TabsContent value="effects" className="space-y-4">
              <Label className="text-base">副作用配置</Label>
              {effects.map((effect, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>副作用类型</Label>
                      <Select
                        value={effect.effectType}
                        onValueChange={(v) => updateEffect(index, 'effectType', v)}
                        disabled={!EFFECT_TYPES.find(t => t.value === effect.effectType)?.enabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EFFECT_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value} disabled={!t.enabled}>
                              {t.label} {!t.enabled && '(暂未实现)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {effect.effectType === 'NOTIFICATION' && (
                      <div className="space-y-2">
                        <Label>通知内容</Label>
                        <Input
                          value={effect.content}
                          onChange={(e) => updateEffect(index, 'content', e.target.value)}
                          placeholder="完成${实例id}的操作"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>{editingAction ? '更新' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>执行动作: {executingAction?.displayName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {Object.keys(executeParams).length === 0 ? (
              <p className="text-slate-500">此动作类型无需输入参数</p>
            ) : (
              Object.entries(executeParams).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label>{key}</Label>
                  <Input
                    value={value}
                    onChange={(e) => setExecuteParams({ ...executeParams, [key]: e.target.value })}
                    placeholder={`请输入 ${key}`}
                  />
                </div>
              ))
            )}
            
            {/* 默认添加instanceId参数 */}
            {!executeParams['instanceId'] && (
              <div className="space-y-2">
                <Label>实例ID (instanceId)</Label>
                <Input
                  value={executeParams['instanceId'] || ''}
                  onChange={(e) => setExecuteParams({ ...executeParams, instanceId: e.target.value })}
                  placeholder="请输入实例ID"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>取消</Button>
            <Button onClick={handleExecute} disabled={executeLoading}>
              {executeLoading ? '执行中...' : '执行'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

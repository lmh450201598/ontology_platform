import React, { useState, useEffect } from 'react';
import { api, FunctionType, FunctionParam } from '@/src/api/client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Plus, Trash2, Edit, Code, ArrowRightLeft, Play, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

const CATEGORIES = [
  { value: 'QUERY', label: '查询', color: 'bg-blue-100 text-blue-700' },
  { value: 'CREATE', label: '创建', color: 'bg-green-100 text-green-700' },
  { value: 'UPDATE', label: '更新', color: 'bg-amber-100 text-amber-700' },
  { value: 'DELETE', label: '删除', color: 'bg-red-100 text-red-700' },
  { value: 'ANALYZE', label: '分析', color: 'bg-purple-100 text-purple-700' },
];

const INTERFACE_TYPES = [
  { value: 'RESTFUL', label: 'RESTful' },
  { value: 'DUBBO', label: 'Dubbo' },
  { value: 'INTERNAL', label: '内部调用' },
];

const HTTP_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

const PARAM_TYPES = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔' },
  { value: 'object', label: '对象' },
  { value: 'array', label: '数组' },
];

export function FunctionTypes() {
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Execute preview state
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executingFunction, setExecutingFunction] = useState<FunctionType | null>(null);
  const [executeParams, setExecuteParams] = useState<Record<string, string>>({});
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeResult, setExecuteResult] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<FunctionType>>({
    code: '',
    name: '',
    description: '',
    category: 'QUERY',
    interfaceType: 'RESTFUL',
    requestMethod: 'GET',
    interfaceUrl: '',
    implementationType: 'JAVA',
  });
  const [inputParams, setInputParams] = useState<FunctionParam[]>([]);
  const [outputParams, setOutputParams] = useState<FunctionParam[]>([]);

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setLoading(true);
    try {
      const res = await api.getFunctionTypes();
      setFunctions(res.functions || []);
    } catch (err: any) {
      toast.error(`加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'QUERY',
      interfaceType: 'RESTFUL',
      requestMethod: 'GET',
      interfaceUrl: '',
      implementationType: 'JAVA',
    });
    setInputParams([]);
    setOutputParams([]);
    setEditingFunction(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (func: FunctionType) => {
    setEditingFunction(func);
    setFormData({
      code: func.code,
      name: func.name,
      description: func.description || '',
      category: func.category,
      interfaceType: func.interfaceType || 'RESTFUL',
      requestMethod: func.requestMethod || 'GET',
      interfaceUrl: func.interfaceUrl || '',
      implementationType: func.implementationType || 'JAVA',
    });
    setInputParams(func.inputParams || []);
    setOutputParams(func.outputParams || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error('函数编码和名称为必填项');
      return;
    }

    try {
      const saveData = {
        ...formData,
        inputParams,
        outputParams,
      } as FunctionType;

      if (editingFunction) {
        await api.updateFunctionType(editingFunction.id, saveData);
        toast.success('函数类型更新成功');
      } else {
        await api.createFunctionType(saveData);
        toast.success('函数类型创建成功');
      }
      setDialogOpen(false);
      resetForm();
      loadFunctions();
    } catch (err: any) {
      toast.error(`保存失败: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个函数类型吗？')) return;
    try {
      await api.deleteFunctionType(id);
      toast.success('删除成功');
      loadFunctions();
    } catch (err: any) {
      toast.error(`删除失败: ${err.message}`);
    }
  };

  const addParam = (direction: 'INPUT' | 'OUTPUT') => {
    const newParam: FunctionParam = {
      paramName: '',
      paramCode: '',
      paramType: 'string',
      isRequired: direction === 'INPUT' ? 1 : 0,
      description: '',
      sourceType: 'USER_INPUT',
    };
    if (direction === 'INPUT') {
      setInputParams([...inputParams, newParam]);
    } else {
      setOutputParams([...outputParams, newParam]);
    }
  };

  const updateParam = (direction: 'INPUT' | 'OUTPUT', index: number, field: keyof FunctionParam, value: any) => {
    const params = direction === 'INPUT' ? [...inputParams] : [...outputParams];
    params[index] = { ...params[index], [field]: value };
    if (direction === 'INPUT') {
      setInputParams(params);
    } else {
      setOutputParams(params);
    }
  };

  const removeParam = (direction: 'INPUT' | 'OUTPUT', index: number) => {
    if (direction === 'INPUT') {
      setInputParams(inputParams.filter((_, i) => i !== index));
    } else {
      setOutputParams(outputParams.filter((_, i) => i !== index));
    }
  };

  // Execute preview functions
  const handleOpenExecute = (func: FunctionType) => {
    setExecutingFunction(func);
    // 初始化参数，使用默认值
    const defaultParams: Record<string, string> = {};
    func.inputParams?.forEach(param => {
      if (param.defaultValue) {
        defaultParams[param.paramCode] = param.defaultValue;
      } else {
        defaultParams[param.paramCode] = '';
      }
    });
    setExecuteParams(defaultParams);
    setExecuteResult(null);
    setExecuteDialogOpen(true);
  };

  const handleExecute = async () => {
    if (!executingFunction) return;
    setExecuteLoading(true);
    try {
      const result = await api.executeFunctionType(executingFunction.id, executeParams);
      setExecuteResult(result);
      if (result.status === 'success') {
        toast.success('函数执行成功');
      } else {
        toast.error(`执行失败: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(`执行失败: ${err.message}`);
      setExecuteResult({ status: 'failed', error: err.message });
    } finally {
      setExecuteLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || { label: category, color: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">函数类型</h1>
          <p className="text-slate-500 mt-1">管理业务函数定义，配置接口和参数</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          新建函数
        </Button>
      </div>

      <div className="grid gap-4">
        {functions.map((func) => {
          const category = getCategoryLabel(func.category);
          const isExpanded = expandedId === func.id;
          
          return (
            <Card key={func.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{func.name}</CardTitle>
                      <Badge className={cn("text-xs", category.color)}>
                        {category.label}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        {func.code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {func.requestMethod}
                      </span>
                      <span className="font-mono text-xs">{func.interfaceUrl}</span>
                    </div>
                    {func.description && (
                      <p className="text-sm text-slate-500 mt-2">{func.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleOpenExecute(func)}
                    >
                      <Play className="w-4 h-4" />
                      执行
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : func.id)}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(func)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(func.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0 border-t">
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    {/* Input Params */}
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <ArrowRightLeft className="w-4 h-4" />
                        入参 ({func.inputParams?.length || 0})
                      </div>
                      <div className="space-y-2">
                        {func.inputParams?.map((param, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{param.paramCode}</span>
                            <span className="text-slate-600">{param.paramName}</span>
                            <span className="text-xs text-slate-400">({param.paramType})</span>
                            {param.isRequired === 1 && <span className="text-red-500 text-xs">*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Output Params */}
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <Play className="w-4 h-4" />
                        出参 ({func.outputParams?.length || 0})
                      </div>
                      <div className="space-y-2">
                        {func.outputParams?.map((param, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{param.paramCode}</span>
                            <span className="text-slate-600">{param.paramName}</span>
                            <span className="text-xs text-slate-400">({param.paramType})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>实现类型: {func.implementationType}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        
        {functions.length === 0 && !loading && (
          <Card className="p-8 text-center text-slate-500">
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无函数类型</p>
            <p className="text-sm text-slate-400 mt-2">点击上方按钮创建第一个函数</p>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFunction ? '编辑函数类型' : '新建函数类型'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="interface">接口配置</TabsTrigger>
              <TabsTrigger value="params">参数配置</TabsTrigger>
            </TabsList>
            
            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>函数编码 <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例如：query_instance_relations"
                  />
                </div>
                <div className="space-y-2">
                  <Label>函数名称 <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：查询实例关系图谱"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>函数类别</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>实现类型</Label>
                  <Select
                    value={formData.implementationType}
                    onValueChange={(v) => setFormData({ ...formData, implementationType: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JAVA">Java</SelectItem>
                      <SelectItem value="BFF">BFF</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="函数功能描述"
                />
              </div>
            </TabsContent>
            
            {/* Interface Config */}
            <TabsContent value="interface" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>接口类型</Label>
                  <Select
                    value={formData.interfaceType}
                    onValueChange={(v) => setFormData({ ...formData, interfaceType: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERFACE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>请求方式</Label>
                  <Select
                    value={formData.requestMethod}
                    onValueChange={(v) => setFormData({ ...formData, requestMethod: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HTTP_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>接口URL</Label>
                <Input
                  value={formData.interfaceUrl}
                  onChange={(e) => setFormData({ ...formData, interfaceUrl: e.target.value })}
                  placeholder="例如：/api/instances/{objectTypeId}/{instanceId}/relations"
                />
              </div>
            </TabsContent>
            
            {/* Params Config */}
            <TabsContent value="params" className="space-y-6">
              {/* Input Params */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">入参配置</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addParam('INPUT')}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加入参
                  </Button>
                </div>
                
                {inputParams.map((param, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg">
                    <div className="col-span-2">
                      <Input
                        placeholder="参数编码"
                        value={param.paramCode}
                        onChange={(e) => updateParam('INPUT', index, 'paramCode', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="参数名称"
                        value={param.paramName}
                        onChange={(e) => updateParam('INPUT', index, 'paramName', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={param.paramType}
                        onValueChange={(v) => updateParam('INPUT', index, 'paramType', v)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PARAM_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="描述"
                        value={param.description || ''}
                        onChange={(e) => updateParam('INPUT', index, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        placeholder="默认值"
                        value={param.defaultValue || ''}
                        onChange={(e) => updateParam('INPUT', index, 'defaultValue', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={param.isRequired === 1}
                        onChange={(e) => updateParam('INPUT', index, 'isRequired', e.target.checked ? 1 : 0)}
                        className="w-4 h-4"
                        title="必填"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeParam('INPUT', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Output Params */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">出参配置</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addParam('OUTPUT')}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加出参
                  </Button>
                </div>
                
                {outputParams.map((param, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg">
                    <div className="col-span-3">
                      <Input
                        placeholder="参数编码"
                        value={param.paramCode}
                        onChange={(e) => updateParam('OUTPUT', index, 'paramCode', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="参数名称"
                        value={param.paramName}
                        onChange={(e) => updateParam('OUTPUT', index, 'paramName', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={param.paramType}
                        onValueChange={(v) => updateParam('OUTPUT', index, 'paramType', v)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PARAM_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="描述"
                        value={param.description || ''}
                        onChange={(e) => updateParam('OUTPUT', index, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeParam('OUTPUT', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingFunction ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Preview Dialog */}
      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              执行预览: {executingFunction?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Function Info */}
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">
                  {executingFunction?.code}
                </Badge>
                <span className="text-slate-500">
                  {executingFunction?.requestMethod} {executingFunction?.interfaceUrl}
                </span>
              </div>
            </div>

            {/* Input Parameters */}
            {executingFunction?.inputParams && executingFunction.inputParams.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">入参配置</h4>
                <div className="grid gap-3">
                  {executingFunction.inputParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1/3">
                        <Label className="flex items-center gap-1">
                          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            {param.paramCode}
                          </span>
                          <span className="text-slate-600">{param.paramName}</span>
                          {param.isRequired === 1 && <span className="text-red-500">*</span>}
                        </Label>
                        <span className="text-xs text-slate-400 ml-2">({param.paramType})</span>
                      </div>
                      <Input
                        className="flex-1"
                        value={executeParams[param.paramCode] || ''}
                        onChange={(e) => setExecuteParams({
                          ...executeParams,
                          [param.paramCode]: e.target.value
                        })}
                        placeholder={param.defaultValue || `请输入${param.paramName}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex justify-center py-4">
              <Button
                onClick={handleExecute}
                disabled={executeLoading}
                className="gap-2 px-8"
              >
                {executeLoading ? (
                  <span className="animate-spin">\u231B</span>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {executeLoading ? '执行中...' : '执行函数'}
              </Button>
            </div>

            {/* Execution Result */}
            {executeResult && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700 flex items-center gap-2">
                  执行结果
                  <Badge 
                    variant={executeResult.status === 'success' ? 'default' : 'destructive'}
                    className={executeResult.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                  >
                    {executeResult.status === 'success' ? '成功' : '失败'}
                  </Badge>
                </h4>
                <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-80">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(executeResult.status === 'success' 
                      ? executeResult.response 
                      : executeResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

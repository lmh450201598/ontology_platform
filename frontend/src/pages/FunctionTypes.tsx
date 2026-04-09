import React, { useState, useEffect } from 'react';
import { api } from '@/src/api/client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Plus, Trash2, Edit, Code, ArrowRightLeft, Play } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

interface FunctionType {
  id: string;
  name: string;
  restRoute: string;
  description?: string;
  inputParams: {
    ontologyGraph: {
      name: string;
      type: string;
      description: string;
      required: boolean;
      default: boolean;
    };
    custom: ParamConfig[];
  };
  outputParams: {
    params: ParamConfig[];
  };
}

interface ParamConfig {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

export function FunctionTypes() {
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionType | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formRoute, setFormRoute] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [inputParams, setInputParams] = useState<ParamConfig[]>([]);
  const [outputParams, setOutputParams] = useState<ParamConfig[]>([]);

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setLoading(true);
    try {
      const res = await api.getFunctionTypes();
      setFunctions(res.functions);
    } catch (err: any) {
      toast.error(`加载失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormRoute('');
    setFormDesc('');
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
    setFormName(func.name);
    setFormRoute(func.restRoute);
    setFormDesc(func.description || '');
    setInputParams(func.inputParams?.custom || []);
    setOutputParams(func.outputParams?.params || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formRoute) {
      toast.error('函数名和Rest路由为必填项');
      return;
    }

    try {
      if (editingFunction) {
        await api.updateFunctionType(editingFunction.id, {
          name: formName,
          restRoute: formRoute,
          description: formDesc,
          inputParams,
          outputParams,
        });
        toast.success('函数类型更新成功');
      } else {
        await api.createFunctionType({
          name: formName,
          restRoute: formRoute,
          description: formDesc,
          inputParams,
          outputParams,
        });
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

  const addInputParam = () => {
    setInputParams([...inputParams, { name: '', type: 'string', description: '', required: false }]);
  };

  const updateInputParam = (index: number, field: keyof ParamConfig, value: any) => {
    const updated = [...inputParams];
    updated[index] = { ...updated[index], [field]: value };
    setInputParams(updated);
  };

  const removeInputParam = (index: number) => {
    setInputParams(inputParams.filter((_, i) => i !== index));
  };

  const addOutputParam = () => {
    setOutputParams([...outputParams, { name: '', type: 'string', description: '', required: false }]);
  };

  const updateOutputParam = (index: number, field: keyof ParamConfig, value: any) => {
    const updated = [...outputParams];
    updated[index] = { ...updated[index], [field]: value };
    setOutputParams(updated);
  };

  const removeOutputParam = (index: number) => {
    setOutputParams(outputParams.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">函数类型</h1>
          <p className="text-slate-500 mt-1">管理函数定义，配置Rest路由和参数</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          新建函数
        </Button>
      </div>

      <div className="grid gap-4">
        {functions.map((func) => (
          <Card key={func.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{func.name}</CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      <Code className="w-3 h-3 mr-1" />
                      {func.restRoute}
                    </Badge>
                  </div>
                  {func.description && (
                    <p className="text-sm text-slate-500 mt-1">{func.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="font-medium">入参</span>
                    <Badge variant="outline" className="text-xs">
                      默认: 本体图谱
                    </Badge>
                    {func.inputParams?.custom?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{func.inputParams.custom.length} 自定义
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 pl-6">
                    {func.inputParams?.custom?.map((p, i) => (
                      <span key={i} className="inline-block mr-2">
                        {p.name}: {p.type}
                        {p.required && <span className="text-red-500">*</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Play className="w-4 h-4" />
                    <span className="font-medium">出参</span>
                    {func.outputParams?.params?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {func.outputParams.params.length} 个参数
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 pl-6">
                    {func.outputParams?.params?.map((p, i) => (
                      <span key={i} className="inline-block mr-2">
                        {p.name}: {p.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFunction ? '编辑函数类型' : '新建函数类型'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>函数名 <span className="text-red-500">*</span></Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：数据清洗函数"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rest路由 <span className="text-red-500">*</span></Label>
                <Input
                  value={formRoute}
                  onChange={(e) => setFormRoute(e.target.value)}
                  placeholder="例如：/api/functions/clean-data"
                />
              </div>
              
              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="函数功能描述"
                />
              </div>
            </div>

            {/* Default Input Param */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <ArrowRightLeft className="w-4 h-4" />
                <span className="font-medium">默认入参：本体图谱</span>
                <Badge variant="outline" className="text-xs bg-white">自动传递</Badge>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                所有函数调用时都会自动传入系统中的对象类型和链接类型数据
              </p>
            </div>

            {/* Custom Input Params */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>自定义入参</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInputParam}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加参数
                </Button>
              </div>
              
              {inputParams.map((param, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="col-span-3">
                    <Input
                      placeholder="参数名"
                      value={param.name}
                      onChange={(e) => updateInputParam(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={param.type}
                      onValueChange={(v) => updateInputParam(index, 'type', v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="number">number</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                        <SelectItem value="object">object</SelectItem>
                        <SelectItem value="array">array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="描述"
                      value={param.description || ''}
                      onChange={(e) => updateInputParam(index, 'description', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={param.required}
                      onChange={(e) => updateInputParam(index, 'required', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeInputParam(index)}
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
                <Label>出参配置</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOutputParam}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加参数
                </Button>
              </div>
              
              {outputParams.map((param, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="col-span-4">
                    <Input
                      placeholder="参数名"
                      value={param.name}
                      onChange={(e) => updateOutputParam(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={param.type}
                      onValueChange={(v) => updateOutputParam(index, 'type', v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">string</SelectItem>
                        <SelectItem value="number">number</SelectItem>
                        <SelectItem value="boolean">boolean</SelectItem>
                        <SelectItem value="object">object</SelectItem>
                        <SelectItem value="array">array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="描述"
                      value={param.description || ''}
                      onChange={(e) => updateOutputParam(index, 'description', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeOutputParam(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
    </div>
  );
}

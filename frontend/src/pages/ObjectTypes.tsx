import React, { useState, useEffect } from 'react';
import { OntologyData, ObjectType, Property, PropertyType } from '@/src/store/ontologyStore';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/src/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Search, Plus, Database, Key, MoreHorizontal, FileText, Settings2, Table as TableIcon, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/api/client';

export function ObjectTypes({ data, onUpdate }: { data: OntologyData, onUpdate: (data: OntologyData) => void }) {
  const [search, setSearch] = useState('');
  const [selectedObjectType, setSelectedObjectType] = useState<ObjectType | null>(null);

  // New Object Type form state
  const [newOtName, setNewOtName] = useState('');
  const [newOtId, setNewOtId] = useState('');
  const [newOtDataset, setNewOtDataset] = useState('');
  const [newOtDesc, setNewOtDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // New Property form state
  const [newPropName, setNewPropName] = useState('');
  const [newPropId, setNewPropId] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('string');
  const [newPropBaseCol, setNewPropBaseCol] = useState('');
  const [addingProp, setAddingProp] = useState(false);
  const [propDialogOpen, setPropDialogOpen] = useState(false);

  // AI suggestions
  const [suggestingProps, setSuggestingProps] = useState(false);
  const [propSuggestions, setPropSuggestions] = useState<any[]>([]);

  // Dataset columns for mapping
  const [datasetColumns, setDatasetColumns] = useState<Array<{
    columnName: string;
    columnComment: string;
    dataType: string;
    isNullable: string;
  }>>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  const filteredObjectTypes = data.objectTypes.filter(ot =>
    ot.name.toLowerCase().includes(search.toLowerCase()) ||
    ot.id.toLowerCase().includes(search.toLowerCase())
  );

  // Keep selectedObjectType in sync with data updates
  const syncedSelected = selectedObjectType
    ? data.objectTypes.find(ot => ot.id === selectedObjectType.id) || null
    : null;

  // Ensure properties array exists
  const selectedProperties = syncedSelected?.properties || [];

  // Load dataset columns when viewing datasource tab
  useEffect(() => {
    const loadColumns = async () => {
      if (syncedSelected?.backingDataset) {
        console.log('Loading columns for dataset:', syncedSelected.backingDataset);
        setLoadingColumns(true);
        try {
          const res = await api.getDatasetColumns(syncedSelected.backingDataset);
          console.log('Columns loaded:', res.data?.length || 0);
          if (res.success) {
            setDatasetColumns(res.data);
          } else {
            setDatasetColumns([]);
            toast.error('获取数据集列信息失败');
          }
        } catch (err) {
          console.error('Failed to load dataset columns:', err);
          setDatasetColumns([]);
        } finally {
          setLoadingColumns(false);
        }
      } else {
        setDatasetColumns([]);
      }
    };
    loadColumns();
  }, [syncedSelected?.id, syncedSelected?.backingDataset]);

  const handleCreateObjectType = async () => {
    if (!newOtName || !newOtId) {
      toast.error('Name and ID are required.');
      return;
    }
    setCreating(true);
    try {
      const result = await api.createObjectType({
        id: newOtId,
        name: newOtName,
        description: newOtDesc,
        backingDataset: newOtDataset,
      });
      onUpdate(result.data);
      setNewOtName(''); setNewOtId(''); setNewOtDataset(''); setNewOtDesc('');
      setCreateDialogOpen(false);
      toast.success(`Object type "${newOtName}" created.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteObjectType = async (ot: ObjectType) => {
    try {
      const result = await api.deleteObjectType(ot.id);
      onUpdate(result.data);
      toast.success(`Object type "${ot.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddProperty = async () => {
    if (!syncedSelected || !newPropName || !newPropId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setAddingProp(true);
    try {
      const result = await api.addProperty(syncedSelected.id, {
        id: newPropId,
        name: newPropName,
        type: newPropType,
        baseColumn: newPropBaseCol,
      });
      onUpdate(result.data);
      setNewPropName(''); setNewPropId(''); setNewPropType('string'); setNewPropBaseCol('');
      setPropDialogOpen(false);
      toast.success(`Property "${newPropName}" added.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddingProp(false);
    }
  };

  const handleDeleteProperty = async (prop: Property) => {
    if (!syncedSelected) return;
    try {
      const result = await api.deleteProperty(syncedSelected.id, prop.id);
      onUpdate(result.data);
      toast.success(`Property "${prop.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Update property's base column mapping
  const handleUpdatePropertyColumn = async (propertyId: string, baseColumn: string) => {
    if (!syncedSelected) return;
    try {
      // Find the property to update
      const property = syncedSelected.properties.find(p => p.id === propertyId);
      if (!property) return;

      // Call API to update property
      const result = await api.updateProperty(syncedSelected.id, propertyId, {
        ...property,
        baseColumn: baseColumn || undefined,
      });
      onUpdate(result.data);
      toast.success(`属性 "${property.name}" 已映射到数据列`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSuggestProperties = async () => {
    if (!syncedSelected) return;
    setSuggestingProps(true);
    try {
      const result = await api.suggestProperties(
        syncedSelected.name,
        syncedSelected.description,
        selectedProperties
      );
      setPropSuggestions(result.suggestions || []);
      if (result.suggestions.length === 0) toast.info('No suggestions returned.');
    } catch (err: any) {
      toast.error(err.message.includes('GEMINI_API_KEY') ? 'Set GEMINI_API_KEY in .env to use AI features' : err.message);
    } finally {
      setSuggestingProps(false);
    }
  };

  const handleAddSuggestedProperty = async (suggestion: any) => {
    if (!syncedSelected) return;
    const id = `p_${suggestion.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    try {
      const result = await api.addProperty(syncedSelected.id, {
        id,
        name: suggestion.name,
        type: suggestion.type || 'string',
        baseColumn: suggestion.baseColumn || '',
      });
      onUpdate(result.data);
      setPropSuggestions(s => s.filter(x => x.name !== suggestion.name));
      toast.success(`Property "${suggestion.name}" added.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveMetadata = async () => {
    if (!syncedSelected) return;
    try {
      const result = await api.updateObjectType(syncedSelected.id, {
        name: syncedSelected.name,
        description: syncedSelected.description,
        icon: syncedSelected.icon,
        backingDataset: syncedSelected.backingDataset,
      });
      onUpdate(result.data);
      toast.success('Changes saved.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Detail View ─────────────────────────────────────────────────────────────
  if (syncedSelected) {
    // Debug log
    console.log('Rendering detail view for:', syncedSelected.name, 'dataset:', syncedSelected.backingDataset);
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setSelectedObjectType(null); setPropSuggestions([]); }} className="text-slate-500">
            ← 返回对象类型列表
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{syncedSelected.name}</h1>
              <p className="text-slate-500 text-sm font-mono">{syncedSelected.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => { handleDeleteObjectType(syncedSelected); setSelectedObjectType(null); }}>
              <Trash2 className="w-4 h-4 mr-1" /> 删除
            </Button>
            <Button onClick={handleSaveMetadata}>保存更改</Button>
          </div>
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties" className="gap-2"><FileText className="w-4 h-4" /> 属性</TabsTrigger>
            <TabsTrigger value="datasource" className="gap-2"><TableIcon className="w-4 h-4" /> 数据源</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings2 className="w-4 h-4" /> 设置</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {/* AI Suggestions */}
            {propSuggestions.length > 0 && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI 建议的属性
                </p>
                <div className="space-y-2">
                  {propSuggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                      <div>
                        <span className="font-medium text-sm text-slate-900">{s.name}</span>
                        <Badge variant="secondary" className="ml-2 font-mono text-[10px] uppercase">{s.type}</Badge>
                        <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 ml-4"
                        onClick={() => handleAddSuggestedProperty(s)}>
                        <Plus className="w-3 h-3 mr-1" /> 添加
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  属性 ({selectedProperties.length})
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-purple-600 border-purple-200"
                    onClick={handleSuggestProperties} disabled={suggestingProps}>
                    {suggestingProps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI 建议
                  </Button>
                  <Dialog open={propDialogOpen} onOpenChange={setPropDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Plus className="w-3 h-3" /> 添加属性
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加属性</DialogTitle>
                        <DialogDescription>为 {syncedSelected.name} 定义一个新属性。</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>显示名称 *</Label>
                          <Input value={newPropName} onChange={e => setNewPropName(e.target.value)} placeholder="例如：邮箱地址" />
                        </div>
                        <div className="space-y-2">
                          <Label>属性 ID *</Label>
                          <Input value={newPropId} onChange={e => setNewPropId(e.target.value)} placeholder="例如：p_email" className="font-mono text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label>类型</Label>
                          <Select value={newPropType} onValueChange={(v: PropertyType) => setNewPropType(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(['string','integer','double','boolean','date','timestamp','geohash'] as PropertyType[]).map(t => (
                                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>基础列</Label>
                          <Input value={newPropBaseCol} onChange={e => setNewPropBaseCol(e.target.value)} placeholder="例如：email_address" className="font-mono text-sm" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPropDialogOpen(false)}>取消</Button>
                        <Button onClick={handleAddProperty} disabled={addingProp}>
                          {addingProp ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                          添加属性
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">属性 ID</TableHead>
                    <TableHead>显示名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>类型类</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProperties.map(prop => (
                    <TableRow key={prop.id}>
                      <TableCell className="font-mono text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {prop.isPrimaryKey && <Key className="w-3 h-3 text-amber-500" />}
                          {prop.id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{prop.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">{prop.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {prop.typeClasses?.map(tc => (
                          <Badge key={tc} variant="outline" className="mr-1 text-[10px] font-mono bg-slate-50 text-slate-500">{tc}</Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteProperty(prop)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedProperties.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-16 text-center text-slate-400 text-sm">
                        暂无属性。添加一个开始。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="datasource">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900">底层数据集</h3>
                <p className="text-sm text-slate-500 mb-4">支持此对象类型的数据集。</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="font-mono text-sm text-slate-700">{syncedSelected?.backingDataset || '(未设置)'}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">列映射</h3>
                {loadingColumns ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    加载数据列...
                  </div>
                ) : !datasetColumns || datasetColumns.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <TableIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">未找到数据列</p>
                    <p className="text-xs mt-1">请确保数据集名称正确且表存在</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>属性</TableHead>
                          <TableHead>映射到数据列</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProperties && selectedProperties.map(prop => (
                          <TableRow key={prop?.id || Math.random()}>
                            <TableCell className="font-medium text-slate-900">{prop?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Select 
                                value={prop?.baseColumn || '__UNMAPPED__'} 
                                onValueChange={(value) => prop?.id && handleUpdatePropertyColumn(prop.id, value === '__UNMAPPED__' ? '' : value)}
                              >
                                <SelectTrigger className="w-[280px]">
                                  <SelectValue placeholder="选择数据列..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__UNMAPPED__">不映射</SelectItem>
                                  {datasetColumns && datasetColumns.map(col => (
                                    <SelectItem key={col?.columnName || Math.random()} value={col?.columnName || ''}>
                                      <div className="flex flex-col items-start">
                                        <span>{col?.columnComment || col?.columnName || 'Unknown'}</span>
                                        <span className="text-xs text-slate-400 font-mono">{col?.columnName || ''} ({col?.dataType || ''})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">元数据</h3>
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Input defaultValue={syncedSelected.description} />
                  </div>
                  <div className="space-y-2">
                    <Label>图标</Label>
                    <Input defaultValue={syncedSelected.icon} />
                  </div>
                  <div className="space-y-2">
                    <Label>底层数据集</Label>
                    <Input defaultValue={syncedSelected.backingDataset} className="font-mono text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ── List View ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">对象类型</h1>
          <p className="text-slate-500 text-sm mt-1">定义本体的核心实体。</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> 新建对象类型</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建对象类型</DialogTitle>
              <DialogDescription>在本体中定义一个新实体。</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>显示名称 *</Label>
                <Input value={newOtName} onChange={e => setNewOtName(e.target.value)} placeholder="例如：员工、航班、产品" />
              </div>
              <div className="space-y-2">
                <Label>对象类型 ID *</Label>
                <Input value={newOtId} onChange={e => setNewOtId(e.target.value)} placeholder="例如：ot_employee" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input value={newOtDesc} onChange={e => setNewOtDesc(e.target.value)} placeholder="这个实体代表什么？" />
              </div>
              <div className="space-y-2">
                <Label>底层数据集</Label>
                <Input value={newOtDataset} onChange={e => setNewOtDataset(e.target.value)} placeholder="例如：dataset_employees" className="font-mono text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
              <Button onClick={handleCreateObjectType} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="搜索对象类型..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>名称</TableHead>
              <TableHead>对象类型 ID</TableHead>
              <TableHead>属性</TableHead>
              <TableHead>底层数据集</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredObjectTypes.map(ot => (
              <TableRow key={ot.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedObjectType(ot)}>
                <TableCell className="font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Database className="w-3 h-3" />
                    </div>
                    {ot.name}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{ot.id}</TableCell>
                <TableCell><Badge variant="secondary">{ot.properties.length}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-slate-500 max-w-[200px] truncate">{ot.backingDataset}</TableCell>
                <TableCell>
                  {ot.status === 'pending' ? (
                    <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50">待审核</Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">已生效</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={e => { e.stopPropagation(); handleDeleteObjectType(ot); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredObjectTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">未找到对象类型。</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

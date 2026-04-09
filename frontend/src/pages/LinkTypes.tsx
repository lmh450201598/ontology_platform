import React, { useState, useEffect } from 'react';
import { OntologyData, LinkType } from '@/src/store/ontologyStore';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Search, Plus, Link as LinkIcon, ArrowRight, Trash2, Sparkles, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/api/client';

export function LinkTypes({ data, onUpdate }: { data: OntologyData, onUpdate: (data: OntologyData) => void }) {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLinkType, setEditingLinkType] = useState<LinkType | null>(null);

  // New Link Type form state
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkId, setNewLinkId] = useState('');
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkTarget, setNewLinkTarget] = useState('');
  const [newLinkCardinality, setNewLinkCardinality] = useState<'1:1' | '1:N' | 'N:1' | 'N:M'>('1:N');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [newLinkSourceColumn, setNewLinkSourceColumn] = useState('');
  const [newLinkTargetColumn, setNewLinkTargetColumn] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Link Type form state
  const [editLinkName, setEditLinkName] = useState('');
  const [editLinkSource, setEditLinkSource] = useState('');
  const [editLinkTarget, setEditLinkTarget] = useState('');
  const [editLinkCardinality, setEditLinkCardinality] = useState<'1:1' | '1:N' | 'N:1' | 'N:M'>('1:N');
  const [editLinkDesc, setEditLinkDesc] = useState('');
  const [editLinkSourceColumn, setEditLinkSourceColumn] = useState('');
  const [editLinkTargetColumn, setEditLinkTargetColumn] = useState('');
  const [editing, setEditing] = useState(false);

  // Dataset columns for source/target object types
  const [sourceColumns, setSourceColumns] = useState<Array<{columnName: string; columnComment: string; dataType: string}>>([]);
  const [targetColumns, setTargetColumns] = useState<Array<{columnName: string; columnComment: string; dataType: string}>>([]);
  const [loadingSourceColumns, setLoadingSourceColumns] = useState(false);
  const [loadingTargetColumns, setLoadingTargetColumns] = useState(false);

  // AI suggestions
  const [suggestingLinks, setSuggestingLinks] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);

  // Load source object type columns when source is selected
  useEffect(() => {
    const loadSourceColumns = async () => {
      if (newLinkSource) {
        const objectType = data.objectTypes.find(ot => ot.id === newLinkSource);
        if (objectType?.backingDataset) {
          setLoadingSourceColumns(true);
          try {
            const res = await api.getDatasetColumns(objectType.backingDataset);
            if (res.success) {
              setSourceColumns(res.data);
            }
          } catch (err) {
            console.error('Failed to load source columns:', err);
          } finally {
            setLoadingSourceColumns(false);
          }
        } else {
          setSourceColumns([]);
        }
      } else {
        setSourceColumns([]);
      }
    };
    loadSourceColumns();
  }, [newLinkSource, data.objectTypes]);

  // Load target object type columns when target is selected
  useEffect(() => {
    const loadTargetColumns = async () => {
      if (newLinkTarget) {
        const objectType = data.objectTypes.find(ot => ot.id === newLinkTarget);
        if (objectType?.backingDataset) {
          setLoadingTargetColumns(true);
          try {
            const res = await api.getDatasetColumns(objectType.backingDataset);
            if (res.success) {
              setTargetColumns(res.data);
            }
          } catch (err) {
            console.error('Failed to load target columns:', err);
          } finally {
            setLoadingTargetColumns(false);
          }
        } else {
          setTargetColumns([]);
        }
      } else {
        setTargetColumns([]);
      }
    };
    loadTargetColumns();
  }, [newLinkTarget, data.objectTypes]);

  // Load columns for edit dialog
  useEffect(() => {
    const loadEditColumns = async () => {
      if (editDialogOpen && editingLinkType) {
        // Load source columns
        const sourceObj = data.objectTypes.find(ot => ot.id === editingLinkType.sourceObjectId);
        if (sourceObj?.backingDataset) {
          try {
            const res = await api.getDatasetColumns(sourceObj.backingDataset);
            if (res.success) setSourceColumns(res.data);
          } catch (err) {
            console.error('Failed to load source columns:', err);
          }
        }
        // Load target columns
        const targetObj = data.objectTypes.find(ot => ot.id === editingLinkType.targetObjectId);
        if (targetObj?.backingDataset) {
          try {
            const res = await api.getDatasetColumns(targetObj.backingDataset);
            if (res.success) setTargetColumns(res.data);
          } catch (err) {
            console.error('Failed to load target columns:', err);
          }
        }
      }
    };
    loadEditColumns();
  }, [editDialogOpen, editingLinkType, data.objectTypes]);

  const filteredLinkTypes = data.linkTypes.filter(lt =>
    lt.name.toLowerCase().includes(search.toLowerCase()) ||
    lt.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newLinkName || !newLinkId || !newLinkSource || !newLinkTarget) {
      toast.error('请填写所有必填字段。');
      return;
    }
    setCreating(true);
    try {
      const result = await api.createLinkType({
        id: newLinkId,
        name: newLinkName,
        sourceObjectId: newLinkSource,
        targetObjectId: newLinkTarget,
        cardinality: newLinkCardinality,
        description: newLinkDesc,
        sourceColumn: newLinkSourceColumn,
        targetColumn: newLinkTargetColumn,
      });
      onUpdate(result.data);
      setNewLinkName(''); setNewLinkId(''); setNewLinkSource(''); setNewLinkTarget('');
      setNewLinkCardinality('1:N'); setNewLinkDesc('');
      setNewLinkSourceColumn(''); setNewLinkTargetColumn('');
      setCreateDialogOpen(false);
      toast.success(`链接类型 "${newLinkName}" 创建成功。`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (lt: LinkType) => {
    setEditingLinkType(lt);
    setEditLinkName(lt.name);
    setEditLinkSource(lt.sourceObjectId);
    setEditLinkTarget(lt.targetObjectId);
    setEditLinkCardinality(lt.cardinality as '1:1' | '1:N' | 'N:1' | 'N:M');
    setEditLinkDesc(lt.description || '');
    setEditLinkSourceColumn(lt.sourceColumn || '');
    setEditLinkTargetColumn(lt.targetColumn || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingLinkType) return;
    setEditing(true);
    try {
      const result = await api.updateLinkType(editingLinkType.id, {
        name: editLinkName,
        sourceObjectId: editLinkSource,
        targetObjectId: editLinkTarget,
        cardinality: editLinkCardinality,
        description: editLinkDesc,
        sourceColumn: editLinkSourceColumn,
        targetColumn: editLinkTargetColumn,
      });
      onUpdate(result.data);
      setEditDialogOpen(false);
      setEditingLinkType(null);
      toast.success(`链接类型 "${editLinkName}" 更新成功。`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (lt: LinkType) => {
    try {
      const result = await api.deleteLinkType(lt.id);
      onUpdate(result.data);
      toast.success(`Link type "${lt.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSuggestLinks = async () => {
    setSuggestingLinks(true);
    try {
      const result = await api.suggestLinks(data.objectTypes);
      setLinkSuggestions(result.suggestions || []);
      if (result.suggestions.length === 0) toast.info('No suggestions returned.');
    } catch (err: any) {
      toast.error(err.message.includes('GEMINI_API_KEY') ? 'Set GEMINI_API_KEY in .env to use AI features' : err.message);
    } finally {
      setSuggestingLinks(false);
    }
  };

  const handleAddSuggestion = async (s: any) => {
    const id = `lt_${s.sourceObjectId}_${s.targetObjectId}_${Date.now()}`;
    try {
      const result = await api.createLinkType({
        id,
        name: s.name,
        sourceObjectId: s.sourceObjectId,
        targetObjectId: s.targetObjectId,
        cardinality: s.cardinality || 'N:M',
        description: s.description || s.businessLogic || '',
      });
      onUpdate(result.data);
      setLinkSuggestions(prev => prev.filter(x => x.name !== s.name));
      toast.success(`Link type "${s.name}" added.`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">链接类型</h1>
          <p className="text-slate-500 text-sm mt-1">定义对象类型之间的关系。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={handleSuggestLinks} disabled={suggestingLinks || data.objectTypes.length < 2}>
            {suggestingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI 建议链接
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> 新建链接类型</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建链接类型</DialogTitle>
                <DialogDescription>定义对象类型之间的新语义关系。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>显示名称 *</Label>
                  <Input value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="例如：工作于、包含、管理" />
                </div>
                <div className="space-y-2">
                  <Label>链接类型 ID *</Label>
                  <Input value={newLinkId} onChange={e => setNewLinkId(e.target.value)} placeholder="例如：lt_employee_facility" className="font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>源对象类型 *</Label>
                    <Select value={newLinkSource} onValueChange={setNewLinkSource}>
                      <SelectTrigger><SelectValue placeholder="选择源对象" /></SelectTrigger>
                      <SelectContent>
                        {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>目标对象类型 *</Label>
                    <Select value={newLinkTarget} onValueChange={setNewLinkTarget}>
                      <SelectTrigger><SelectValue placeholder="选择目标对象" /></SelectTrigger>
                      <SelectContent>
                        {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>源对象类型唯一标识</Label>
                    <Select 
                      value={newLinkSourceColumn || '__UNMAPPED__'} 
                      onValueChange={(v) => setNewLinkSourceColumn(v === '__UNMAPPED__' ? '' : v)}
                      disabled={!newLinkSource || loadingSourceColumns}
                    >
                      <SelectTrigger>
                        {loadingSourceColumns ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-slate-400">加载中...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder={newLinkSource ? "选择字段..." : "请先选择源对象类型"} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__UNMAPPED__">不设置</SelectItem>
                        {sourceColumns.map(col => (
                          <SelectItem key={col.columnName} value={col.columnName}>
                            <div className="flex flex-col items-start">
                              <span>{col.columnComment || col.columnName}</span>
                              <span className="text-xs text-slate-400 font-mono">{col.columnName} ({col.dataType})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>目标对象类型唯一标识</Label>
                    <Select 
                      value={newLinkTargetColumn || '__UNMAPPED__'} 
                      onValueChange={(v) => setNewLinkTargetColumn(v === '__UNMAPPED__' ? '' : v)}
                      disabled={!newLinkTarget || loadingTargetColumns}
                    >
                      <SelectTrigger>
                        {loadingTargetColumns ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-slate-400">加载中...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder={newLinkTarget ? "选择字段..." : "请先选择目标对象类型"} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__UNMAPPED__">不设置</SelectItem>
                        {targetColumns.map(col => (
                          <SelectItem key={col.columnName} value={col.columnName}>
                            <div className="flex flex-col items-start">
                              <span>{col.columnComment || col.columnName}</span>
                              <span className="text-xs text-slate-400 font-mono">{col.columnName} ({col.dataType})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>基数</Label>
                  <Select value={newLinkCardinality} onValueChange={(v: any) => setNewLinkCardinality(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">一对一 (1:1)</SelectItem>
                      <SelectItem value="1:N">一对多 (1:N)</SelectItem>
                      <SelectItem value="N:1">多对一 (N:1)</SelectItem>
                      <SelectItem value="N:M">多对多 (N:M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input value={newLinkDesc} onChange={e => setNewLinkDesc(e.target.value)} placeholder="此关系的业务含义" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Suggestions */}
      {linkSuggestions.length > 0 && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI 建议的关系
          </p>
          <div className="space-y-2">
            {linkSuggestions.map((s, i) => {
              const src = data.objectTypes.find(o => o.id === s.sourceObjectId)?.name || s.sourceObjectId;
              const tgt = data.objectTypes.find(o => o.id === s.targetObjectId)?.name || s.targetObjectId;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900">{s.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">{s.cardinality}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <span>{src}</span><ArrowRight className="w-3 h-3" /><span>{tgt}</span>
                    </div>
                    {s.businessLogic && <p className="text-xs text-slate-400 mt-1 italic">{s.businessLogic}</p>}
                  </div>
                  <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 ml-4"
                    onClick={() => handleAddSuggestion(s)}>
                    <Plus className="w-3 h-3 mr-1" /> 添加
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="搜索链接类型..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>名称</TableHead>
              <TableHead>链接类型 ID</TableHead>
              <TableHead>关系</TableHead>
              <TableHead>基数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinkTypes.map(lt => {
              const source = data.objectTypes.find(o => o.id === lt.sourceObjectId)?.name;
              const target = data.objectTypes.find(o => o.id === lt.targetObjectId)?.name;
              return (
                <TableRow key={lt.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <LinkIcon className="w-3 h-3" />
                      </div>
                      {lt.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{lt.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">{source || lt.sourceObjectId}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-medium">{target || lt.targetObjectId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-slate-50">
                      {lt.cardinality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleEdit(lt)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(lt)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredLinkTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">未找到链接类型。</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑链接类型</DialogTitle>
            <DialogDescription>修改链接类型的配置信息。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>显示名称 *</Label>
              <Input value={editLinkName} onChange={e => setEditLinkName(e.target.value)} placeholder="例如：工作于、包含、管理" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>源对象类型 *</Label>
                <Select value={editLinkSource} onValueChange={setEditLinkSource}>
                  <SelectTrigger><SelectValue placeholder="选择源对象" /></SelectTrigger>
                  <SelectContent>
                    {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>目标对象类型 *</Label>
                <Select value={editLinkTarget} onValueChange={setEditLinkTarget}>
                  <SelectTrigger><SelectValue placeholder="选择目标对象" /></SelectTrigger>
                  <SelectContent>
                    {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>源对象类型唯一标识</Label>
                <Select 
                  value={editLinkSourceColumn || '__UNMAPPED__'} 
                  onValueChange={(v) => setEditLinkSourceColumn(v === '__UNMAPPED__' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择字段..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__UNMAPPED__">不设置</SelectItem>
                    {sourceColumns.map(col => (
                      <SelectItem key={col.columnName} value={col.columnName}>
                        <div className="flex flex-col items-start">
                          <span>{col.columnComment || col.columnName}</span>
                          <span className="text-xs text-slate-400 font-mono">{col.columnName} ({col.dataType})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>目标对象类型唯一标识</Label>
                <Select 
                  value={editLinkTargetColumn || '__UNMAPPED__'} 
                  onValueChange={(v) => setEditLinkTargetColumn(v === '__UNMAPPED__' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择字段..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__UNMAPPED__">不设置</SelectItem>
                    {targetColumns.map(col => (
                      <SelectItem key={col.columnName} value={col.columnName}>
                        <div className="flex flex-col items-start">
                          <span>{col.columnComment || col.columnName}</span>
                          <span className="text-xs text-slate-400 font-mono">{col.columnName} ({col.dataType})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>基数</Label>
              <Select value={editLinkCardinality} onValueChange={(v: any) => setEditLinkCardinality(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">一对一 (1:1)</SelectItem>
                  <SelectItem value="1:N">一对多 (1:N)</SelectItem>
                  <SelectItem value="N:1">多对一 (N:1)</SelectItem>
                  <SelectItem value="N:M">多对多 (N:M)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input value={editLinkDesc} onChange={e => setEditLinkDesc(e.target.value)} placeholder="此关系的业务含义" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpdate} disabled={editing}>
              {editing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

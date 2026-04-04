import React, { useState } from 'react';
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

  const filteredObjectTypes = data.objectTypes.filter(ot =>
    ot.name.toLowerCase().includes(search.toLowerCase()) ||
    ot.id.toLowerCase().includes(search.toLowerCase())
  );

  // Keep selectedObjectType in sync with data updates
  const syncedSelected = selectedObjectType
    ? data.objectTypes.find(ot => ot.id === selectedObjectType.id) || null
    : null;

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

  const handleSuggestProperties = async () => {
    if (!syncedSelected) return;
    setSuggestingProps(true);
    try {
      const result = await api.suggestProperties(
        syncedSelected.name,
        syncedSelected.description,
        syncedSelected.properties
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
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setSelectedObjectType(null); setPropSuggestions([]); }} className="text-slate-500">
            ← Back to Object Types
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
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <Button onClick={handleSaveMetadata}>Save Changes</Button>
          </div>
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties" className="gap-2"><FileText className="w-4 h-4" /> Properties</TabsTrigger>
            <TabsTrigger value="datasource" className="gap-2"><TableIcon className="w-4 h-4" /> Datasource</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings2 className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {/* AI Suggestions */}
            {propSuggestions.length > 0 && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI-Suggested Properties
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
                        <Plus className="w-3 h-3 mr-1" /> Add
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
                  Properties ({syncedSelected.properties.length})
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-purple-600 border-purple-200"
                    onClick={handleSuggestProperties} disabled={suggestingProps}>
                    {suggestingProps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Suggest
                  </Button>
                  <Dialog open={propDialogOpen} onOpenChange={setPropDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <Plus className="w-3 h-3" /> Add Property
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Property</DialogTitle>
                        <DialogDescription>Define a new property for {syncedSelected.name}.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Display Name *</Label>
                          <Input value={newPropName} onChange={e => setNewPropName(e.target.value)} placeholder="e.g. Email Address" />
                        </div>
                        <div className="space-y-2">
                          <Label>Property ID *</Label>
                          <Input value={newPropId} onChange={e => setNewPropId(e.target.value)} placeholder="e.g. p_email" className="font-mono text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
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
                          <Label>Base Column</Label>
                          <Input value={newPropBaseCol} onChange={e => setNewPropBaseCol(e.target.value)} placeholder="e.g. email_address" className="font-mono text-sm" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPropDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddProperty} disabled={addingProp}>
                          {addingProp ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                          Add Property
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Property ID</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Type Classes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedSelected.properties.map(prop => (
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
                  {syncedSelected.properties.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-16 text-center text-slate-400 text-sm">
                        No properties yet. Add one to get started.
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
                <h3 className="font-semibold text-slate-900">Backing Dataset</h3>
                <p className="text-sm text-slate-500 mb-4">The dataset that powers this object type.</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Database className="w-5 h-5 text-blue-500" />
                  <span className="font-mono text-sm text-slate-700">{syncedSelected.backingDataset || '(not set)'}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Column Mapping</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Base Column</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncedSelected.properties.map(prop => (
                        <TableRow key={prop.id}>
                          <TableCell className="font-medium text-slate-900">{prop.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TableIcon className="w-4 h-4 text-slate-400" />
                              <span className="font-mono text-sm text-slate-600">
                                {prop.baseColumn || <span className="text-slate-400 italic">Unmapped</span>}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Metadata</h3>
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input defaultValue={syncedSelected.description} />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input defaultValue={syncedSelected.icon} />
                  </div>
                  <div className="space-y-2">
                    <Label>Backing Dataset</Label>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Object Types</h1>
          <p className="text-slate-500 text-sm mt-1">Define the core entities of your ontology.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Object Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Object Type</DialogTitle>
              <DialogDescription>Define a new entity in your ontology.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input value={newOtName} onChange={e => setNewOtName(e.target.value)} placeholder="e.g. Employee, Flight, Product" />
              </div>
              <div className="space-y-2">
                <Label>Object Type ID *</Label>
                <Input value={newOtId} onChange={e => setNewOtId(e.target.value)} placeholder="e.g. ot_employee" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newOtDesc} onChange={e => setNewOtDesc(e.target.value)} placeholder="What does this entity represent?" />
              </div>
              <div className="space-y-2">
                <Label>Backing Dataset</Label>
                <Input value={newOtDataset} onChange={e => setNewOtDataset(e.target.value)} placeholder="e.g. dataset_employees" className="font-mono text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateObjectType} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search object types..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Object Type ID</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead>Backing Dataset</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No object types found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { OntologyData, LinkType } from '@/src/store/ontologyStore';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { Search, Plus, Link as LinkIcon, ArrowRight, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/src/api/client';

export function LinkTypes({ data, onUpdate }: { data: OntologyData, onUpdate: (data: OntologyData) => void }) {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // New Link Type form state
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkId, setNewLinkId] = useState('');
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkTarget, setNewLinkTarget] = useState('');
  const [newLinkCardinality, setNewLinkCardinality] = useState<'1:1' | '1:N' | 'N:M'>('1:N');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // AI suggestions
  const [suggestingLinks, setSuggestingLinks] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);

  const filteredLinkTypes = data.linkTypes.filter(lt =>
    lt.name.toLowerCase().includes(search.toLowerCase()) ||
    lt.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newLinkName || !newLinkId || !newLinkSource || !newLinkTarget) {
      toast.error('Please fill in all required fields.');
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
      });
      onUpdate(result.data);
      setNewLinkName(''); setNewLinkId(''); setNewLinkSource(''); setNewLinkTarget('');
      setNewLinkCardinality('1:N'); setNewLinkDesc('');
      setCreateDialogOpen(false);
      toast.success(`Link type "${newLinkName}" created.`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Link Types</h1>
          <p className="text-slate-500 text-sm mt-1">Define relationships between object types.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={handleSuggestLinks} disabled={suggestingLinks || data.objectTypes.length < 2}>
            {suggestingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Suggest Links
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Link Type</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Link Type</DialogTitle>
                <DialogDescription>Define a new semantic relationship between object types.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input value={newLinkName} onChange={e => setNewLinkName(e.target.value)} placeholder="e.g. Works At, Contains, Manages" />
                </div>
                <div className="space-y-2">
                  <Label>Link Type ID *</Label>
                  <Input value={newLinkId} onChange={e => setNewLinkId(e.target.value)} placeholder="e.g. lt_employee_facility" className="font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Object Type *</Label>
                    <Select value={newLinkSource} onValueChange={setNewLinkSource}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Object Type *</Label>
                    <Select value={newLinkTarget} onValueChange={setNewLinkTarget}>
                      <SelectTrigger><SelectValue placeholder="Select target" /></SelectTrigger>
                      <SelectContent>
                        {data.objectTypes.map(ot => <SelectItem key={ot.id} value={ot.id}>{ot.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cardinality</Label>
                  <Select value={newLinkCardinality} onValueChange={(v: any) => setNewLinkCardinality(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">One-to-One (1:1)</SelectItem>
                      <SelectItem value="1:N">One-to-Many (1:N)</SelectItem>
                      <SelectItem value="N:M">Many-to-Many (N:M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newLinkDesc} onChange={e => setNewLinkDesc(e.target.value)} placeholder="Business meaning of this relationship" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Create
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
            <Sparkles className="w-4 h-4" /> AI-Suggested Relationships
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
                    <Plus className="w-3 h-3 mr-1" /> Add
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
          <Input placeholder="Search link types..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Link Type ID</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Cardinality</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No link types found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, FolderTree, Database, Link as LinkIcon, PlayCircle, Loader2, Network, Search, Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { api } from '@/src/api/client';
import { IndustryCategory, OntologyData } from '@/src/store/ontologyStore';

interface IndustryMapProps {
  data: OntologyData;
  onNavigate: (tab: string) => void;
}

// ── Tree Node Component ─────────────────────────────────────────────────────

function TreeNode({
  node,
  selectedId,
  onSelect,
  stats,
  expandedIds,
  onToggle,
  depth = 0,
}: {
  node: IndustryCategory;
  selectedId: string | null;
  onSelect: (id: string) => void;
  stats: Record<string, { objectTypes: number; linkTypes: number }>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth?: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const stat = stats[node.id];
  const totalEntities = stat ? stat.objectTypes + stat.linkTypes : 0;

  // Aggregate stats for children
  const childHasEntities = useMemo(() => {
    if (!node.children) return false;
    const check = (n: IndustryCategory): boolean => {
      if (stats[n.id]) return true;
      return n.children?.some(check) || false;
    };
    return node.children.some(check);
  }, [node, stats]);

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors group',
          isSelected
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-slate-700 hover:bg-slate-100'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <FolderTree className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-blue-500' : 'text-slate-400')} />
        <span className="truncate flex-1 text-left">{node.name}</span>
        {totalEntities > 0 && (
          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
            {totalEntities}
          </span>
        )}
        {!totalEntities && childHasEntities && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
        )}
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              stats={stats}
              expandedIds={expandedIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function IndustryMap({ data, onNavigate }: IndustryMapProps) {
  const [tree, setTree] = useState<IndustryCategory[]>([]);
  const [stats, setStats] = useState<Record<string, { objectTypes: number; linkTypes: number }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [industryOntology, setIndustryOntology] = useState<any>(null);
  const [loadingOntology, setLoadingOntology] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | null>(null);

  // Flat list for search
  const [allIndustries, setAllIndustries] = useState<IndustryCategory[]>([]);

  useEffect(() => {
    Promise.all([api.getIndustryTree(), api.getIndustryStats(), api.getIndustries()])
      .then(([treeRes, statsRes, indRes]) => {
        setTree(treeRes.tree);
        setStats(statsRes.stats);
        setAllIndustries(indRes.industries);
        // Auto-expand L1
        const l1Ids = new Set(treeRes.tree.map((n: IndustryCategory) => n.id));
        setExpandedIds(l1Ids);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setLoadingOntology(true);
    api.getIndustryOntology(id)
      .then((res) => {
        setIndustryOntology(res);
        setSelectedIndustry(res.industry as IndustryCategory);
      })
      .catch(console.error)
      .finally(() => setLoadingOntology(false));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Search filter
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    const q = searchQuery.toLowerCase();
    const matchIds = new Set<string>();
    const parentMap = new Map<string, string>();

    for (const ind of allIndustries) {
      if (ind.name.toLowerCase().includes(q) || ind.code.includes(q)) {
        matchIds.add(ind.id);
        // Add all ancestors
        let pid = ind.parent_id;
        while (pid) {
          matchIds.add(pid);
          const parent = allIndustries.find((i) => i.id === pid);
          pid = parent?.parent_id || null;
        }
      }
    }

    const filterNodes = (nodes: IndustryCategory[]): IndustryCategory[] => {
      return nodes
        .filter((n) => matchIds.has(n.id))
        .map((n) => ({
          ...n,
          children: n.children ? filterNodes(n.children) : [],
        }));
    };
    return filterNodes(tree);
  }, [tree, searchQuery, allIndustries]);

  // Summary stats
  const totalL1 = tree.length;
  const totalIndustries = allIndustries.length;
  const industriesWithEntities = Object.keys(stats).length;

  // Count entities in selected industry
  const selectedOT = industryOntology?.objectTypes?.length || 0;
  const selectedLT = industryOntology?.linkTypes?.length || 0;
  const selectedAT = industryOntology?.actionTypes?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>加载行业分类...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              产业图谱
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              基于申万行业分类标准 · {totalL1} 个一级行业 · {totalIndustries} 个子分类 · {industriesWithEntities} 个行业已建模
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Industry Tree */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索行业..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredTree.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                未找到匹配行业
              </div>
            ) : (
              filteredTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  stats={stats}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Industry Detail */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <FolderTree className="w-16 h-16 opacity-30" />
              <div className="text-center">
                <p className="text-lg font-medium text-slate-500">选择一个行业分类</p>
                <p className="text-sm mt-1">从左侧目录树中选择行业，查看该行业的本体图谱</p>
              </div>
            </div>
          ) : loadingOntology ? (
            <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>加载行业图谱...</span>
            </div>
          ) : (
            <div className="p-6">
              {/* Industry Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedIndustry?.name || ''}
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                    {selectedIndustry?.code}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                    L{selectedIndustry?.level}
                  </span>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <Database className="w-4 h-4" />
                    对象类型
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{selectedOT}</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <LinkIcon className="w-4 h-4" />
                    链接类型
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{selectedLT}</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <PlayCircle className="w-4 h-4" />
                    行动类型
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{selectedAT}</div>
                </div>
              </div>

              {/* Object Types */}
              {selectedOT > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    对象类型 ({selectedOT})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {industryOntology.objectTypes.map((ot: any) => (
                      <div key={ot.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-slate-900">{ot.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{ot.id}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{ot.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ot.properties?.map((p: any) => (
                            <span
                              key={p.id}
                              className={cn(
                                'text-[11px] px-1.5 py-0.5 rounded',
                                p.isPrimaryKey
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-50 text-slate-600 border border-slate-100'
                              )}
                            >
                              {p.name}
                              <span className="text-slate-400 ml-0.5">({p.type})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Link Types */}
                  {selectedLT > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mt-6">
                        <LinkIcon className="w-4 h-4 text-emerald-500" />
                        链接类型 ({selectedLT})
                      </h3>
                      <div className="space-y-2">
                        {industryOntology.linkTypes.map((lt: any) => (
                          <div key={lt.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm font-medium text-slate-700">
                                {data.objectTypes.find((ot) => ot.id === lt.sourceObjectId)?.name || lt.sourceObjectId}
                              </span>
                              <span className="text-xs text-slate-400">→</span>
                              <span className="text-sm font-medium text-emerald-600">{lt.name}</span>
                              <span className="text-xs text-slate-400">→</span>
                              <span className="text-sm font-medium text-slate-700">
                                {data.objectTypes.find((ot) => ot.id === lt.targetObjectId)?.name || lt.targetObjectId}
                              </span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                              {lt.cardinality}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Action Types */}
                  {selectedAT > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mt-6">
                        <PlayCircle className="w-4 h-4 text-purple-500" />
                        行动类型 ({selectedAT})
                      </h3>
                      <div className="space-y-2">
                        {industryOntology.actionTypes.map((at: any) => (
                          <div key={at.id} className="bg-white rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <PlayCircle className="w-3.5 h-3.5 text-purple-500" />
                              <span className="text-sm font-medium text-slate-900">{at.name}</span>
                            </div>
                            <p className="text-xs text-slate-500">{at.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                  <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">该行业暂无本体数据</p>
                  <p className="text-sm text-slate-400 mt-1">
                    在 AI Studio 中生成本体时可指定行业分类，或在对象类型编辑中设置行业归属
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

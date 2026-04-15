import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { OntologyData, ObjectType, LinkType } from '@/src/store/ontologyStore';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Link as LinkIcon, Key, X, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/src/components/ui/sheet';
import { AiStudio } from './AiStudio';
import dagre from 'dagre';
import { cn } from '@/src/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#14b8a6'];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

// ── Custom Node ──────────────────────────────────────────────────────────────

const ObjectTypeNode = ({ data }: NodeProps) => {
  const color = data.color as string || '#3b82f6';
  const properties = data.properties as any[] || [];
  const selected = data.selected as boolean;
  const status = data.status as string;
  const isPending = status === 'pending';

  return (
    <div
      className="shadow-lg rounded-xl min-w-[220px] max-w-[260px] transition-all relative"
      style={{
        borderWidth: 2,
        borderStyle: isPending ? 'dashed' : 'solid',
        borderColor: isPending ? '#9ca3af' : (selected ? color : '#e2e8f0'),
        boxShadow: selected ? `0 0 0 3px ${color}33` : undefined,
        backgroundColor: isPending ? '#f9fafb' : 'white',
      }}
    >
      {isPending && (
        <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full border border-amber-200 font-medium">
          待审核
        </div>
      )}
      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2" style={{ background: color }} />
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2" style={{ background: color }} />

      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2 cursor-pointer" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Database className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-900 truncate">{data.label as string}</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{data.id as string}</div>
        </div>
      </div>

      {/* Properties */}
      <div className="px-3 py-2">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          属性 ({properties.length})
        </div>
        <div className="space-y-0.5">
          {properties.slice(0, 5).map((p: any) => (
            <div key={p.id} className="flex items-center gap-1.5 text-[11px] py-0.5">
              {p.isPrimaryKey && <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
              <span className="text-slate-700 truncate flex-1">{p.name}</span>
              <span className="text-slate-400 font-mono text-[9px] shrink-0 bg-slate-50 px-1 rounded">{p.type}</span>
            </div>
          ))}
          {properties.length > 5 && (
            <div className="text-[10px] text-slate-400 italic pt-0.5">+{properties.length - 5} 更多</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2" style={{ background: color }} />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2" style={{ background: color }} />
    </div>
  );
};

const nodeTypes = { objectType: ObjectTypeNode };

// ── Dagre layout ─────────────────────────────────────────────────────────────

function layoutGraph(objectTypes: ObjectType[], linkTypes: LinkType[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 160, marginx: 40, marginy: 40 });

  objectTypes.forEach(ot => {
    const height = 70 + Math.min(ot.properties.length, 5) * 18;
    g.setNode(ot.id, { width: 250, height });
  });

  linkTypes.forEach(lt => {
    if (g.hasNode(lt.sourceObjectId) && g.hasNode(lt.targetObjectId)) {
      g.setEdge(lt.sourceObjectId, lt.targetObjectId);
    }
  });

  dagre.layout(g);

  return objectTypes.map((ot, i) => {
    const pos = g.node(ot.id);
    return {
      id: ot.id,
      type: 'objectType' as const,
      position: { x: pos?.x || 200 * i, y: pos?.y || 200 * Math.floor(i / 3) },
      data: {
        label: ot.name,
        id: ot.id,
        properties: ot.properties,
        color: getColor(i),
        selected: false,
        status: ot.status,
      },
    };
  });
}

// ── Side Panel ───────────────────────────────────────────────────────────────

function DetailPanel({
  objectType,
  relatedLinks,
  allObjects,
  onClose,
  onNavigate,
}: {
  objectType: ObjectType;
  relatedLinks: LinkType[];
  allObjects: ObjectType[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const inbound = relatedLinks.filter(lt => lt.targetObjectId === objectType.id);
  const outbound = relatedLinks.filter(lt => lt.sourceObjectId === objectType.id);
  const getName = (id: string) => allObjects.find(o => o.id === id)?.name || id;

  return (
    <div className="w-[360px] bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-slate-900 truncate">{objectType.name}</h2>
          <p className="text-xs text-slate-400 font-mono truncate">{objectType.id}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        {objectType.description && (
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm text-slate-600">{objectType.description}</p>
          </div>
        )}

        {/* Properties */}
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            属性 ({objectType.properties.length})
          </h3>
          <div className="space-y-1">
            {objectType.properties.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-50">
                {p.isPrimaryKey && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-xs truncate">{p.name}</div>
                  {p.description && <div className="text-[10px] text-slate-400 truncate">{p.description}</div>}
                </div>
                <Badge variant="secondary" className="font-mono text-[9px] h-4 px-1.5 shrink-0">{p.type}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Outbound Links */}
        {outbound.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              出站链接 ({outbound.length})
            </h3>
            <div className="space-y-1.5">
              {outbound.map(lt => (
                <button key={lt.id} className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 group"
                  onClick={() => onNavigate(lt.targetObjectId)}>
                  <LinkIcon className="w-3 h-3 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      {lt.name}
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-blue-600">{getName(lt.targetObjectId)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{lt.description}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] h-4 shrink-0">{lt.cardinality}</Badge>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inbound Links */}
        {inbound.length > 0 && (
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              入站链接 ({inbound.length})
            </h3>
            <div className="space-y-1.5">
              {inbound.map(lt => (
                <button key={lt.id} className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                  onClick={() => onNavigate(lt.sourceObjectId)}>
                  <LinkIcon className="w-3 h-3 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <span className="text-blue-600">{getName(lt.sourceObjectId)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      {lt.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{lt.description}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] h-4 shrink-0">{lt.cardinality}</Badge>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Backing Dataset */}
        {objectType.backingDataset && (
          <div className="px-4 py-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dataset</h3>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Database className="w-3 h-3 text-slate-400" />
              <span className="font-mono text-[10px] text-slate-500 truncate">{objectType.backingDataset}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function GraphView({ data, onUpdate }: { data: OntologyData; onUpdate?: (data: OntologyData) => void }) {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);

  const initialNodes = useMemo(() => layoutGraph(data.objectTypes, data.linkTypes), [data.objectTypes, data.linkTypes]);

  const initialEdges: Edge[] = useMemo(() => {
    return data.linkTypes.map(lt => {
      const srcIdx = data.objectTypes.findIndex(o => o.id === lt.sourceObjectId);
      const color = getColor(srcIdx >= 0 ? srcIdx : 0);
      const isPending = lt.status === 'pending';
      return {
        id: lt.id,
        source: lt.sourceObjectId,
        target: lt.targetObjectId,
        label: `${lt.name} (${lt.cardinality})${isPending ? ' [待审核]' : ''}`,
        animated: !isPending,
        style: {
          stroke: isPending ? '#9ca3af' : color,
          strokeWidth: 2,
          opacity: 0.7,
          strokeDasharray: isPending ? '5,5' : undefined,
        },
        labelStyle: { fill: isPending ? '#9ca3af' : '#475569', fontWeight: 500, fontSize: 11 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [data.linkTypes, data.objectTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Highlight selected node
  useEffect(() => {
    setNodes(nds =>
      nds.map(n => ({
        ...n,
        data: { ...n.data, selected: n.id === selectedObjectId },
      }))
    );
    // Highlight connected edges
    setEdges(eds =>
      eds.map(e => {
        const connected = selectedObjectId && (e.source === selectedObjectId || e.target === selectedObjectId);
        return {
          ...e,
          style: {
            ...e.style,
            strokeWidth: connected ? 3 : 2,
            opacity: selectedObjectId ? (connected ? 1 : 0.3) : 0.7,
          },
          animated: connected || !selectedObjectId,
        };
      })
    );
  }, [selectedObjectId, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: any, node: any) => {
    setSelectedObjectId(prev => prev === node.id ? null : node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedObjectId(null);
  }, []);

  const selectedObject = data.objectTypes.find(o => o.id === selectedObjectId) || null;
  const relatedLinks = selectedObjectId
    ? data.linkTypes.filter(lt => lt.sourceObjectId === selectedObjectId || lt.targetObjectId === selectedObjectId)
    : [];

  return (
    <div className="h-full w-full flex flex-col -m-6">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">本体图谱</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            点击任意实体查看其详情和关系。通过链接导航探索图谱。
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>{data.objectTypes.length} 个实体</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>{data.linkTypes.length} 个关系</span>
          </div>
          {/* 图例 */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-4 h-3 border-2 border-slate-300 rounded" style={{ borderStyle: 'solid' }}></div>
              <span>已生效</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-4 h-3 border-2 border-slate-400 rounded bg-slate-100" style={{ borderStyle: 'dashed' }}></div>
              <span>待审核</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Graph */}
        <div className="flex-1 bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.2}
            maxZoom={2}
          >
            {/* Controls in top-left */}
            <Panel position="top-left" className="!m-2">
              <Controls className="bg-white border-slate-200 shadow-sm !static" showInteractive={false} />
            </Panel>
            
            {/* MiniMap in bottom-left */}
            <Panel position="bottom-left" className="!m-2">
              <MiniMap
                nodeColor={node => {
                  const idx = data.objectTypes.findIndex(o => o.id === node.id);
                  return getColor(idx >= 0 ? idx : 0);
                }}
                maskColor="rgba(248, 250, 252, 0.7)"
                className="bg-white border border-slate-200 rounded-lg shadow-sm"
              />
            </Panel>
            
            {/* AI Floating Ball in bottom-right */}
            <Panel position="bottom-right" className="!m-4">
              <Sheet open={aiSheetOpen} onOpenChange={setAiSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600",
                      "flex items-center justify-center gap-1",
                      "text-white text-xs font-medium",
                      "shadow-lg hover:shadow-xl hover:scale-105",
                      "transition-all duration-300",
                      "animate-pulse hover:animate-none",
                      "group relative"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[10px]">AI</span>
                    {/* Tooltip */}
                    <div className={cn(
                      "absolute right-full mr-3 top-1/2 -translate-y-1/2",
                      "bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap",
                      "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    )}>
                      AI本体建模
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[600px] sm:max-w-[600px] p-0 bg-slate-50/95 backdrop-blur-sm"
                  style={{ '--sheet-overlay-opacity': '0.3' } as React.CSSProperties}
                >
                  <AiStudio data={data} onUpdate={onUpdate || (() => {})} embedded />
                </SheetContent>
              </Sheet>
            </Panel>
            
            <Background color="#cbd5e1" gap={20} />
          </ReactFlow>
        </div>

        {/* Detail Panel */}
        {selectedObject && (
          <DetailPanel
            objectType={selectedObject}
            relatedLinks={relatedLinks}
            allObjects={data.objectTypes}
            onClose={() => setSelectedObjectId(null)}
            onNavigate={id => setSelectedObjectId(id)}
          />
        )}
      </div>
    </div>
  );
}

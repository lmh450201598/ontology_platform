import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OntologyData, ObjectType, Property } from '@/src/store/ontologyStore';
import { api } from '@/src/api/client';
import { 
  Database, 
  Search, 
  ChevronRight,
  Network,
  BarChart3,
  Table,
  X,
  RefreshCw,
  PieChart,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import * as d3 from 'd3';

interface ObjectExplorerProps {
  data: OntologyData;
}

interface ObjectInstance {
  [key: string]: any;
}

// 属性统计维度
interface PropertyStats {
  property: Property;
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  valueDistribution: Array<{
    value: any;
    count: number;
    percentage: number;
  }>;
}

// 图谱节点
interface GraphNode {
  id: string;
  objectTypeId: string;
  objectTypeName: string;
  instanceId: string;
  label: string;
  data: any;
  depth: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// 图谱链接
interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  linkTypeId: string;
  linkTypeName: string;
  cardinality: string;
  direction: string;
}

export function ObjectExplorer({ data }: ObjectExplorerProps) {
  const [selectedObjectType, setSelectedObjectType] = useState<string>('');
  const [instances, setInstances] = useState<ObjectInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<ObjectInstance | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'instances' | 'graph'>('overview');
  
  // 图谱相关状态
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);

  // 获取对象类型实例数据并计算属性统计
  const fetchInstances = useCallback(async (objectTypeId: string) => {
    if (!objectTypeId) return;
    setLoading(true);
    try {
      const result = await api.getObjectInstances(objectTypeId);
      const instanceData = result.data || [];
      const objectTypeFromApi = result.objectType;
      setInstances(instanceData);
      calculatePropertyStats(instanceData, objectTypeFromApi, objectTypeId);
    } catch (error: any) {
      toast.error(`获取实例数据失败: ${error.message}`);
      setInstances([]);
      setPropertyStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 计算属性维度统计
  const calculatePropertyStats = (instanceData: ObjectInstance[], objectTypeFromApi?: any, objectTypeId?: string) => {
    if (!instanceData.length) return;
    
    const currentObjectTypeId = objectTypeId || selectedObjectType;
    if (!currentObjectTypeId) return;
    
    // 优先使用 API 返回的 objectType（属性 ID 与数据匹配）
    const properties = objectTypeFromApi?.properties || 
                       data.objectTypes.find(ot => ot.id === currentObjectTypeId)?.properties || [];
    
    if (!properties.length) return;

    const stats: PropertyStats[] = properties.map((prop: any) => {
      const values = instanceData.map(item => item[prop.id]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const uniqueValues = [...new Set(nonNullValues)];
      
      // 计算值分布
      const valueCounts: Record<string, number> = {};
      nonNullValues.forEach(v => {
        const key = String(v);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });
      
      const valueDistribution = Object.entries(valueCounts)
        .map(([value, count]) => ({
          value,
          count,
          percentage: Math.round((count / instanceData.length) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        property: prop,
        totalCount: instanceData.length,
        uniqueCount: uniqueValues.length,
        nullCount: instanceData.length - nonNullValues.length,
        valueDistribution
      };
    });
    
    setPropertyStats(stats);
  };

  // 过滤实例
  const filteredInstances = instances.filter(instance => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(instance).some(value => 
      String(value).toLowerCase().includes(query)
    );
  });

  // 获取当前选中的对象类型
  const currentObjectType = data.objectTypes.find(ot => ot.id === selectedObjectType);

  // 获取主键属性
  const getPrimaryKeyProperty = (ot: ObjectType | undefined) => {
    if (!ot) return null;
    return ot.properties.find(p => p.isPrimaryKey) || ot.properties[0];
  };

  const primaryKeyProp = getPrimaryKeyProperty(currentObjectType);

  // 获取关系图谱数据
  const fetchGraphData = useCallback(async () => {
    if (!selectedObjectType || !selectedInstance || !primaryKeyProp) {
      console.log('fetchGraphData early return:', { selectedObjectType, selectedInstance, primaryKeyProp });
      return;
    }
    
    const instanceId = selectedInstance[primaryKeyProp.id];
    console.log('fetchGraphData instanceId:', instanceId, 'from prop:', primaryKeyProp.id);
    if (!instanceId) return;
    
    setGraphLoading(true);
    try {
      console.log('Calling API with:', selectedObjectType, instanceId);
      const result = await api.getRelationGraph(selectedObjectType, instanceId, 3);
      console.log('API result:', result);
      setGraphData(result.data);
    } catch (error: any) {
      console.error('API error:', error);
      toast.error(`获取关系图谱失败: ${error.message}`);
      setGraphData(null);
    } finally {
      setGraphLoading(false);
    }
  }, [selectedObjectType, selectedInstance, primaryKeyProp]);

  // D3力导向图渲染
  useEffect(() => {
    console.log('D3 render useEffect triggered:', { graphData: !!graphData, svgRef: !!svgRef.current, viewMode });
    if (!graphData || !svgRef.current || viewMode !== 'graph') return;
  
    console.log('D3 rendering with:', { 
      nodes: graphData.nodes.length, 
      links: graphData.links.length,
      firstNode: graphData.nodes[0],
      firstLink: graphData.links[0]
    });
  
    // 过滤掉引用不存在节点的链接
    const nodeIds = new Set(graphData.nodes.map(n => n.id));
    const validLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
      const valid = nodeIds.has(sourceId) && nodeIds.has(targetId);
      if (!valid) {
        console.warn('Filtering invalid link:', link.id, 'source:', sourceId, 'target:', targetId);
      }
      return valid;
    });
      
    console.log('Valid links after filtering:', validLinks.length, '/', graphData.links.length);
  
    const svg = d3.select(svgRef.current);
      
    // 等待svg元素渲染完成后获取尺寸
    const rect = svgRef.current.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
      
    console.log('SVG dimensions:', { width, height });
      
    // 如果尺寸为0，使用默认值
    if (width === 0 || height === 0) {
      width = 800;
      height = 600;
    }
  
    // 清除旧内容
    svg.selectAll('*').remove();
      
    // 设置viewBox确保图谱可见
    svg.attr('viewBox', `0 0 ${width} ${height}`);
  
    // 添加缩放功能
    const g = svg.append('g');
      
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
  
    svg.call(zoom);
  
    // 创建力导向模拟 - 使用过滤后的有效链接
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(validLinks)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));
  
    // 添加箭头标记 - 只用于下游关系
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-10 -5 10 10')
      .attr('refX', 40)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M-10,-5L0,0L-10,5')
      .attr('fill', '#999');

    // 绘制链接线 - 只在下游关系显示箭头
    const link = g.append('g')
      .selectAll('line')
      .data(validLinks)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', d => d.direction === 'downstream' ? 'url(#arrowhead)' : null);

    // 绘制节点组
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on('click', (event: MouseEvent, d: GraphNode) => {
        event.stopPropagation();
        setSelectedGraphNode(d);
      });

    // 节点背景圆
    node.append('rect')
      .attr('width', 80)
      .attr('height', 40)
      .attr('x', -40)
      .attr('y', -20)
      .attr('rx', 8)
      .attr('fill', d => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[d.depth % colors.length];
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // 节点文字
    node.append('text')
      .text(d => d.label.length > 10 ? d.label.substring(0, 10) + '...' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', '500');

    // 节点类型标签
    node.append('text')
      .text(d => d.objectTypeName.length > 8 ? d.objectTypeName.substring(0, 8) + '..' : d.objectTypeName)
      .attr('text-anchor', 'middle')
      .attr('dy', 32)
      .attr('fill', '#666')
      .attr('font-size', '8px');

    // 链接标签
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(validLinks)
      .join('text')
      .text(d => d.linkTypeName)
      .attr('font-size', '8px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle');

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);

      linkLabel
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2 - 5);
    });

    // 初始缩放适应
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 4, height / 4).scale(0.8));

    return () => {
      simulation.stop();
    };
  }, [graphData, viewMode]);

  // 当切换到图谱视图时获取数据
  useEffect(() => {
    if (viewMode === 'graph' && selectedInstance && primaryKeyProp) {
      fetchGraphData();
    }
  }, [viewMode, selectedInstance, primaryKeyProp, fetchGraphData]);

  // 获取属性图标
  const getPropertyIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'number':
      case 'double':
      case 'integer':
        return Hash;
      case 'date':
        return Calendar;
      case 'boolean':
        return ToggleLeft;
      default:
        return Type;
    }
  };

  // 当选择对象类型时
  useEffect(() => {
    if (selectedObjectType) {
      fetchInstances(selectedObjectType);
      setViewMode('overview');
      setSelectedProperty(null);
      setSelectedInstance(null);
    }
  }, [selectedObjectType, fetchInstances]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">对象浏览器</h1>
          <p className="text-slate-500 mt-1">浏览对象实例数据，查看上下游关系图谱</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel - Object Type Selector & Property Stats */}
        <div className="w-2/5 flex flex-col gap-4 min-h-0">
          {/* Object Type Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                选择对象类型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedObjectType} onValueChange={(value) => {
                setSelectedObjectType(value);
                setViewMode('overview');
                setSelectedInstance(null);
                setSelectedProperty(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择对象类型..." />
                </SelectTrigger>
                <SelectContent>
                  {data.objectTypes.map(ot => (
                    <SelectItem key={ot.id} value={ot.id}>
                      <div className="flex items-center gap-2">
                        <span>{ot.icon || '📦'}</span>
                        <span>{ot.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {ot.properties.length} 属性
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Property Dimension Stats */}
          {selectedObjectType && (
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    属性维度统计
                    <Badge variant="secondary">{propertyStats.length} 个属性</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fetchInstances(selectedObjectType)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : propertyStats.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>暂无统计数据</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {propertyStats.map((stat) => {
                      const Icon = getPropertyIcon(stat.property.type);
                      return (
                        <div
                          key={stat.property.id}
                          className={cn(
                            "px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
                            selectedProperty?.id === stat.property.id && "bg-blue-50 hover:bg-blue-50"
                          )}
                          onClick={() => {
                            setSelectedProperty(stat.property);
                            setViewMode('instances');
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-sm">{stat.property.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {stat.property.type || 'string'}
                            </Badge>
                          </div>
                          
                          {/* Stats Summary */}
                          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                            <div className="bg-slate-50 rounded px-2 py-1 text-center">
                              <div className="font-semibold text-blue-600">{stat.totalCount}</div>
                              <div className="text-slate-400">总数</div>
                            </div>
                            <div className="bg-slate-50 rounded px-2 py-1 text-center">
                              <div className="font-semibold text-emerald-600">{stat.uniqueCount}</div>
                              <div className="text-slate-400">唯一值</div>
                            </div>
                            <div className="bg-slate-50 rounded px-2 py-1 text-center">
                              <div className="font-semibold text-amber-600">{stat.nullCount}</div>
                              <div className="text-slate-400">空值</div>
                            </div>
                          </div>

                          {/* Value Distribution Preview */}
                          {stat.valueDistribution.length > 0 && (
                            <div className="space-y-1">
                              {stat.valueDistribution.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <div className="flex-1 truncate text-slate-600" title={item.value}>
                                    {item.value}
                                  </div>
                                  <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-500 h-1.5 rounded-full"
                                      style={{ width: `${item.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-slate-400 w-8 text-right">{item.count}</span>
                                </div>
                              ))}
                              {stat.valueDistribution.length > 3 && (
                                <div className="text-xs text-slate-400 text-center">
                                  +{stat.valueDistribution.length - 3} 更多值
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {!selectedObjectType ? (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>请先选择对象类型查看属性统计</p>
              </div>
            </Card>
          ) : viewMode === 'overview' ? (
            <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>点击左侧属性查看值分布详情</p>
                <p className="text-sm text-slate-400 mt-2">或选择实例查看上下游图谱</p>
              </div>
            </Card>
          ) : viewMode === 'instances' && selectedProperty ? (
            /* Property Value Distribution & Instances */
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        {selectedProperty.name}
                        <Badge variant="outline">{selectedProperty.type || 'string'}</Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">属性值分布</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedProperty(null);
                        setViewMode('overview');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const stat = propertyStats.find(s => s.property.id === selectedProperty.id);
                    if (!stat) return null;
                    return (
                      <div className="space-y-3">
                        {stat.valueDistribution.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium truncate" title={item.value}>
                                  {item.value}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {item.count} ({item.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Instances with this property value */}
              <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    实例列表
                    <Badge variant="secondary">{filteredInstances.length}</Badge>
                  </CardTitle>
                  
                  <div className="relative mt-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="搜索实例..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                  {filteredInstances.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>暂无实例数据</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredInstances.map((instance, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedInstance(instance);
                            setViewMode('graph');
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors",
                            selectedInstance === instance && "bg-blue-50 hover:bg-blue-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm truncate">
                              {primaryKeyProp ? instance[primaryKeyProp.id] : `实例 #${index + 1}`}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {currentObjectType?.properties.slice(0, 3).map(prop => (
                              <span key={prop.id} className="mr-3">
                                {prop.name}: {instance[prop.id] || '-'}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : viewMode === 'graph' ? (
            /* Relation Graph */
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    关系图谱
                    {graphData && (
                      <Badge variant="secondary" className="text-xs">
                        {graphData.nodes.length} 节点 / {graphData.links.length} 关系
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchGraphData()}
                      disabled={graphLoading}
                    >
                      {graphLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('instances')}
                    >
                      返回实例列表
                    </Button>
                  </div>
                </div>
                {primaryKeyProp && selectedInstance && (
                  <p className="text-xs text-slate-500 mt-1">
                    当前实例: {selectedInstance[primaryKeyProp.id]}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="flex h-full">
                  {/* Graph SVG */}
                  <div className="flex-1 relative">
                    {graphLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      </div>
                    ) : graphData && graphData.nodes.length > 0 ? (
                      <svg
                        ref={svgRef}
                        className="w-full h-full"
                        style={{ background: '#f8fafc' }}
                        onClick={() => setSelectedGraphNode(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        <div className="text-center">
                          <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>暂无关系数据</p>
                          <p className="text-sm text-slate-400 mt-2">该实例可能没有关联的上下游关系</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Node Detail Panel */}
                  {selectedGraphNode && (
                    <div className="w-72 border-l border-slate-200 bg-white flex flex-col">
                      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">实例详情</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedGraphNode.objectTypeName}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedGraphNode(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-3">
                          {selectedGraphNode.data && Object.entries(selectedGraphNode.data).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-slate-500">{key}:</span>
                              <span className="ml-2 text-slate-900 font-medium break-all">
                                {value !== null && value !== undefined ? String(value) : '-'}
                              </span>
                            </div>
                          ))}
                          {(!selectedGraphNode.data || Object.keys(selectedGraphNode.data).length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">无属性数据</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

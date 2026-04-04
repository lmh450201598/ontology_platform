import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Database, Link as LinkIcon, Activity, Plus, FileText, Settings2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { OntologyData } from '@/src/store/ontologyStore';

export function Dashboard({ data, onNavigate }: { data: OntologyData, onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">本体概览</h1>
          <p className="text-slate-500 text-sm mt-1">管理和监控您的企业数据模型。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => onNavigate('settings')}>
            <Settings2 className="w-4 h-4" />
            配置
          </Button>
          <Button className="gap-2" onClick={() => onNavigate('objects')}>
            <Plus className="w-4 h-4" />
            新建对象类型
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:border-blue-200 transition-colors" onClick={() => onNavigate('objects')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">对象类型</CardTitle>
            <Database className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.objectTypes.length}</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              本周 +2
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-emerald-200 transition-colors" onClick={() => onNavigate('links')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">链接类型</CardTitle>
            <LinkIcon className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{data.linkTypes.length}</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              本周 +1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">总属性数</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {data.objectTypes.reduce((acc, ot) => acc + ot.properties.length, 0)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              跨所有对象类型
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近的对象类型</CardTitle>
              <CardDescription>最近修改或创建的对象类型。</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('objects')}>查看全部</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.objectTypes.slice(0, 5).map((ot) => (
                <div key={ot.id} onClick={() => onNavigate('objects')} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-slate-900">{ot.name}</div>
                      <div className="text-xs text-slate-500">{ot.properties.length} 个属性</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {ot.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近的链接类型</CardTitle>
              <CardDescription>最近建立的关系。</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('links')}>查看全部</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.linkTypes.slice(0, 5).map((lt) => {
                const source = data.objectTypes.find(o => o.id === lt.sourceObjectId)?.name;
                const target = data.objectTypes.find(o => o.id === lt.targetObjectId)?.name;
                return (
                  <div key={lt.id} onClick={() => onNavigate('links')} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">{lt.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          {source} <span className="text-slate-300">→</span> {target}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                      {lt.cardinality}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

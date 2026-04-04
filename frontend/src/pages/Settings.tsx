import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

export function Settings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('设置保存成功。');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">设置</h1>
        <p className="text-slate-500 text-sm mt-1">管理您的本体环境和权限。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>环境设置</CardTitle>
          <CardDescription>配置当前本体环境。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">环境名称</label>
            <Input defaultValue="Production" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">描述</label>
            <Input defaultValue="Main production environment for enterprise data." />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存变更'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>访问控制</CardTitle>
          <CardDescription>管理谁可以查看和编辑本体。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-slate-200 divide-y divide-slate-200">
            <div className="flex items-center justify-between p-4 bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">本体管理员</p>
                <p className="text-xs text-slate-500">拥有创建、编辑和删除对象类型的完整权限。</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('打开管理管理员对话框。')}>管理</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">数据工程师</p>
                <p className="text-xs text-slate-500">可以将后台数据集映射到对象类型。</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('打开管理数据工程师对话框。')}>管理</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">查看者</p>
                <p className="text-xs text-slate-500">对本体图谱和定义具有只读访问权限。</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('打开管理查看者对话框。')}>管理</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

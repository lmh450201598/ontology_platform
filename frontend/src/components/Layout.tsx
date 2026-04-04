import React, { useState } from 'react';
import { LayoutDashboard, Database, Link as LinkIcon, Network, Settings, Search, Bell, UserCircle, PlayCircle, Save, CheckCircle2, Sparkles, Bot, Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/src/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'objects', label: '对象类型', icon: Database },
  { id: 'links', label: '链接类型', icon: LinkIcon },
  { id: 'actions', label: '动作类型', icon: PlayCircle },
  { id: 'graph', label: '本体图谱', icon: Network },
  // { id: 'industry', label: '产业图谱', icon: Building2 },
  { id: 'ai', label: 'AI 工作室', icon: Sparkles },
  { id: 'agents', label: '研究智能体', icon: Bot },
  { id: 'settings', label: '设置', icon: Settings },
];

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [pendingChanges, setPendingChanges] = useState(3);

  const handlePublish = () => {
    toast.success('更改已成功发布到生产环境。');
    setPendingChanges(0);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-600">
            <Network className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-tight">Ontology平台</span>
              <span className="text-xs text-blue-500/80">（集成DeepSeek）</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            生产环境
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">管理员</span>
              <span className="text-xs text-slate-500">本体管理员</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索对象类型、链接或属性..." 
                className="w-full h-9 pl-9 pr-4 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 h-8", pendingChanges > 0 ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700" : "text-slate-600 border-slate-200")}>
                  <Save className="w-3.5 h-3.5" />
                  审核变更 {pendingChanges > 0 && `(${pendingChanges})`}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>审核待处理变更</SheetTitle>
                  <SheetDescription>
                    您的本体工作空间中有 {pendingChanges} 个未发布的变更。
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  {pendingChanges > 0 ? (
                    <>
                      <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <Database className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">为 "Employee" 添加属性</p>
                          <p className="text-xs text-slate-500">添加字符串属性 "p_email" 映射到 "email_address"。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <LinkIcon className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">创建链接类型 "Employee works at Facility"</p>
                          <p className="text-xs text-slate-500">从 Employee 到 Facility 的 1:N 关系。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                        <PlayCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">创建动作类型 "Update Employee Status"</p>
                          <p className="text-xs text-slate-500">目标为 Employee 对象类型。</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                      <p>没有待处理的变更。</p>
                    </div>
                  )}
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">取消</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button onClick={handlePublish} disabled={pendingChanges === 0}>发布变更</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div className="h-6 w-px bg-slate-200"></div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 relative outline-none focus:ring-2 focus:ring-blue-200 rounded-full">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm">通知</div>
                <div className="py-2">
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-900">本体同步完成</p>
                    <p className="text-xs text-slate-500 mt-1">夜间从后台数据集的同步已成功完成。</p>
                    <p className="text-[10px] text-slate-400 mt-2">2 小时前</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p className="text-sm font-medium text-slate-900">新数据集可用</p>
                    <p className="text-xs text-slate-500 mt-1">"hr_employee_records_v2" 现在可用于映射。</p>
                    <p className="text-[10px] text-slate-400 mt-2">5 小时前</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button className="text-xs text-blue-600 hover:underline font-medium">标记全部为已读</button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-sm font-medium text-slate-600">
              环境：<span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-1">生产环境</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

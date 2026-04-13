import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Database, Link as LinkIcon, Network, Settings, Search, Bell, UserCircle, PlayCircle, Save, CheckCircle2, Sparkles, Bot, Building2, Compass, Code, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { toast } from 'sonner';
import { api, Notification } from '@/src/api/client';
import { ReviewDialog } from '@/src/components/ReviewDialog';
import { OntologyData } from '@/src/store/ontologyStore';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ontologyData?: OntologyData;
  onUpdate?: (data: OntologyData) => void;
}

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'explorer', label: '对象浏览器', icon: Compass },
  { id: 'objects', label: '对象类型', icon: Database },
  { id: 'links', label: '链接类型', icon: LinkIcon },
  { id: 'functions', label: '函数类型', icon: Code },
  { id: 'actions', label: '动作类型', icon: PlayCircle, children: [
    { id: 'actions', label: '动作类型', icon: PlayCircle },
    { id: 'rules', label: '本体规则', icon: Shield },
  ]},
  { id: 'graph', label: '本体图谱', icon: Network },
  // { id: 'industry', label: '产业图谱', icon: Building2 },
  { id: 'ai', label: 'AI 工作室', icon: Sparkles },
  { id: 'agents', label: '研究智能体', icon: Bot },
  { id: 'settings', label: '设置', icon: Settings },
];

export function Layout({ children, activeTab, setActiveTab, ontologyData, onUpdate }: LayoutProps) {
  const [pendingChanges, setPendingChanges] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  
  // 通知相关状态
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载待审核数量
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const res = await api.getPendingReviewCount();
        setPendingChanges(res.total || 0);
      } catch (err) {
        console.error('Failed to load pending count:', err);
      }
    };
    loadPendingCount();
    // 每30秒刷新一次
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // 加载通知数据
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [listRes, countRes] = await Promise.all([
          api.getNotifications(undefined, 10, 0),
          api.getUnreadCount()
        ]);
        setNotifications(listRes.notifications || []);
        setUnreadCount(countRes.count || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
    // 每60秒刷新一次
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 切换菜单展开状态
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  // 审核对话框关闭后刷新待审核数量
  const handleReviewDialogClose = (open: boolean) => {
    setReviewDialogOpen(open);
    if (!open) {
      // 重新获取待审核数量
      api.getPendingReviewCount().then(res => {
        setPendingChanges(res.total || 0);
      }).catch(() => {});
    }
  };

  // 审核通过/拒绝后的回调
  const handleDataUpdate = (data: OntologyData) => {
    if (onUpdate) {
      onUpdate(data);
    }
    // 刷新待审核数量
    api.getPendingReviewCount().then(res => {
      setPendingChanges(res.total || 0);
    }).catch(() => {});
  };

  // 标记单条通知已读
  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'READ' as const } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // 标记全部已读
  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' as const })));
      setUnreadCount(0);
      toast.success('已标记全部通知为已读');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return `${days} 天前`;
  };

  // 获取通知类型图标和颜色
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'SYSTEM': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'APPROVAL': return { bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'EXECUTION': return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'DATASET': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600' };
    }
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
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.id);
            const isActive = activeTab === item.id || (item.children?.some(c => c.id === activeTab));
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    isExpanded 
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setActiveTab(child.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          activeTab === child.id 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <child.icon className={cn("w-4 h-4", activeTab === child.id ? "text-blue-600" : "text-slate-400")} />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "gap-2 h-8", 
                pendingChanges > 0 
                  ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700" 
                  : "text-slate-600 border-slate-200"
              )}
              onClick={() => setReviewDialogOpen(true)}
            >
              <Save className="w-3.5 h-3.5" />
              审核变更 {pendingChanges > 0 && `(${pendingChanges})`}
            </Button>

            <div className="h-6 w-px bg-slate-200"></div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 relative outline-none focus:ring-2 focus:ring-blue-200 rounded-full">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm flex items-center justify-between">
                  <span>通知</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-normal text-slate-500">{unreadCount} 条未读</span>
                  )}
                </div>
                <div className="py-2 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">暂无通知</div>
                  ) : (
                    notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      return (
                        <div 
                          key={notif.id} 
                          className={cn(
                            "px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-l-2",
                            notif.status === 'UNREAD' ? "border-l-blue-500 bg-blue-50/30" : "border-l-transparent"
                          )}
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <div className="flex items-start gap-2">
                            <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", style.bg)}></span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.content}</p>
                              <p className="text-[10px] text-slate-400 mt-2">{formatTime(notif.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <button className="text-xs text-blue-600 hover:underline font-medium" onClick={handleMarkAllRead}>
                      标记全部为已读
                    </button>
                  </div>
                )}
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

      {/* 审核弹窗 */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={handleReviewDialogClose}
        onUpdate={handleDataUpdate}
      />
    </div>
  );
}

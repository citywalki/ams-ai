import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Link2, History, Home, Bell, Menu, Users, Settings, BookOpen, Folder } from 'lucide-react';
import { useMenus } from '@/contexts/MenuContext';
import type { MenuItem } from '@/services';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  bell: Bell,
  menu2: Menu,
  employee: Users,
  group: Users,
  'document-text': BookOpen,
  settings: Settings,
  folder: Folder,
  DashboardOutlined: Home,
  AlertOutlined: Bell,
  MenuOutlined: Menu,
  UserOutlined: Users,
  TeamOutlined: Users,
  BookOutlined: BookOpen,
  SettingOutlined: Settings,
  'chain-link': Link2,
  history: History,
};

function getMenuIcon(iconName?: string): React.ElementType {
  if (!iconName) return ChevronRight;
  return iconMap[iconName] || Folder;
}

function getMenuLabel(item: MenuItem): string {
  const routeLabelMap: Record<string, string> = {
    '/dashboard': '首页',
    '/alerts': '告警列表',
    '/admin/menus': '菜单管理',
    '/admin/users': '用户管理',
    '/admin/roles': '角色管理',
    '/admin/dict': '字典管理',
    '/settings': '设置'
  };

  if (item.name && item.name.trim().length > 0) {
    return item.name;
  }
  if (item.route && routeLabelMap[item.route]) {
    return routeLabelMap[item.route];
  }
  if (item.route && item.route !== '/') {
    const normalized = item.route.replace(/^\//, '').split('/').pop() ?? item.route;
    return normalized
      .split(/[-_]/)
      .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part))
      .join(' ');
  }
  return '首页';
}

interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

function MenuItemComponent({ item, isCollapsed, isActive, onClick }: MenuItemProps) {
  const Icon = getMenuIcon(item.icon);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
        "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
        isActive && "bg-sky-100 text-sky-700 font-medium shadow-sm",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="truncate">{getMenuLabel(item)}</span>}
    </button>
  );
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus, isLoading, error } = useMenus();

  const currentRoute = location.pathname;

  const handleNavigate = (route?: string) => {
    if (route && route !== currentRoute) {
      navigate(route);
    }
  };

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-white rounded-lg shadow-sm border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : error ? (
          <div className="p-2 text-sm text-red-500">{error}</div>
        ) : (
          menus.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={item.route === currentRoute}
              onClick={() => handleNavigate(item.route)}
            />
          ))
        )}
      </nav>

      <div className="border-t p-2 space-y-1">
        <MenuItemComponent
          item={{ id: 'links', name: '常用链接', icon: 'chain-link' } as MenuItem}
          isCollapsed={isCollapsed}
          isActive={false}
          onClick={() => navigate('/dashboard')}
        />
        <MenuItemComponent
          item={{ id: 'history', name: '历史记录', icon: 'history' } as MenuItem}
          isCollapsed={isCollapsed}
          isActive={false}
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <div className="border-t p-2 hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          onClick={onToggle}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

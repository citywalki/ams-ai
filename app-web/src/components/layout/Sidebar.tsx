import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Link2, History } from 'lucide-react';
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
  home: ChevronRight,
  bell: Link2,
  menu2: History,
  employee: ChevronRight,
  group: Link2,
  'document-text': History,
  settings: Link2,
  folder: ChevronRight,
  DashboardOutlined: ChevronRight,
  AlertOutlined: Link2,
  MenuOutlined: History,
  UserOutlined: ChevronRight,
  TeamOutlined: Link2,
  BookOutlined: History,
  SettingOutlined: Link2,
};

function getMenuIcon(iconName?: string): React.ElementType {
  if (!iconName) return ChevronRight;
  return iconMap[iconName] || ChevronRight;
}

function getMenuLabel(item: MenuItem): string {
  const routeLabelMap: Record<string, string> = {
    '/dashboard': 'Home',
    '/alerts': 'Alerts',
    '/admin/menus': 'Menus',
    '/admin/users': 'Users',
    '/admin/roles': 'Roles',
    '/admin/dict': 'Dictionary',
    '/settings': 'Settings'
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
  return 'Home';
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
        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
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
        "flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
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
          item={{ id: 'links', name: 'Useful Links', icon: 'chain-link' } as MenuItem}
          isCollapsed={isCollapsed}
          isActive={false}
          onClick={() => navigate('/dashboard')}
        />
        <MenuItemComponent
          item={{ id: 'history', name: 'History', icon: 'history' } as MenuItem}
          isCollapsed={isCollapsed}
          isActive={false}
          onClick={() => navigate('/dashboard')}
        />
      </div>

      <div className="border-t p-2 hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={onToggle}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

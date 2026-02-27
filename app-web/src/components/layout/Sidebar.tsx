import {type ReactNode, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Bell,
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Folder,
    History,
    Home,
    Link2,
    Menu,
    Settings,
    Users
} from 'lucide-react';
import {useMenus} from '@/contexts/MenuContext';
import type {MenuItem} from '@/services';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/lib/utils';

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
    if (item.label && item.label.trim().length > 0) {
        return item.label;
    }
    if (item.route) {
        const routeLabelMap: Record<string, string> = {
            '/dashboard': '首页',
            '/alerts': '告警列表',
            '/admin/menus': '菜单管理',
            '/admin/users': '用户管理',
            '/admin/roles': '角色管理',
            '/admin/dict': '字典管理',
            '/settings': '设置'
        };
        if (routeLabelMap[item.route]) {
            return routeLabelMap[item.route];
        }
        if (item.route !== '/') {
            const normalized = item.route.replace(/^\//, '').split('/').pop() ?? item.route;
            return normalized
                .split(/[-_]/)
                .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part))
                .join(' ');
        }
  }
  return '首页';
}

function normalizePath(path?: string): string {
  if (!path) {
    return '/';
  }

  const [withoutQueryOrHash] = path.split(/[?#]/);
  if (!withoutQueryOrHash) {
    return '/';
  }

  if (withoutQueryOrHash.length === 1) {
    return '/';
  }

  return withoutQueryOrHash.replace(/\/+$/, '');
}

function isRouteMatch(menuRoute: string | undefined, currentPath: string): boolean {
  if (!menuRoute) {
    return false;
  }

  const menuPath = normalizePath(menuRoute);
  const current = normalizePath(currentPath);

  if (menuPath === '/') {
    return current === '/';
  }

  return current === menuPath || current.startsWith(`${menuPath}/`);
}

type ActiveMatch = {
  activeId: string | null;
  parentFolderIds: string[];
};

function findActiveMatch(items: MenuItem[], currentPath: string): ActiveMatch {
  let bestRouteLength = -1;
  let activeId: string | null = null;
  let parentFolderIds: string[] = [];

  const walk = (nodes: MenuItem[], parentIds: string[]) => {
    nodes.forEach((node) => {
      const isFolder = node.menuType === 'FOLDER';

      if (!isFolder && isRouteMatch(node.route, currentPath)) {
        const routeLength = normalizePath(node.route).length;
        if (routeLength > bestRouteLength) {
          bestRouteLength = routeLength;
          activeId = node.id;
          parentFolderIds = parentIds;
        }
      }

      if (node.children && node.children.length > 0) {
        walk(node.children, isFolder ? [...parentIds, node.id] : parentIds);
      }
    });
  };

  walk(items, []);

  return { activeId, parentFolderIds };
}

interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
    isExpanded?: boolean;
  onClick: () => void;
    onToggleExpand?: () => void;
    renderChild?: (child: MenuItem) => ReactNode;
}

function MenuItemComponent({
                               item,
                               isCollapsed,
                               isActive,
                               isExpanded,
                               onClick,
                               onToggleExpand,
                               renderChild
                           }: MenuItemProps) {
  const Icon = getMenuIcon(item.icon);
    const isFolder = item.menuType === 'FOLDER';
    const hasChildren = item.children && item.children.length > 0;

    const handleClick = () => {
        if (isFolder) {
            if (onToggleExpand) {
                onToggleExpand();
            }
        } else {
            onClick();
        }
    };

  return (
      <div>
          <button
              onClick={handleClick}
              className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                  "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
                  isActive && "bg-sky-100 text-sky-700 font-medium shadow-sm",
                  isCollapsed && "justify-center px-2"
              )}
          >
              <Icon className="h-5 w-5 shrink-0"/>
              {!isCollapsed && (
                  <>
                      <span className="truncate flex-1 text-left">{getMenuLabel(item)}</span>
                      {isFolder && (
                          <ChevronDown
                              className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  isExpanded && "rotate-180"
                              )}
                          />
                      )}
                  </>
              )}
          </button>
          {!isCollapsed && isFolder && isExpanded && hasChildren && renderChild && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-2">
                  {item.children!.map(renderChild)}
              </div>
          )}
      </div>
  );
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus, isLoading, error } = useMenus();
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const currentRoute = location.pathname;
  const { activeId, parentFolderIds } = useMemo(
    () => findActiveMatch(menus, currentRoute),
    [menus, currentRoute]
  );

  useEffect(() => {
    if (parentFolderIds.length === 0) {
      return;
    }

    setExpandedFolders((prev) => {
      const missing = parentFolderIds.some((folderId) => !prev.has(folderId));
      if (!missing) {
        return prev;
      }

      const next = new Set(prev);
      parentFolderIds.forEach((folderId) => next.add(folderId));
      return next;
    });
  }, [parentFolderIds]);

  const handleNavigate = (route?: string) => {
    const target = normalizePath(route);
    if (route && target !== normalizePath(currentRoute)) {
      navigate(target);
    }
  };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const renderMenuItem = (item: MenuItem) => {
        const isFolder = item.menuType === 'FOLDER';
        const isExpanded = expandedFolders.has(item.id);
        const isActive = item.id === activeId;

        return (
            <MenuItemComponent
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isActive}
                isExpanded={isExpanded}
                onClick={() => handleNavigate(item.route)}
                onToggleExpand={isFolder ? () => toggleFolder(item.id) : undefined}
                renderChild={isFolder ? (child: MenuItem) => (
                    <MenuItemComponent
                        key={child.id}
                        item={child}
                        isCollapsed={false}
                        isActive={child.id === activeId}
                        onClick={() => handleNavigate(child.route)}
                    />
                ) : undefined}
            />
        );
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
            menus.map(renderMenuItem)
        )}
      </nav>

      <div className="border-t p-2 space-y-1">
        <MenuItemComponent
            item={{id: 'links', label: '常用链接', icon: 'chain-link'} as MenuItem}
          isCollapsed={isCollapsed}
          isActive={false}
          onClick={() => navigate('/dashboard')}
        />
        <MenuItemComponent
            item={{id: 'history', label: '历史记录', icon: 'history'} as MenuItem}
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

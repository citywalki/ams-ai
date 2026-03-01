import { type ReactNode, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Folder,
  History,
  Home,
  Link2,
  Menu,
  Settings,
  Users,
} from 'lucide-react';
import { Button, Layout, Menu as AntMenu, Skeleton } from 'antd';
import type { ItemType } from 'antd/es/menu/interface';
import { useMenus } from '@/contexts/MenuContext';
import type { MenuItem } from '@/services';
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';

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

function getMenuIcon(iconName?: string): ReactNode {
  const Icon = iconMap[iconName ?? ''] ?? Folder;
  return <Icon className="h-4 w-4" />;
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
  if (!menuRoute) return false;

  const menuPath = normalizePath(menuRoute);
  const current = normalizePath(currentPath);
  if (menuPath === '/') return current === '/';

  return current === menuPath || current.startsWith(`${menuPath}/`);
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
      '/settings': '设置',
    };
    if (routeLabelMap[item.route]) {
      return routeLabelMap[item.route];
    }
  }
  return item.key;
}

function buildItems(items: MenuItem[]): ItemType[] {
  return items.map((item) => {
    if (item.children?.length) {
      return {
        key: item.id,
        icon: getMenuIcon(item.icon),
        label: getMenuLabel(item),
        children: buildItems(item.children),
      };
    }
    return {
      key: item.id,
      icon: getMenuIcon(item.icon),
      label: getMenuLabel(item),
    };
  });
}

function findActiveAndOpen(items: MenuItem[], currentPath: string, parentIds: string[] = []): { selectedKey?: string; openKeys: string[] } {
  for (const item of items) {
    const nextParents = item.children?.length ? [...parentIds, item.id] : parentIds;

    if (item.children?.length) {
      const childResult = findActiveAndOpen(item.children, currentPath, nextParents);
      if (childResult.selectedKey) {
        return childResult;
      }
    }

    if (isRouteMatch(item.route, currentPath)) {
      return { selectedKey: item.id, openKeys: parentIds };
    }
  }
  return { openKeys: [] };
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus, isLoading, error, refreshMenus } = useMenus();

  const menuData = useMemo(() => {
    const currentRoute = location.pathname;
    const active = findActiveAndOpen(menus, currentRoute);
    return {
      items: buildItems(menus),
      selectedKeys: active.selectedKey ? [active.selectedKey] : [],
      defaultOpenKeys: active.openKeys,
    };
  }, [location.pathname, menus]);

  const routeById = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: MenuItem[]) => {
      nodes.forEach((node) => {
        if (node.route) {
          map.set(node.id, normalizePath(node.route));
        }
        if (node.children?.length) {
          walk(node.children);
        }
      });
    };
    walk(menus);
    return map;
  }, [menus]);

  return (
    <Layout.Sider
      collapsed={isCollapsed}
      collapsible
      trigger={null}
      width={256}
      collapsedWidth={72}
      style={{
        background: 'var(--ams-color-surface)',
        borderRight: '1px solid var(--ams-color-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} title={false} />
            ))}
          </div>
        ) : error ? (
          <QueryErrorDisplay error={new Error(error)} onRetry={refreshMenus} size="inline" className="m-2" />
        ) : (
          <AntMenu
            mode="inline"
            items={menuData.items}
            selectedKeys={menuData.selectedKeys}
            defaultOpenKeys={menuData.defaultOpenKeys}
            onClick={({ key }) => {
              const route = routeById.get(String(key));
              if (route) navigate(route);
            }}
          />
        )}
      </div>

      <div className="border-t border-[var(--ams-color-border)] p-2 hidden md:block">
        <Button
          type="text"
          className="w-full"
          icon={isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          onClick={onToggle}
        />
      </div>
    </Layout.Sider>
  );
}

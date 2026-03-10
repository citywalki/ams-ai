import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Settings,
  Users,
  FileText,
  Folder,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserMenus } from "@/features/menu/hooks/use-menu";
import type { Menu } from "@/features/menu/schema/menu";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bell,
  Settings,
  Users,
  FileText,
  Folder,
};

function getIconComponent(iconName?: string): React.ReactNode {
  if (!iconName) {
    return <Folder className="h-5 w-5" />;
  }

  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return <IconComponent className="h-5 w-5" />;
  }

  return <Folder className="h-5 w-5" />;
}

interface NavItemProps {
  menu: Menu;
  level?: number;
  parentRoute?: string;
  expandedKeys?: Set<number>;
  onToggle?: (menuId: number) => void;
}

function NavItem({ menu, level = 0, parentRoute = "", expandedKeys = new Set(), onToggle }: NavItemProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const paddingLeft = level * 16 + 12;
  const isExpanded = expandedKeys.has(menu.id);
  
  // 计算完整路由：父路由 + 当前路由
  const fullRoute = parentRoute + (menu.route || "");

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div
          className="flex items-center gap-3 h-10 px-3 text-sm font-medium text-[#6A6D70] rounded cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150"
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onToggle?.(menu.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle?.(menu.id);
            }
          }}
          aria-expanded={isExpanded}
        >
          <span className="flex-shrink-0">{getIconComponent(menu.icon)}</span>
          <span className="flex-1">{menu.label}</span>
          <span className="flex-shrink-0 transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        </div>
        <div 
          className={cn(
            "space-y-1 overflow-hidden transition-all duration-200 ease-in-out",
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {menu.children.map((child) => (
            <NavItem 
              key={child.id} 
              menu={child} 
              level={level + 1} 
              parentRoute={fullRoute}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!menu.route) {
    return (
      <div
        className="flex items-center gap-3 h-10 px-3 text-sm font-medium text-[#6A6D70] rounded cursor-default"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="flex-shrink-0">{getIconComponent(menu.icon)}</span>
        <span className="flex-1">{menu.label}</span>
      </div>
    );
  }

  return (
    <NavLink key={menu.id} to={fullRoute}>
      {({ isActive }) => (
        <div
          className={cn(
            "flex items-center gap-3 h-10 px-3 text-sm font-medium transition-colors duration-150 relative cursor-pointer",
            isActive
              ? "bg-[#EBF5FF] text-[#0070D2] rounded"
              : "text-[#6A6D70] hover:bg-[#F5F5F5] hover:text-[#32363A] rounded"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <span className="flex-shrink-0">{getIconComponent(menu.icon)}</span>
          <span className="flex-1">{menu.label}</span>
          {isActive && (
            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0070D2]" />
          )}
        </div>
      )}
    </NavLink>
  );
}

// 递归查找包含指定路径的所有父菜单ID
function findParentIdsByPath(
  menus: Menu[],
  pathname: string,
  parentRoute: string = ""
): number[] {
  for (const menu of menus) {
    // 计算当前菜单的完整路由
    const currentFullRoute = parentRoute + (menu.route || "");

    // 检查当前菜单是否匹配路径（如果是叶子节点且匹配）
    if (
      (!menu.children || menu.children.length === 0) &&
      currentFullRoute &&
      pathname.startsWith(currentFullRoute)
    ) {
      // 返回空数组，表示已找到匹配，但当前节点不是父菜单
      return [];
    }

    // 递归检查子菜单
    if (menu.children && menu.children.length > 0) {
      const childResult = findParentIdsByPath(
        menu.children,
        pathname,
        currentFullRoute
      );

      // 如果子菜单链中有匹配的，当前菜单ID也应该被包含
      if (childResult !== null) {
        return [menu.id, ...childResult];
      }

      // 检查是否有子菜单直接匹配
      const hasMatchingChild = menu.children.some((child) => {
        const childFullRoute = currentFullRoute + (child.route || "");
        return childFullRoute && pathname.startsWith(childFullRoute);
      });

      if (hasMatchingChild) {
        return [menu.id];
      }
    }
  }
  return [];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: menus, isLoading, error } = useUserMenus();
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(new Set());

  // 当路由变化时，自动展开包含当前路由的父菜单
  useEffect(() => {
    if (!menus) return;

    // 后端已返回树形结构，直接使用 menus 作为根菜单
    // 找到需要展开的父菜单ID
    const parentIdsToExpand = findParentIdsByPath(
      menus,
      location.pathname
    );

    if (parentIdsToExpand.length > 0) {
      setExpandedKeys((prev) => {
        const newSet = new Set(prev);
        parentIdsToExpand.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [location.pathname, menus]);

  const handleToggle = (menuId: number) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const loadingContent = (
    <>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 h-10 px-3 rounded animate-pulse"
          >
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
        <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
      </div>
    </>
  );

  const errorContent = (
    <>
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="text-sm text-red-500 text-center py-4">
          加载菜单失败
        </div>
      </nav>
      <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
        <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <>
        {/* Desktop */}
        <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E5E5] h-full flex-col">
          {loadingContent}
        </aside>
        {/* Mobile */}
        <aside
          className={`
            lg:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-xl
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {loadingContent}
        </aside>
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Desktop */}
        <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E5E5] h-full flex-col">
          {errorContent}
        </aside>
        {/* Mobile */}
        <aside
          className={`
            lg:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-xl
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {errorContent}
        </aside>
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  // 后端 getUserMenus 已经返回构建好的树形结构（根菜单列表），直接使用即可
  // 不需要再根据 parentId 进行过滤
  const rootMenus = menus ?? [];

  const sidebarContent = (
    <>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {rootMenus.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">暂无菜单</div>
        )}
        {rootMenus.map((menu) => (
          <NavItem
            key={menu.id}
            menu={menu}
            expandedKeys={expandedKeys}
            onToggle={handleToggle}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
        <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - always visible on lg screens */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E5E5] h-full flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

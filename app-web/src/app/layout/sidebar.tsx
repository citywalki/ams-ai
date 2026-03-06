import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Settings,
  Users,
  FileText,
  Folder,
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
}

function NavItem({ menu, level = 0, parentRoute = "" }: NavItemProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const paddingLeft = level * 16 + 12;
  
  // 计算完整路由：父路由 + 当前路由
  const fullRoute = parentRoute + (menu.route || "");

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div
          className="flex items-center gap-3 h-10 px-3 text-sm font-medium text-[#6A6D70] rounded cursor-default"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <span className="flex-shrink-0">{getIconComponent(menu.icon)}</span>
          <span className="flex-1">{menu.label}</span>
        </div>
        <div className="space-y-1">
          {menu.children.map((child) => (
            <NavItem 
              key={child.id} 
              menu={child} 
              level={level + 1} 
              parentRoute={fullRoute}
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

export function Sidebar() {
  const { data: menus, isLoading, error } = useUserMenus();

  if (isLoading) {
    return (
      <aside className="w-60 bg-white border-r border-[#E5E5E5] h-full flex flex-col">
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
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-60 bg-white border-r border-[#E5E5E5] h-full flex flex-col">
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="text-sm text-red-500 text-center py-4">
            加载菜单失败
          </div>
        </nav>
        <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
          <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
        </div>
      </aside>
    );
  }

  // 找出根菜单：parentId 为 null/undefined，或者在当前菜单列表中找不到父菜单的
  const menuIds = new Set(menus?.map((m) => m.id) ?? []);
  const rootMenus = menus?.filter((menu) => {
    // 如果没有 parentId，是根菜单
    if (!menu.parentId) return true;
    // 如果 parentId 存在但在当前列表中找不到对应的菜单，也视为根菜单
    return !menuIds.has(menu.parentId);
  }) ?? [];

  return (
    <aside className="w-60 bg-white border-r border-[#E5E5E5] h-full flex flex-col">
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {rootMenus.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">暂无菜单</div>
        )}
        {rootMenus.map((menu) => (
          <NavItem key={menu.id} menu={menu} />
        ))}
      </nav>

      <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
        <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
      </div>
    </aside>
  );
}

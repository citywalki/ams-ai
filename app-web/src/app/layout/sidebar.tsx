import { NavLink } from "react-router-dom";
import { 
    LayoutDashboard, 
    Bell, 
    Settings,
    Users,
    FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { to: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "仪表盘" },
    { to: "/alarms", icon: <Bell className="h-5 w-5" />, label: "告警管理" },
    { to: "/users", icon: <Users className="h-5 w-5" />, label: "用户管理" },
    { to: "/reports", icon: <FileText className="h-5 w-5" />, label: "报表统计" },
    { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "系统配置" },
];

export function Sidebar() {
    return (
        <aside className="w-60 bg-white border-r border-[#E5E5E5] min-h-[calc(100vh-48px)] relative">
            <nav className="p-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        children={({ isActive }) => (
                            <div
                                className={cn(
                                    "flex items-center gap-3 h-10 px-3 text-sm font-medium transition-colors duration-150 relative cursor-pointer",
                                    isActive
                                        ? "bg-[#EBF5FF] text-[#0070D2] rounded"
                                        : "text-[#6A6D70] hover:bg-[#F5F5F5] hover:text-[#32363A] rounded"
                                )}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {isActive && (
                                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0070D2]" />
                                )}
                            </div>
                        )}
                    />
                ))}
            </nav>
            
            {/* 底部信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#E5E5E5]">
                <p className="text-xs text-[#A9A9A9] text-center">
                    AMS v1.0.0
                </p>
            </div>
        </aside>
    );
}

# SAP 企业蓝主题实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 app-web 改造成 SAP UI5 风格的企业级蓝主题，采用 4+1+1 Dashboard 布局

**Architecture:** 使用 shadcn v4 CSS 变量系统，更新 index.css 主题变量，重写 Header/Sidebar/Dashboard 组件

**Tech Stack:** React 19 + Tailwind v4 + shadcn/ui + Phosphor 图标

---

## Task 1: 更新 CSS 主题变量

**Files:**
- Modify: `app-web/src/index.css:1-129`

**Step 1: 备份原文件**

```bash
cp /Users/walkin/SourceCode/citywalki/ams-ai/app-web/src/index.css /Users/walkin/SourceCode/citywalki/ams-ai/app-web/src/index.css.bak
```

**Step 2: 重写 CSS 变量为 SAP 主题**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@custom-variant dark (&:is(.dark *));

:root {
    /* Primary - SAP Blue */
    --primary: #0070D2;
    --primary-foreground: #FFFFFF;
    --primary-hover: #005a99;
    
    /* Backgrounds - 企业级浅灰 */
    --background: #F5F5F5;
    --foreground: #32363A;
    
    /* Card */
    --card: #FFFFFF;
    --card-foreground: #32363A;
    
    /* Popover */
    --popover: #FFFFFF;
    --popover-foreground: #32363A;
    
    /* Secondary */
    --secondary: #F5F5F5;
    --secondary-foreground: #32363A;
    
    /* Muted */
    --muted: #FAFAFA;
    --muted-foreground: #6A6D70;
    
    /* Accent - 选中状态 */
    --accent: #EBF5FF;
    --accent-foreground: #0070D2;
    
    /* Destructive */
    --destructive: #D9363E;
    --destructive-foreground: #FFFFFF;
    
    /* Borders */
    --border: #E5E5E5;
    --input: #D9D9D9;
    --ring: #0070D2;
    
    /* Charts - 功能色 */
    --chart-1: #0070D2;
    --chart-2: #107E3E;
    --chart-3: #E78C07;
    --chart-4: #D9363E;
    --chart-5: #0A6ED1;
    
    /* Radius - 轻微圆角 */
    --radius: 0.5rem;
    
    /* Sidebar */
    --sidebar: #FFFFFF;
    --sidebar-foreground: #32363A;
    --sidebar-primary: #0070D2;
    --sidebar-primary-foreground: #FFFFFF;
    --sidebar-accent: #EBF5FF;
    --sidebar-accent-foreground: #0070D2;
    --sidebar-border: #E5E5E5;
    --sidebar-ring: #0070D2;
}

.dark {
    /* Dark mode - 深色系企业风格 */
    --primary: #0A6ED1;
    --primary-foreground: #FFFFFF;
    
    --background: #1C1C1C;
    --foreground: #F5F5F5;
    
    --card: #2D2D2D;
    --card-foreground: #F5F5F5;
    
    --popover: #2D2D2D;
    --popover-foreground: #F5F5F5;
    
    --secondary: #3D3D3D;
    --secondary-foreground: #F5F5F5;
    
    --muted: #2D2D2D;
    --muted-foreground: #A9A9A9;
    
    --accent: #1A3A5C;
    --accent-foreground: #0A6ED1;
    
    --destructive: #FF6B6B;
    
    --border: #404040;
    --input: #404040;
    --ring: #0A6ED1;
    
    --sidebar: #2D2D2D;
    --sidebar-foreground: #F5F5F5;
    --sidebar-primary: #0A6ED1;
    --sidebar-primary-foreground: #FFFFFF;
    --sidebar-accent: #1A3A5C;
    --sidebar-accent-foreground: #0A6ED1;
    --sidebar-border: #404040;
}

@theme inline {
    --font-sans: 'Geist Variable', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    
    /* Color mappings */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    
    /* Sidebar colors */
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
    
    /* Radius */
    --radius-sm: 0.125rem;  /* 2px */
    --radius-md: 0.25rem;   /* 4px */
    --radius-lg: 0.5rem;    /* 8px */
    --radius-xl: 0.75rem;   /* 12px */
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }
    body {
        @apply font-sans bg-background text-foreground;
    }
    html {
        @apply font-sans;
    }
}
```

**Step 3: 验证 CSS 语法**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npm run lint`
Expected: 无 CSS 错误

**Step 4: Commit**

```bash
git add app-web/src/index.css
git commit -m "feat: implement SAP enterprise blue theme variables"
```

---

## Task 2: 重写 Header 组件

**Files:**
- Modify: `app-web/src/app/layout/header.tsx`

**Step 1: 重写 Header 为 SAP 风格**

```tsx
import { Bell, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Badge } from "@/components/ui/badge";

export function Header() {
    const { user, logout } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 h-12 bg-white border-b border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="flex h-full items-center px-4">
                {/* 左侧：菜单按钮 + Logo + 标题 */}
                <div className="flex items-center gap-3 flex-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#32363A] hover:bg-[#F5F5F5]"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#0070D2] rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-base font-semibold text-[#32363A]">AMS</h1>
                            <span className="text-sm text-[#6A6D70]">告警管理系统</span>
                        </div>
                    </div>
                </div>

                {/* 右侧：工具图标组 + 用户 */}
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 relative text-[#32363A] hover:bg-[#F5F5F5]"
                    >
                        <Bell className="h-4 w-4" />
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                        >
                            3
                        </Badge>
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#32363A] hover:bg-[#F5F5F5]"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="relative h-8 w-8 rounded-full p-0 hover:bg-[#F5F5F5]"
                            >
                                <Avatar className="h-7 w-7 border border-[#E5E5E5]">
                                    <AvatarFallback className="bg-[#0070D2] text-white text-xs">
                                        {user?.realName?.[0] || user?.username?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium text-[#32363A]">
                                            {user?.realName || user?.username}
                                        </p>
                                        <p className="text-xs text-[#6A6D70]">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem className="text-sm text-[#32363A] cursor-pointer">
                                个人资料
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-sm text-[#32363A] cursor-pointer">
                                设置
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                                onClick={logout}
                                className="text-sm text-[#D9363E] cursor-pointer"
                            >
                                退出登录
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
```

**Step 2: 验证 TypeScript**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npx tsc --noEmit`
Expected: 无编译错误

**Step 3: Commit**

```bash
git add app-web/src/app/layout/header.tsx
git commit -m "feat: redesign Header with SAP enterprise style"
```

---

## Task 3: 重写 Sidebar 组件

**Files:**
- Modify: `app-web/src/app/layout/sidebar.tsx`

**Step 1: 重写 Sidebar 为 SAP 风格**

```tsx
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
        <aside className="w-60 bg-white border-r border-[#E5E5E5] min-h-[calc(100vh-48px)]">
            <nav className="p-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 h-10 px-3 text-sm font-medium transition-colors duration-150 relative",
                                isActive
                                    ? "bg-[#EBF5FF] text-[#0070D2] rounded"
                                    : "text-[#6A6D70] hover:bg-[#F5F5F5] hover:text-[#32363A] rounded"
                            )
                        }
                    >
                        <span className={cn(
                            "flex-shrink-0",
                            "text-current"
                        )}>
                            {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        
                        {/* 选中状态右侧圆点指示器 */}
                        {({ isActive }: { isActive: boolean }) => isActive && (
                            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0070D2]" />
                        )}
                    </NavLink>
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
```

**Step 2: 修复 NavLink children 函数语法**

修正：NavLink 的 children 函数需要正确处理

```tsx
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
```

**Step 3: 验证 TypeScript**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npx tsc --noEmit`
Expected: 无编译错误

**Step 4: Commit**

```bash
git add app-web/src/app/layout/sidebar.tsx
git commit -m "feat: redesign Sidebar with SAP navigation style"
```

---

## Task 4: 更新 MainLayout 组件

**Files:**
- Modify: `app-web/src/app/layout/main-layout.tsx`

**Step 1: 更新布局样式**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function MainLayout() {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
```

**Step 2: Commit**

```bash
git add app-web/src/app/layout/main-layout.tsx
git commit -m "style: update MainLayout background to SAP gray"
```

---

## Task 5: 重写 Dashboard 首页 (4+1+1 布局)

**Files:**
- Modify: `app-web/src/pages/Dashboard/index.tsx`

**Step 1: 重写 Dashboard 为 SAP 风格 4+1+1 布局**

```tsx
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    TrendingUp,
    ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 统计卡片数据
const statsData = [
    {
        title: "今日告警",
        value: "128",
        change: "+12%",
        changeType: "increase" as const,
        icon: AlertCircle,
        description: "较昨日"
    },
    {
        title: "待处理",
        value: "23",
        change: "5 个致命",
        changeType: "neutral" as const,
        icon: Clock,
        description: "需立即关注"
    },
    {
        title: "已解决",
        value: "98",
        change: "76.6%",
        changeType: "positive" as const,
        icon: CheckCircle2,
        description: "解决率"
    },
    {
        title: "平均处理时间",
        value: "15m",
        change: "-3m",
        changeType: "positive" as const,
        icon: TrendingUp,
        description: "较上周"
    }
];

// 最近告警数据
const recentAlarms = [
    { id: 1, title: "服务器 CPU 使用率过高", severity: "CRITICAL", time: "5分钟前", source: "server-01" },
    { id: 2, title: "数据库连接数超限", severity: "HIGH", time: "12分钟前", source: "db-master" },
    { id: 3, title: "磁盘空间不足", severity: "MEDIUM", time: "25分钟前", source: "storage-03" },
    { id: 4, title: "服务响应超时", severity: "LOW", time: "1小时前", source: "api-gateway" },
    { id: 5, title: "网络延迟异常", severity: "INFO", time: "2小时前", source: "network-monitor" },
];

const severityConfig = {
    CRITICAL: { color: "bg-[#FFF0F0] text-[#D9363E] border-[#D9363E]", label: "致命" },
    HIGH: { color: "bg-[#FFFBF2] text-[#E78C07] border-[#E78C07]", label: "高" },
    MEDIUM: { color: "bg-[#F5F9FF] text-[#0A6ED1] border-[#0A6ED1]", label: "中" },
    LOW: { color: "bg-[#F6FDF8] text-[#107E3E] border-[#107E3E]", label: "低" },
    INFO: { color: "bg-[#F5F5F5] text-[#6A6D70] border-[#E5E5E5]", label: "信息" },
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#32363A]">仪表盘</h1>
                <p className="text-sm text-[#6A6D70]">告警系统概览与实时监控</p>
            </div>

            {/* 第一行: 4 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (
                    <Card 
                        key={index} 
                        className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-[#6A6D70]">
                                {stat.title}
                            </CardTitle>
                            <div className="h-8 w-8 rounded bg-[#F5F5F5] flex items-center justify-center">
                                <stat.icon className="h-4 w-4 text-[#0070D2]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#32363A]">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className={cn(
                                    "text-xs font-medium",
                                    stat.changeType === "positive" && "text-[#107E3E]",
                                    stat.changeType === "increase" && "text-[#D9363E]",
                                    stat.changeType === "neutral" && "text-[#E78C07]"
                                )}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-[#A9A9A9]">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 第二行: 1 告警趋势图表 */}
            <Card className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#32363A]">
                                告警趋势
                            </CardTitle>
                            <CardDescription className="text-sm text-[#6A6D70] mt-1">
                                过去 7 天告警数量统计
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[#0070D2] border-[#0070D2] hover:bg-[#EBF5FF]"
                        >
                            查看详情
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-[#FAFAFA] rounded border border-dashed border-[#E5E5E5]">
                        <div className="text-center">
                            <p className="text-sm text-[#6A6D70]">图表区域（待实现）</p>
                            <p className="text-xs text-[#A9A9A9] mt-1">将集成告警趋势图表组件</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 第三行: 1 最近告警列表 */}
            <Card className="bg-white border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#32363A]">
                                最近告警
                            </CardTitle>
                            <CardDescription className="text-sm text-[#6A6D70] mt-1">
                                最新产生的 10 条告警
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="text-[#0070D2] border-[#0070D2] hover:bg-[#EBF5FF]"
                        >
                            查看全部
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentAlarms.map((alarm) => (
                            <div 
                                key={alarm.id}
                                className="flex items-center justify-between p-3 rounded hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-1 h-8 rounded-full",
                                        alarm.severity === "CRITICAL" && "bg-[#D9363E]",
                                        alarm.severity === "HIGH" && "bg-[#E78C07]",
                                        alarm.severity === "MEDIUM" && "bg-[#0A6ED1]",
                                        alarm.severity === "LOW" && "bg-[#107E3E]",
                                        alarm.severity === "INFO" && "bg-[#6A6D70]"
                                    )} />
                                    
                                    <div>
                                        <p className="text-sm font-medium text-[#32363A] group-hover:text-[#0070D2] transition-colors">
                                            {alarm.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-[#6A6D70]">{alarm.source}</span>
                                            <span className="text-xs text-[#A9A9A9]">·</span>
                                            <span className="text-xs text-[#A9A9A9]">{alarm.time}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Badge 
                                    variant="outline"
                                    className={cn(
                                        "text-xs font-medium",
                                        severityConfig[alarm.severity].color
                                    )}
                                >
                                    {severityConfig[alarm.severity].label}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>    );
}

// 导入 cn 工具函数
import { cn } from "@/lib/utils";
```

**Step 2: 修复 cn 导入位置**

将 `import { cn } from "@/lib/utils";` 移到文件顶部。

**Step 3: 验证 TypeScript**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npx tsc --noEmit`
Expected: 无编译错误

**Step 4: 运行 lint 检查**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npm run lint`
Expected: 无 lint 错误

**Step 5: Commit**

```bash
git add app-web/src/pages/Dashboard/index.tsx
git commit -m "feat: redesign Dashboard with 4+1+1 SAP layout"
```

---

## Task 6: 更新 shadcn 组件样式

**Files:**
- Modify: `app-web/src/components/ui/button.tsx`（可选，如有需要）
- Modify: `app-web/src/components/ui/card.tsx`（可选，如有需要）

**Step 1: 检查并更新 Button 组件圆角**

确认 button 组件使用 `--radius` 变量。

```tsx
// 在 button.tsx 中确保使用 rounded-md 或类似
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#0070D2] text-white hover:bg-[#005a99]",
        destructive: "bg-[#D9363E] text-white hover:bg-[#b52d33]",
        outline: "border border-[#D9D9D9] bg-white hover:bg-[#F5F5F5] hover:text-[#32363A]",
        secondary: "bg-[#F5F5F5] text-[#32363A] hover:bg-[#EBEBEB]",
        ghost: "hover:bg-[#F5F5F5] hover:text-[#32363A]",
        link: "text-[#0070D2] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Step 2: Commit（如修改）**

```bash
git add app-web/src/components/ui/
git commit -m "style: update shadcn components with SAP color scheme" || echo "No changes to commit"
```

---

## Task 7: 构建验证

**Files:**
- 所有修改的文件

**Step 1: 完整构建检查**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && npm run build`
Expected: 构建成功，无错误

**Step 2: 启动开发服务器验证**

Run: `cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web && timeout 10 npm run dev &> /dev/null && echo "Dev server started successfully" || echo "Check dev server manually"`

**Step 3: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete SAP enterprise blue theme implementation

- Add SAP blue color scheme to CSS variables
- Redesign Header with 48px height and proper shadows
- Redesign Sidebar with 240px width and active state indicators
- Implement 4+1+1 Dashboard layout with enhanced styling
- Update all components to use SAP color palette"
```

---

## 总结

**修改文件清单:**
1. `app-web/src/index.css` - 主题变量
2. `app-web/src/app/layout/header.tsx` - Header 组件
3. `app-web/src/app/layout/sidebar.tsx` - Sidebar 组件
4. `app-web/src/app/layout/main-layout.tsx` - 布局容器
5. `app-web/src/pages/Dashboard/index.tsx` - Dashboard 首页
6. `app-web/src/components/ui/button.tsx` (可选) - 按钮样式

**视觉变更:**
- 主色从黑色改为 SAP 蓝 `#0070D2`
- 圆角从 0 改为轻微圆角 8px
- 背景从白色改为浅灰 `#F5F5F5`
- Header 高度 48px + 底部阴影
- Sidebar 宽度 240px + 右侧边框
- Dashboard 采用 4+1+1 层次布局

**测试清单:**
- [ ] TypeScript 编译通过
- [ ] ESLint 检查通过
- [ ] 构建成功
- [ ] 登录页面正常
- [ ] Header 显示正确
- [ ] Sidebar 导航高亮正常
- [ ] Dashboard 卡片布局正确

# AMS 前台阶段1实施计划（精简版）

> **目标：** 搭建项目基础框架，实现仪表盘首页  
> **预计工期：** 1周  
> **技术栈：** React 18 + TypeScript + Vite + shadcn/ui + TanStack Query

---

## 概述

本阶段将搭建 AMS 前台的基础框架：
1. 项目初始化与 shadcn/ui 配置
2. 认证系统（登录/登出）
3. 基础布局（侧边栏、头部）
4. 仪表盘首页（统计卡片、告警趋势图）

**本阶段不包含：** 告警管理、系统管理等其他页面

---

## 实施步骤

### Task 1: 使用 shadcn CLI 初始化项目（Base UI）

**目标：** 使用 shadcn CLI 创建项目，配置 Base UI 作为底层

**Step 1: 使用 shadcn create 初始化项目**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai

# 使用 shadcn create 命令，通过 preset 配置项目
pnpm dlx shadcn@latest create \
  --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=phosphor&font=geist&menuAccent=bold&menuColor=default&radius=none&template=vite&rtl=false" \
  --template vite \
  app-web
```

**配置说明：**
- `--base base`: 使用 Base UI 作为底层（替代 Radix UI）
- `--style nova`: 使用 Nova 设计风格
- `--base-color neutral`: 基础颜色使用 neutral
- `--theme neutral`: 主题颜色使用 neutral
- `--icon-library phosphor`: 使用 Phosphor 图标库
- `--font geist`: 使用 Geist 字体
- `--menu-accent bold`: 菜单强调样式为粗体
- `--radius none`: 圆角为 0（直角）
- `--template vite`: 使用 Vite 模板
- `--rtl false`: 不支持 RTL（从右到左）

**Step 2: 安装项目依赖**

初始化完成后，进入项目目录：

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web
pnpm install
```

**Step 3: 创建基础工具函数**

创建 `src/lib/utils.ts`（如果 shadcn 未创建）：

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "chore: 使用 shadcn CLI 初始化项目（Base UI）"
```

---

### Task 2: 使用 shadcn CLI 安装组件

**目标：** 使用 shadcn CLI 安装所需的 UI 组件

**Step 1: 安装 shadcn 组件**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web

# 安装基础 UI 组件
pnpm dlx shadcn add button card input label badge avatar skeleton

# 安装导航菜单
pnpm dlx shadcn add dropdown-menu

# 安装消息提示（使用 sonner）
pnpm dlx shadcn add sonner
```

**已安装的组件：**
- `button` - 按钮
- `card` - 卡片
- `input` - 输入框
- `label` - 标签
- `badge` - 徽章
- `avatar` - 头像
- `skeleton` - 骨架屏
- `dropdown-menu` - 下拉菜单
- `sonner` - 消息提示

**Step 2: 验证安装**

检查 `src/components/ui/` 目录下是否已生成组件文件。

**Commit**

```bash
git add .
git commit -m "feat: 使用 shadcn CLI 安装 UI 组件"
```

---

### Task 3: 配置 TanStack Query

**Step 1: 创建 QueryClient**

`src/shared/api/query-client.ts`：

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Step 2: 创建 REST Client**

`src/shared/api/rest-client.ts`：

```typescript
import axios from "axios";

export const restClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

restClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Step 3: 配置全局错误处理**

更新 `src/lib/api/query-client.ts`，配置错误处理：

```typescript
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
      // 错误不抛出，组件继续渲染
      throwOnError: false,
    },
    mutations: {
      // 错误通过 toast 提示，不抛出
      onError: (error) => {
        const message = error instanceof Error ? error.message : "操作失败";
        toast.error(message);
      },
    },
  },
});
```

**错误处理策略：**
- **Queries**: 错误不抛出，组件通过 `isError` 状态处理，显示空数据或错误提示
- **Mutations**: 错误通过 sonner toast 提示，不影响页面渲染
- **组件级别**: 使用 `error` 状态显示友好的错误提示，而不是阻断渲染

**Step 4: 更新 Providers**

`src/app/providers/index.tsx`：

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/query-client";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

**Commit**

```bash
git add .
git commit -m "feat: 配置 TanStack Query 和 API 客户端，添加全局错误处理"
```

---

### Task 4: 实现认证模块

**Step 1: 类型定义**

`src/features/auth/model/auth-types.ts`：

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  realName?: string;
  avatar?: string;
  status: "ACTIVE" | "DISABLED";
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

**Step 2: Auth Store**

`src/features/auth/model/auth-store.ts`：

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { restClient } from "@/lib/api/rest-client";
import type { User, LoginCredentials, AuthResponse } from "./auth-types";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await restClient.post<AuthResponse>("/auth/login", credentials);
          const { user, tokens } = response.data;
          localStorage.setItem("token", tokens.token);
          localStorage.setItem("refreshToken", tokens.refreshToken);
          set({
            isAuthenticated: true,
            user,
            token: tokens.token,
            refreshToken: tokens.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "登录失败",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await restClient.post("/auth/logout");
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

**Step 3: 登录表单组件**

`src/features/auth/components/login-form.tsx`：

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/features/auth/model/auth-store";

const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data);
      toast({ title: "登录成功", description: "欢迎回来！" });
      navigate("/dashboard");
    } catch {
      toast({
        title: "登录失败",
        description: error || "请检查用户名和密码",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">AMS 告警管理系统</CardTitle>
        <CardDescription>请输入您的账号密码登录系统</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" placeholder="请输入用户名" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" placeholder="请输入密码" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

**Step 4: 登录页面**

`src/pages/Login/index.tsx`：

```typescript
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <LoginForm />
    </div>
  );
}
```

**Commit**

```bash
git add .
git commit -m "feat: 实现认证模块"
```

---

### Task 5: 创建路由和布局

**布局结构：** Header + Sidebar/Content

**路由逻辑：**
- 访问 `/`（根路由）：
  - 已登录 → 自动跳转到 `/dashboard`
  - 未登录 → 自动跳转到 `/login`

**Step 1: 路由配置**

`src/app/routes/index.tsx`：

```typescript
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { MainLayout } from "@/app/layout/main-layout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";

// 根路由重定向组件
function RootRedirect() {
  const { isAuthenticated } = useAuthStore();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

// 登录页路由守卫 - 已登录用户自动跳转到 dashboard
function LoginGuard() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginGuard />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
    ],
  },
]);
```

**Step 3: MainLayout（带权限守卫）**

`src/app/layout/main-layout.tsx`：

```typescript
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function MainLayout() {
  const { isAuthenticated } = useAuthStore();

  // 未登录用户访问受保护路由，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
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

`src/app/layout/main-layout.tsx`：

```typescript
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

**Step 4: Header**

`src/app/layout/header.tsx`：

```typescript
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/model/auth-store";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold">AMS</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.realName?.[0] || user?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.realName || user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>个人资料</DropdownMenuItem>
              <DropdownMenuItem>设置</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>退出登录</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
```

**Step 5: Sidebar**

`src/app/layout/sidebar.tsx`：

```typescript
import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          仪表盘
        </NavLink>
      </nav>
    </aside>
  );
}
```

**Step 6: 应用入口**

`src/app/index.tsx`：

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Providers } from "./providers";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
```

**Commit**

```bash
git add .
git commit -m "feat: 配置路由和布局"
```

---

### Task 6: 创建仪表盘页面

`src/pages/Dashboard/index.tsx`：

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">告警系统概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日告警</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+12% 较昨日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">其中 5 个致命告警</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已解决</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">解决率 76.6%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15m</div>
            <p className="text-xs text-muted-foreground">-3m 较上周</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>告警趋势</CardTitle>
            <CardDescription>过去 7 天告警数量统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              图表区域（待实现）
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近告警</CardTitle>
            <CardDescription>最新产生的 5 条告警</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "服务器 CPU 使用率过高", severity: "HIGH", time: "5分钟前" },
                { title: "数据库连接数超限", severity: "CRITICAL", time: "12分钟前" },
                { title: "磁盘空间不足", severity: "MEDIUM", time: "25分钟前" },
                { title: "服务响应超时", severity: "LOW", time: "1小时前" },
                { title: "网络延迟异常", severity: "INFO", time: "2小时前" },
              ].map((alarm, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{alarm.title}</p>
                    <p className="text-xs text-muted-foreground">{alarm.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    alarm.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                    alarm.severity === "HIGH" ? "bg-orange-100 text-orange-800" :
                    alarm.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {alarm.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Commit**

```bash
git add .
git commit -m "feat: 创建仪表盘页面"
```

---

## 验证清单

- [ ] 项目可以正常启动 (`pnpm dev`)
- [ ] 可以访问登录页面并登录
- [ ] 登录成功后跳转到仪表盘
- [ ] 仪表盘显示统计卡片和告警列表
- [ ] 侧边栏导航正常工作
- [ ] 可以点击退出登录

---

## 后续扩展

### 阶段2：告警管理（2周）
- 告警列表页面
- 告警详情页面
- 告警操作（确认、解决、分派）

### 阶段3：系统管理（2周）
- 用户管理
- 角色管理
- 菜单管理
- 字典管理

---

**文档结束**

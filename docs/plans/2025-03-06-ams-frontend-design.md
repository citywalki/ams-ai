# AMS 前台系统设计文档

**日期：** 2025-03-06  
**版本：** 1.0  
**状态：** 设计阶段

---

## 1. 概述

### 1.1 项目背景

AMS（Alert Management System）是一个告警管理系统，面向运维人员提供告警监控、处理和运维功能，同时提供管理员进行系统配置的管理后台。

### 1.2 设计目标

- 构建完整的前台系统，覆盖告警运维全生命周期
- 提供友好的用户体验，支持高效告警处理
- 实现细粒度的权限控制，确保数据安全
- 支持多租户，数据完全隔离

### 1.3 用户角色

| 角色 | 描述 | 权限范围 |
|------|------|----------|
| **管理员（ADMIN）** | 系统管理员 | 用户/角色/权限/菜单/字典管理、全部告警操作 |
| **运维人员（OPERATOR）** | 告警处理人员 | 告警查看、确认、解决、分派、个人设置 |
| **普通用户（USER）** | 告警接收者 | 查看分配的告警、个人告警历史、通知偏好 |
| **访客（GUEST）** | 只读用户 | 仅查看告警，无操作权限 |

---

## 2. 技术栈

### 2.1 核心技术

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | React | 18.x | UI框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 构建 | Vite | 5.x | 构建工具 |
| UI库 | shadcn/ui | latest | 组件库 |
| 样式 | Tailwind CSS | 3.x | CSS框架 |
| 基础组件 | Base UI | 1.x | React 官方无头组件库 |
| 路由 | React Router | 6.x | 客户端路由 |
| 状态 | Zustand | 4.x | 全局状态 |
| 数据 | TanStack Query | 5.x | 服务端状态管理 |
| 图标 | Lucide React | latest | 图标库 |
| 表单 | React Hook Form | 7.x | 表单处理 |
| 校验 | Zod | 3.x | 数据校验 |
| 图表 | Recharts | 2.x | 数据可视化 |
| HTTP | Axios | 1.x | REST API |
| GraphQL | urql | 4.x | GraphQL客户端 |
| 国际化 | i18next | latest | 多语言支持 |

### 2.2 为什么选择 shadcn/ui + Base UI

1. **无运行时依赖**：组件代码直接存在于项目，可完全定制
2. **Base UI 基础**：React 官方无头组件库，提供优秀的可访问性支持
3. **Tailwind 集成**：与项目样式系统无缝融合
4. **按需添加**：只添加需要的组件，避免体积膨胀
5. **TypeScript 原生支持**：类型定义完善

### 2.3 为什么分 GraphQL + REST

- **GraphQL 用于查询**：灵活的数据获取，减少 over-fetching，支持复杂筛选
- **REST 用于命令**：简单直观，符合 RESTful 设计原则，便于缓存控制

---

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前台应用 (app-web)                     │
├─────────────────────────────────────────────────────────────┤
│  页面层 (pages)  │ 功能特性 (features)  │ 共享组件 (shared)   │
├─────────────────────────────────────────────────────────────┤
│                   路由层 (routes)                            │
├─────────────────────────────────────────────────────────────┤
│  状态管理 (Zustand)  │  数据获取 (TanStack Query)            │
├─────────────────────────────────────────────────────────────┤
│         API 层 (GraphQL Client / Axios)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端服务 (Quarkus)                      │
│  ├─ feature-graphql: 查询接口                                │
│  ├─ feature-admin: 管理REST接口                              │
│  ├─ feature-core: 告警核心服务                               │
│  └─ feature-alert-ingestion: 告警摄入                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 极简版 Feature-Based 目录结构

**核心原则：所有数据获取逻辑都放在 TanStack Query hooks 中，不再单独封装 api 层。**

```
src/
├── app/                    # 应用初始化层
│   ├── providers/          # 全局Provider组合
│   ├── styles/            # 全局样式
│   ├── layout/            # 布局组件（Header, Sidebar, MainLayout）
│   ├── routes/            # 路由配置
│   └── index.tsx          # 应用入口
├── pages/                  # 页面层（只负责组合features）
│   ├── Login/
│   ├── Dashboard/
│   ├── Alarm/
│   ├── System/
│   └── Profile/
├── features/              # 功能特性层（自包含）
│   ├── auth/             # 认证功能
│   │   ├── components/   # 登录表单
│   │   ├── hooks/        # useAuth, useLogin, useLogout
│   │   │   └── use-auth.ts   # 包含 REST API 调用 + TanStack Query
│   │   └── model/        # auth-types.ts, auth-store.ts, auth-schema.ts
│   ├── alarm/            # 告警功能
│   │   ├── components/   # AlarmFilters, AlarmTable, AlarmCard
│   │   ├── hooks/        # 所有数据获取 hooks
│   │   │   ├── use-alarms.ts          # GraphQL + useQuery
│   │   │   ├── use-acknowledge-alarm.ts  # REST + useMutation
│   │   │   └── use-resolve-alarm.ts
│   │   └── model/        # alarm-types.ts
│   ├── user/             # 用户管理
│   ├── role/             # 角色管理
│   ├── menu/             # 菜单管理
│   └── dict/             # 字典管理
├── shared/                # 共享基础设施
│   ├── api/              # API客户端实例（axios.ts, graphql-client.ts）
│   ├── ui/               # 基础UI组件（shadcn）
│   ├── lib/              # 工具函数库（utils.ts）
│   └── config/           # 配置文件
```

### 3.3 数据获取模式

**GraphQL 查询 Hook 示例（`features/alarm/hooks/use-alarms.ts`）：**

```typescript
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/api/graphql-client";
import type { AlarmConnection, AlarmListParams } from "@/features/alarm/model/alarm-types";

const ALARMS_QUERY = `
  query Alarms($where: AlarmFilter, $page: Int, $size: Int) {
    alarms(where: $where, page: $page, size: $size) {
      nodes { id title severity status ... }
      totalCount
    }
  }
`;

export function useAlarms(params: AlarmListParams) {
  return useQuery({
    queryKey: ["alarms", params],
    queryFn: async () => {
      const result = await graphqlClient
        .query(ALARMS_QUERY, params)
        .toPromise();
      
      if (result.error) throw new Error(result.error.message);
      return result.data?.alarms as AlarmConnection;
    },
    staleTime: 30000,
  });
}
```

**REST Mutation Hook 示例（`features/alarm/hooks/use-acknowledge-alarm.ts`）：**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restClient } from "@/lib/api/rest-client";
import { useToast } from "@/components/ui/use-toast";

export function useAcknowledgeAlarm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await restClient.post(`/alarms/${id}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      toast({ title: "操作成功", description: "告警已确认" });
    },
  });
}
```
src/
├── app/                    # 应用初始化层
│   ├── providers/          # 全局Provider组合
│   ├── styles/            # 全局样式
│   └── index.tsx          # 应用入口
├── pages/                  # 页面层
│   ├── Login/
│   ├── Dashboard/
│   ├── Alarm/
│   ├── System/
│   └── Profile/
├── app/                    # 应用初始化层
│   ├── providers/          # 全局Provider组合
│   ├── styles/            # 全局样式
│   ├── layout/            # 布局组件（Header, Sidebar, MainLayout）
│   ├── routes/            # 路由配置
│   └── index.tsx          # 应用入口
├── features/              # 功能特性层（自包含）
│   ├── auth/
│   │   ├── api/          # REST API
│   │   ├── components/   # 登录表单
│   │   ├── hooks/        # useAuth
│   │   └── model/        # auth-store, auth-types
│   ├── alarm/
│   │   ├── components/   # AlarmFilters, AlarmTable
│   │   ├── hooks/        # useAlarms (含GraphQL), useAcknowledgeAlarm (含REST)
│   │   └── model/        # alarm-types
│   ├── user/
│   ├── role/
│   ├── menu/
│   └── dict/
├── shared/                # 共享基础设施
│   ├── api/              # API客户端封装（axios, urql）
│   ├── ui/               # 基础UI组件（shadcn）
│   ├── lib/              # 工具函数库
│   └── config/           # 配置文件
```

### 3.4 依赖规则

```
pages → features → shared
     ↘_______↗
      (允许直接访问下层)
```

**禁止反向依赖**：下层不能导入上层模块

**跨 feature 引用规则**：
- 允许引用其他 feature 的 `model/*.ts`（类型定义）
- 禁止引用其他 feature 的 `hooks/`（避免循环依赖）
- 公共 API 通过 re-export 暴露：`features/alarm/index.ts`

---

## 4. 模块设计

### 4.1 认证模块 (auth)

**功能：**
- 用户登录（用户名/密码）
- Token 刷新机制
- 登出
- 密码修改

**API 接口：**
- `POST /api/auth/login` - 登录
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 登出
- `PUT /api/auth/password` - 修改密码

**状态管理（`features/auth/model/auth-store.ts`）：**

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}
```

### 4.2 告警模块 (alarm)

**功能：**
- 告警列表（分页、筛选、排序）
- 告警详情查看
- 告警处理：确认、解决、分派、升级
- 批量操作

**API 接口：**
- **GraphQL:**
  ```graphql
  query alarms($where: AlarmFilter, $page: Int, $size: Int) {
    alarms(where: $where, page: $page, size: $size) {
      nodes { id title severity status ... }
      totalCount
      pageInfo { hasNextPage }
    }
  }
  ```

- **REST:**
  - `POST /api/alarms/{id}/acknowledge` - 确认告警
  - `POST /api/alarms/{id}/resolve` - 解决告警
  - `POST /api/alarms/{id}/assign` - 分派告警
  - `POST /api/alarms/{id}/escalate` - 升级告警
  - `POST /api/alarms/batch/acknowledge` - 批量确认

**实体模型：**
```typescript
interface Alarm {
  id: number;
  title: string;
  description: string;
  source: string;
  sourceId: string;
  fingerprint: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  occurredAt: string;
  assignee?: User;
}
```

### 4.3 用户管理模块 (user)

**功能：**
- 用户列表
- 用户增删改查
- 用户角色分配
- 重置密码
- 启用/禁用用户

**API 接口：**
- **GraphQL:** `query users` - 查询用户列表
- **REST:**
  - `POST /api/system/users` - 创建用户
  - `PUT /api/system/users/{id}` - 更新用户
  - `DELETE /api/system/users/{id}` - 删除用户
  - `PUT /api/system/users/{id}/status` - 更新状态
  - `PUT /api/system/users/{id}/reset-password` - 重置密码

### 4.4 角色权限模块 (role)

**功能：**
- 角色列表
- 角色增删改查
- 角色权限分配
- 角色用户列表

**API 接口：**
- **GraphQL:** `query roles`, `query permissions`
- **REST:**
  - `POST /api/system/roles` - 创建角色
  - `PUT /api/system/roles/{id}` - 更新角色
  - `DELETE /api/system/roles/{id}` - 删除角色
  - `PUT /api/system/roles/{id}/permissions` - 分配权限

### 4.5 菜单管理模块 (menu)

**功能：**
- 菜单树管理
- 菜单增删改查
- 权限绑定

**API 接口：**
- **GraphQL:** `query menus`
- **REST:**
  - `GET /api/system/menus/user` - 获取当前用户菜单
  - `POST /api/system/menus` - 创建菜单
  - `PUT /api/system/menus/{id}` - 更新菜单
  - `DELETE /api/system/menus/{id}` - 删除菜单

### 4.6 字典管理模块 (dict)

**功能：**
- 字典分类管理
- 字典项管理
- 公共字典查询（无需权限）

**API 接口：**
- **GraphQL:** `query dictCategories`, `query dictItems`
- **REST:**
  - `GET /api/public/dict/{category}` - 公共字典查询
  - `POST /api/system/dict-categories` - 创建分类
  - `POST /api/system/dict-items` - 创建字典项

---

## 5. 路由设计

### 5.1 布局结构

**Header + Sidebar/Content 布局：**

```
┌─────────────────────────────────────────┐
│  Header                                 │
├──────────┬──────────────────────────────┤
│          │                              │
│          │                              │
│ Sidebar  │         Content              │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### 5.2 路由逻辑

**根路由（/）重定向策略：**
- 已登录用户 → 自动跳转到 `/dashboard`
- 未登录用户 → 自动跳转到 `/login`

**登录页（/login）守卫：**
- 已登录用户访问 → 自动跳转到 `/dashboard`
- 未登录用户 → 正常显示登录页

### 5.3 路由配置

```typescript
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootRedirect />,  // 根据登录状态重定向
  },
  {
    path: '/login',
    element: <LoginGuard />,     // 已登录用户自动跳转
  },
  {
    path: '/',
    element: <MainLayout />,     // Header + Sidebar/Content
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'alarms',
        children: [
          { index: true, element: <AlarmListPage /> },
          { path: ':id', element: <AlarmDetailPage /> },
        ],
      },
      {
        path: 'system',
        element: <RequireRole role="ADMIN" />,
        children: [
          { path: 'users', element: <UserListPage /> },
          { path: 'roles', element: <RoleListPage /> },
          { path: 'permissions', element: <PermissionListPage /> },
          { path: 'menus', element: <MenuListPage /> },
          { path: 'dicts', element: <DictListPage /> },
        ],
      },
      {
        path: 'profile',
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'my-alarms', element: <MyAlarmsPage /> },
        ],
      },
    ],
  },
];
```

### 5.4 路由守卫组件

**RootRedirect - 根路由重定向：**

```typescript
function RootRedirect() {
  const { isAuthenticated } = useAuthStore();
  // 已登录 → dashboard，未登录 → login
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
```

**LoginGuard - 登录页守卫：**

```typescript
function LoginGuard() {
  const { isAuthenticated } = useAuthStore();
  // 已登录用户自动跳转到 dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}
```

**MainLayout - 主布局（带权限检查）：**

```typescript
function MainLayout() {
  const { isAuthenticated } = useAuthStore();
  
  // 未登录用户访问受保护路由，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**RequireRole - 角色权限守卫：**

```typescript
function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  if (!user?.roles?.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}
```

---

## 6. 权限设计

### 6.1 权限模型

采用 RBAC（基于角色的访问控制）模型：
- **用户** 拥有多个 **角色**
- **角色** 拥有多个 **权限**
- **权限** 对应系统功能点

### 6.2 权限控制层级

1. **路由级别**：控制页面访问权限
2. **菜单级别**：控制菜单显示（基于 `/api/system/menus/user` 返回的菜单）
3. **按钮级别**：控制操作按钮显示（基于 `user.permissions` 检查）
4. **数据级别**：后端控制数据访问（多租户 + 权限过滤）

### 6.3 权限检查实现

```typescript
// hooks/usePermission.ts
export function usePermission() {
  const { user } = useAuthStore();
  
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };
  
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };
  
  return { hasPermission, hasRole, hasAnyRole };
}
```

---

## 7. 状态管理设计

### 7.1 Zustand Store 划分

```typescript
// stores/auth.ts - 认证状态
// stores/user.ts - 当前用户信息
// stores/ui.ts - UI状态（侧边栏、主题等）
// stores/alarm-filter.ts - 告警筛选条件（持久化）
```

### 7.2 TanStack Query 设计（直接在 hooks 中写 API 调用）

**Query Hook 示例：**

```typescript
// features/alarm/hooks/use-alarms.ts
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/api/graphql-client";

const ALARMS_QUERY = `
  query Alarms($where: AlarmFilter, $page: Int, $size: Int) {
    alarms(where: $where, page: $page, size: $size) {
      nodes { id title severity status ... }
      totalCount
    }
  }
`;

export function useAlarms(params: AlarmListParams) {
  return useQuery({
    queryKey: ["alarms", params],
    queryFn: async () => {
      const result = await graphqlClient.query(ALARMS_QUERY, params).toPromise();
      if (result.error) throw new Error(result.error.message);
      return result.data?.alarms;
    },
    staleTime: 30000,
  });
}
```

**Mutation Hook 示例：**

```typescript
// features/alarm/hooks/use-acknowledge-alarm.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restClient } from "@/lib/api/rest-client";

export function useAcknowledgeAlarm() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await restClient.post(`/alarms/${id}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
    },
  });
}
```

---

## 8. 组件设计规范

### 8.1 UI 组件策略

**组件来源：**
- 所有 UI 组件通过 `shadcn CLI` 安装
- 底层使用 **Base UI**（shadcn 默认）
- 组件代码完全在项目中，可自由修改

**安装方式：**

```bash
# 安装单个组件
pnpm dlx shadcn add button

# 安装多个组件
pnpm dlx shadcn add card input label badge avatar skeleton dropdown-menu sonner

# 查看所有可用组件
pnpm dlx shadcn add --help
```

**常用组件清单：**

| 组件 | 用途 | 安装命令 |
|------|------|----------|
| button | 按钮 | `shadcn add button` |
| card | 卡片容器 | `shadcn add card` |
| input | 输入框 | `shadcn add input` |
| label | 表单标签 | `shadcn add label` |
| badge | 徽章标签 | `shadcn add badge` |
| avatar | 头像 | `shadcn add avatar` |
| skeleton | 骨架屏 | `shadcn add skeleton` |
| dropdown-menu | 下拉菜单 | `shadcn add dropdown-menu` |
| sonner | 消息提示 | `shadcn add sonner` |

**使用示例：**

```typescript
// 导入 shadcn 组件
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// 使用组件
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <Button>点击</Button>
</Card>
```

### 8.2 自定义业务组件

业务组件放在对应 feature 的 `components/` 目录下：

```typescript
// features/alarm/components/AlarmFilters.tsx
// features/alarm/components/AlarmTable.tsx
// features/user/components/UserForm.tsx
```

### 8.3 组件使用原则

1. **优先使用 shadcn 组件**：通过 CLI 安装官方组件
2. **按需定制**：shadcn 组件代码在项目中，可直接修改
3. **组合优于配置**：利用 shadcn 的组合模式构建复杂 UI
4. **类型安全**：所有组件有完整的 TypeScript 类型
5. **可访问性**：shadcn 组件遵循 WAI-ARIA 规范

---

## 9. API 封装设计

### 9.1 GraphQL Client

```typescript
// lib/api/graphql-client.ts
import { createClient } from 'urql';

export const graphqlClient = createClient({
  url: '/graphql',
  fetchOptions: () => {
    const token = useAuthStore.getState().token;
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' },
    };
  },
});
```

### 9.2 REST Client

```typescript
// lib/api/rest-client.ts
import axios from 'axios';

export const restClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 添加 Token
restClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - Token 刷新
restClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 尝试刷新 Token
      await useAuthStore.getState().refresh();
      // 重试原请求
      return restClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 10. 错误处理设计

### 10.1 核心原则

**永不阻塞渲染**：后台 API 错误不应导致组件无法渲染，始终展示 UI，仅通过消息提示错误。

### 10.2 错误处理策略

| 场景 | 处理方式 | 用户感知 |
|------|----------|----------|
| **Query 错误** | 不抛出异常，返回空数据，显示加载失败提示 | Sonner Toast |
| **Mutation 错误** | 操作失败，不刷新页面，提示错误 | Sonner Toast |
| **认证错误** | 401 自动刷新 token，失败跳转登录 | 跳转登录页 |
| **网络错误** | 自动重试 1 次，失败提示 | Sonner Toast |

### 10.3 QueryClient 配置

```typescript
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
      // 关键：错误不抛出，组件继续渲染
      throwOnError: false,
    },
    mutations: {
      // Mutation 错误通过 toast 提示
      onError: (error) => {
        const message = error instanceof Error 
          ? error.message 
          : "操作失败，请稍后重试";
        toast.error(message);
      },
    },
  },
});
```

### 10.4 组件错误处理模式

**Query Hook 使用示例：**

```typescript
function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardStats();

  // 错误时依然渲染组件，显示空状态
  if (isError) {
    return (
      <div className="p-6">
        <h1>仪表盘</h1>
        <p className="text-muted-foreground">
          数据加载失败，请刷新页面重试
        </p>
      </div>
    );
  }

  // 正常渲染
  return (
    <div className="p-6">
      <StatsCard data={data} />
    </div>
  );
}
```

**Mutation 使用示例：**

```typescript
function AcknowledgeButton({ alarmId }: { alarmId: string }) {
  const { mutate, isPending } = useAcknowledgeAlarm();

  const handleClick = () => {
    mutate(alarmId);
    // 错误会自动通过 toast 提示，无需处理
  };

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "处理中..." : "确认告警"}
    </Button>
  );
}
```

### 10.5 Sonner 配置

```typescript
// app/providers/index.tsx
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </QueryClientProvider>
  );
}
```

### 10.6 错误类型定义

```typescript
// lib/api/error-types.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

---

## 11. 开发阶段规划

### 阶段1：核心框架 + 认证 + 告警运维（2周）

**目标：** 搭建项目基础，实现最核心的告警处理功能

**交付物：**
- 项目初始化和 shadcn/ui 配置
- 登录/登出功能
- 基础布局（侧边栏、头部、内容区）
- 告警列表页面（筛选、分页）
- 告警详情页面
- 告警操作（确认、解决、分派）

### 阶段2：系统管理（2周）

**目标：** 实现完整的系统管理功能

**交付物：**
- 用户管理（CRUD、角色分配）
- 角色管理（CRUD、权限分配）
- 权限管理（查看）
- 菜单管理（树形结构）
- 字典管理（分类 + 项）

### 阶段3：仪表盘 + AI分析 + 用户自助（1周）

**目标：** 增强用户体验和智能化能力

**交付物：**
- 仪表盘（告警统计、趋势图）
- 个人中心（信息修改、密码修改）
- 我的告警
- 通知偏好设置
- AI 告警根因分析（如果有后端支持）

---

## 12. 性能优化策略

### 11.1 代码分割

```typescript
// 路由级别懒加载
const AlarmListPage = lazy(() => import('./pages/Alarm/AlarmList'));
const UserListPage = lazy(() => import('./pages/System/UserList'));
```

### 11.2 数据缓存策略

| 数据类型 | 缓存策略 | TTL |
|----------|----------|-----|
| 告警列表 | Stale While Revalidate | 30秒 |
| 用户信息 | 长期缓存 | 会话级 |
| 字典数据 | 长期缓存 | 1小时 |
| 菜单数据 | 长期缓存 | 会话级 |

### 11.3 虚拟列表

告警列表使用虚拟滚动优化大数据量渲染。

---

## 13. 安全考虑

1. **XSS 防护**：所有用户输入转义，使用 dangerouslySetInnerHTML 时严格校验
2. **CSRF 防护**：使用 SameSite Cookie，配合 Token 机制
3. **敏感信息**：不在前端存储敏感信息，密码输入使用原生密码框
4. **权限校验**：前端权限控制仅用于 UI 展示，所有操作后端二次校验

---

## 14. 附录

### 13.1 术语表

- **AMS**: Alert Management System（告警管理系统）
- **FSD**: Feature-Sliced Design（功能切片架构）
- **RBAC**: Role-Based Access Control（基于角色的访问控制）
- **GraphQL**: 一种查询语言和运行时

### 13.2 参考资料

- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [React Router 文档](https://reactrouter.com/)

---

**文档历史**

| 日期 | 版本 | 修改人 | 修改内容 |
|------|------|--------|----------|
| 2025-03-06 | 1.0 | AI Assistant | 初始版本 |

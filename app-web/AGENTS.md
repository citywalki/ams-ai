# Frontend Project Guidelines

## 技术栈

- React 19 + TypeScript 5.9 + Vite 7
- 架构: Feature-Sliced Design (FSD)
- UI: Base UI + shadcn/ui + Tailwind CSS 4
- 路由: React Router 7 (Data API / createBrowserRouter)
- 状态: Zustand 5
- 数据: GraphQL (urql) + TanStack Query 5, REST (axios)
- 表单: React Hook Form + Zod
- 图标: Phosphor Icons + Lucide React
- 字体: Geist (Variable)
- 通知: Sonner
- 主题: next-themes (dark/light)

## 项目结构 (FSD)

**注意**: 不使用独立的 `entities/` 层，所有业务实体代码都放在对应的 `features/` 中。

```
src/
├── app/               # 应用层: providers, router, layout
├── pages/             # 页面层: 路由对应的页面组件 (仅组合，不含业务逻辑)
├── features/          # 特性层: 业务功能模块 (包含实体、可复用组件)
│   └── {feature}/
│       ├── schema/    # 数据建模: TypeScript 类型定义 (interface)
│       ├── hooks/     # TanStack Query hooks
│       └── components/# 特性专用组件 (可复用)
├── store/             # 全局状态: Zustand stores (按 feature 命名)
│   └── {feature}-store.ts
├── components/        # 共享 UI 组件 (shadcn/ui)
├── shared/            # 共享层: 工具、API 客户端
│   └── api/           # graphqlClient, restClient, queryClient
└── lib/               # 工具库: utils (cn)
```

## 硬规则

### 项目结构规范

**禁止**创建 `src/entities/` 目录。所有业务实体相关的代码（类型、hooks）都应放在对应的 `features/{feature}/` 中。

**❌ 错误结构:**
```
src/
├── entities/          # 不要这样做
│   └── menu/
│       ├── model/types.ts
│       └── hooks/use-menu.ts
├── features/
│   └── menu/          # 实体和 feature 分离
```

**✅ 正确结构:**
```
src/
├── features/          # 所有业务代码在这里
│   └── menu/
│       ├── schema/
│       │   └── menu.ts    # 类型定义
│       └── hooks/
│           └── use-menu.ts
```

### Schema 层规范

**数据建模的 interface/type 放在 `features/{feature}/schema/` 中**，每个 feature 可以有多个 schema 文件。

**示例:**
```typescript
// features/menu/schema/menu.ts
export interface Menu {
  id: number;
  key: string;
  label: string;
  route?: string;
  // ...
}

// features/auth/schema/auth.ts
export interface User {
  id: number;
  username: string;
  email: string;
  // ...
}
```

### Store 层规范

**全局状态 (Zustand store) 放在 `src/store/` 目录下**，按 feature 命名。

**示例:**
```typescript
// store/auth-store.ts
import { create } from "zustand";

export const useAuthStore = create<AuthState>()(...);
```

**✅ 导入方式:**
```typescript
import { useAuthStore } from "@/store/auth-store";
```

### Pages 层规范

**pages/** 目录中的页面组件**仅**用于：
1. 组合 `features/` 中的组件
2. 准备数据并传递给 feature 组件
3. 定义页面级布局

**禁止**在 pages 中编写可复用的业务组件、数据转换逻辑或复杂的 UI 逻辑。这些应该封装在对应的 `features/{feature}/components/` 中。

**❌ 错误示例:**
```typescript
// pages/Dashboard/index.tsx - 不要这样做
export default function DashboardPage() {
  // ❌ 页面中包含大量业务数据和 UI 逻辑
  const statsData = [...]; // 20+ 行数据定义
  const recentAlarms = [...]; // 大量数据定义
  
  return (
    <div>
      {/* ❌ 直接在页面中渲染复杂的卡片组件 */}
      <Card>
        <CardHeader>...30 行 UI 代码...</CardHeader>
      </Card>
      {/* 更多复杂组件... */}
    </div>
  );
}
```

**✅ 正确示例:**
```typescript
// pages/Dashboard/index.tsx
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { AlarmTrendChart } from "@/features/dashboard/components/alarm-trend-chart";
import { RecentAlarmList } from "@/features/dashboard/components/recent-alarm-list";

const statsData = [...]; // 简洁的数据准备
const recentAlarms = [...];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>仪表盘</h1>
      <StatCards data={statsData} />
      <AlarmTrendChart />
      <RecentAlarmList alarms={recentAlarms} />
    </div>
  );
}
```

### API 调用规范

**协议选择原则:**
- **查询（Query）**: 通常使用 **GraphQL** (urql)
- **更新（Mutation）**: 必须使用 **REST** (axios)
- **例外情况**: 个别简单查询可以使用 REST（如系统菜单等基础接口）

**禁止**创建单独的 API 封装层（如 `features/**/api/`）。所有请求必须在 hook 中直接调用相应的客户端。

**❌ 错误示例:**
```typescript
// features/menu/api/menu-api.ts - 不要这样做
export async function fetchUserMenus(): Promise<Menu[]> {
  const response = await restClient.get<MenuResponse>("/system/menus/user");
  return response.data.data;
}

// features/menu/hooks/use-menu.ts
import { fetchUserMenus } from "../api/menu-api";
export function useUserMenus() {
  return useQuery({
    queryFn: fetchUserMenus, // 间接调用
  });
}
```

**✅ GraphQL 查询示例:**
```typescript
// features/alarm/hooks/use-alarms.ts
import { useQuery } from "urql";

const ALARMS_QUERY = `
  query GetAlarms($status: String, $limit: Int) {
    alarms(status: $status, limit: $limit) {
      id
      title
      severity
      createdAt
    }
  }
`;

export function useAlarms(status?: string, limit: number = 10) {
  return useQuery({
    query: ALARMS_QUERY,
    variables: { status, limit },
  });
}
```

**✅ REST 更新示例:**
```typescript
// features/alarm/hooks/use-update-alarm.ts
import { useMutation } from "@tanstack/react-query";
import { restClient } from "@/shared/api/rest-client";

interface UpdateAlarmParams {
  id: string;
  status: string;
}

export function useUpdateAlarm() {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateAlarmParams) => {
      const response = await restClient.patch(`/alarms/${id}`, { status });
      return response.data;
    },
  });
}
```

**✅ REST 简单查询示例（例外情况）:**
```typescript
// features/menu/hooks/use-menu.ts - 简单查询可以用 REST
import { restClient } from "@/shared/api/rest-client";

export function useUserMenus() {
  return useQuery({
    queryFn: async () => {
      const response = await restClient.get<MenuResponse>("/system/menus/user");
      return response.data.data;
    },
  });
}
```

### 状态管理规范

- **服务端状态**: 
  - GraphQL 查询使用 **urql** (在 `features/{feature}/hooks/` 中)
  - REST 请求使用 **TanStack Query** (在 `features/{feature}/hooks/` 中)
- **客户端全局状态**: 使用 Zustand (在 `src/store/{feature}-store.ts` 中)
- **禁止**在组件中直接使用 `localStorage`，应通过 Zustand persist 中间件
- **类型定义**: 放在 `features/{feature}/schema/{feature}.ts`

### 组件规范

- **UI 组件**: 优先使用 `components/ui/` 下的 shadcn/ui 组件
- **业务组件**: 可复用的业务逻辑组件放在 `features/{feature}/components/`
- **样式工具**: 使用 `cn()` 函数合并 Tailwind 类名
- **图标**: 优先使用 Phosphor Icons (`@phosphor-icons/react`)

### 代码风格

- 缩进: 2 空格（不使用 tab）
- 行宽: 120
- TS 严格模式: `noUnusedLocals`, `noUnusedParameters`
- 路径别名: `@/*` -> `src/*`
- 函数式组件，使用默认导出作为页面组件

### 命名约定

- **Hooks**: `use{Feature}{Action}` (如 `useUserMenus`, `useAuthStore`)
- **Query Keys**: `["{entity}", "{action}"]` 格式
- **Store 文件**: `src/store/{feature}-store.ts`
- **Schema 文件**: `src/features/{feature}/schema/{feature}.ts`
- **组件**: PascalCase (如 `LoginForm`, `MainLayout`)

### 路由规范

- 路由配置集中在 `app/routes/index.tsx`
- 使用 `createBrowserRouter` 定义路由
- 路由守卫作为独立组件实现 (如 `LoginGuard`)
- 页面组件放在 `pages/{PageName}/index.tsx`

# 前端开发规范

## 技术栈

- **框架**: React 19
- **语言**: TypeScript 5.9
- **构建工具**: Vite 7
- **架构**: Feature-Sliced Design (FSD)
- **UI 组件**: Base UI + shadcn/ui + Tailwind CSS 4
- **路由**: React Router 7 (Data API / createBrowserRouter)
- **状态管理**: Zustand 5
- **数据获取**: Axios + TanStack Query 5
- **表单**: React Hook Form + Zod
- **图标**: Phosphor Icons + Lucide React
- **字体**: Geist (Variable)
- **通知**: Sonner
- **主题**: next-themes (dark/light)

## TypeScript 配置

- 严格模式: `noUnusedLocals`, `noUnusedParameters`
- 路径别名: `@/*` -> `src/*`

## 目录结构 (FSD)

```
app-web/src/
├── app/               # 应用层: providers, router, layout, store
├── entities/          # 实体层: menu, user 等
├── features/          # 特性层: auth, login-form 等
├── pages/             # 页面层: Login, Dashboard 等
├── widgets/           # 组件层: 复杂 UI 组合
├── components/        # 共享 UI 组件 (shadcn/ui)
├── shared/            # 共享层: api (axios, query-client), lib
└── lib/               # 工具库: utils (cn)
```

### 层级说明

| 层级 | 说明 | 示例 |
|------|------|------|
| `app/` | 应用初始化、全局配置、路由定义 | `router.tsx`, `providers.tsx` |
| `entities/` | 业务实体，无 UI 逻辑 | `entities/user`, `entities/menu` |
| `features/` | 用户交互功能，包含业务逻辑 | `features/auth`, `features/login-form` |
| `pages/` | 页面组件，组合 features | `pages/login`, `pages/dashboard` |
| `widgets/` | 复杂 UI 组件，组合多个 features | `widgets/header`, `widgets/sidebar` |
| `components/` | 纯 UI 组件库 (shadcn) | `components/ui/button.tsx` |
| `shared/` | 跨层共享的基础设施 | `shared/api`, `shared/lib` |

## 开发命令

```bash
cd app-web
pnpm dev              # 开发服务器
pnpm build            # 构建 (tsc + vite build)
pnpm lint             # ESLint 检查
pnpm preview          # 预览生产构建
```

## 代码规范

### 缩进与格式
- 缩进: 2 空格（不使用 tab）
- 行宽: 120

### 导入顺序
```typescript
// 1. React/框架
import React from 'react';

// 2. 第三方库
import { useQuery } from '@tanstack/react-query';

// 3. 内部模块
import { Button } from '@/components/ui/button';

// 4. 相对路径
import { useAuth } from '../hooks/useAuth';
```

### 组件规范

#### 文件命名
- 组件: `PascalCase.tsx`
- 工具: `camelCase.ts`
- 常量: `SCREAMING_SNAKE_CASE.ts` 或 `constants.ts`

#### 组件结构
```typescript
// imports
import { useState } from 'react';

// types
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

// component
export function UserCard({ user, onEdit }: UserCardProps) {
  // hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // handlers
  const handleClick = () => {
    onEdit?.(user);
  };
  
  // render
  return (
    <div className="p-4">
      <h3>{user.name}</h3>
    </div>
  );
}
```

### 状态管理

#### Zustand Store
```typescript
// store/counter.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### 数据获取

#### TanStack Query
```typescript
import { useQuery } from '@tanstack/react-query';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });
}
```

### 表单处理

#### React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

### 样式规范

#### Tailwind CSS
- 使用 Tailwind 的 utility classes
- 复杂样式组合使用 `cn()` 工具函数
- 自定义主题配置在 `tailwind.config.ts`

```typescript
import { cn } from '@/lib/utils';

export function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

## 路由配置

路由定义位于 `app-web/src/app/routes/`。

```typescript
// routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
]);
```

## UI 主题风格

详见 `docs/ui-style-guide.md`。

- 色彩系统
- 布局规范
- 组件设计原则

## 仓库约定

- 分支: `main`; `feature/*`; `fix/*`
- 提交: conventional style (`feat:`, `fix:`, `docs:`, `chore:`)
- 生成的产物和文档优先使用中文

## 参考文件

- `app-web/src/app/routes/`: 前端路由配置
- `docs/ui-style-guide.md`: 前端 UI 主题风格设计规范

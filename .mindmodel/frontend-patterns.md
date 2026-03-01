# 前端模式 (Frontend Patterns)

## 概述

AMS-AI 前端使用 React 18 + TypeScript 5 + Vite + Ant Design，采用函数组件和 Hooks，使用 Zustand 进行状态管理，TanStack Query 管理服务端状态。

## 技术栈

### 核心
- **React**: 18.2.0
- **TypeScript**: 5.5.0（strict 模式）
- **Vite**: 5.2.0

### UI
- **Ant Design**: 6.0.0
- **Lucide React**: 0.575.0（图标）
- **Framer Motion**: 12.34.3（动画）

### 状态管理
- **Zustand**: 4.5.2（客户端状态）
- **TanStack Query**: 5.90.21（服务端状态）

### 路由
- **React Router**: 6.23.1 → 7.x

### 样式
- **TailwindCSS**: 4.2.1
- **clsx**: 2.1.1
- **tailwind-merge**: 3.5.0

### 表单
- **TanStack Form**: 1.28.3
- **Zod**: 4.3.6（验证）

### HTTP
- **Axios**: 1.6.2
- **GraphQL Request**: 7.4.0

### 国际化
- **i18next**: 25.8.13
- **react-i18next**: 16.5.4

## 项目结构

```
app-web/
├── public/
├── src/
│   ├── api/              # API 客户端
│   │   ├── axios.ts      # Axios 配置
│   │   ├── userApi.ts    # 用户 API
│   │   └── alarmApi.ts   # 告警 API
│   ├── components/       # 通用组件
│   │   ├── Layout/
│   │   ├── Table/
│   │   └── Form/
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   └── useTenant.ts
│   ├── pages/            # 页面组件
│   │   ├── Users/
│   │   ├── Alarms/
│   │   └── Dashboard/
│   ├── stores/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── menuStore.ts
│   ├── types/            # TypeScript 类型
│   │   ├── user.ts
│   │   └── alarm.ts
│   ├── utils/            # 工具函数
│   ├── i18n/             # 国际化
│   ├── App.tsx           # 应用根组件
│   └── main.tsx          # 入口文件
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 组件规范

### 函数组件

```typescript
// ✅ 正确：函数组件
import React from 'react';

interface UserListProps {
  tenantId: number;
  onUserSelect?: (userId: number) => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  tenantId, 
  onUserSelect 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};

// ❌ 错误：Class 组件
class UserList extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

### 组件结构

```typescript
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Table, Button, Modal } from 'antd';
import { userApi } from '@/api/userApi';
import type { User } from '@/types/user';

/**
 * 用户列表组件
 * 显示系统中所有用户，支持搜索、分页和删除
 */
export const UserList: React.FC<UserListProps> = ({ tenantId }) => {
  // ========== Hooks ==========
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', tenantId, page, pageSize, searchText],
    queryFn: () => userApi.getUsers(tenantId, page, pageSize, searchText),
  });
  
  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      refetch();
    },
  });
  
  // ========== 事件处理 ==========
  const handleDelete = (userId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: () => deleteMutation.mutate(userId),
    });
  };
  
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(0);
  };
  
  // ========== 渲染 ==========
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: User) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];
  
  return (
    <div className="user-list">
      <Table
        columns={columns}
        dataSource={data?.users}
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize,
          total: data?.total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />
    </div>
  );
};
```

## API 客户端

### Axios 配置

```typescript
// src/api/axios.ts
import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('未登录或登录已过期');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data?.message || '请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API 模块

```typescript
// src/api/userApi.ts
import apiClient from './axios';
import type { User, UserRequest, UserResponse, PageResponse } from '@/types/user';

export const userApi = {
  getUsers: async (
    tenantId: number,
    page: number,
    size: number,
    search?: string
  ): Promise<PageResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await apiClient.get<PageResponse<User>>(
      `/api/tenants/${tenantId}/users?${params}`
    );
    return response.data;
  },
  
  getUserById: async (tenantId: number, userId: number): Promise<User> => {
    const response = await apiClient.get<User>(
      `/api/tenants/${tenantId}/users/${userId}`
    );
    return response.data;
  },
  
  createUser: async (tenantId: number, data: UserRequest): Promise<User> => {
    const response = await apiClient.post<User>(
      `/api/tenants/${tenantId}/users`,
      data
    );
    return response.data;
  },
  
  updateUser: async (
    tenantId: number,
    userId: number,
    data: UserRequest
  ): Promise<User> => {
    const response = await apiClient.put<User>(
      `/api/tenants/${tenantId}/users/${userId}`,
      data
    );
    return response.data;
  },
  
  deleteUser: async (tenantId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/users/${userId}`);
  },
};
```

## 状态管理

### Zustand Store

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  tenantId: number;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('tenantId', user.tenantId.toString());
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 使用 Store

```typescript
import { useAuthStore } from '@/stores/authStore';

export const UserProfile = () => {
  const { user, logout } = useAuthStore();
  
  if (!user) {
    return <div>未登录</div>;
  }
  
  return (
    <div>
      <h2>{user.username}</h2>
      <p>{user.email}</p>
      <Button onClick={logout}>退出登录</Button>
    </div>
  );
};
```

## TanStack Query

### 查询

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';

// 查询用户列表
export const useUsers = (tenantId: number, page: number, size: number) => {
  return useQuery({
    queryKey: ['users', tenantId, page, size],
    queryFn: () => userApi.getUsers(tenantId, page, size),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 查询单个用户
export const useUser = (tenantId: number, userId: number) => {
  return useQuery({
    queryKey: ['user', tenantId, userId],
    queryFn: () => userApi.getUserById(tenantId, userId),
    enabled: !!userId, // 只在有 userId 时执行
  });
};
```

### 变更

```typescript
// 创建用户
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: number; data: UserRequest }) =>
      userApi.createUser(tenantId, data),
    
    onSuccess: (_, variables) => {
      // 失效用户列表缓存
      queryClient.invalidateQueries({ 
        queryKey: ['users', variables.tenantId] 
      });
      message.success('创建用户成功');
    },
    
    onError: (error) => {
      message.error('创建用户失败');
    },
  });
};

// 使用
const createMutation = useCreateUser();

const handleCreate = (data: UserRequest) => {
  createMutation.mutate({ tenantId, data });
};
```

## 路由

### 路由配置

```typescript
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: (
          <RequirePermission permission="user:read">
            <UserList />
          </RequirePermission>
        ),
      },
      {
        path: 'alarms',
        element: <AlarmList />,
      },
    ],
  },
]);
```

### 路由守卫

```typescript
// src/router/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// 权限守卫
interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
}) => {
  const { user } = useAuthStore();
  
  const hasPermission = user?.roles.some(role => 
    role === 'ADMIN' || role === permission
  );
  
  if (!hasPermission) {
    return <div>权限不足</div>;
  }
  
  return <>{children}</>;
};
```

## TypeScript 类型

### 类型定义

```typescript
// src/types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password?: string;
  roleIds: number[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  status: string;
}

export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}
```

## 表单处理

### TanStack Form + Zod

```typescript
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

const userSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8个字符'),
  roleIds: z.array(z.number()).min(1, '至少选择一个角色'),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const form = useForm<UserFormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      roleIds: [],
    },
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit}>
      <form.Field
        name="username"
        validators={{
          onChange: ({ value }) => {
            const result = userSchema.shape.username.safeParse(value);
            return result.success ? undefined : result.error.errors[0].message;
          },
        }}
      >
        {(field) => (
          <div>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <span className="error">{field.state.meta.errors}</span>
            )}
          </div>
        )}
      </form.Field>
      
      <Button type="submit">提交</Button>
    </form>
  );
};
```

## 最佳实践

### ✅ 必须遵守

1. **使用函数组件 + Hooks**
2. **TypeScript strict 模式**
3. **明确类型定义（不使用 any）**
4. **组件职责单一**
5. **状态分离（客户端 vs 服务端）**
6. **错误边界处理**
7. **代码分割（懒加载）**

### ❌ 禁止做法

1. **使用 Class 组件**
2. **使用 any 类型**
3. **直接操作 DOM**
4. **在组件中直接调用 fetch**
5. **状态管理混乱**
6. **忽略错误处理**
7. **过度使用 Context**

---
date: 2026-03-01
topic: "Frontend Reference Plan for New Project"
status: validated
---

# 前端项目参考计划

> 本文档供 AI 在其他项目中参考 AMS-AI 前端架构和实现模式

---

## 1. 技术栈

### 核心依赖

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.x |
| 语言 | TypeScript | 5.x (strict mode) |
| 构建工具 | Vite | 5.x |
| UI 组件库 | Ant Design | 6.x |
| 图标 | @ant-design/icons | 6.x |
| 状态管理 | Zustand | 4.x |
| 数据获取 | TanStack Query | 5.x |
| 表格 | TanStack Table | 8.x |
| 表单 | TanStack Form + Zod | latest |
| GraphQL 客户端 | graphql-request | 7.x |
| HTTP 客户端 | Axios | 1.x |
| 路由 | React Router | 6.x / 7.x |
| 样式 | Tailwind CSS | 4.x |
| 动画 | Framer Motion | 12.x |
| 国际化 | i18next | 25.x |

### 开发依赖

```json
{
  "@playwright/test": "^1.58.0",
  "eslint": "^8.55.0",
  "typescript": "^5.2.0",
  "vite": "^5.0.0",
  "vite-tsconfig-paths": "^4.2.0"
}
```

---

## 2. 目录结构

```
src/
├── main.tsx                    # React 入口
├── Router.tsx                  # 路由配置
│
├── components/                 # 通用组件
│   ├── common/                 # 基础组件
│   │   └── QueryErrorDisplay.tsx
│   ├── layout/                 # 布局组件
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── tables/                 # 表格组件
│       ├── DataTable.tsx
│       └── DataTablePagination.tsx
│
├── features/                   # 功能模块 (按领域划分)
│   └── {domain}/
│       ├── components/         # 领域组件
│       ├── hooks/              # 业务 Hooks
│       ├── mutations.ts        # REST 命令
│       ├── queries.ts          # GraphQL 查询
│       ├── schemas/            # Zod 验证
│       └── types.ts            # 类型定义
│
├── pages/                      # 页面组件
│   ├── login/
│   ├── dashboard/
│   └── admin/
│
├── lib/                        # 基础设施
│   ├── apiClient.ts            # REST 客户端
│   ├── graphqlClient.ts        # GraphQL 客户端
│   ├── queryClient.ts          # React Query 配置
│   ├── queryKeys.ts            # Query Key 定义
│   ├── types.ts                # 共享类型
│   └── utils.ts                # 工具函数
│
├── stores/                     # Zustand 状态
│   ├── authStore.ts
│   └── permissionStore.ts
│
├── services/                   # API 服务封装
├── contexts/                   # React Context
├── styles/                     # 全局样式
└── i18n/                       # 国际化
```

---

## 3. 核心配置

### vite.config.ts

```typescript
// 关键配置点:
// 1. 路径别名: @/* -> src/*
// 2. API 代理: /api, /graphql
// 3. TypeScript 插件
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 路径别名

所有导入使用 `@/` 前缀：
```typescript
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/apiClient';
```

---

## 4. 设计模式

### 4.1 查询/命令分离 (CQRS)

| 操作 | 技术 | 文件 |
|------|------|------|
| 查询 (Query) | GraphQL | `features/*/queries.ts` |
| 命令 (Command) | REST | `features/*/mutations.ts` |

### 4.2 三层架构

```
Page (页面) → Hooks (业务逻辑) → Components (UI组件)
     ↓
Mutations/Queries (数据层)
```

### 4.3 状态分离

| 状态类型 | 存储位置 | 示例 |
|----------|----------|------|
| 全局状态 | Zustand Store | authStore, permissionStore |
| 服务器状态 | TanStack Query | useQuery, useMutation |
| UI 状态 | 组件 useState | 对话框开关、表单输入 |

---

## 5. API 客户端配置

### REST 客户端 (apiClient.ts)

**关键功能**:
- JWT Token 自动注入
- 401 自动刷新 Token
- 错误统一处理

```typescript
// 请求拦截: 自动添加 Authorization
config.headers.set('Authorization', `Bearer ${token}`);

// 响应拦截: 401 时自动刷新
if (error.response?.status === 401) {
  const response = await axios.post('/auth/refresh', { refreshToken });
  // 重试原请求
}
```

### GraphQL 客户端 (graphqlClient.ts)

**关键功能**:
- BigInt 处理 (雪花 ID)
- Token 自动注入

```typescript
// 使用 json-bigint 处理大数字
const JSONBigString = JSONBig({ storeAsString: true });
```

---

## 6. 组件规范

### 6.1 DataTable 组件

**设计要点**:
- 封装 TanStack Table
- 服务端分页/排序
- 自动 loading/error 状态
- 可复用的列定义

```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  queryKey: unknown[];
  queryFn: (params: QueryParams) => Promise<PageResponse<TData>>;
  defaultSort?: { id: string; desc: boolean };
  searchParams?: Record<string, string>;
}
```

### 6.2 表单布局

**强制规则**: 所有表单使用水平布局 (标签在左)

```tsx
<Form layout="horizontal">
  <Form.Item label="字段名" name="fieldName">
    <Input />
  </Form.Item>
</Form>
```

### 6.3 Dialog/Panel 模式

**结构**:
```tsx
<Modal open={open} onCancel={onClose}>
  <Form form={form} layout="horizontal">
    {/* 表单字段 */}
  </Form>
</Modal>
```

---

## 7. Mutations 模式

### 标准结构

```typescript
export function useCreateXxx(
  options?: UseMutationOptions<XxxItem, Error, XxxPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: XxxPayload) => {
      const res = await apiClient.post<XxxItem>('/xxx', payload);
      return res.data;
    },
    onSuccess: () => {
      // 失效相关缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.xxx.list() });
    },
    ...options,
  });
}
```

### 缓存失效策略

| 操作 | 失效的 Query Keys |
|------|-------------------|
| 创建 | list |
| 更新 | list, detail(id) |
| 删除 | list |
| 关联更新 | list, detail(id), related(id) |

---

## 8. Queries 模式

### 分页查询

```typescript
export async function fetchXxxPage(
  params: QueryParams,
  searchParams: Record<string, string>,
): Promise<PageResponse<XxxItem>> {
  const where = buildFilter(searchParams);
  const orderBy = buildOrderBy(params);

  const query = `
    query XxxList($where: XxxFilter, $orderBy: [OrderByInput], $page: Int, $size: Int) {
      xxxs(where: $where, orderBy: $orderBy, page: $page, size: $size) {
        content { id name ... }
        totalElements
        totalPages
        page
        size
      }
    }
  `;

  return graphqlClient.request(query, { where, orderBy, page, size });
}
```

### Filter 构建

```typescript
function buildFilter(searchParams: Record<string, string>) {
  const filter: Record<string, unknown> = {};
  
  if (searchParams.keyword) {
    filter._or = [
      { code: { _ilike: searchParams.keyword } },
      { name: { _ilike: searchParams.keyword } },
    ];
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}
```

---

## 9. 页面实现模式

### 管理页面结构

```tsx
function XxxManagementPage() {
  // 1. 搜索状态 (输入与查询分离)
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  
  // 2. 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<XxxItem | null>(null);
  
  // 3. Mutations
  const createMutation = useCreateXxx();
  const updateMutation = useUpdateXxx();
  const deleteMutation = useDeleteXxx();
  
  // 4. 表格列定义
  const columns = createColumns({
    onEdit: (item) => { setEditingItem(item); setDialogOpen(true); },
    onDelete: (id) => deleteMutation.mutate(id),
  });
  
  // 5. 搜索处理
  const handleSearch = () => setQueryKeyword(keyword);
  
  return (
    <div>
      {/* 搜索卡片 */}
      <Card>
        <Input value={keyword} onChange={e => setKeyword(e.target.value)} />
        <Button onClick={handleSearch}>搜索</Button>
        <Button onClick={() => { setEditingItem(null); setDialogOpen(true); }}>
          新增
        </Button>
      </Card>
      
      {/* 数据表格 */}
      <DataTable
        columns={columns}
        queryKey={['xxxs']}
        queryFn={fetchXxxPage}
        searchParams={{ keyword: queryKeyword }}
      />
      
      {/* 编辑对话框 */}
      <XxxDialog
        open={dialogOpen}
        item={editingItem}
        onClose={() => setDialogOpen(false)}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, payload: data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}
```

### 搜索状态分离

**为什么分离 `keyword` 和 `queryKeyword`?**
- `keyword`: 输入框绑定值，实时更新
- `queryKeyword`: 查询参数，点击搜索才更新
- 避免每次输入都触发 API 请求

---

## 10. 状态管理

### Zustand Store 模式

```typescript
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  bootstrap: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    // 获取用户信息...
  },

  login: async (username, password) => {
    // 登录逻辑...
  },
}));
```

---

## 11. Query Keys 规范

```typescript
export const queryKeys = {
  users: {
    list: () => ['users'] as const,
    listRoot: () => ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    list: () => ['roles'] as const,
    listRoot: () => ['roles', 'list'] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    menus: (id: string) => ['roles', 'menus', id] as const,
  },
};
```

---

## 12. 错误处理

### QueryErrorDisplay 组件

统一的查询错误展示：
- 显示错误信息
- 提供重试按钮
- 支持 inline/modal 两种模式

### 全局错误处理

```typescript
// apiClient.ts 响应拦截
const errorMessage = errorData?.message || error.message;
const enhancedError = new Error(errorMessage);
enhancedError.status = error.response?.status;
return Promise.reject(enhancedError);
```

---

## 13. 类型定义

### 共享类型 (lib/types.ts)

```typescript
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: PermissionItem[];
}
```

---

## 14. 实现检查清单

新项目实现时按此顺序：

- [ ] 1. 初始化项目: `pnpm create vite`
- [ ] 2. 配置 TypeScript (strict mode)
- [ ] 3. 配置 Vite (别名、代理)
- [ ] 4. 安装核心依赖
- [ ] 5. 创建目录结构
- [ ] 6. 实现 apiClient (JWT 拦截器)
- [ ] 7. 实现 graphqlClient (BigInt 处理)
- [ ] 8. 配置 TanStack Query
- [ ] 9. 实现 authStore
- [ ] 10. 实现路由和布局
- [ ] 11. 实现 DataTable 组件
- [ ] 12. 按功能模块实现 features

---

## 15. 参考 URL

| 资源 | URL |
|------|-----|
| Ant Design LLM 文档 | https://ant.design/llms-full.txt |
| Ant Design 中文文档 | https://ant.design/llms-full-cn.txt |
| TanStack Query | https://tanstack.com/query/latest |
| TanStack Table | https://tanstack.com/table/latest |
| Zustand | https://zustand-demo.pmnd.rs/ |

---

*生成时间: 2026-03-01*

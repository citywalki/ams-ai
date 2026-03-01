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
| 表格 | Ant Design Table | 6.x (内置) |
| 表单验证 | Ant Design Form + Zod | - |
| GraphQL 客户端 | graphql-request | 7.x |
| HTTP 客户端 | Axios | 1.x |
| 路由 | React Router | 6.x / 7.x |
| 国际化 | i18next | 25.x |

### 精简原则

- **样式**: 使用 Ant Design Design Token，不需要 Tailwind CSS
- **表单**: 使用 Ant Design Form + Zod 验证，不需要 TanStack Form
- **动画**: 使用 CSS transitions，不需要 Framer Motion

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
│   └── layout/                 # 布局组件
│       ├── MainLayout.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
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
├── styles/                     # 全局样式 (CSS变量、Ant Design主题)
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

### 6.1 表格组件 (Ant Design Table)

**直接使用 Ant Design Table**，无需额外封装。配合 TanStack Query 实现服务端分页。

```tsx
function UserTable() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, size],
    queryFn: () => fetchUsersPage(page, size),
  });

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { 
      title: '状态', 
      dataIndex: 'enabled', 
      key: 'enabled',
      render: (enabled) => <Tag color={enabled ? 'green' : 'red'}>
        {enabled ? '启用' : '禁用'}
      </Tag>
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 错误处理：直接用 Ant Design Alert
  if (error) {
    return (
      <Alert
        type="error"
        message="加载失败"
        description={error.message}
        showIcon
        action={<Button size="small" onClick={() => refetch()}>重试</Button>}
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data?.content}
      loading={isLoading}
      rowKey="id"
      pagination={{
        current: page + 1,
        pageSize: size,
        total: data?.totalElements,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: (p, s) => { setPage(p - 1); setSize(s); },
      }}
    />
  );
}
```

### 6.2 错误处理

**直接使用 Ant Design 组件**：

```tsx
// 内联错误 (表格上方、表单区域)
{error && (
  <Alert 
    type="error" 
    message={error.message} 
    showIcon 
    closable
    action={<Button size="small" onClick={refetch}>重试</Button>}
  />
)}

// 页面级错误 (整个页面失败)
<Result
  status="error"
  title="加载失败"
  subTitle={error.message}
  extra={<Button type="primary" onClick={refetch}>重试</Button>}
/>
```

### 6.3 表单布局

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

## 14. 登录页面

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────┐   ┌─────────────────────────┐    │
│   │                     │   │   欢迎登录               │    │
│   │   系统 Logo         │   │   ───────────────        │    │
│   │   系统标题          │   │   用户名: [__________]   │    │
│   │   系统简介          │   │   密  码: [__________]   │    │
│   │                     │   │   □ 记住我   [EN|中]     │    │
│   │   • 功能特性1       │   │   [    登 录    ]        │    │
│   │   • 功能特性2       │   │                         │    │
│   │   • 功能特性3       │   │   错误提示区域           │    │
│   │                     │   │                         │    │
│   └─────────────────────┘   └─────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 功能需求

| 功能 | 说明 |
|------|------|
| 用户名/密码登录 | 必填，调用 `/auth/login` |
| 记住我 | 可选，延长 Token 有效期 |
| 国际化切换 | 中/英文切换按钮 |
| 错误提示 | 登录失败显示错误信息 |
| 已登录跳转 | 检测到 Token 直接跳转首页 |
| Loading 状态 | 登录按钮显示加载状态 |

### 核心代码结构

```tsx
export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // 已登录则跳转
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (username: string, password: string) => {
    const ok = await login(username, password);
    if (ok) navigate('/');
  };

  return (
    <div className="登录容器">
      {/* 左侧品牌区域 */}
      <div className="品牌介绍">
        <h1>系统标题</h1>
        <p>系统简介</p>
        <ul>功能特性列表</ul>
      </div>
      
      {/* 右侧登录表单 */}
      <Card>
        <Form layout="horizontal" onFinish={handleSubmit}>
          {error && <Alert type="error" message={error} />}
          <Form.Item label="用户名" required>
            <Input />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input.Password />
          </Form.Item>
          <Checkbox>记住我</Checkbox>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
```

### API 接口

```typescript
// POST /api/auth/login
Request:  { username: string, password: string }
Response: { accessToken: string, refreshToken: string, userId, username, tenantId }

// GET /api/auth/me (获取当前用户信息)
Response: { id, username, email, roles[], permissions[], tenantId }
```

---

## 15. 动态路由菜单

### 架构流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   登录成功   │ ──→ │  获取用户菜单 │ ──→ │  渲染侧边栏  │
│  存储 Token │     │  /menus/user │     │  动态路由    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### MenuContext 设计

**职责**: 管理用户菜单状态，提供全局访问

```typescript
// contexts/MenuContext.tsx
type MenuContextValue = {
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
};

export function MenuProvider({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // 登录状态变化时获取菜单
  useEffect(() => {
    if (isAuthenticated) {
      refreshMenus();
    } else {
      setMenus([]);
    }
  }, [isAuthenticated]);

  const refreshMenus = async () => {
    const userMenus = await menuApi.getUserMenus();
    setMenus(normalizeMenuTree(userMenus));  // 路径规范化处理
  };

  return <MenuContext.Provider value={{ menus, ... }}>{children}</MenuContext.Provider>;
}
```

### 菜单数据结构

```typescript
interface MenuItem {
  id: string;
  key: string;           // 唯一标识
  label: string;         // 显示名称
  route?: string;        // 路由路径
  icon?: string;         // 图标名称
  parentId?: string;     // 父级ID
  sortOrder?: number;    // 排序
  menuType?: 'FOLDER' | 'MENU';
  children?: MenuItem[]; // 子菜单
}
```

### 侧边栏渲染

```tsx
// components/layout/Sidebar.tsx
function Sidebar({ isCollapsed, onToggle }) {
  const { menus, isLoading, error } = useMenus();
  const navigate = useNavigate();
  const location = useLocation();

  // 转换为 Ant Design Menu 格式
  const menuItems: ItemType[] = useMemo(() => {
    return convertToAntdMenu(menus);
  }, [menus]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  if (isLoading) return <Skeleton />;
  if (error) return <QueryErrorDisplay error={error} />;

  return (
    <Layout.Sider collapsed={isCollapsed}>
      <AntMenu
        items={menuItems}
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
      />
    </Layout.Sider>
  );
}
```

### 路由配置

```tsx
// Router.tsx
function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout />;  // 包含 Sidebar + Outlet
}

export default function AppRouter() {
  return (
    <MenuProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />
          <Route path="admin/roles" element={<RoleManagementPage />} />
          {/* 其他路由 */}
        </Route>
      </Routes>
    </MenuProvider>
  );
}
```

### API 接口

```typescript
// GET /api/system/menus/user
// 返回当前用户有权限的菜单树
Response: MenuItem[]
```

---

## 16. 首页 (Dashboard) 设计

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  欢迎横幅 (渐变背景)                                          │
│  欢迎回来，{username}                           2026-03-01   │
└─────────────────────────────────────────────────────────────┘
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  📊 总告警 │ │  ⏳ 待处理 │ │  ✅ 已解决 │ │  📈 今日新增│
│    128    │ │     45    │ │     78    │ │     12    │
│   +5.2%   │ │   -2.1%   │ │   +8.3%   │ │   +3      │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
┌─────────────────────────────────────────────────────────────┐
│  最近告警                                          查看全部 → │
├─────────────────────────────────────────────────────────────┤
│  告警标题              严重级别    状态       时间           │
│  ─────────────────────────────────────────────────────────│
│  设备A温度过高         [严重]     [待处理]    10:30        │
│  网络连接中断           [高]      [处理中]    09:45        │
│  磁盘空间不足           [中]      [已解决]    昨天         │
└─────────────────────────────────────────────────────────────┘
```

### 组件结构

```tsx
export default function DashboardPage() {
  const { data: alarms, isLoading, error } = useAlarms(0, 100);
  const user = useAuthStore((state) => state.user);

  // 计算统计数据
  const stats = useMemo(() => ({
    total: alarms?.totalElements ?? 0,
    pending: alarms?.content.filter(a => a.status === 'NEW').length ?? 0,
    resolved: alarms?.content.filter(a => a.status === 'RESOLVED').length ?? 0,
    today: alarms?.content.filter(a => isToday(a.createdAt)).length ?? 0,
  }), [alarms]);

  return (
    <div className="dashboard-container">
      {/* 欢迎横幅 */}
      <Card className="welcome-banner" style={{ background: 'linear-gradient(...)' }}>
        <Typography.Title>欢迎回来，{user?.username}</Typography.Title>
        <Typography.Text>{formatDate(new Date())}</Typography.Text>
      </Card>

      {/* 统计卡片 (4列 Grid) */}
      <Row gutter={16}>
        <Col span={6}>
          <StatCard title="总告警" value={stats.total} icon={<Bell />} color="sky" />
        </Col>
        <Col span={6}>
          <StatCard title="待处理" value={stats.pending} icon={<Clock />} color="orange" />
        </Col>
        <Col span={6}>
          <StatCard title="已解决" value={stats.resolved} icon={<CheckCircle />} color="green" />
        </Col>
        <Col span={6}>
          <StatCard title="今日新增" value={stats.today} icon={<TrendingUp />} color="blue" />
        </Col>
      </Row>

      {/* 最近告警列表 */}
      <Card title="最近告警" extra={<a href="/alarms">查看全部</a>}>
        <QueryErrorDisplay error={error} />
        {isLoading ? <Skeleton /> : (
          <List
            dataSource={alarms?.content.slice(0, 5)}
            renderItem={alarm => (
              <List.Item>
                <Text>{alarm.title}</Text>
                <Tag color={getSeverityColor(alarm.severity)}>{alarm.severity}</Tag>
                <Tag color={getStatusColor(alarm.status)}>{alarm.status}</Tag>
                <Text type="secondary">{formatTime(alarm.createdAt)}</Text>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
```

### 统计卡片组件

```tsx
interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: 'sky' | 'orange' | 'green' | 'blue';
  trend?: number;  // 增长百分比
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <Text type="secondary">{title}</Text>
          <Typography.Title level={2}>{value}</Typography.Title>
          {trend && (
            <Text type={trend > 0 ? 'danger' : 'success'}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
          )}
        </div>
        <div className={`icon-wrapper bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
```

### 颜色映射

```typescript
const severityColors = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'gold',
  LOW: 'green',
};

const statusColors = {
  NEW: 'blue',
  ACKNOWLEDGED: 'cyan',
  IN_PROGRESS: 'processing',
  RESOLVED: 'success',
  CLOSED: 'default',
};
```

### 数据获取

```typescript
// hooks/useAlarms.ts
export function useAlarms(page: number, size: number) {
  return useQuery({
    queryKey: ['alarms', page, size],
    queryFn: () => graphqlClient.request(ALARMS_QUERY, { page, size }),
  });
}

// GraphQL 查询
const ALARMS_QUERY = `
  query Alarms($page: Int, $size: Int) {
    alarms(page: $page, size: $size, orderBy: [{ field: "createdAt", direction: DESC }]) {
      content { id title severity status createdAt }
      totalElements
    }
  }
`;
```

---

## 17. 实现检查清单

新项目实现时按此顺序：

- [ ] 1. 初始化项目: `pnpm create vite`
- [ ] 2. 配置 TypeScript (strict mode)
- [ ] 3. 配置 Vite (别名、代理)
- [ ] 4. 安装核心依赖
- [ ] 5. 创建目录结构
- [ ] 6. 实现 apiClient (JWT 拦截器)
- [ ] 7. 实现 graphqlClient (BigInt 处理)
- [ ] 8. 实现 authStore (登录/登出/状态)
- [ ] 9. 实现登录页面
- [ ] 10. 实现 MenuContext (动态菜单)
- [ ] 11. 实现 MainLayout + Sidebar
- [ ] 12. 配置 TanStack Query
- [ ] 13. 实现首页 Dashboard
- [ ] 14. 按功能模块实现 features

---

## 18. 参考 URL

| 资源 | URL |
|------|-----|
| Ant Design LLM 文档 | https://ant.design/llms-full.txt |
| Ant Design 中文文档 | https://ant.design/llms-full-cn.txt |
| Ant Design Table | https://ant.design/components/table |
| TanStack Query | https://tanstack.com/query/latest |
| Zustand | https://zustand-demo.pmnd.rs/ |

---

*生成时间: 2026-03-01*

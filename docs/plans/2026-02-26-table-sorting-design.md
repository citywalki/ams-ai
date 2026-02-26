# Table 组件排序功能设计方案

**创建时间**: 2026-02-26  
**状态**: 已批准  
**预计实施时间**: 10-12 天

---

## 一、项目概述

### 1.1 背景
当前 AMS-AI 系统的管理页面（用户管理、角色管理、权限管理、菜单管理、字典管理）使用基础的 HTML Table 组件，缺少排序功能。用户无法对表格数据进行排序，影响使用体验。

### 1.2 目标
为所有管理页面的表格添加完整的排序功能，同时重构数据获取方式，提升代码质量和开发效率。

### 1.3 范围
- **前端**: 所有管理页面（5个）
- **后端**: 对应的 Controller、Service、Repository 层
- **技术栈升级**: TanStack Table + TanStack Query

---

## 二、需求分析

### 2.1 功能需求
- ✅ 点击表头进行排序（升序/降序切换）
- ✅ 默认按创建时间降序排序
- ✅ 排序时显示图标（↑/↓）
- ✅ 排序状态不保存在 URL 中（刷新后重置）
- ✅ 所有管理页面统一体验

### 2.2 非功能需求
- ✅ 排序响应时间 < 500ms
- ✅ 支持大数据量（1000+ 记录）
- ✅ 流畅的用户体验
- ✅ 代码可维护性和可扩展性

### 2.3 约束条件
- 保持现有 UI 样式（shadcn/ui）
- 保持现有 API 结构
- 渐进式迁移，降低风险

---

## 三、技术方案

### 3.1 技术选型

**方案对比**:

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 封装 SortableTable 组件 | 复用性强、易维护 | 需改造现有组件 | 备选 |
| TanStack Table | 功能强大、社区支持、可扩展 | 学习曲线、改动大 | ✅ 采用 |
| 各页面手动实现 | 实现快速、改动小 | 代码重复、难维护 | 不推荐 |

**最终方案**: TanStack Table + TanStack Query

**理由**:
1. 统一的状态管理：排序、分页、过滤由 TanStack 系列统一管理
2. 智能缓存：避免重复请求，提升性能
3. 流畅体验：`keepPreviousData` 在切换时保持数据显示
4. 未来友好：为添加更多表格功能（过滤、列隐藏等）打下基础

### 3.2 技术栈

```
前端表格：@tanstack/react-table v8
数据获取：@tanstack/react-query v5
UI 组件：shadcn/ui（保持现有）
状态管理：TanStack Query（服务端状态）+ useState（本地状态）
```

---

## 四、架构设计

### 4.1 系统架构

```
┌─────────────────────────────────────────────────┐
│                  前端应用层                      │
├─────────────────────────────────────────────────┤
│  UserManagementPage  RoleManagementPage  ...    │
│         ↓                  ↓                    │
│  ┌───────────────────────────────────────┐     │
│  │       DataTable (通用表格组件)          │     │
│  │  - TanStack Table (表格逻辑)           │     │
│  │  - TanStack Query (数据获取)           │     │
│  └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                  后端 API 层                     │
├─────────────────────────────────────────────────┤
│  UserController  RoleController  ...            │
│         ↓              ↓                        │
│  UserService     RoleService                    │
│         ↓              ↓                        │
│  UserRepository   RoleRepository                │
│  (支持动态排序：sortBy, sortOrder)               │
└─────────────────────────────────────────────────┘
```

### 4.2 组件结构

```
app-web/src/
├── components/tables/
│   ├── DataTable.tsx              # 通用数据表格
│   ├── DataTableHeader.tsx        # 可排序表头
│   └── DataTablePagination.tsx    # 分页组件
├── hooks/
│   └── useTableQuery.ts           # 通用查询 hook
├── lib/
│   └── queryClient.ts             # Query 客户端配置
└── types/
    └── table.ts                   # 类型定义
```

### 4.3 数据流

```
用户点击表头
  → TanStack Table 更新 sorting 状态
  → 触发 useQuery 重新获取数据
  → 后端 API 返回排序后的数据
  → 表格自动重新渲染
  → 显示排序图标
```

---

## 五、详细设计

### 5.1 前端设计

#### Query Key 设计
```typescript
['users', { page, size, sortBy, sortOrder, username, status }]
['roles', { page, size, sortBy, sortOrder, keyword }]
['menus', { parentId }]
['permissions', { page, size, sortBy, sortOrder }]
['dictItems', { categoryId }]
```

#### DataTable 组件接口
```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  queryKey: unknown[]
  queryFn: (params: QueryParams) => Promise<PageResponse<TData>>
  defaultSort?: { id: string; desc: boolean }
}

interface QueryParams {
  page: number
  size: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
```

#### 核心代码模式
```typescript
export function DataTable<TData>({ 
  columns, 
  queryKey, 
  queryFn,
  defaultSort = { id: 'createdAt', desc: true }
}: DataTableProps<TData>) {
  // 状态管理
  const [sorting, setSorting] = useState<SortingState>([defaultSort])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

  // 数据获取
  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, sorting, pagination],
    queryFn: () => queryFn({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC'
    })
  })

  // 表格实例
  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  })

  // 渲染表格
  return (/* ... */)
}
```

### 5.2 后端设计

#### API 接口改造
```java
// Controller 层
@GET
public Response findAll(
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size,
    @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
    @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder,
    // ... 其他参数
) {
    List<T> items = service.findAll(sortBy, sortOrder, page, size);
    // ...
}
```

#### Repository 层排序实现
```java
default List<User> findByFilters(
    Long tenantId, String username, String email, String status,
    String sortBy, String sortOrder,
    int page, int size
) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    Map<String, Object> params = new HashMap<>();
    params.put("tenantId", tenantId);
    
    // 添加过滤条件
    // ...
    
    // 添加排序
    String sortField = mapSortField(sortBy);
    String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
    query.append(" order by ").append(sortField).append(" ").append(direction);

    return find(query.toString(), params).page(page, size).list();
}

default String mapSortField(String sortBy) {
    return switch (sortBy) {
        case "username" -> "username";
        case "email" -> "email";
        case "status" -> "status";
        case "createdAt" -> "createdAt";
        case "updatedAt" -> "updatedAt";
        default -> "createdAt";
    };
}
```

---

## 六、实施计划

### 6.1 迁移步骤

**阶段1：基础设施准备（1-2天）**
```
1. 安装依赖
   pnpm add @tanstack/react-table @tanstack/react-query

2. 配置 TanStack Query
   - 创建 QueryClient
   - 在 App.tsx 添加 QueryClientProvider

3. 创建通用组件
   - DataTable.tsx
   - DataTableHeader.tsx
   - DataTablePagination.tsx
```

**阶段2：后端 API 改造（2-3天）**
```
1. Controller 层：添加 sortBy/sortOrder 参数
   - UserController
   - RoleController
   - PermissionController
   - MenuController
   - DictController

2. Service 层：传递排序参数

3. Repository 层：实现动态排序
   - 添加 mapSortField 方法
   - 修改 findByFilters 方法
```

**阶段3：前端页面迁移（5天）**
```
优先级顺序：
1. UserManagementPage（最复杂，先做参考模板）
2. RoleManagementPage
3. PermissionManagementPage
4. DictManagementPage
5. MenuManagementPage
```

**阶段4：测试和修复（2天）**
```
- 全量回归测试
- 修复发现的问题
- 性能优化
```

### 6.2 文件变更清单

**新增文件**:
```
app-web/src/
├── components/tables/
│   ├── DataTable.tsx            ✨ 新建
│   ├── DataTableHeader.tsx      ✨ 新建
│   └── DataTablePagination.tsx  ✨ 新建
├── hooks/
│   └── useTableQuery.ts         ✨ 新建
├── lib/
│   └── queryClient.ts           ✨ 新建
└── types/
    └── table.ts                 ✨ 新建
```

**修改文件**:
```
前端：
app-web/src/
├── App.tsx                      🔧 添加 QueryClientProvider
├── pages/admin/
│   ├── UserManagementPage.tsx   ♻️ 重构
│   ├── RoleManagementPage.tsx   ♻️ 重构
│   ├── PermissionManagementPage.tsx ♻️ 重构
│   ├── DictManagementPage.tsx   ♻️ 重构
│   └── MenuManagementPage.tsx   ♻️ 重构
└── utils/api.ts                 🔧 更新类型定义

后端：
feature-admin/.../
├── UserController.java          🔧 添加排序参数
├── UserService.java             🔧 传递排序参数
├── RoleController.java          🔧 添加排序参数
├── RoleService.java             🔧 传递排序参数
├── PermissionController.java    🔧 添加排序参数
├── PermissionService.java       🔧 传递排序参数
├── MenuController.java          🔧 添加排序参数
├── MenuService.java             🔧 传递排序参数

lib-persistence/.../
├── User.java                    🔧 Repo 添加排序支持
├── Role.java                    🔧 Repo 添加排序支持
├── Permission.java              🔧 Repo 添加排序支持
└── Menu.java                    🔧 Repo 添加排序支持
```

---

## 七、风险控制

### 7.1 技术风险

**TanStack Table 学习曲线**
- 风险: 团队不熟悉新 API
- 缓解: 提供详细代码模板，先完成一个页面作为参考
- 应急: 准备备选方案（封装 SortableTable 组件）

**排序字段映射错误**
- 风险: 前端字段名与数据库不匹配
- 缓解: 使用白名单验证，非法字段使用默认值
- 应急: 添加详细日志，快速定位问题

**性能问题**
- 风险: 频繁排序导致后端压力
- 缓解: 添加防抖（300ms）
- 应急: 增加数据库索引

### 7.2 业务风险

**功能回归**
- 风险: 重构过程中遗漏现有功能
- 缓解: 逐页面迁移，每个页面完成后测试
- 应急: Git revert 回滚单个页面

**用户体验变化**
- 风险: 表格行为与之前不同
- 缓解: 保持相同的默认排序和分页大小
- 应急: 收集用户反馈，快速调整

### 7.3 回滚策略

每个页面独立迁移，如果出现问题：
1. Git revert 到迁移前的版本
2. 其他已迁移页面不受影响
3. 可选择性地回滚单个页面

---

## 八、测试策略

### 8.1 测试清单

**每个页面迁移后必须测试**:
```
□ 列表加载正常
□ 排序功能：点击表头升序/降序切换
□ 默认排序：created_at DESC
□ 分页功能正常
□ 搜索过滤功能正常
□ 创建/编辑/删除功能正常
□ 刷新页面后状态重置
□ Loading 状态显示正常
□ 错误处理正常
□ 性能符合预期（响应 < 500ms）
```

### 8.2 自动化测试

**单元测试**:
```typescript
describe('DataTable', () => {
  it('应该正确渲染排序图标', () => {})
  it('点击表头应该触发排序回调', () => {})
  it('应该显示分页信息', () => {})
})
```

**集成测试**:
```typescript
describe('UserManagementPage', () => {
  it('应该加载用户列表', async () => {})
  it('点击排序应该发送正确的 API 请求', async () => {})
})
```

---

## 九、成功标准

### 9.1 功能完整性
- ✅ 所有管理页面支持表头排序
- ✅ 默认按 created_at DESC 排序
- ✅ 支持升序/降序切换
- ✅ 排序时显示相应的图标
- ✅ 排序状态不保存在 URL 中

### 9.2 性能指标
- ✅ 排序响应时间 < 500ms
- ✅ 无不必要的重复请求
- ✅ 页面切换流畅

### 9.3 代码质量
- ✅ TypeScript 编译无错误
- ✅ ESLint 检查通过
- ✅ 代码复用率高（通用 DataTable 组件）
- ✅ 符合项目代码规范

---

## 十、时间估算

| 阶段 | 任务 | 估算时间 | 依赖 |
|------|------|---------|------|
| 阶段1 | 基础设施准备 | 1-2天 | 无 |
| 阶段2 | 后端 API 改造 | 2-3天 | 无 |
| 阶段3 | 前端页面迁移 | 5天 | 阶段1、2 |
| 阶段4 | 测试和修复 | 2天 | 阶段3 |
| **总计** | | **10-12天** | |

---

## 十一、附录

### 11.1 参考资料
- [TanStack Table 官方文档](https://tanstack.com/table)
- [TanStack Query 官方文档](https://tanstack.com/query)
- [AMS-AI AGENTS.md](../../AGENTS.md)

### 11.2 相关文档
- 实施计划: 待创建（通过 writing-plans skill）

---

**批准人**:   
**批准时间**: 2026-02-26

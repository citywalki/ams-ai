# Table Sorting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为所有管理页面添加 TanStack Table + Query 支持的排序功能

**Architecture:** 使用 TanStack Table 处理表格逻辑（排序、分页），使用 TanStack Query 管理数据获取和缓存。后端添加 sortBy/sortOrder 参数支持动态排序。

**Tech Stack:** @tanstack/react-table v8, @tanstack/react-query v5, shadcn/ui, Java 25, Quarkus 3.31.2

---

## 阶段1：基础设施准备（1-2天）

### Task 1: 安装前端依赖

**Files:**
- Modify: `app-web/package.json`

**Step 1: 安装 TanStack Table 和 Query**

```bash
cd app-web
pnpm add @tanstack/react-table @tanstack/react-query
```

**Step 2: 验证安装成功**

Run: `cat app-web/package.json | grep -A 2 "@tanstack"`
Expected: 显示两个包的版本信息

**Step 3: Commit**

```bash
git add app-web/package.json app-web/pnpm-lock.yaml
git commit -m "chore: add @tanstack/react-table and @tanstack/react-query dependencies"
```

---

### Task 2: 配置 TanStack Query Client

**Files:**
- Create: `app-web/src/lib/queryClient.ts`
- Modify: `app-web/src/App.tsx`

**Step 1: 创建 Query Client 配置文件**

Create: `app-web/src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Step 2: 在 App.tsx 中添加 QueryClientProvider**

Read: `app-web/src/App.tsx` (前50行)

**Step 3: 修改 App.tsx 添加 Provider**

Modify: `app-web/src/App.tsx`

在文件顶部添加导入：
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
```

在返回的 JSX 中包装 QueryClientProvider：
```typescript
// 修改前
return (
  <ThemeProvider>
    {/* ... */}
  </ThemeProvider>
);

// 修改后
return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      {/* ... */}
    </ThemeProvider>
  </QueryClientProvider>
);
```

**Step 4: 验证 TypeScript 编译**

Run: `cd app-web && pnpm tsc --noEmit`
Expected: 无错误

**Step 5: Commit**

```bash
git add app-web/src/lib/queryClient.ts app-web/src/App.tsx
git commit -m "feat: configure TanStack Query client"
```

---

### Task 3: 创建类型定义

**Files:**
- Create: `app-web/src/types/table.ts`

**Step 1: 创建通用表格类型定义**

Create: `app-web/src/types/table.ts`

```typescript
import { SortingState } from '@tanstack/react-table';

export interface QueryParams {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TableQueryState {
  sorting: SortingState;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

export interface SortConfig {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}
```

**Step 2: 验证类型定义**

Run: `cd app-web && pnpm tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add app-web/src/types/table.ts
git commit -m "feat: add table type definitions"
```

---

### Task 4: 创建通用 DataTable 组件

**Files:**
- Create: `app-web/src/components/tables/DataTable.tsx`
- Create: `app-web/src/components/tables/DataTablePagination.tsx`

**Step 1: 创建 DataTablePagination 组件**

Create: `app-web/src/components/tables/DataTablePagination.tsx`

```typescript
import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          每页显示
        </p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          条记录
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 创建 DataTable 组件**

Create: `app-web/src/components/tables/DataTable.tsx`

```typescript
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from './DataTablePagination';
import type { QueryParams, PageResponse } from '@/types/table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  queryKey: unknown[];
  queryFn: (params: QueryParams) => Promise<PageResponse<TData>>;
  defaultSort?: { id: string; desc: boolean };
  searchParams?: Record<string, string>;
}

export function DataTable<TData>({
  columns,
  queryKey,
  queryFn,
  defaultSort = { id: 'createdAt', desc: true },
  searchParams = {},
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([defaultSort]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, sorting, pagination, searchParams],
    queryFn: () =>
      queryFn({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC',
        ...searchParams,
      }),
  });

  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  if (error) {
    return <div className="text-red-500 p-4">加载数据失败</div>;
  }

  return (
    <div className="border rounded-lg">
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && (
                        <ArrowUp className="h-4 w-4" />
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      {!header.column.getIsSorted() && header.column.getCanSort() && (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
```

**Step 3: 验证组件编译**

Run: `cd app-web && pnpm tsc --noEmit`
Expected: 无错误

**Step 4: Commit**

```bash
git add app-web/src/components/tables/
git commit -m "feat: create reusable DataTable component with TanStack Table"
```

---

## 阶段2：后端 API 改造（2-3天）

### Task 5: User 实体添加排序支持

**Files:**
- Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java`

**Step 1: 在 User.Repo 中添加字段映射方法**

Read: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java` (Repository 接口部分)

**Step 2: 修改 findByFilters 方法支持排序**

Modify: `lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java`

在 `findByFilters` 方法中添加排序参数和逻辑：

```java
default List<User> findByFilters(
    Long tenantId, String username, String email, String status,
    String sortBy, String sortOrder,  // 新增参数
    int page, int size
) {
    StringBuilder query = new StringBuilder("tenant = :tenantId");
    java.util.HashMap<String, Object> params = new java.util.HashMap<>();
    params.put("tenantId", tenantId);

    if (username != null && !username.isBlank()) {
        query.append(" and lower(username) like lower(:username)");
        params.put("username", "%" + username + "%");
    }
    if (email != null && !email.isBlank()) {
        query.append(" and lower(email) like lower(:email)");
        params.put("email", "%" + email + "%");
    }
    if (status != null && !status.isBlank()) {
        query.append(" and status = :status");
        params.put("status", status);
    }

    // 添加排序
    String sortField = mapSortField(sortBy);
    String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
    query.append(" order by ").append(sortField).append(" ").append(direction);

    return find(query.toString(), params).page(page, size).list();
}

// 添加字段映射方法
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

**Step 3: 验证编译**

Run: `./gradlew :lib-persistence:compileJava`
Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git add lib-persistence/src/main/java/pro/walkin/ams/persistence/entity/system/User.java
git commit -m "feat: add sorting support to User repository"
```

---

### Task 6: UserService 添加排序参数

**Files:**
- Modify: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserService.java`

**Step 1: 修改 findAll 方法签名**

Read: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserService.java` (findAll 方法)

**Step 2: 更新 findAll 方法**

Modify: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserService.java`

```java
// 修改前
public List<UserResponseDto> findAll(String username, String email, String status, int page, int size) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
        return List.of();
    }

    List<User> users = userRepo.findByFilters(tenantId, username, email, status, page, size);
    return users.stream().map(this::toResponse).collect(Collectors.toList());
}

// 修改后
public List<UserResponseDto> findAll(
    String username, String email, String status,
    String sortBy, String sortOrder,  // 新增参数
    int page, int size
) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
        return List.of();
    }

    List<User> users = userRepo.findByFilters(
        tenantId, username, email, status,
        sortBy, sortOrder,  // 传递排序参数
        page, size
    );
    return users.stream().map(this::toResponse).collect(Collectors.toList());
}
```

**Step 3: 验证编译**

Run: `./gradlew :feature-admin:compileJava`
Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git add feature-admin/src/main/java/pro/walkin/ams/admin/system/UserService.java
git commit -m "feat: add sorting parameters to UserService.findAll"
```

---

### Task 7: UserController 添加排序参数

**Files:**
- Modify: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserController.java`

**Step 1: 修改 findAll 接口**

Read: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserController.java` (findAll 方法)

**Step 2: 添加排序参数到 Controller**

Modify: `feature-admin/src/main/java/pro/walkin/ams/admin/system/UserController.java`

```java
// 修改前
@GET
@RequireRole("ADMIN")
public Response findAll(
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size,
    @QueryParam("username") String username,
    @QueryParam("email") String email,
    @QueryParam("status") String status
) {
    List<UserResponseDto> users = userService.findAll(username, email, status, page, size);
    long totalCount = userService.count(username, email, status);
    long totalPages = (long) Math.ceil((double) totalCount / size);
    return ResponseBuilder.page(users, totalCount, totalPages, page, size);
}

// 修改后
@GET
@RequireRole("ADMIN")
public Response findAll(
    @QueryParam("page") @DefaultValue("0") int page,
    @QueryParam("size") @DefaultValue("20") int size,
    @QueryParam("username") String username,
    @QueryParam("email") String email,
    @QueryParam("status") String status,
    @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,      // 新增
    @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder      // 新增
) {
    List<UserResponseDto> users = userService.findAll(
        username, email, status,
        sortBy, sortOrder,  // 传递排序参数
        page, size
    );
    long totalCount = userService.count(username, email, status);
    long totalPages = (long) Math.ceil((double) totalCount / size);
    return ResponseBuilder.page(users, totalCount, totalPages, page, size);
}
```

**Step 3: 验证编译**

Run: `./gradlew :feature-admin:compileJava`
Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git add feature-admin/src/main/java/pro/walkin/ams/admin/system/UserController.java
git commit -m "feat: add sorting parameters to UserController.findAll API"
```

---

### Task 8-12: 其他实体添加排序支持

**重复 Task 5-7 的步骤，应用到以下实体：**

- Task 8: Role 实体 + RoleService + RoleController
- Task 9: Permission 实体 + PermissionService + PermissionController
- Task 10: Menu 实体 + MenuService + MenuController
- Task 11: DictItem 实体 + DictService + DictController（如果需要）

每个 Task 遵循相同的模式：
1. Repository 添加 mapSortField 方法和修改 findByFilters
2. Service 层传递排序参数
3. Controller 添加 sortBy/sortOrder 参数
4. 验证编译
5. Commit

---

## 阶段3：前端页面迁移（5天）

### Task 13: 更新 API 类型定义

**Files:**
- Modify: `app-web/src/utils/api.ts`

**Step 1: 添加通用查询参数类型**

Modify: `app-web/src/utils/api.ts`

在文件顶部（import 之后）添加：

```typescript
// 通用查询参数
export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分页响应（如果还没有）
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

**Step 2: 更新 systemApi.getUsers 方法**

Modify: `app-web/src/utils/api.ts`

```typescript
// 修改前
getUsers: (params?: UserQueryParams) => apiClient.get<PageResponse<UserItem> | UserItem[]>('/system/users', {params}),

// 修改后
getUsers: (params?: QueryParams & UserQueryParams) => 
  apiClient.get<PageResponse<UserItem>>('/system/users', {params}),
```

**Step 3: 验证编译**

Run: `cd app-web && pnpm tsc --noEmit`
Expected: 无错误

**Step 4: Commit**

```bash
git add app-web/src/utils/api.ts
git commit -m "feat: update API types to support sorting"
```

---

### Task 14: 重构 UserManagementPage

**Files:**
- Modify: `app-web/src/pages/admin/UserManagementPage.tsx`

**Step 1: 备份原文件**

Run: `cp app-web/src/pages/admin/UserManagementPage.tsx app-web/src/pages/admin/UserManagementPage.tsx.backup`

**Step 2: 添加新的导入**

Read: `app-web/src/pages/admin/UserManagementPage.tsx` (前30行)

**Step 3: 重构页面使用 DataTable**

这是一个较大的重构。简化后的版本：

```typescript
import { useState } from 'react';
import { Plus, Pencil, Trash2, Key, Search, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tables/DataTable';
import {
  systemApi,
  type UserItem,
  type RoleOption,
  type UserCreatePayload,
  type UserUpdatePayload,
  type PageResponse,
} from '@/utils/api';

// 列定义
const columns: ColumnDef<UserItem>[] = [
  {
    accessorKey: 'username',
    header: '用户名',
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {row.original.status === 'ACTIVE' ? '启用' : '禁用'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('zh-CN'),
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

// 操作按钮组件（提取出来避免在 column 定义中使用 hooks）
function UserActions({ user }: { user: UserItem }) {
  // 这里可以实现编辑、删除等操作按钮
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function UserManagementPage() {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [queryUsername, setQueryUsername] = useState('');
  const [queryStatus, setQueryStatus] = useState<string>('all');

  const handleSearch = () => {
    setQueryUsername(searchUsername);
    setQueryStatus(searchStatus);
  };

  const handleReset = () => {
    setSearchUsername('');
    setSearchStatus('all');
    setQueryUsername('');
    setQueryStatus('all');
  };

  // 构建查询参数
  const searchParams: Record<string, string> = {};
  if (queryUsername) searchParams.username = queryUsername;
  if (queryStatus !== 'all') searchParams.status = queryStatus;

  return (
    <div className="space-y-4 p-6">
      {/* 搜索区 */}
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label>用户名</Label>
              <Input
                placeholder="请输入用户名"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>状态</Label>
              <Select value={searchStatus} onValueChange={setSearchStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="ACTIVE">启用</SelectItem>
                  <SelectItem value="INACTIVE">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 列表区 */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            queryKey={['users']}
            queryFn={(params) => systemApi.getUsers({ ...params, ...searchParams })}
            defaultSort={{ id: 'createdAt', desc: true }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 4: 验证编译**

Run: `cd app-web && pnpm tsc --noEmit`
Expected: 无错误

**Step 5: 手动测试功能**

启动前端和后端，测试：
- 用户列表加载
- 表头排序（用户名、邮箱、状态、创建时间）
- 分页功能
- 搜索过滤

**Step 6: 删除备份文件**

Run: `rm app-web/src/pages/admin/UserManagementPage.tsx.backup`

**Step 7: Commit**

```bash
git add app-web/src/pages/admin/UserManagementPage.tsx
git commit -m "feat: refactor UserManagementPage with TanStack Table and Query"
```

---

### Task 15-18: 重构其他管理页面

**重复 Task 14 的步骤，应用到以下页面：**

- Task 15: RoleManagementPage
- Task 16: PermissionManagementPage
- Task 17: DictManagementPage
- Task 18: MenuManagementPage（可能需要特殊处理树形结构）

每个 Task 遵循相同的模式：
1. 备份原文件
2. 添加 TanStack Table 相关导入
3. 定义 columns
4. 重构页面使用 DataTable
5. 验证编译
6. 手动测试
7. 删除备份
8. Commit

---

## 阶段4：测试和文档（2天）

### Task 19: 创建集成测试

**Files:**
- Create: `app-web/src/components/tables/__tests__/DataTable.test.tsx`

**Step 1: 创建测试文件**

Create: `app-web/src/components/tables/__tests__/DataTable.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataTable } from '../DataTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface TestItem {
  id: string;
  name: string;
}

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

const mockQueryFn = async () => ({
  content: [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
});

describe('DataTable', () => {
  it('should render table with data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DataTable
          columns={columns}
          queryKey={['test']}
          queryFn={mockQueryFn}
        />
      </QueryClientProvider>
    );

    // 等待数据加载
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
```

**Step 2: 运行测试**

Run: `cd app-web && pnpm test`
Expected: 测试通过

**Step 3: Commit**

```bash
git add app-web/src/components/tables/__tests__/
git commit -m "test: add DataTable component tests"
```

---

### Task 20: 手动测试所有页面

**Step 1: 启动后端和前端**

Run: `./gradlew quarkusDev` (后端)
Run: `cd app-web && pnpm dev` (前端)

**Step 2: 测试每个页面**

按照测试清单逐一测试：

**用户管理页面**:
- [ ] 列表加载正常
- [ ] 按用户名排序（升序/降序）
- [ ] 按邮箱排序
- [ ] 按状态排序
- [ ] 按创建时间排序
- [ ] 默认排序：created_at DESC
- [ ] 分页功能正常
- [ ] 搜索过滤功能正常
- [ ] 创建/编辑/删除功能正常
- [ ] 刷新页面后状态重置

**角色管理页面**: (重复上述测试)

**权限管理页面**: (重复上述测试)

**字典管理页面**: (重复上述测试)

**菜单管理页面**: (重复上述测试)

**Step 3: 记录发现的问题**

将发现的问题记录到临时文件，后续修复。

**Step 4: Commit 测试清单**

```bash
git add docs/test-checklist.md  # 如果创建了测试清单文档
git commit -m "docs: add manual test checklist for table sorting"
```

---

### Task 21: 更新项目文档

**Files:**
- Modify: `AGENTS.md`

**Step 1: 在 AGENTS.md 中添加 DataTable 使用说明**

Read: `AGENTS.md` (CODE STYLE GUIDELINES 部分)

**Step 2: 添加 DataTable 使用示例**

在 AGENTS.md 的合适位置添加：

```markdown
### 表格组件规范

**使用 DataTable 组件**:
```typescript
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<UserItem>[] = [
  { accessorKey: 'username', header: '用户名' },
  { accessorKey: 'email', header: '邮箱' },
];

export default function MyPage() {
  return (
    <DataTable
      columns={columns}
      queryKey={['users']}
      queryFn={systemApi.getUsers}
      defaultSort={{ id: 'createdAt', desc: true }}
    />
  );
}
```

**关键点**:
- 使用 TanStack Table 管理表格状态
- 使用 TanStack Query 管理数据获取
- 所有管理页面使用统一的 DataTable 组件
- 默认按 created_at DESC 排序
```

**Step 3: Commit 文档更新**

```bash
git add AGENTS.md
git commit -m "docs: add DataTable usage guidelines to AGENTS.md"
```

---

## 阶段5：清理和发布（0.5天）

### Task 22: 清理未使用的代码

**Step 1: 检查未使用的导入**

Run: `cd app-web && pnpm lint`
Expected: 检查并修复未使用的导入

**Step 2: 删除不再需要的代码**

检查是否还有使用旧的表格实现方式的地方，清理掉。

**Step 3: Commit 清理**

```bash
git add .
git commit -m "chore: cleanup unused table code"
```

---

### Task 23: 最终验证

**Step 1: 运行所有测试**

Run: `./gradlew test`
Expected: 所有测试通过

Run: `cd app-web && pnpm lint && pnpm build`
Expected: 编译成功

**Step 2: 创建发布标签**

```bash
git tag -a v1.1.0-table-sorting -m "Add table sorting with TanStack Table and Query"
git push origin v1.1.0-table-sorting
```

---

## 总结

**完成标志**:
- ✅ 所有管理页面支持表头排序
- ✅ 默认按 created_at DESC 排序
- ✅ 使用 TanStack Table + Query
- ✅ 所有测试通过
- ✅ 文档已更新

**预计总时间**: 10-12 天

**注意事项**:
- 每个任务完成后立即提交
- 遇到问题时及时记录和沟通
- 保持代码质量，遵循项目规范
- 优先完成第一个页面（UserManagementPage）作为模板

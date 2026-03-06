# GraphQL 客户端迁移实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 GraphQL 客户端从原生 fetch 迁移到 urql，同时保持 TanStack Query 的缓存和失效机制

**架构:** 在 `shared/api/graphql.ts` 中创建 urql core client，提供 `graphql()` fetcher 函数供 TanStack Query 使用。保持现有 TanStack Query 架构不变。

**Tech Stack:** React, TypeScript, urql/core, TanStack Query, Zustand

---

## 前置条件

- 当前只有 1 个 GraphQL 查询文件: `src/features/user/hooks/use-users.ts`
- 使用原生 `fetch` 手动调用 `/graphql`
- TanStack Query 配置在 `src/shared/api/query-client.ts`

---

### Task 1: 安装 urql 依赖

**Files:**
- Modify: `app-web/package.json`

**Step 1: 安装依赖**

```bash
cd app-web
pnpm add @urql/core
```

**Step 2: 验证安装**

```bash
pnpm list @urql/core
```

Expected: `@urql/core@x.x.x`

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add @urql/core for graphql client"
```

---

### Task 2: 创建 graphql.ts 客户端文件

**Files:**
- Create: `app-web/src/shared/api/graphql.ts`

**Step 1: 编写 graphql.ts 文件**

```typescript
import { createClient, fetchExchange, type OperationResult } from '@urql/core';
import { useAuthStore } from '@/store/auth-store';

/**
 * urql GraphQL 客户端
 * 
 * 注意：此客户端仅作为底层 HTTP 层，查询缓存由 TanStack Query 管理
 */
const client = createClient({
  url: '/graphql',
  exchanges: [fetchExchange],
  fetchOptions: () => {
    const token = useAuthStore.getState().token;
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  },
});

/**
 * GraphQL 查询 fetcher，供 TanStack Query 使用
 * 
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Query result data
 * @throws Error when GraphQL returns errors
 */
export async function graphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result: OperationResult<T> = await client
    .query(query, variables)
    .toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error('GraphQL response contains no data');
  }

  return result.data;
}

export default client;
```

**Step 2: 验证 TypeScript 编译**

```bash
cd app-web
pnpm tsc --noEmit
```

Expected: `error TS0: error TS0: no errors`

**Step 3: Commit**

```bash
git add src/shared/api/graphql.ts
git commit -m "feat(api): add urql graphql client with auth support"
```

---

### Task 3: 迁移 use-users.ts 到 urql

**Files:**
- Modify: `app-web/src/features/user/hooks/use-users.ts`

**Step 1: 重写 use-users.ts**

迁移前代码（备份参考）:
```typescript
import { useQuery } from "@tanstack/react-query";
import type { UserConnection, UserFilterInput } from "../schema/user";

const USERS_QUERY = `
  query GetUsers($where: UserFilter, $page: Int, $size: Int) {
    users(where: $where, page: $page, size: $size) {
      content {
        id
        username
        email
        status
        roles {
          id
          code
          name
        }
        lastLoginAt
        createdAt
        updatedAt
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const USERS_QUERY_KEY = ["users"] as const;

interface UseUsersOptions {
  page?: number;
  size?: number;
  filters?: UserFilterInput;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 20, filters } = options;

  const query = useQuery<UserConnection, Error>({
    queryKey: [...USERS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: USERS_QUERY,
          variables: {
            where: filters,
            page,
            size,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "获取用户列表失败");
      }

      return result.data.users;
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}
```

迁移后代码:
```typescript
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";
import type { UserConnection, UserFilterInput } from "../schema/user";

const USERS_QUERY = `
  query GetUsers($where: UserFilter, $page: Int, $size: Int) {
    users(where: $where, page: $page, size: $size) {
      content {
        id
        username
        email
        status
        roles {
          id
          code
          name
        }
        lastLoginAt
        createdAt
        updatedAt
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export const USERS_QUERY_KEY = ["users"] as const;

interface UseUsersOptions {
  page?: number;
  size?: number;
  filters?: UserFilterInput;
}

interface UsersResponse {
  users: UserConnection;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 20, filters } = options;

  const query = useQuery<UserConnection, Error>({
    queryKey: [...USERS_QUERY_KEY, { page, size, filters }],
    queryFn: async () => {
      const data = await graphql<UsersResponse>(USERS_QUERY, {
        where: filters,
        page,
        size,
      });
      return data.users;
    },
  });

  return {
    ...query,
    isLoading: query.isLoading || query.isFetching,
  };
}
```

**Step 2: 验证 TypeScript 编译**

```bash
cd app-web
pnpm tsc --noEmit
```

Expected: 无错误

**Step 3: Commit**

```bash
git add src/features/user/hooks/use-users.ts
git commit -m "refactor(user): migrate useUsers to urql graphql client"
```

---

### Task 4: 运行 linter 检查代码风格

**Files:**
- All modified files

**Step 1: 运行 ESLint**

```bash
cd app-web
pnpm lint
```

Expected: `✓ no errors or warnings`

**Step 2: 如有问题则修复**

```bash
pnpm lint --fix
```

**Step 3: Commit（如有修复）**

```bash
git add -A
git commit -m "style: fix linting issues"
```

---

### Task 5: 验证构建

**Files:**
- All project files

**Step 1: 运行生产构建**

```bash
cd app-web
pnpm build
```

Expected:
```
vite v7.x.x building for production...
✓ 1234 modules transformed.
dist/                     123.45 kB │ gzip: 45.67 kB
✓ built in 1.23s
```

**Step 2: Commit（如构建成功）**

```bash
git add -A
git commit -m "chore: verify production build"
```

---

## 验证清单

- [ ] `@urql/core` 已安装
- [ ] `src/shared/api/graphql.ts` 已创建
- [ ] `use-users.ts` 已迁移到 urql
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] 生产构建成功
- [ ] 所有改动已提交

## 后续扩展

如需添加更多 GraphQL 查询，遵循以下模式:

```typescript
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";

const MY_QUERY = `...`;

export function useMyData() {
  return useQuery({
    queryKey: ["myData"],
    queryFn: () => graphql<MyResponse>(MY_QUERY, { variables }),
  });
}
```

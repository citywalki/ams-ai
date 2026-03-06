# GraphQL 客户端迁移设计 - 从手动 fetch 到 urql

**日期**: 2025-03-06  
**主题**: graphql-client-migration

## 1. 背景与目标

### 当前状态
- `use-users.ts` 使用原生 `fetch` 手动调用 `/graphql`
- 手动处理请求头（从 localStorage 读取 token）
- 手动解析 GraphQL 响应和错误

### 目标
- 迁移到 urql 作为底层 GraphQL 客户端
- **保持 TanStack Query 作为查询层**（保留缓存、失效机制）
- 使用 Zustand auth store 管理认证 token
- 保持 `api/` 目录单一文件结构

## 2. 架构设计

### 文件结构

```
src/shared/api/
├── graphql.ts            # NEW: urql client + fetcher（单一文件）
├── rest-client.ts        # (不变)
└── query-client.ts       # (不变)
```

### 依赖

新增:
- `@urql/core`: urql 核心库

## 3. 核心实现

### graphql.ts

```typescript
import { createClient, fetchExchange, type OperationResult } from '@urql/core';
import { useAuthStore } from '@/store/auth-store';

// urql client
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

// 供 TanStack Query 使用的 fetcher
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
  
  return result.data as T;
}

export default client;
```

### Hook 迁移示例 (use-users.ts)

迁移前:
```typescript
export function useUsers(options: UseUsersOptions = {}) {
  return useQuery<UserConnection, Error>({
    queryKey: [...],
    queryFn: async () => {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ query: USERS_QUERY, variables: {...} }),
      });
      const result = await response.json();
      if (result.errors) throw new Error(...);
      return result.data.users;
    },
  });
}
```

迁移后:
```typescript
import { graphql } from '@/shared/api/graphql';

export function useUsers(options: UseUsersOptions = {}) {
  return useQuery<UserConnection, Error>({
    queryKey: [...],
    queryFn: () => graphql(USERS_QUERY, { ... }),
  });
}
```

## 4. 关键决策

### 为什么保留 TanStack Query？
- 缓存策略、失效机制、重试逻辑已经成熟
- 与 REST mutation 保持统一的数据层
- 不需要改动 Provider 层级

### 为什么使用 urql core 而不是 @urql/react？
- 不需要 urql 的 React hooks（由 TanStack Query 提供）
- core 版本更轻量，只负责 GraphQL 协议处理
- 符合 AGENTS.md 的架构规范

### 认证处理
- 通过 `fetchOptions` 函数动态获取 token
- 使用 Zustand auth store，支持 persist 和 reactive 更新
- 与 rest-client.ts 的认证逻辑保持一致

## 5. 后续扩展

未来如需添加功能：
- **错误处理增强**: 在 `graphql()` 中统一处理特定 GraphQL 错误码
- **订阅支持**: 添加 `@urql/exchange-graphcache` 和 subscription exchange
- **离线缓存**: 可添加 `persistedExchange` 实现离线优先

## 6. 验收标准

- [ ] `shared/api/graphql.ts` 创建完成
- [ ] `use-users.ts` 迁移到 urql
- [ ] TanStack Query 缓存机制正常工作
- [ ] 认证 token 正确传递
- [ ] GraphQL 错误正确处理并抛出

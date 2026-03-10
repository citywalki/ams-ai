# Developer Onboarding Guide

Welcome to the AMS-AI project! This guide will help you get started quickly and understand our key development patterns.

## Quick Start Checklist

- [ ] Read [CLAUDE.md](../CLAUDE.md) - Project context and coding rules
- [ ] Review [API Protocol Selection](#api-protocol-selection) section below
- [ ] Set up your development environment
- [ ] Run the application locally

## API Protocol Selection

We use a hybrid API architecture with clear protocol separation:

**GraphQL for Queries (Read)** | **REST for Mutations (Write)**
--- | ---
Flexible field selection | Clear resource semantics
Single endpoint for related data | Optimal HTTP caching
Precise data fetching | Standard HTTP status codes

### Decision Matrix

Use this table to determine which protocol to use:

| Operation Type | Protocol | Example | Rationale |
|----------------|----------|---------|-----------|
| **List/Detail Queries** | GraphQL | `users`, `userById`, `alarms` | Flexible field selection, nested data fetching, single endpoint for multiple resources |
| **Create/Update/Delete** | REST (Command) | `POST /api/commands` | 统一 Command 端点，通过 `type` 路由到 Handler |
| **File Upload** | REST | `POST /api/files/upload` | Native multipart/form-data support |

### Quick Decision Flowchart

```
Is this a READ operation?
├── YES → Use GraphQL (query)
│   └── Examples: Get user list, fetch alert details, search with filters
├── NO → Is it a file upload?
│   ├── YES → REST POST /api/files/upload
│   └── NO → Use Command (POST /api/commands)
│       └── Examples: CreateUserCommand, UpdateRoleCommand, DeleteMenuCommand
```

## Code Examples

### Example 1: GraphQL Query Hook

**File**: `app-web/src/features/user/hooks/use-users.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/shared/api/graphql";

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

export function useUsers(options: UseUsersOptions = {}) {
  const { page = 0, size = 20, filters } = options;

  return useQuery<UserConnection, Error>({
    queryKey: ["users", { page, size, filters }],
    queryFn: async () => {
      const data = await graphql<UsersResponse>(USERS_QUERY, {
        where: filters,
        page,
        size,
      });
      return data.users;
    },
  });
}
```

**Key Points**:
- Uses `urql` GraphQL client via `@/shared/api/graphql`
- Returns only requested fields
- Supports filtering, pagination, and sorting
- Nested `roles` data fetched in single request

### Example 2: Command Hook (Create)

**File**: `app-web/src/features/user/hooks/use-user-commands.ts`

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { useCommand } from "@/shared/hooks/use-command";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useCommand<User, Error, CreateUserInput>({
    commandType: "CreateUserCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

**Key Points**:
- Uses `useCommand` hook sending to unified `POST /api/commands`
- `commandType` 对应后端的 Command 类名
- Invalidates cache to refresh user list

### Example 3: Command Hook (Update)

**File**: `app-web/src/features/user/hooks/use-user-commands.ts`

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useCommand<User, Error, UpdateUserInput>({
    commandType: "UpdateUserCommand",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

**Key Points**:
- 所有写操作都通过 `useCommand` 发送到 `POST /api/commands`
- 不再使用 `restClient.put/post/delete` 直接调用资源端点
- Command 类型由 `CommandType` union type 约束

## Common Patterns

### Hook Naming Conventions

- **Query hooks**: `use{Feature}{Action}` (e.g., `useUsers`, `useAlarms`)
- **Command hooks**: `use{Action}{Feature}` (e.g., `useCreateUser`, `useUpdateUser`) in `use-{feature}-commands.ts`
- **Query keys**: `["{entity}", {filters}]` format for caching

### Frontend Architecture (FSD)

```
src/
├── features/user/
│   ├── schema/user.ts       # TypeScript interfaces
│   ├── hooks/
│   │   ├── use-users.ts     # GraphQL query
│   │   └── use-user-commands.ts  # Command mutations
│   └── components/          # Feature components
├── shared/
│   ├── api/
│   │   ├── command/index.ts # Command API client (sendCommand)
│   │   ├── graphql.ts       # GraphQL client
│   │   └── rest-client.ts   # axios client
│   └── hooks/
│       └── use-command.ts   # useCommand hook
```

**Important**: No `src/entities/` directory. All entity code lives in `features/{feature}/`.

## Troubleshooting

### Common Mistakes and Solutions

#### Mistake 1: Using REST for Queries

**Problem**: Using axios/REST to fetch lists or details.

```typescript
// DON'T DO THIS
const response = await restClient.get("/system/users");
```

**Solution**: Use GraphQL for queries to benefit from field selection and nested data.

```typescript
// CORRECT
const data = await graphql<UsersResponse>(USERS_QUERY, variables);
```

#### Mistake 2: Using Individual REST Endpoints for Mutations

**Problem**: Creating separate REST endpoints for each resource instead of using unified Command endpoint.

```typescript
// DON'T DO THIS
const response = await restClient.post("/system/users", input);
const response = await restClient.put(`/system/users/${id}`, input);
const response = await restClient.delete(`/system/users/${id}`);
```

**Solution**: Use `useCommand` hook sending to `POST /api/commands`.

```typescript
// CORRECT
const createUser = useCommand<User, Error, CreateUserInput>({
  commandType: "CreateUserCommand",
});
createUser.mutate({ username: "admin", email: "admin@example.com" });
```

#### Mistake 3: Creating Separate API Directories

**Problem**: Creating `features/{feature}/api/` directories.

```
features/user/
├── api/                    # DON'T CREATE THIS
│   ├── user-api.ts
│   └── user-queries.ts
```

**Solution**: Call clients directly in hooks. This reduces abstraction and keeps code in one place.

```typescript
// CORRECT - in features/user/hooks/use-users.ts
import { graphql } from "@/shared/api/graphql";

export function useUsers() {
  // Call graphql client directly here
}
```

#### Mistake 4: Missing Cache Invalidation

**Problem**: Not invalidating cache after mutations.

```typescript
// DON'T DO THIS
return useCommand<User, Error, CreateUserInput>({
  commandType: "CreateUserCommand",
  // Missing onSuccess!
});
```

**Solution**: Always invalidate related queries on mutation success.

```typescript
// CORRECT
return useCommand<User, Error, CreateUserInput>({
  commandType: "CreateUserCommand",
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

## Backend Quick Reference

### Layer Separation (CQRS)

| Layer | Purpose | Example |
|-------|---------|---------|
| `*Query` classes | Read operations | `UserQuery.findByCriteria()` |
| Command / Handler | Write operations | `CreateUserCommand` + `CreateUserHandler.handle()` |

### Multi-Tenancy

All entities must have `tenant_id`:

```java
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class User extends BaseEntity {
    public Long tenantId;  // Mandatory field
}
```

## Next Steps

1. Review [CLAUDE.md](../CLAUDE.md) for detailed coding patterns
2. Read [ADR-003: GraphQL Queries and REST Mutations](./adr/ADR-003-graphql-queries-rest-mutations.md) for architecture context
3. Check [API Standards](./api-standards.md) for detailed API design guidelines
4. Explore [Backend Patterns](./backend-patterns.md) and [Frontend Patterns](./frontend-patterns.md)

## Resources

- [CLAUDE.md](../CLAUDE.md) - Complete project context and rules
- [ADR-003](./adr/ADR-003-graphql-queries-rest-mutations.md) - Architecture Decision Record
- [API Standards](./api-standards.md) - API design guidelines
- [Backend Patterns](./backend-patterns.md) - Java/Quarkus patterns
- [Frontend Patterns](./frontend-patterns.md) - FSD architecture guide

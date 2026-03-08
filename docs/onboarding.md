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
| **Create** | REST | `POST /system/users` | Standard HTTP 201 Created, Location header, clear resource semantics |
| **Update** | REST | `PUT /system/users/:id` | Standard HTTP 200/204, PATCH for partial updates |
| **Delete** | REST | `DELETE /system/users/:id` | Standard HTTP 204 No Content, clear resource lifecycle |
| **Bulk Operations** | REST | `POST /system/users/batch` | Better handling of large payloads, standard HTTP batch patterns |
| **File Upload** | REST | `POST /system/files/upload` | Native multipart/form-data support |

### Quick Decision Flowchart

```
Is this a READ operation?
├── YES → Use GraphQL (query)
│   └── Examples: Get user list, fetch alert details, search with filters
└── NO → Use REST (mutation)
    ├── Is it CREATE? → POST /resource
    ├── Is it UPDATE? → PUT/PATCH /resource/:id
    └── Is it DELETE? → DELETE /resource/:id
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

### Example 2: REST Mutation Hook (Create)

**File**: `app-web/src/features/user/hooks/use-user-mutations.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restClient } from "@/shared/api/rest-client";
import { USERS_QUERY_KEY } from "./use-users";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const response = await restClient.post<User>("/system/users", input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
```

**Key Points**:
- Uses `axios` REST client via `@/shared/api/rest-client`
- POST request to `/system/users` returns HTTP 201
- Invalidates cache to refresh user list

### Example 3: REST Mutation Hook (Update)

**File**: `app-web/src/features/user/hooks/use-user-mutations.ts`

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateUserInput }) => {
      const response = await restClient.put<User>(`/system/users/${id}`, input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
```

**Key Points**:
- PUT request for full updates
- PATCH available for partial updates
- RESTful URL pattern: `/system/users/:id`

## Common Patterns

### Hook Naming Conventions

- **Query hooks**: `use{Feature}{Action}` (e.g., `useUsers`, `useAlarms`)
- **Mutation hooks**: `use{Action}{Feature}` or `use{Feature}Mutations` (e.g., `useCreateUser`, `useUpdateUser`)
- **Query keys**: `["{entity}", {filters}]` format for caching

### Frontend Architecture (FSD)

```
src/
├── features/user/
│   ├── schema/user.ts       # TypeScript interfaces
│   ├── hooks/
│   │   ├── use-users.ts     # GraphQL query
│   │   └── use-user-mutations.ts  # REST mutations
│   └── components/          # Feature components
├── shared/api/
│   ├── graphql.ts           # urql client
│   └── rest-client.ts       # axios client
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

#### Mistake 2: Using GraphQL for Mutations

**Problem**: Using GraphQL mutations instead of REST for writes.

```typescript
// DON'T DO THIS
const MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) { id }
  }
`;
```

**Solution**: Use REST endpoints for mutations to leverage HTTP caching and clear semantics.

```typescript
// CORRECT
const response = await restClient.post("/system/users", input);
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
return useMutation({
  mutationFn: async (input) => {
    return restClient.post("/system/users", input);
  },
  // Missing onSuccess!
});
```

**Solution**: Always invalidate related queries on mutation success.

```typescript
// CORRECT
return useMutation({
  mutationFn: async (input) => {
    return restClient.post("/system/users", input);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
  },
});
```

## Backend Quick Reference

### Layer Separation

| Layer | Purpose | Example |
|-------|---------|---------|
| `*Query` classes | Read operations | `UserQuery.findByCriteria()` |
| `*Service` classes | Write operations | `UserService.create()` |

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

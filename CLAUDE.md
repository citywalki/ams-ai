# AMS-AI Project Context

> Agentic Context Engineering (ACE) playbook for the AMS-AI project.
> This file captures high-value insights, patterns, and constraints to improve future agent performance.
> Last updated: 2026-03-08

## Project Overview

**Domain**: Alert Management System with AI Analysis
**Architecture**: Monolithic + Cluster (NOT microservices)
**Multi-tenancy**: Mandatory tenant isolation via `tenant_id` + Hibernate Filter

## Tech Stack & Versions

### Backend
- **JDK**: 21
- **Framework**: Quarkus 3.31.2
- **Persistence**: Hibernate ORM + Panache Next
- **Cache**: Hazelcast 5.4.0 (distributed only, no local memory cache)
- **Database Migration**: Liquibase (YAML format)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build**: Vite 7
- **Architecture**: Feature-Sliced Design (FSD)
- **UI Library**: shadcn/ui + Base UI + Tailwind CSS 4
- **State**: Zustand 5
- **Data Fetching**: GraphQL (urql) for queries, REST (axios) for mutations

## Critical Architecture Rules

### Multi-Tenancy (Non-Negotiable)
- All core tables **must** have `tenant_id` column
- All queries **must** filter by `TenantContext.getCurrentTenantId()`
- Cross-tenant access is **strictly prohibited**
- Tenant context is ThreadLocal-based, set from JWT or Header

```java
// Correct pattern - automatic filtering via Hibernate Filter
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class User extends BaseEntity {
    public Long tenantId;
}
```

### API Protocol Selection
| Operation Type | Protocol | Rationale |
|----------------|----------|-----------|
| **Queries (Read)** | GraphQL | Flexible field selection, reduce round trips |
| **Commands (Write)** | REST | Clear resource semantics, better caching for mutations |

**Anti-pattern**: Using GraphQL mutations for writes or REST GETs for complex queries.

### Caching Strategy
- **feature-admin**: Queries exposed to frontend **must NOT use cache**
- **feature-core**: Only alarm-configuration queries **may use cache**
- Cache invalidation via `cache-invalidate` topic (Hazelcast)
- **Never** use local memory cache (cluster consistency risk)

### Layer Separation (Backend)
- **Read operations**: Place in `*Query` classes (e.g., `UserQuery.java`)
- **Write operations**: Place in `*Service` classes with `@Transactional`
- **Never** mix read/write logic in the same class

## Code Style & Patterns

### Java Backend

#### Entity Definition (Panache Next)
```java
@Entity
@Table(name = "user")
public class User extends BaseEntity {
    public String username;  // Public fields, NO Lombok
    public String email;
    public Long tenantId;    // Mandatory for multi-tenancy
    
    // Nested repository definition
    public interface Repo extends PanacheRepository<User> {}
}

// Usage: User_.managedBlocking().findById(id)
```

**Critical Rules**:
- All entities must extend `BaseEntity` (provides id, timestamps)
- Use `public` fields (no getters/setters needed with Panache)
- **NO Lombok** - explicitly prohibited
- Repository nested in entity: `public interface Repo extends PanacheRepository<Entity>`
- Access via static methods: `Entity_.managedBlocking()` or `Entity_.managed()`

#### Exception Handling Hierarchy
```
BaseException (code, message)
├── BusinessException (BUSINESS_ERROR)
├── ValidationException (field, value)
├── NotFoundException (resourceType, resourceId)
└── AuthException
```

**Usage Patterns**:
```java
// Resource not found
throw new NotFoundException("User", userId.toString());

// Validation with field info
throw new ValidationException("邮箱格式不正确", "email", userValue);

// Business logic error
throw new BusinessException("订单金额不能为负数");
```

**Never**:
- Throw raw `RuntimeException`
- Use empty catch blocks
- Expose sensitive info in error messages
- Hardcode error messages (use constants)

#### Imports Order (Mandatory)
1. Third-party/project packages
2. `javax.*`
3. `java.*`
4. Static imports

Use `./gradlew spotlessApply` for automatic formatting. Never manually align code.

### TypeScript Frontend (FSD Architecture)

#### Directory Structure
```
src/
├── app/               # App initialization, router, providers
├── pages/             # Page components (composition only, NO business logic)
├── features/          # Business features with schema/, hooks/, components/
├── store/             # Zustand stores: store/{feature}-store.ts
├── components/        # Shared UI (shadcn/ui)
├── shared/            # API clients, utilities
└── lib/               # Tool utilities
```

**Hard Constraint**: No `src/entities/` directory. All entity code lives in `features/{feature}/`.

#### Schema Layer Pattern
```typescript
// features/user/schema/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  tenantId: number;  // Mandatory field
}

export interface CreateUserRequest {
  username: string;
  email: string;
}
```

#### Hook Naming Conventions
- **Data hooks**: `use{Feature}{Action}` (e.g., `useUserMenus`, `useAlarmsList`)
- **Store hooks**: `use{Feature}Store` (e.g., `useAuthStore`)
- **Query keys**: `["{entity}", "{action}"]` format

#### API Calling Patterns
```typescript
// GraphQL Query (urql)
export function useAlarms(status?: string) {
  return useQuery({
    query: ALARMS_QUERY,
    variables: { status },
  });
}

// REST Mutation (axios) - REQUIRED for writes
export function useUpdateAlarm() {
  return useMutation({
    mutationFn: async ({ id, status }: UpdateParams) => {
      const response = await restClient.patch(`/alarms/${id}`, { status });
      return response.data;
    },
  });
}
```

**Anti-pattern**: Creating separate `features/**/api/` directories. Call clients directly in hooks.

#### Component Organization (Pages Layer)
Pages should only:
1. Compose features from `features/`
2. Prepare and pass data
3. Define page-level layout

**Wrong**:
```typescript
// pages/Dashboard.tsx - DON'T DO THIS
export default function Dashboard() {
  const statsData = [...]; // 20+ lines data
  return (
    <Card><CardHeader>...30 lines UI...</CardHeader></Card>
  );
}
```

**Correct**:
```typescript
// pages/Dashboard.tsx
import { StatCards } from "@/features/dashboard/components/stat-cards";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <StatCards data={statsData} />
      <AlarmTrendChart />
    </div>
  );
}
```

## Common Commands

### Backend
```bash
./gradlew spotlessApply              # Format code (mandatory before commit)
./gradlew :app-boot:quarkusDev       # Dev mode with hot reload
./gradlew build -x test              # Build without tests
./gradlew test                       # Run all tests
./gradlew :app-boot:test --tests "UserServiceTest"  # Single test class
```

### Frontend
```bash
cd app-web
pnpm dev                             # Dev server
pnpm build                           # Production build (tsc + vite)
pnpm lint                            # ESLint check
pnpm test:run                        # Unit tests
npx shadcn add <component>           # Add shadcn/ui component
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `gradle/libs.versions.toml` | Dependency versions baseline |
| `lib-common/src/.../TenantContext.java` | Multi-tenant context management |
| `lib-common/src/.../GlobalExceptionHandler.java` | Unified error handling |
| `lib-common/src/.../BaseException.java` | Exception hierarchy root |
| `app-web/src/app/routes/` | Frontend routing configuration |
| `buildSrc/.../base-java-convention.gradle.kts` | JDK version config |

## Development Guidelines

### Naming Conventions

| Scope | Convention | Example |
|-------|-----------|---------|
| Java packages | `pro.walkin.ams.{module}.{layer}` | `pro.walkin.ams.admin.system.query` |
| Java classes | PascalCase | `UserService`, `UserQuery` |
| Java methods | camelCase | `findById`, `createUser` |
| Java constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| DB columns | snake_case | `tenant_id`, `created_at` |
| TS components | PascalCase | `LoginForm`, `DashboardPage` |
| TS hooks | camelCase | `useUserMenus`, `useAuthStore` |

### State Management Rules
- **Server state**: GraphQL (urql) or TanStack Query (REST)
- **Client global state**: Zustand in `src/store/{feature}-store.ts`
- **Never** use `localStorage` directly in components (use Zustand persist)

### shadcn/ui Component Installation
Always use CLI, never copy-paste:
```bash
npx shadcn add button dialog dropdown-menu
```

## Anti-Patterns to Avoid

### Backend
1. **Local memory cache** - Use Hazelcast distributed cache only
2. **Mixing read/write logic** - Keep Query and Service classes separate
3. **Raw EntityManager** - Use Panache `managedBlocking()` instead
4. **Hardcoded tenant IDs** - Always use `TenantContext`
5. **Lombok** - Explicitly prohibited, use public fields
6. **System.out/err** - Use SLF4J parameterized logging

### Frontend
1. **Creating `src/entities/`** - Put all entity code in `features/`
2. **Separate API layers** - Call clients directly in hooks
3. **Business logic in pages** - Move to `features/{feature}/components/`
4. **GraphQL mutations** - Use REST for all write operations
5. **Manual component code** - Use `npx shadcn add` for UI components

## Testing Guidelines

### Backend Test Commands
```bash
./gradlew test                                        # All tests
./gradlew :app-boot:test --tests "*Test"              # Pattern match
./gradlew :app-boot:test --tests "UserServiceTest.shouldCreateUser"  # Method
./gradlew :app-boot:test -PrunIntegrationTests        # Integration tests (needs Docker)
./gradlew :app-boot:test --tests "*PactProviderTest"  # Contract tests
```

### Frontend Test Commands
```bash
pnpm test          # Vitest unit tests (watch mode)
pnpm test:run      # Single run
pnpm e2e           # Playwright E2E tests
pnpm e2e:ui        # E2E with UI
```

## Verification Checklist

Before submitting changes, verify:

- [ ] All new entities have `tenant_id` field
- [ ] Queries filter by `TenantContext.getCurrentTenantId()`
- [ ] Read operations in `*Query` classes, writes in `*Service` with `@Transactional`
- [ ] No Lombok usage
- [ ] No local memory cache
- [ ] Backend: `./gradlew spotlessApply` executed
- [ ] Frontend: `pnpm lint` passes
- [ ] No `src/entities/` directory created (frontend)
- [ ] GraphQL only for queries, REST for mutations
- [ ] shadcn components installed via CLI

## Domain-Specific Knowledge

### Alert Management Context
- **feature-admin**: System management, user/role/permission administration
- **feature-core**: Core alert processing, deduplication, routing rules
- **feature-alert-ingestion**: Alert ingestion from various sources
- **feature-notification**: Notification delivery management
- **feature-ai-analysis**: AI-powered alert analysis and insights
- **feature-graphql**: GraphQL API layer

### Security Model
- JWT-based authentication
- RBAC (Role-Based Access Control) with `@RolesAllowed` annotation
- Tenant isolation at database level via Hibernate Filter
- Permission annotations: `@RequirePermission`, `@RequirePermissions`

### Caching Invalidation Flow
1. Data changes in Service layer
2. Publish `CacheInvalidationEvent` to `cache-invalidate` topic
3. `CacheInvalidationListener` receives event
4. Invalidates specific key or entire cache (if key is null)

## Confidence Levels

- **High**: Multi-tenancy rules, API protocol selection, FSD structure
- **Medium**: Specific component patterns (may evolve with UI library updates)
- **Source**: AGENTS.md, docs/*.md, actual codebase patterns (2026-03-08)

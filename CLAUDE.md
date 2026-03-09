# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Domain**: Alert Management System with AI Analysis
**Architecture**: Monolithic + Cluster (NOT microservices)
**Multi-tenancy**: Mandatory tenant isolation via `tenant_id` + Hibernate Filter

## Tech Stack & Versions

### Backend
- **JDK**: 21
- **Framework**: Quarkus 3.31.2
- **Persistence**: Hibernate ORM + Panache Next
- **Command Framework**: Tower 1.4.0-SNAPSHOT (CQRS pattern)
- **Cache**: Hazelcast 5.4.0 (cluster event bus), Quarkus Cache (local memory + cluster invalidation)
- **Database Migration**: Liquibase (YAML format)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build**: Vite 7
- **Architecture**: Feature-Sliced Design (FSD)
- **UI Library**: shadcn/ui + Base UI + Tailwind CSS 4
- **State**: Zustand 5
- **Data Fetching**: GraphQL (urql) for queries, REST Commands for mutations

## Critical Architecture Rules

### Multi-Tenancy (Non-Negotiable)
- All core tables **must** have `tenant_id` column
- All queries **must** filter by `TenantContext.getCurrentTenantId()`
- Cross-tenant access is **strictly prohibited**
- Tenant context is ThreadLocal-based, set from JWT or Header

```java
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class User extends BaseEntity {
    public Long tenantId;
}
```

### CQRS Pattern: Command + Query Separation

| Operation | Location | Pattern |
|-----------|----------|---------|
| **Write** | `command/` + `handler/` | Tower Command → Handler → Repository |
| **Read** | `query/` | Query class → Repository |

**Rules**:
- Commands implement `io.iamcyw.tower.messaging.Command`
- Handlers implement `CommandHandler<Command, Result>`
- All commands sent to `POST /api/commands`
- Handlers use `@Inject Query` for validation (NOT repository)
- Handlers mark `handle()` with `@Transactional`

See [backend-patterns.md](./docs/backend-patterns.md) for complete examples.

### API Protocol Selection

| Operation Type | Protocol | Endpoint Pattern | Rationale |
|----------------|----------|------------------|-----------|
| **List/Detail Queries** | GraphQL | `/graphql` | Flexible field selection, nested data fetching |
| **Commands (Write)** | REST | `POST /api/commands` | Unified command endpoint via Tower |
| **File Upload** | REST | `/api/files/*` | Native multipart/form-data support |

**Command Request Format**:
```json
{
  "type": "CreateUserCommand",
  "payload": {
    "username": "admin",
    "email": "admin@example.com",
    "password": "secret",
    "status": "ACTIVE",
    "tenantId": 1
  }
}
```

### Caching Strategy

**集群缓存架构模式（强制）**:
```
Node 1                    Hazelcast Topic    Node 2
┌──────────┐            "cache-invalidate"   ┌──────────┐
│本地缓存   │◄───────────────────────────────►│本地缓存   │
└──────────┘                                └──────────┘
```

- **Correct**: Local cache (Quarkus Cache) + cluster invalidation events
- **Wrong**: Direct Hazelcast IMap usage (network overhead)

**Components**:
- `CacheInvalidationBroadcaster` - Broadcast cache invalidation events
- `CacheInvalidationListener` - Listen to `cache-invalidate` topic

## Code Style Rules

### Java Backend

#### Entity Definition (Panache Next)
```java
@Entity
@Table(name = "user")
public class User extends BaseEntity {
    public String username;  // Public fields, NO Lombok
    public String email;
    public Long tenantId;

    // Nested repository definition
    public interface Repo extends PanacheRepository<User> {}
}

// Usage: User_.managedBlocking().findById(id)
```

**Critical Rules**:
- All entities must extend `BaseEntity`
- Use `public` fields (no getters/setters with Panache)
- **NO Lombok** - explicitly prohibited
- Repository nested in entity: `public interface Repo extends PanacheRepository<Entity>`
- Access via static methods: `Entity_.managedBlocking()` or `Entity_.managed()`

#### Command Pattern Implementation

**Directory Structure**:
```
feature-admin/src/main/java/pro/walkin/ams/admin/system/
├── command/     # Command records
├── handler/     # Command handlers
└── query/       # Query classes
```

**Rules**:
1. Commands are records implementing `io.iamcyw.tower.messaging.Command`
2. Handlers implement `CommandHandler<CommandType, ReturnType>`
3. Handlers use `@Inject Query` for validation (NOT repository)
4. Handlers mark `handle()` with `@Transactional`
5. Queries go in `*Query` classes, never in handlers

See [backend-patterns.md](./docs/backend-patterns.md) for complete examples.

#### Exception Handling

**Hierarchy**: `BaseException` → `BusinessException` | `ValidationException` | `NotFoundException` | `AuthException`

**Usage**:
- `NotFoundException(resourceType, resourceId)` - 资源不存在
- `ValidationException(message, field, value)` - 字段校验失败
- `BusinessException(message)` - 业务逻辑错误

**Never**: Throw raw `RuntimeException`, use empty catch blocks, expose sensitive info.

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
│   ├── api/
│   │   ├── command/   # Command API client
│   │   ├── graphql.ts
│   │   └── rest-client.ts
│   └── hooks/
│       └── use-command.ts
└── lib/               # Tool utilities
```

**Hard Constraint**: No `src/entities/` directory. All entity code lives in `features/{feature}/`.

#### Command API Pattern (Frontend)

**Files**:
- `shared/api/command/index.ts` - Command API client
- `shared/hooks/use-command.ts` - `useCommand` hook
- `features/{feature}/hooks/use-{feature}-commands.ts` - Feature commands

**Flow**: `useCommand` → `sendCommand` → `POST /api/commands`

See [frontend-patterns.md](./docs/frontend-patterns.md) for complete examples.

#### Schema & Hook Conventions
- **Data hooks**: `use{Feature}{Action}` (e.g., `useUserMenus`, `useAlarmsList`)
- **Command hooks**: `use{Action}{Entity}` (e.g., `useCreateUser`, `useUpdateRole`)
- **Store hooks**: `use{Feature}Store` (e.g., `useAuthStore`)
- **Query keys**: `["{entity}", "{action}"]` format

#### Component Organization

**Pages** should only:
1. Compose features from `features/`
2. Pass data to features
3. Define page-level layout

**Don't**: Put business logic, data fetching, or state in pages.
**Do**: Move business logic to `features/{feature}/components/`.

## Common Commands

### Backend
```bash
./gradlew spotlessApply              # Format code (mandatory before commit)
./gradlew :app-boot:quarkusDev       # Dev mode with hot reload
./gradlew build -x test              # Build without tests
./gradlew test                       # Run all tests
./gradlew :app-boot:test --tests "UserQueryTest"  # Single test class
./gradlew :app-boot:test --tests "UserQueryTest.shouldFindById"  # Single test method
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

## Codemap CLI

**Required Usage** - You MUST use `codemap --diff --ref main` to research changes different from main branch, and `git diff` + `git status` to research current working state.

### Quick Start

```bash
codemap .                    # Project tree
codemap --only java .        # Just Java files
codemap --exclude .png .     # Hide assets
codemap --depth 2 .          # Limit depth
codemap --diff --ref main    # What changed vs main
codemap --deps .             # Dependency flow
```

### Options

| Flag | Description |
|------|-------------|
| `--depth, -d <n>` | Limit tree depth (0 = unlimited) |
| `--only <exts>` | Only show files with these extensions |
| `--exclude <patterns>` | Exclude files matching patterns |
| `--diff` | Show files changed vs main branch |
| `--ref <branch>` | Branch to compare against (with --diff) |
| `--deps` | Dependency flow mode |
| `--importers <file>` | Check who imports a file |
| `--skyline` | City skyline visualization |
| `--json` | Output JSON |

**Smart pattern matching** - no quotes needed:
- `.png` - any `.png` file
| `Fonts` - any `/Fonts/` directory
| `*Test*` - glob pattern

### Diff Mode

See what you're working on:

```bash
codemap --diff --ref main
codemap --diff --ref origin/main
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `gradle/libs.versions.toml` | Dependency versions baseline |
| `lib-common/src/.../TenantContext.java` | Multi-tenant context management |
| `lib-common/src/.../GlobalExceptionHandler.java` | Unified error handling |
| `lib-common/src/.../command/CommandRequest.java` | Command request wrapper |
| `lib-common/src/.../command/CommandResponse.java` | Command response wrapper |
| `feature-admin/src/.../command/CommandController.java` | Unified command endpoint |
| `app-web/src/shared/api/command/index.ts` | Frontend command API |
| `app-web/src/shared/hooks/use-command.ts` | useCommand hook |
| `buildSrc/.../base-java-convention.gradle.kts` | JDK version config |

## Development Guidelines

### Naming Conventions

| Scope | Convention | Example |
|-------|-----------|---------|
| Java packages | `pro.walkin.ams.{module}.{layer}` | `pro.walkin.ams.admin.system.query` |
| Java classes | PascalCase | `UserQuery`, `CreateUserHandler` |
| Command records | PascalCase + Command suffix | `CreateUserCommand` |
| Handler classes | PascalCase + Handler suffix | `CreateUserHandler` |
| Java methods | camelCase | `findById`, `handle` |
| Java constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| DB columns | snake_case | `tenant_id`, `created_at` |
| TS components | PascalCase | `LoginForm`, `DashboardPage` |
| TS hooks | camelCase | `useUserMenus`, `useCreateUser` |

### State Management Rules
- **Server state**: GraphQL (urql) or TanStack Query (REST)
- **Commands**: useCommand hook with TanStack Query mutations
- **Client global state**: Zustand in `src/store/{feature}-store.ts`
- **Never** use `localStorage` directly in components

### shadcn/ui Component Installation
Always use CLI, never copy-paste:
```bash
npx shadcn add button dialog dropdown-menu
```

## Anti-Patterns to Avoid

### Backend
1. **Direct Hazelcast IMap for caching** - Use local cache + cluster invalidation
2. **Missing cluster cache invalidation** - Always broadcast via `CacheInvalidationBroadcaster`
3. **Service layer for writes** - Use CommandHandler pattern instead
4. **Mixing read/write logic** - Keep Query and Handler classes separate
5. **Raw EntityManager** - Use Panache `managedBlocking()` instead
6. **Hardcoded tenant IDs** - Always use `TenantContext`
7. **Lombok** - Explicitly prohibited, use public fields
8. **System.out/err** - Use SLF4J parameterized logging

### Frontend
1. **Creating `src/entities/`** - Put all entity code in `features/`
2. **Separate API layers** - Call command client directly in hooks
3. **Business logic in pages** - Move to `features/{feature}/components/`
4. **Manual component code** - Use `npx shadcn add` for UI components

## Testing Guidelines

### Backend Test Commands
```bash
./gradlew test                                        # All tests
./gradlew :app-boot:test --tests "*Test"              # Pattern match
./gradlew :app-boot:test --tests "UserQueryTest.shouldFindById"  # Method
./gradlew :app-boot:test -PrunIntegrationTests        # Integration tests (needs Docker)
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
- [ ] Write operations use Command pattern (Command class + Handler)
- [ ] Handlers inject Query for validation (not direct repository calls)
- [ ] No Lombok usage
- [ ] Caching uses local cache + cluster invalidation
- [ ] Backend: `./gradlew spotlessApply` executed
- [ ] Frontend: `pnpm lint` passes
- [ ] No `src/entities/` directory created (frontend)
- [ ] shadcn components installed via CLI
- [ ] Command types added to `CommandType` union in frontend

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

## Context7 MCP Documentation

Context7 MCP is configured to fetch up-to-date library documentation.

### Recommended Library IDs

| Library | Context7 ID | Usage |
|---------|-------------|-------|
| Quarkus | `quarkusio/quarkus` | Backend framework |
| Hibernate ORM | `hibernate/hibernate-orm` | JPA implementation |
| JUnit 5 | `junit-team/junit5` | Testing framework |
| React | `facebook/react` | Frontend framework |
| TypeScript | `microsoft/typescript` | Language |
| TanStack Query | `tanstack/query` | Data fetching |

### Usage Patterns

Query documentation using:
- "use context7 for [topic]" - Fetch documentation
- "check context7 for [library]" - Verify library usage
- "look up in context7" - General documentation query

Example:
```
How to use Hibernate second-level cache? Use context7.
```

---

**Last Updated**: 2026-03-09

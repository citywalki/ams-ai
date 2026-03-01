# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AMS-AI is a semiconductor fab equipment alarm management system. Java 21 + Quarkus 3.31.2 monolithic cluster architecture with multi-tenant design. Frontend: React 18 + TypeScript 5 + Vite.

## Build Commands

```bash
./gradlew build                    # Full build (includes tests)
./gradlew build -x test            # Build without tests
./gradlew clean                    # Clean build artifacts
./gradlew quarkusDev               # Development mode with hot reload
./gradlew quarkusBuild             # Production build
```

## Test Commands

```bash
./gradlew test                                            # All tests
./gradlew :feature-core:test                              # Module-specific tests
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.ApplicationTest"           # Single test class
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.ApplicationTest.testMethod" # Single method
./gradlew :lib-persistence:test --tests "*Alarm*Test"     # Pattern matching
./gradlew :app-boot:test --tests "*Test" --debug-jvm      # Debug mode
./gradlew jacocoTestReport                                # Coverage report
```

## Frontend Commands

```bash
cd app-web && pnpm install          # Install dependencies
cd app-web && pnpm dev              # Development server (http://localhost:5173)
cd app-web && pnpm build            # Production build
cd app-web && pnpm lint             # ESLint
cd app-web && pnpm test:e2e         # Playwright E2E tests
```

## Database Commands

```bash
./gradlew liquibaseUpdate           # Apply migrations
./gradlew liquibaseRollback         # Rollback migrations
```

## Architecture

### Module Structure

```
ams-ai/
├── lib-common/           # Utilities, exceptions, DTOs, security tools
├── lib-persistence/      # Hibernate entities (Panache Repository pattern)
├── lib-cluster/          # Hazelcast distributed cache
├── feature-core/         # Alarm pipeline
├── feature-admin/        # Admin backend (users, roles, menus)
├── feature-alert-ingestion/  # Webhook/API intake
├── feature-notification/ # Notification channels
├── app-boot/             # Quarkus main application
└── app-web/              # React frontend
```

### Key Patterns

**Entity Pattern (Quarkus Panache Next):**
```java
@Entity
@Table(name = "table_name")
public class EntityName extends BaseEntity {
    @Column(name = "field_name")
    public String fieldName;

    public interface Repo extends PanacheRepository<EntityName> {
        @Find
        Optional<EntityName> findByFieldName(String fieldName);
    }
}
```

**Multi-Tenancy:** All core tables have `tenant_id`. Use `TenantContext.getCurrentTenantId()` for filtering. Entities inherit `BaseEntity` with built-in `tenant-filter`.

**Repository Access:** Use `Entity_.managedBlocking()` or `Entity_.managed()` for transactional access.

**JSON Fields:** Use `@JdbcTypeCode(SqlTypes.JSON)` with `Map<String, Object>` type.

### Frontend Architecture

- **State Management:** Zustand stores in `src/stores/`
- **API Client:** Axios with JWT auto-refresh in `src/utils/api.ts`
- **Routing:** React Router with `@/` path alias
- **Styling:** Tailwind CSS 4
- **i18n:** react-i18next, locales in `src/i18n/locales/`
- **Data Fetching:** TanStack Query (react-query)

### API Patterns

Backend exposes REST endpoints under `/api`. Frontend proxies `/api` to `http://localhost:8080` in development.

**Common API response types:**
- `PageResponse<T>` with `content`/`items` and `totalElements`/`totalCount`
- Entity DTOs defined in `lib-common/`

### Query Layer Architecture

```
Controller ──┬──> Query (查询)
             │
             └──> Service (命令/写操作) ──> Repository
```

**Rules:**
1. **No caching in Service** - Local cache in cluster environment causes data inconsistency
2. **All queries in Query class** - Query classes are shared by Controller and Service
3. **Service cannot call Repository queries** - Only `findById` is allowed

```
✅ Allowed:  Service → Query
✅ Allowed:  Service → Repository.findById()
❌ Forbidden: Service → Repository.findByXxx()
❌ Forbidden: Service → Local cache
```

## Conventions

- **Packages:** `pro.walkin.ams.{module}.{layer}`
- **DB columns:** `snake_case` (e.g., `tenant_id`, `created_at`)
- **Java fields:** `camelCase` with `@Column(name = "snake_case")`
- **Timestamps:** Use `@CreationTimestamp` and `@UpdateTimestamp`
- **Transactions:** `@Transactional` on Service layer
- **No Lombok:** Incompatible with Panache pattern

## Skills Management

Skills are custom instructions for specialized tasks, stored with symlink structure:

```
.agents/skills/
├── frontend-development/SKILL.md
├── frontend-ui-verification/SKILL.md
└── ...

.claude/skills/  (symlinks)
├── frontend-development -> ../../.agents/skills/frontend-development
└── ...
```

- **Location:** All skills stored in `.agents/skills/` with each skill in its own folder
- **Linking:** Symlink to `.claude/skills/` for Claude Code to discover them
- **Language:** Skills must be written in English

## Anti-Patterns (Forbidden)

- Microservices splitting (maintain monolith)
- Direct database access (use Repository layer)
- Cross-tenant data access (use TenantContext filter)
- Skipping database migrations (use Liquibase)
- Using Lombok (incompatible with Panache)


---
name: Quarkus Multi-Tenant Architecture Refactoring
description: Patterns for fixing Hibernate tenant-filter inheritance, Hazelcast IMap vs local cache, bulk query optimization, and frontend command migration in AMS
topics: quarkus, hibernate, multi-tenancy, @Filter, hazelcast, cache, cqrs, frontend-commands
created: 2026-03-10
updated: 2026-03-10
scratchpad: .specs/scratchpad/508e9a70.md
---

# Quarkus Multi-Tenant Architecture Refactoring

## Overview

This skill covers four recurring architectural issues in the AMS Quarkus/Hibernate multi-tenant system: missing `@Filter` annotations on entity subclasses, Hazelcast IMap misuse for caching, bulk tenant loading anti-pattern, and frontend components bypassing the Command architecture. Each issue has a well-defined fix pattern derived from existing correct implementations in the codebase.

---

## Key Concepts

- **@Filter inheritance**: Hibernate does NOT automatically inherit `@Filter` from `@MappedSuperclass` - each concrete entity class must declare it explicitly
- **Local cache + cluster broadcast**: The correct caching pattern uses Quarkus Cache (in-process) + CacheInvalidationBroadcaster over Hazelcast topic
- **Tenant lookup by code**: Always query a single tenant by code instead of loading all tenants and filtering in Java
- **Command architecture**: All write operations must go through `useCommand` hook → `POST /api/commands`, never via direct REST calls

---

## Documentation & References

| Resource | Description | Link |
|----------|-------------|------|
| Hibernate @Filter docs | How @Filter works with inheritance | https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#mapping-filter |
| Quarkus Cache guide | @CacheName imperative API usage | https://quarkus.io/guides/cache |
| Project CacheInvalidationListener | Reference implementation for cluster cache invalidation | `/lib-cluster/src/main/java/pro/walkin/ams/cluster/event/CacheInvalidationListener.java` |
| Project LabelMappingCacher | Reference implementation for local cache with imperative API | `/lib-cluster/src/main/java/pro/walkin/ams/cluster/cache/LabelMappingCacher.java` |
| Project use-user-commands.ts | Reference for Command-based hooks | `/app-web/src/features/user/hooks/use-user-commands.ts` |

---

## Recommended Libraries & Tools

| Name | Purpose | Maturity | Notes |
|------|---------|----------|-------|
| `io.quarkus.cache.Cache` | Local in-process cache via `@CacheName` | Stable | Use imperative API for fine-grained control |
| `CacheInvalidationBroadcaster` | Broadcast cache invalidation across cluster nodes | Stable | Project-specific, wraps Hazelcast topic |
| Hibernate `@Filter` | Per-request query filter for tenant isolation | Stable | Must be declared on each concrete entity |

---

## Patterns & Best Practices

### Pattern 1: @Filter on Concrete Entity Classes

**When to use**: Every entity class that extends `BaseEntity` and has a `tenant_id` column
**Trade-offs**: Minor boilerplate per class vs. mandatory correctness
**Example**:
```java
import org.hibernate.annotations.Filter;

@Entity
@Table(name = "alarms")
@Filter(name = "tenant-filter")  // REQUIRED on each concrete class, NOT inherited from BaseEntity
public class Alarm extends BaseEntity {
    // fields...
}
```

The `@FilterDef` is already declared on `BaseEntity`:
```java
@MappedSuperclass
@FilterDef(
    name = "tenant-filter",
    parameters = @ParamDef(name = "tenant", type = Long.class),
    defaultCondition = "tenant_id = :tenant")
@Filter(name = "tenant-filter")  // This only applies to queries through BaseEntity itself, not subclasses
public abstract class BaseEntity extends PanacheEntityBase { ... }
```

**Which entities need `@Filter(name = "tenant-filter")` added** (verified missing as of 2026-03-10):
- `running/Alarm.java`, `running/AiAnalysisResult.java`, `running/AlarmComment.java`
- `running/Notification.java`, `running/FabEquipment.java`
- `modeling/AlarmRule.java`, `modeling/AlertSource.java`, `modeling/AlarmPolicy.java`
- `modeling/LabelMapping.java`, `modeling/NotificationChannel.java`, `modeling/NotificationTemplate.java`
- `system/DictCategory.java`, `system/DictItem.java`, `system/AuditLog.java`, `system/RefreshToken.java`

**Which entities already have it** (do NOT add again):
- `system/User.java`, `system/Role.java`, `system/Permission.java`, `system/Menu.java`

### Pattern 2: Local Cache + Cluster Invalidation (NOT Hazelcast IMap)

**When to use**: Any component that needs to cache data for performance in a cluster
**Trade-offs**: Slightly more code than direct IMap, but correct eventual consistency across nodes

**WRONG (violates architecture)**:
```java
// DO NOT DO THIS
com.hazelcast.map.IMap<String, String> cache = hazelcastInstance.getMap("alarmStatus");
String cachedStatus = cache.get(cacheKey);
cache.put(cacheKey, value, 5, TimeUnit.MINUTES);
cache.remove(cacheKey);
```

**CORRECT pattern** (modeled on `LabelMappingCacher.java`):
```java
@ApplicationScoped
public class AlarmStatusManager {

    @Inject
    @CacheName("alarm-status")
    Cache cache;

    @Inject
    CacheInvalidationBroadcaster broadcaster;

    public Constants.Alarm.Status getAlarmStatus(Long alarmId) {
        String cacheKey = "alarm:status:" + alarmId;
        return cache.get(cacheKey, key -> {
            Alarm alarm = alarmRepo.findByIdOptional(alarmId).orElse(null);
            return alarm != null ? alarm.status.name() : null;
        }).await().indefinitely();
    }

    public void clearCache(Long alarmId) {
        String cacheKey = "alarm:status:" + alarmId;
        cache.invalidate(cacheKey).await().indefinitely();
        // Broadcast invalidation to other cluster nodes
        broadcaster.broadcast("alarm-status", cacheKey);
    }
}
```

**Key notes**:
- Cache name in `@CacheName` must match what is registered (use kebab-case strings)
- `broadcaster.broadcast(cacheName, cacheKey)` sends invalidation to ALL nodes via Hazelcast topic
- `CacheInvalidationListener` listens to the topic and invalidates local cache on receipt
- Hazelcast is still OK to use for **distributed locking** (not caching): `hazelcastInstance.getCPSubsystem().getLock(key)`

### Pattern 3: Tenant Lookup by Code (Not listAll)

**When to use**: Whenever code needs to resolve a tenant from its code/identifier
**Trade-offs**: Single query vs. full table scan

**WRONG**:
```java
List<Tenant> tenants = Tenant_.managedBlocking().listAll();
Tenant tenant = tenants.stream()
    .filter(t -> t.code.equalsIgnoreCase(tenantCode))
    .findFirst()
    .orElseThrow(...);
```

**CORRECT**:
```java
Tenant tenant = Tenant_.managedBlocking().findByCode(tenantCode);
if (tenant == null) {
    throw new IllegalArgumentException("Tenant not found: " + tenantCode);
}
```

`Tenant.Repo` already has `@Find findByCode(String code)` method.

### Pattern 4: Frontend Command Migration

**When to use**: Migrating components from `use-*-mutations.ts` (direct REST) to `use-*-commands.ts` (Command pattern)
**IMPORTANT**: API signatures may differ between the two implementations.

**Step 1**: Update import in component:
```typescript
// BEFORE
import { useCreateUser, useUpdateUser } from "../hooks/use-user-mutations";

// AFTER
import { useCreateUser, useUpdateUser } from "../hooks/use-user-commands";
```

**Step 2**: Check for payload shape differences:

| Hook | Mutations Shape | Commands Shape |
|------|----------------|----------------|
| `useUpdateUser` | `{id, input: {username, email, status}}` | `{id, username, email, status}` (flat) |
| `useDeleteUser` | `mutateAsync(id: number)` | `mutateAsync({id: number})` |
| `useResetPassword` | `{id, newPassword}` | `{id, password}` |
| `useUpdateUserStatus` | `{id, status}` | `{id, status}` (same) |
| `useCreateUser` | `{username, email, password, status}` | `{username, email, password, status}` (same) |

**Step 3**: After all components migrated, delete `use-user-mutations.ts`.

---

## Common Pitfalls & Solutions

| Issue | Impact | Solution |
|-------|--------|----------|
| Forgetting `@Filter` on new entity class | High - cross-tenant data leakage | Add `@Filter(name = "tenant-filter")` as mandatory checklist item for every new entity |
| Using Hazelcast IMap for caching | Medium - network overhead, single-node invalidation | Use `@CacheName` + `CacheInvalidationBroadcaster` |
| Calling `listAll()` on large tables | High - performance degradation | Always use specific query methods, never `listAll()` for tenant/config resolution |
| Forgetting to update call sites when migrating hooks | Medium - TypeScript errors or runtime behavior bugs | Check payload shape for each hook when migrating |
| Not deleting the old mutations file | Low - dead code confusion | Delete `use-user-mutations.ts` after migration complete |

---

## Recommendations

1. **Enforce @Filter via code review checklist**: Every new entity extending BaseEntity must include `@Filter(name = "tenant-filter")`
2. **Ban direct Hazelcast IMap for caching**: Use `CacheInvalidationBroadcaster` interface for all cluster cache coordination
3. **Use @Find methods over listAll()**: Hibernate Panache `@Find` annotation generates optimal queries; never stream-filter in memory

---

## Implementation Guidance

### Installation

No new dependencies needed. All required components exist:
- `io.quarkus:quarkus-cache` - already in project (used by LabelMappingCacher)
- `CacheInvalidationBroadcaster` - in `lib-common`
- `CacheInvalidationListener` - in `lib-cluster`

### Configuration

Cache names must be consistent between `@CacheName("cache-name")` and `broadcaster.broadcast("cache-name", key)`:
```yaml
# application.yaml (if TTL needed)
quarkus:
  cache:
    caffeine:
      "alarm-status":
        expire-after-write: 5M
```

### Integration Points

- Hibernate tenant filter activation: The filter is activated via `TenantRequestFilter` (or similar) which calls `session.enableFilter("tenant-filter").setParameter("tenant", tenantId)`
- Cache invalidation flow: Write operation → local cache invalidate → `broadcaster.broadcast()` → Hazelcast topic → all nodes receive → local cache invalidate on each node

---

## Code Examples

### Example 1: Minimal Entity With @Filter

```java
package pro.walkin.ams.persistence.entity.running;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import pro.walkin.ams.persistence.entity.BaseEntity;

@Entity
@Table(name = "alarm_comments")
@Filter(name = "tenant-filter")  // Required - NOT inherited from BaseEntity
public class AlarmComment extends BaseEntity {
    // fields...
}
```

### Example 2: Refactored getAlarmStatus With Local Cache

```java
@Inject
@CacheName("alarm-status")
Cache alarmStatusCache;

@Inject
CacheInvalidationBroadcaster broadcaster;

public Constants.Alarm.Status getAlarmStatus(Long alarmId) {
    String cacheKey = CACHE_PREFIX + alarmId;
    String cachedStatus = alarmStatusCache.get(cacheKey, key -> {
        metrics.getCacheMissTotal().increment();
        Alarm alarm = alarmRepo.findByIdOptional(alarmId).orElse(null);
        return alarm != null ? alarm.status.name() : null;
    }).await().indefinitely();

    if (cachedStatus != null) {
        metrics.getCacheHitTotal().increment();
        return Constants.Alarm.Status.valueOf(cachedStatus);
    }
    return null;
}

public void clearCache(Long alarmId) {
    String cacheKey = CACHE_PREFIX + alarmId;
    alarmStatusCache.invalidate(cacheKey).await().indefinitely();
    broadcaster.broadcast("alarm-status", cacheKey);
    log.debug("Alarm status cache cleared: id={}", alarmId);
}
```

### Example 3: Optimized Tenant Lookup

```java
private Alarm convertToAlarm(AlertEvent event) {
    String tenantCode = TenantContext.getCurrentTenant();

    // Single query instead of listAll() + stream filter
    Tenant tenant = Tenant_.managedBlocking().findByCode(tenantCode);
    if (tenant == null) {
        throw new IllegalArgumentException("Tenant not found: " + tenantCode);
    }

    Alarm alarm = new Alarm();
    alarm.tenant = tenant.id;
    // ... rest of mapping
    return alarm;
}
```

### Example 4: Frontend Component Migration

```typescript
// user-form.tsx - AFTER migration
import { useCreateUser, useUpdateUser } from "../hooks/use-user-commands";

// Update mutateAsync call for useUpdateUser (payload shape changed from nested to flat):
await updateUser.mutateAsync({
  id: user.id,
  username: data.username,  // flat, not nested under "input"
  email: data.email,
  status: data.status,
});

// delete-user-dialog.tsx - AFTER migration
await deleteUser.mutateAsync({ id: user.id });  // object, not plain number

// reset-password-dialog.tsx - AFTER migration
await resetPassword.mutateAsync({
  id: user.id,
  password: newPassword,  // "password" not "newPassword"
});
```

---

## Sources & Verification

| Source | Type | Last Verified |
|--------|------|---------------|
| `/lib-persistence/.../BaseEntity.java` | Project source | 2026-03-10 |
| `/lib-persistence/.../entity/` (all entity files) | Project source | 2026-03-10 |
| `/lib-cluster/.../LabelMappingCacher.java` | Project source - reference impl | 2026-03-10 |
| `/lib-cluster/.../CacheInvalidationListener.java` | Project source - reference impl | 2026-03-10 |
| `/feature-core/.../AlarmStatusManager.java` | Project source - file to fix | 2026-03-10 |
| `/feature-core/.../AlarmProcessing.java` | Project source - file to fix | 2026-03-10 |
| `/app-web/src/features/user/hooks/use-user-commands.ts` | Project source - target hooks | 2026-03-10 |
| `/app-web/src/features/user/components/*.tsx` (4 files) | Project source - files to fix | 2026-03-10 |
| Hibernate ORM 6 @Filter docs | Official | https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#mapping-filter |

---

## Changelog

| Date | Changes |
|------|---------|
| 2026-03-10 | Initial creation for task: Fix high-priority refactoring issues from architecture audit |

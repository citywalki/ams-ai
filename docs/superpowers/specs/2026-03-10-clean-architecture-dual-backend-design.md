# Clean Architecture: Dual Backend Design

**Date**: 2026-03-10
**Status**: Approved
**Goal**: Introduce Clean Architecture to support Quarkus + Spring Boot 4 dual backend with maximum code reuse

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| Primary goal | Support dual backend (Quarkus + Spring Boot) code reuse |
| Pattern | Shared Core + Framework Shells (Option B) |
| Granularity | Hybrid — module-level isolation for shared layers, package-level separation within shells |
| Tower CQRS | Retain tower-core interfaces in domain layer; only tower-quarkus is framework-specific |
| Repository abstraction | Reader + Writer Port interfaces in domain, implementations in shell |
| Handler DI | No framework scope annotations; constructor injection; shell layer registers beans |
| Migration strategy | 4 phases; old and new modules coexist until Phase 2 complete |

---

## Module Structure

```
ams-ai/
├── buildSrc/                          # Shared (unchanged)
│
├── ─── Clean Arch Shared Layer (zero framework dependency) ───
│
├── core-domain/                       # Domain layer
│   └── pro.walkin.ams.domain/
│       ├── shared/                    # Cross-feature shared
│       │   ├── exception/             # BaseException hierarchy (7 classes)
│       │   ├── event/                 # Infrastructure events (5 classes)
│       │   ├── model/                 # BaseEntity, TenantContext, Constants, PageRequest/Response, TokenPrincipal
│       │   ├── port/                  # CacheInvalidationBroadcaster, TokenService, TokenPrincipalProvider, RbacChecker
│       │   └── util/                  # IdWorker, TimeConverter, JsonSerializer, etc.
│       ├── admin/                      # Note: preserves sub-feature packages (user/, role/, menu/, etc.)
│       │   ├── entity/                # User, Role, Permission, Menu, Tenant, AuditLog,
│       │   │                          # UserRole, RolePermission, RefreshToken,
│       │   │                          # DictCategory, DictItem (11 entities, no Panache)
│       │   ├── port/                  # 10 Reader + 10 Writer interfaces
│       │   └── vo/                    # UserRoleId, RolePermissionId
│       ├── core/
│       │   ├── entity/                # Alarm, AlarmComment, AlarmRule, AlarmPolicy,
│       │   │                          # ProcessorConfig, LabelMapping (6 entities)
│       │   ├── port/                  # 3 Reader + 3 Writer interfaces
│       │   ├── event/                 # AlarmCreatedEvent, AlarmEscalatedEvent, etc.
│       │   └── service/               # PriorityCalculator, AlarmProcessor (interface)
│       ├── ingestion/
│       │   ├── entity/                # AlertSource, FabEquipment
│       │   ├── port/                  # IngestionConnector, AlertMapper
│       │   └── service/               # AlertFingerprinter
│       ├── notification/
│       │   └── entity/                # Notification, NotificationTemplate, NotificationChannel
│       └── ai/                        # (empty — placeholder for feature-ai-analysis)
│           └── entity/                # AiAnalysisResult
│
├── core-application/                  # Application layer (Use Cases)
│   └── pro.walkin.ams.application/
│       ├── shared/
│       │   ├── dto/                   # CommandRequest, CommandResponse, ErrorResponse
│       │   ├── security/              # @RequirePermission, @RequireRole, TokenPrincipalProvider
│       │   │                          # Note: RbacChecker interface lives in core-domain/shared/port/
│       │   └── port/                  # EventPublisher, PasswordHasher (interface)
│       ├── admin/                     # Preserves sub-feature packages: user/, role/, permission/, menu/, dict/
│       │   ├── command/               # 27 Command records (implements tower Command)
│       │   │                          # Organized: command/user/, command/role/, command/permission/, etc.
│       │   ├── handler/               # 28 Handlers (constructor injection, no scope annotations)
│       │   │                          # Organized: handler/user/, handler/role/, handler/permission/, etc.
│       │   ├── query/                 # 8 QueryPort interfaces
│       │   ├── dto/                   # Response DTOs
│       │   └── mapper/               # Entity-DTO mappers
│       ├── core/
│       │   ├── service/               # AlarmProcessingLogic, RuleEngineLogic, EscalationLogic
│       │   ├── port/                  # AlarmCachePort, ClusterEventPort, SchedulerPort
│       │   └── dto/                   # AlertEvent, DeduplicationState/Result
│       ├── ingestion/
│       │   ├── service/               # IngestionLogic, LabelNormalizer
│       │   └── port/                  # EventPublisherPort, DeduplicationStorePort
│       └── graphql/
│           ├── criteria/              # CriteriaQueryContext, CriteriaFilterHelper, *CriteriaTranslator
│           ├── filter/                # *FilterInput DTOs (no MicroProfile annotations)
│           └── connection/            # *Connection DTOs (no MicroProfile annotations)
│
├── ─── Shared Infrastructure (framework-neutral) ───
│
├── infra-persistence/
│   ├── generator/                     # SnowflakeIdGenerator (pure Hibernate SPI)
│   └── resources/db/changelog/        # Liquibase YAML + CSV
│
├── infra-cluster/
│   ├── serializer/                    # 3 Hazelcast Compact serializers
│   └── processor/                     # DeduplicationProcessor
│
├── ─── Quarkus Shell ───
│
├── shell-quarkus/
│   └── pro.walkin.ams.quarkus/
│       ├── shared/
│       │   ├── persistence/           # CustomDatabaseJsonFormat
│       │   ├── security/              # SecurityUtils, JwtAuthFilter, AuthorizationFilter, TenantHibernateFilter
│       │   ├── web/                   # GlobalExceptionHandler (JAX-RS ExceptionMapper)
│       │   ├── cache/                 # CacheInvalidationListener, LabelMappingCacher (Quarkus Cache)
│       │   └── config/               # Handler CDI registration
│       ├── admin/
│       │   ├── repository/            # 20 Panache/JPA Reader + Writer implementations
│       │   ├── query/                 # 8 QueryPort Panache implementations
│       │   ├── controller/            # CommandController (JAX-RS + Tower), AuthController
│       │   ├── auth/                  # SmallRyeTokenService, AuthenticationService, PasswordService
│       │   └── graphql/               # 6 MicroProfile GraphQL APIs + Interceptor + Adapter
│       ├── core/
│       │   ├── adapter/               # Quarkus alarm processing, scheduler, event consumer
│       │   ├── cache/                 # AlarmStatusManager (Quarkus Cache)
│       │   └── metrics/               # CoreMetrics (Micrometer)
│       └── ingestion/
│           ├── controller/            # IngestionController (JAX-RS)
│           ├── adapter/               # Hazelcast EventPublisher, DeduplicationStore, SourceStatus
│           └── config/                # AlertIngestionConfig (SmallRye ConfigMapping)
│
├── app-boot-quarkus/
│   ├── config/                        # Hazelcast, Jackson, JWT, ShedLock config
│   ├── initializer/                   # DataInitializer, Tenant/Permission/Role/Menu/User seeds
│   └── resources/                     # application.yml, hazelcast configs, PEM keys
│
├── ─── Spring Shell (future) ───
│
├── shell-spring/                      # (Phase 3)
├── app-boot-spring/                   # (Phase 3)
│
└── app-web/                           # Frontend (unchanged)
```

---

## Dependency Rules (Iron Law)

```
                    ┌─────────────────┐
                    │   core-domain   │  Zero framework dependencies
                    │                 │  Allowed: java.*, jakarta.persistence (annotations),
                    │                 │  tower-core (Command/CommandHandler interfaces),
                    │                 │  slf4j, jackson-annotations, hibernate-core (annotations)
                    └────────▲────────┘
                             │
                    ┌────────┴────────┐
                    │core-application │  Zero framework dependencies
                    │                 │  Allowed: core-domain + jakarta.validation,
                    │                 │  jakarta.transaction (annotations),
                    │                 │  jakarta.persistence.criteria.* (JPA Criteria API),
                    │                 │  jackson-databind
                    └────────▲────────┘
                             │
              ┌──────────────┼──────────────┐
    ┌─────────┴─────────┐         ┌────────┴─────────┐
    │   shell-quarkus   │         │   shell-spring   │
    │ Panache, JAX-RS,  │         │ Spring Data JPA, │
    │ SmallRye JWT,     │         │ Spring MVC,      │
    │ MicroProfile GQL  │         │ Spring Security   │
    └─────────▲─────────┘         └────────▲─────────┘
              │                            │
    ┌─────────┴─────────┐         ┌────────┴─────────┐
    │ app-boot-quarkus  │         │  app-boot-spring  │
    └───────────────────┘         └──────────────────┘
```

**Strictly prohibited dependency directions:**
- core-domain -> any `io.quarkus.*`, `org.springframework.*`
- core-application -> any `io.quarkus.*`, `org.springframework.*`
- shell-quarkus <-> shell-spring (no mutual dependency)

---

## Entity Design: De-Panache

### BaseEntity (core-domain, framework-neutral)

```java
package pro.walkin.ams.domain.shared.model;

@MappedSuperclass
@FilterDef(name = "tenant-filter",
    parameters = @ParamDef(name = "tenant", type = Long.class),
    defaultCondition = "tenant_id = :tenant")
@Filter(name = "tenant-filter")
public abstract class BaseEntity {
    @Id @SnowflakeIdGeneratorType
    public Long id;

    @Column(name = "tenant_id", nullable = false)
    public Long tenant;

    @Column(name = "created_at") public Instant createdAt;
    @Column(name = "updated_at") public Instant updatedAt;
}
```

Changes from existing BaseEntity:
1. Remove `extends PanacheEntityBase` (Panache decoupling)
2. Add `createdAt`/`updatedAt` audit fields (check if existing tables already have these columns; add Liquibase migration if needed)

All annotations (`@FilterDef`, `@Filter`, `@SnowflakeIdGeneratorType`) are standard Hibernate SPI, compatible with both frameworks.

### Entity example (User)

```java
package pro.walkin.ams.domain.admin.entity;

@Entity
@Table(name = "sys_user")
public class User extends BaseEntity {
    public String username;
    public String email;
    public String passwordHash;
    public String status;
    // No nested interface Repo extends PanacheRepository
}
```

---

## Repository Port Design: Reader + Writer Separation

### Principle

```
Query layer (read-only)              Handler layer (write)
    │                                    │
    ▼                                    ▼
UserReader                          UserWriter
  findById()                          persist()
  findByUsername()                    delete()
  findByEmail()
  list(), count()
```

- **Reader**: Injected by Query classes and Handlers (for validation)
- **Writer**: Injected only by Handlers
- Handler may inject both Reader + Writer

### Port count

| Domain | Reader | Writer | Total |
|--------|--------|--------|-------|
| admin (10 aggregates) | 10 | 10 | 20 |
| core (3 aggregates) | 3 | 3 | 6 |
| **Total** | **13** | **13** | **26** |

### Example

```java
package pro.walkin.ams.domain.admin.port;

public interface UserReader {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByTenantId(Long tenantId);
    long count();
}

public interface UserWriter {
    void persist(User user);
    void delete(User user);
}
```

---

## Handler Design: Framework-Neutral

```java
package pro.walkin.ams.application.admin.handler;

// No @ApplicationScoped, no @Service — shell layer registers the bean
public class CreateUserHandler implements CommandHandler<CreateUserCommand, UserResponseDto> {

    private final UserReader userReader;
    private final UserWriter userWriter;

    public CreateUserHandler(UserReader userReader, UserWriter userWriter) {
        this.userReader = userReader;
        this.userWriter = userWriter;
    }

    @Override
    public UserResponseDto handle(CreateUserCommand cmd) {
        userReader.findByUsername(cmd.username()).ifPresent(u -> {
            throw new BusinessException("Username already exists");
        });

        User user = new User();
        user.username = cmd.username();
        user.email = cmd.email();
        user.tenant = cmd.tenantId();

        userWriter.persist(user);
        return UserMapper.toResponse(user);
    }
}
```

### Bean registration in shells

- **shell-quarkus**: Tower-quarkus Jandex scan discovers `CommandHandler` implementations. core-application module needs Jandex plugin.
- **shell-spring**: Custom `@ComponentScan` filter or `BeanPostProcessor` to register all `CommandHandler` implementations as Spring beans.

### @Transactional handling

`@Transactional` is not placed on Handlers. Transaction boundaries are managed at the **command dispatch level** in the shell layer, wrapping the entire `Handler.handle()` execution in a single transaction:

- **shell-quarkus**: CDI interceptor on `MessageGateway.sendAsync()` or Tower's built-in transaction support. The interceptor opens a transaction before calling `handler.handle()` and commits/rolls back after.
- **shell-spring**: `@Transactional` on the `CommandBus.dispatch()` method, which wraps `handler.handle()`.

**Writer methods do NOT have `@Transactional`** — they participate in the outer transaction opened at the dispatch level. This ensures that if a Handler calls multiple Writers, all operations are atomic.

```
CommandController.execute()
  → MessageGateway.sendAsync(command)       ← Transaction START
    → Handler.handle(command)
      → reader.findById(...)                ← reads within transaction
      → writer.persist(entity)              ← participates in outer tx
      → writer.delete(other)                ← participates in outer tx
    ← Handler returns                       ← Transaction COMMIT (or ROLLBACK on exception)
```

---

## QueryPort Design

```java
package pro.walkin.ams.application.admin.query;

public interface UserQueryPort {
    UserResponseDto findById(Long id);
    PageResponse<UserResponseDto> findByFilters(
        String username, String email, String status, PageRequest page);
    List<UserResponseDto> findAll();
}
```

Implementations live in shell layer:
- shell-quarkus: Panache `managedBlocking()` chain
- shell-spring: Spring Data `Specification` + `Pageable`

---

## Infrastructure Ports

```java
package pro.walkin.ams.domain.shared.port;

public interface TokenService {
    TokenPrincipal validateAccessToken(String token);
    String generateAccessToken(Long userId, String username, Long tenantId, Set<String> roles);
    String generateRefreshToken(Long userId);
}

public record TokenPrincipal(
    Long userId, Long tenantId, String username,
    Set<String> groups, Map<String, Object> claims
) {}
```

```java
package pro.walkin.ams.application.shared.port;

public interface EventPublisher {
    <T> void publish(T event);
}
```

---

## Shell Implementation Example (Quarkus)

### Reader/Writer

```java
package pro.walkin.ams.quarkus.admin.repository;

@ApplicationScoped
public class PanacheUserReader implements UserReader {
    @Inject EntityManager em;

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(em.find(User.class, id));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return em.createQuery("FROM User WHERE username = :u", User.class)
            .setParameter("u", username)
            .getResultStream().findFirst();
    }
    // ...
}

@ApplicationScoped
public class PanacheUserWriter implements UserWriter {
    @Inject EntityManager em;

    @Override
    public void persist(User user) { em.persist(user); }
    // No @Transactional — participates in the outer transaction from command dispatch

    @Override
    public void delete(User user) { em.remove(em.contains(user) ? user : em.merge(user)); }
}
```

---

## Infrastructure Ports (additional)

### PasswordHasher

```java
package pro.walkin.ams.application.shared.port;

// Password hashing abstraction — framework-neutral
public interface PasswordHasher {
    String hash(String rawPassword);
    boolean verify(String rawPassword, String hashedPassword);
}
```

Implementations:
- shell-quarkus: `HmacPasswordHasher` (current HMAC-SHA256 logic from PasswordService)
- shell-spring: Same `HmacPasswordHasher` or Spring's `BCryptPasswordEncoder` adapter

### Implementation naming convention

| Layer | Naming | Example |
|-------|--------|---------|
| Port interface (domain/application) | `{Noun}` | `TokenService`, `UserReader` |
| Quarkus implementation | `SmallRye{Noun}` or `Panache{Noun}` or `Quarkus{Noun}` | `SmallRyeTokenService`, `PanacheUserReader` |
| Spring implementation | `Spring{Noun}` or `Jpa{Noun}` | `SpringTokenService`, `JpaUserReader` |

---

## Migration Phases

### Phase 0: Scaffold (1-2 days)
- Create empty new modules alongside existing ones
- Verify `./gradlew build -x test` passes

**Gradle build config for new modules:**

core-domain `build.gradle.kts`:
```kotlin
plugins {
    id("base-java-convention")
    id("google-java-format-convention")
}
dependencies {
    api("jakarta.persistence:jakarta.persistence-api:3.1.0")
    api("org.hibernate.orm:hibernate-core:6.6.1.Final")   // @Filter, @FilterDef
    api("io.iamcyw.tower:tower-messaging:1.4.0-SNAPSHOT") // Command, CommandHandler
    implementation("org.slf4j:slf4j-api:2.0.13")
    implementation("com.fasterxml.jackson.core:jackson-annotations:2.15.2")
    // NO io.quarkus, NO org.springframework
}
```

core-application `build.gradle.kts`:
```kotlin
plugins {
    id("base-java-convention")
    id("google-java-format-convention")
    alias(libs.plugins.gradle.jandex)  // For Tower/CDI Handler discovery
}
dependencies {
    api(project(":core-domain"))
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    implementation("jakarta.transaction:jakarta.transaction-api:2.0.1")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.15.2")
    // NO io.quarkus, NO org.springframework
}
```

shell-quarkus `build.gradle.kts`:
```kotlin
plugins {
    id("base-java-convention")
    id("google-java-format-convention")
    alias(libs.plugins.gradle.jandex)
}
dependencies {
    api(project(":core-application"))
    api(project(":infra-persistence"))
    api(project(":infra-cluster"))
    implementation(enforcedPlatform(libs.quarkus.bom))
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-rest")
    // ... all Quarkus dependencies
    implementation("io.iamcyw.tower:tower-quarkus:1.4.0-SNAPSHOT")
}
```

### Phase 1: Populate Shared Layer (1 week)
- Step 1.1-1.4: core-domain (copy from existing, de-Panache entities, add Ports)
- Step 1.5-1.13: core-application (copy Commands/Handlers/DTOs, add QueryPorts/Mappers)
- Step 1.14-1.16: infra-persistence + infra-cluster
- **Old modules untouched** — new modules copy code, don't move
- Gate: `./gradlew :core-domain:compileJava :core-application:compileJava` passes with zero `io.quarkus` imports

### Phase 2: Build shell-quarkus & Switch (1-2 weeks)
- Step 2.1-2.8: Populate shell-quarkus (security, repository, query, controller, auth, graphql, core, ingestion)
- Step 2.9-2.10: app-boot-quarkus (config, initializer, resources)
- Step 2.11: Full test suite `./gradlew :app-boot-quarkus:test`
- Step 2.12: Remove old modules from settings.gradle.kts

### Phase 3: Build shell-spring (2-3 weeks, future)
- JPA Reader/Writer, Spring MVC Controllers, CommandBus, Spring Security JWT
- Spring for GraphQL + .graphqls schema (schema-first)
- Gate: Both backends pass same API contract tests (Pact)

---

## File Statistics

| Layer | Files | Zero-change | Minor-change | New |
|-------|-------|-------------|--------------|-----|
| core-domain | ~72 | 48 (67%) | 11 (15%) | 13 (18%) |
| core-application | ~105 | 68 (65%) | 20 (19%) | 17 (16%) |
| infra-persistence | ~6 | 6 (100%) | 0 | 0 |
| infra-cluster | ~4 | 4 (100%) | 0 | 0 |
| **Shared total** | **~187** | **126 (67%)** | **31 (17%)** | **30 (16%)** |
| shell-quarkus | ~65 | 35 (54%) | — | 30 (46%) |
| app-boot-quarkus | ~12 | 12 (100%) | — | 0 |

**60% of backend code lives in framework-neutral shared layers.**

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Missing dependency during Phase 1 | `compileJava` after every step |
| CDI discovery fails for Handlers without @ApplicationScoped | Add Jandex plugin to core-application |
| Hibernate Filter not working on new BaseEntity | Integration tests in Phase 2.11 cover multi-tenant scenarios |
| Liquibase changelog path change | Keep `db/changelog/` path unchanged in infra-persistence resources |
| Spring Boot behavior differs from Quarkus | Run same Pact contract tests against both backends |

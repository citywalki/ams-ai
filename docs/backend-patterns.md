# 后端开发规范

## 技术栈

- **运行时**: Java 21, Quarkus 3.31.2, Gradle 多模块
- **持久化**: Hibernate ORM + Panache Next (Repository pattern)
- **数据库迁移**: Liquibase（YAML 格式）
- **缓存/集群**: Hazelcast 5.4.0 分布式缓存
- **日志**: SLF4J
- **测试**: JUnit 5, AssertJ, Mockito, Testcontainers

## 模块结构

```
lib-common/         # 常量、DTO、安全/租户上下文、统一异常处理
lib-persistence/    # 实体 BaseEntity、Liquibase changelog
lib-cluster/        # 集群缓存、事件广播
feature-*           # 业务特性（admin/core/graphql/alert-ingestion/...）
app-boot/           # Quarkus 聚合启动模块
```

## 架构硬规则（必守）

### 单体 + 集群
- 不要拆微服务
- 避免引入本地内存缓存（集群一致性风险）

### 多租户
- 核心表必须有 `tenant_id` 字段
- 查询/写入必须基于 `TenantContext.getCurrentTenantId()`
- 禁止跨租户访问

### 持久化
- 优先 Panache（`Entity_.managedBlocking()`）+ JPQL/Criteria
- 避免裸 `EntityManager`/直连 SQL

### 分层约定
- **读操作**: 放在 `*Query`（例如 `feature-admin/.../query/UserQuery.java`）
- **写操作**: 放在 Command Handler（`handler/*Handler.java`），且必须 `@Transactional`

### CQRS 架构

本项目采用 CQRS（命令查询职责分离）模式：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Command   │────▶│   Handler   │────▶│  Repository │
│  (写入操作)  │     │  (业务逻辑)  │     │  (数据访问)  │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Query    │────▶│   Query类   │────▶│  Repository │
│  (读取操作)  │     │  (查询逻辑)  │     │  (数据访问)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Command**: 记录类，实现 `io.iamcyw.tower.messaging.Command`
- **Handler**: 处理 Command，实现 `CommandHandler<Command, Result>`
- **Query**: 封装查询逻辑，供 Controller 和 Handler 使用

## 缓存策略

| 模块 | 缓存策略 |
|------|----------|
| feature-admin | 暴露给前端的查询**禁止使用缓存** |
| feature-core | 仅告警配置（alarm-configuration）相关查询**可以使用缓存** |

### 集群失效模式
- **Topic**: `cache-invalidate`
- **Payload**: `CacheInvalidationEvent(cacheName, cacheKey)`
- **行为**: `cacheKey` 为空时执行 `invalidateAll()`; 否则执行 `invalidate(cacheKey)`
- **参考**: `lib-cluster/src/main/java/pro/walkin/ams/cluster/event/CacheInvalidationListener.java`

## 实体与 Repository（Panache Next）

### 实体定义
```java
@Entity
@Table(name = "user")
public class User extends BaseEntity {
    public String username;
    public String email;
    
    // Repository 内嵌定义
    public interface Repo extends PanacheRepository<User> {}
}
```

### 约定
- 实体必须继承 `BaseEntity` (PanacheEntityBase)
- 实体字段使用 `public`（不使用 Lombok，Lombok 被禁止）
- Repository 内嵌在实体中: `public interface Repo extends PanacheRepository<Entity>`
- 访问模式: `Entity_.managedBlocking()` / `Entity_.managed()`
- 常量使用嵌套静态类，如 `Constants.Alarm.STATUS_NEW`

### 时间戳与 JSON
- 时间戳使用 `@CreationTimestamp`/`@UpdateTimestamp`
- JSON 列使用 `Map<String, Object>` + `@JdbcTypeCode(SqlTypes.JSON)`

## 错误处理

### 统一出口
`lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`

### 异常体系
- 业务/校验/未找到：抛 `pro.walkin.ams.common.exception.*`（`BaseException` 家族）
- Bean Validation：优先 Jakarta Validation 注解；约束失败会被 `ConstraintViolationException` 转成字段错误

### 禁止事项
- 吞异常
- 随意抛 `RuntimeException`
- 把敏感信息写进 message

## 日志规范

- 使用 SLF4J 参数化日志；禁止 `System.out/err`
- 生产错误信息不要暴露内部堆栈与敏感字段

```java
// 推荐
log.info("Processing user {}", userId);

// 禁止
System.out.println("Processing user " + userId);
```

## 代码风格

### 格式化
- JDK：21（见 `buildSrc/src/main/kotlin/base-java-convention.gradle.kts`）
- 格式化：只用 `./gradlew spotlessApply`；不要手工对齐
- 编码：源码 UTF-8（编译选项强制）

### Imports 顺序
1. 第三方/项目内
2. `javax.*`
3. `java.*`
4. static imports

### 命名规范
- **包**: `pro.walkin.ams.{module}.{layer}`（例：`...admin.system.query`）
- **类/接口**: `PascalCase`
- **方法/变量**: `camelCase`
- **常量**: `UPPER_SNAKE_CASE`
- **DB**: `snake_case` 列名（例：`tenant_id`）

## CQRS 完整示例

### 目录结构

```
feature-admin/src/main/java/pro/walkin/ams/admin/system/
├── command/              # Command 定义
│   └── role/
│       ├── CreateRoleCommand.java
│       ├── UpdateRoleCommand.java
│       └── DeleteRoleCommand.java
├── handler/              # Command 处理器
│   ├── CreateRoleHandler.java
│   ├── UpdateRoleHandler.java
│   └── DeleteRoleHandler.java
└── query/
    └── RoleQuery.java    # 查询逻辑
```

### 1. Command 定义

```java
package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record CreateRoleCommand(
    String code,
    String name,
    String description,
    Long tenantId
) implements Command {}
```

### 2. Command Handler

```java
package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.role.CreateRoleCommand;
import pro.walkin.ams.admin.system.query.RoleQuery;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.Role;

@ApplicationScoped
public class CreateRoleHandler implements CommandHandler<CreateRoleCommand, Role> {

    @Inject Role.Repo roleRepo;
    @Inject RoleQuery roleQuery;

    @Override
    @Transactional
    public Role handle(CreateRoleCommand cmd) {
        // 1. 使用 Query 验证
        if (roleQuery.findByCode(cmd.code()).isPresent()) {
            throw new BusinessException("Role code already exists");
        }

        // 2. 创建实体
        Role role = new Role();
        role.code = cmd.code();
        role.name = cmd.name();
        role.description = cmd.description();
        role.tenant = cmd.tenantId();

        // 3. 持久化
        roleRepo.persist(role);

        // 4. 返回结果
        return role;
    }
}
```

### 3. Query 类

```java
package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.persistence.entity.system.Role;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class RoleQuery {

    @Inject Role.Repo roleRepo;

    public Optional<Role> findById(Long id) {
        return roleRepo.findByIdOptional(id);
    }

    public Optional<Role> findByCode(String code) {
        return roleRepo.find("code", code).firstResultOptional();
    }

    public List<Role> listByTenant(Long tenantId, int page, int size) {
        return roleRepo.find("tenant", tenantId)
            .page(page, size)
            .list();
    }

    public long countByTenant(Long tenantId) {
        return roleRepo.count("tenant", tenantId);
    }
}
```

### 关键规则

1. **Handler 使用 Query 验证** - 不要直接调用 Repository 查询方法（除了 `findById`）
2. **Handler 标记 `@Transactional`** - 确保写操作在事务中
3. **Query 类不标记 `@Transactional`** - 只读操作不需要事务
4. **返回实体** - Handler 返回操作后的实体供前端使用

## 参考文件

- `gradle/libs.versions.toml`: 版本与依赖基线
- `buildSrc/src/main/kotlin/google-java-format-convention.gradle.kts`: 格式化/导入顺序
- `buildSrc/src/main/kotlin/code-quality-convention.gradle.kts`: SpotBugs 规则与报告
- `lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`: 错误映射与响应结构
- `lib-common/src/main/java/pro/walkin/ams/common/security/TenantContext.java`: 租户上下文

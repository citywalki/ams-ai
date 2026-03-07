# 后端开发规范

## 技术栈

- **运行时**: Java 25, Quarkus 3.31.2, Gradle 多模块
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
- **写操作**: 放在 `*Service`，且必须 `@Transactional`

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

## 参考文件

- `gradle/libs.versions.toml`: 版本与依赖基线
- `buildSrc/src/main/kotlin/google-java-format-convention.gradle.kts`: 格式化/导入顺序
- `buildSrc/src/main/kotlin/code-quality-convention.gradle.kts`: SpotBugs 规则与报告
- `lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`: 错误映射与响应结构
- `lib-common/src/main/java/pro/walkin/ams/common/security/TenantContext.java`: 租户上下文

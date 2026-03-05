# AMS-AI AGENTS.md

给自动化编码代理使用的仓库指南（偏“可执行命令 + 硬规则”）。以 `gradle/libs.versions.toml` 的版本为准。

## 1) 技术栈与模块

- 运行时：JDK 21；Quarkus 3.31.2；JUnit 5
- 持久化：Hibernate ORM + Panache（实体内嵌 Repo）；Liquibase（YAML）
- 集群/缓存：Hazelcast
- 多租户：`tenant_id` + Hibernate Filter + `TenantContext`（ThreadLocal）
- 仓库当前不包含可运行的前端工程目录（`app-web/` 不存在；如未来引入，请把脚本同步到本文）

模块：

- `lib-common/`：常量、DTO、安全/租户上下文、统一异常处理（`GlobalExceptionHandler`）
- `lib-persistence/`：实体 `BaseEntity`、Liquibase changelog（`db/changelog/`）
- `feature-*`：业务特性（admin/core/graphql/alert-ingestion/...）
- `app-boot/`：Quarkus 聚合启动模块

## 2) 构建 / 格式化 / 静态检查

常用：

```bash
./gradlew clean
./gradlew build                 # 含测试
./gradlew build -x test          # 跳过测试

./gradlew :app-boot:quarkusDev   # 开发模式启动（推荐入口）
```

Java 格式化（Spotless + google-java-format）：

```bash
./gradlew spotlessApply
./gradlew spotlessCheck
```

SpotBugs（默认 ignoreFailures=true：不阻断构建，但会产出报告，需关注）：

```bash
./gradlew check
./gradlew spotbugsMain           # 在模块目录执行更直观
./gradlew :app-boot:spotbugsMain
./gradlew spotbugsAll            # 根项目聚合任务（见 build.gradle.kts）
```

报告位置（示例）：`build/reports/spotbugs/aggregate.html`。

## 3) 测试命令（重点：单测单跑）

全量测试：

```bash
./gradlew test
./gradlew :feature-admin:test
```

单测（Gradle `--tests`）：

```bash
# 跑单个测试类
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.TenantRoleFilterTest"

# 跑单个测试方法
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.TenantRoleFilterTest.shouldXxx"

# 通配符（注意需要引号）
./gradlew :feature-admin:test --tests "*RbacServiceTest"
```

调试单测（等待 IDE attach）：

```bash
./gradlew :app-boot:test --debug-jvm --tests "*Test"
```

集成测试：`app-boot` 默认在未显式开启时排除 `**/it/**`（见 `app-boot/build.gradle.kts`）。

```bash
./gradlew :app-boot:test -PrunIntegrationTests
```

## 4) 数据库迁移（Liquibase）

- 入口：`lib-persistence/src/main/resources/db/changelog/db.changelog-master.yaml`
- 变更：新增 YAML changelog 并在 master/include 链路中注册；禁止手工改库

```bash
./gradlew liquibaseUpdate
./gradlew liquibaseRollback
./gradlew liquibaseDiffChangeLog
```

## 5) 架构硬规则（必守）

- 单体 + 集群：不要拆微服务；避免引入本地内存缓存（集群一致性风险）
- 多租户：核心表必须有 `tenant_id`；查询/写入必须基于 `TenantContext.getCurrentTenantId()`
- 持久化：优先 Panache（`Entity_.managedBlocking()`）+ JPQL/Criteria；避免裸 `EntityManager`/直连 SQL
- 分层约定（项目实际已有 pattern）：
  - 读：放在 `*Query`（例如 `feature-admin/.../query/UserQuery.java`）
  - 写：放在 `*Service`，且必须 `@Transactional`

## 6) 代码风格（Java）

格式化与编码：

- JDK：21（见 `buildSrc/src/main/kotlin/base-java-convention.gradle.kts`）
- 格式化：只用 `./gradlew spotlessApply`；不要手工对齐
- 编码：源码 UTF-8（编译选项强制）

Imports（Spotless 配置见 `buildSrc/src/main/kotlin/google-java-format-convention.gradle.kts`）：

- 顺序：第三方/项目内 -> `javax.*` -> `java.*` -> static imports
- 禁止未使用 import（Spotless 会移除）；尽量避免静态导入造成可读性下降

命名：

- 包：`pro.walkin.ams.{module}.{layer}`（例：`...admin.system.query`）
- 类/接口：`PascalCase`；方法/变量：`camelCase`；常量：`UPPER_SNAKE_CASE`
- DB：`snake_case` 列名（例：`tenant_id`）；实体字段遵循项目约定（大量为 `public` 字段）

实体与 Repository（Panache）：

- 实体继承 `pro.walkin.ams.persistence.entity.BaseEntity`（自带 `tenant` 字段与 Hibernate Filter）
- 实体内嵌 `public interface Repo extends PanacheRepository<Entity>`（见 `lib-persistence/src/main/java/...`）
- 查询推荐：`Entity_.managedBlocking().find(...)`；列表查询必须显式带 tenant 条件

日志：

- 使用 SLF4J 参数化日志；禁止 `System.out/err`
- 生产错误信息不要暴露内部堆栈与敏感字段

## 7) 错误处理（统一响应）

- 统一出口：`lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`
- 业务/校验/未找到：抛 `pro.walkin.ams.common.exception.*`（`BaseException` 家族）
- Bean Validation：优先 Jakarta Validation 注解；约束失败会被 `ConstraintViolationException` 转成字段错误
- 禁止：吞异常、随意抛 `RuntimeException`、把敏感信息写进 message

## 8) 规则文件（Cursor / Copilot）

- 未发现 `.cursor/rules/`、`.cursorrules`、`.github/copilot-instructions.md`

## 9) 参考入口（建议优先读）

- `gradle/libs.versions.toml`：版本与依赖基线
- `buildSrc/src/main/kotlin/google-java-format-convention.gradle.kts`：格式化/导入顺序
- `buildSrc/src/main/kotlin/code-quality-convention.gradle.kts`：SpotBugs 规则与报告
- `lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`：错误映射与响应结构
- `lib-common/src/main/java/pro/walkin/ams/common/security/TenantContext.java`：租户上下文

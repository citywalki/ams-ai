# AMS-AI AGENTS.md

给自动化编码代理使用的仓库指南（尽量简短、可执行、可引用）。版本以 `gradle/libs.versions.toml` 为准。

## 1) 技术栈与结构

- 后端：JDK 21 + Quarkus 3.31.2 + Hibernate Panache Next（Repository 模式）
- 数据库：PostgreSQL / Oracle；迁移：Liquibase
- 集群：Hazelcast
- 前端：`app-web/`（React + TypeScript + Vite；脚本以该目录实际配置为准）

模块速览（每个模块可能还有自己的 `AGENTS.md`）：

- `lib-common/`：异常、DTO、常量、安全基础设施
- `lib-persistence/`：实体、Repository、Liquibase changelog
- `feature-*/`：业务特性（admin/core/graphql/ingestion/...）
- `app-boot/`：Quarkus 主程序聚合与启动

## 2) 构建 / 格式化 / 静态检查

后端构建：

```bash
./gradlew clean
./gradlew build                 # 含测试
./gradlew build -x test          # 跳过测试
./gradlew quarkusDev             # 开发模式（通常对应 app-boot）
./gradlew :app-boot:quarkusDev   # 显式启动主模块（推荐）
```

格式化与质量检查（Java 格式由 Spotless + google-java-format 统一）：

```bash
./gradlew spotlessApply
./gradlew spotlessCheck

./gradlew spotbugsMain           # 当前模块（在对应 module 下执行更直观）
./gradlew :app-boot:spotbugsMain
./gradlew spotbugsAll            # 聚合所有模块

./gradlew check                  # 绑定 SpotBugs 等校验
```

数据库迁移：

```bash
./gradlew liquibaseUpdate
./gradlew liquibaseRollback
./gradlew liquibaseDiffChangeLog
```

## 3) 测试命令（重点：单测单跑）

后端（JUnit 5）：

```bash
./gradlew test
./gradlew :feature-admin:test

./gradlew :app-boot:test --tests "pro.walkin.ams.boot.TenantRoleFilterTest"
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.TenantRoleFilterTest.shouldXxx"
./gradlew :lib-persistence:test --tests "*Alarm*Test"

./gradlew :app-boot:test --debug-jvm --tests "*Test"   # 需要 IDE attach
```

集成测试（`app-boot` 默认在无 Docker 且未显式开启时排除 `**/it/**`）：

```bash
./gradlew :app-boot:test -PrunIntegrationTests
```

前端（以 README 中约定为主；实际以 `app-web` 脚本为准）：

```bash
cd app-web
pnpm install
pnpm dev
pnpm lint
pnpm build

pnpm test:e2e
pnpm test:e2e --grep "role management|visual regression"   # 只跑匹配用例（Playwright）
pnpm test:e2e:ui
```

## 4) 架构硬规则（必守）

- 单体集群架构：禁止拆微服务。
- 数据访问：禁止直接 `EntityManager` / 直连 SQL；通过 Panache Next Repository 模式。
- 多租户：核心表必须带 `tenant_id`；查询/写入必须使用 `TenantContext` 并显式过滤租户。
- 迁移：表结构变更必须走 Liquibase（禁止手工改库）。
- Lombok：禁止（与当前实体/Repository 模式不兼容）。

查询/命令分层（见 `CLAUDE.md`）：

- 读：放在 Query 类（Controller / Service 共享）
- 写：放在 Service（`@Transactional`）
- Service 禁止调用 Repository 的 `findByXxx()` 查询（仅允许 `findById()`）；需要读就调 Query
- Service 禁止做本地缓存（集群环境一致性风险）

## 5) 后端代码风格（Java）

- 语言级别：JDK 21（`buildSrc/src/main/kotlin/base-java-convention.gradle.kts`）
- 格式化：`./gradlew spotlessApply`（不要手工对齐/重排；让工具决定）
- Imports：按 Spotless 规则排序；禁止未使用 import
- 命名：
  - 包：`pro.walkin.ams.{module}.{layer}`（entity/service/controller/config/...）
  - 类/接口：`PascalCase`；方法/变量：`camelCase`；常量：`UPPER_SNAKE_CASE`
  - DB：`snake_case`（`tenant_id`, `created_at`, `updated_at`）
- 实体（Panache Next）：
  - 继承 `BaseEntity`（最终继承 `PanacheEntityBase`）
  - 字段使用 `public`（项目约定）
  - 内嵌 `public interface Repo extends PanacheRepository<Entity>`
  - JSON 字段：`Map<String, Object>` + `@JdbcTypeCode(SqlTypes.JSON)`
- 事务：写操作 Service 使用 `@Transactional`；校验用 Jakarta Validation（`@Valid`, `@NotNull`...）
- 日志：SLF4J；禁止 `System.out`；使用参数化日志（`log.info("x={} ", x)`）

## 6) 错误处理（统一响应）

- 业务/校验/未找到：抛 `pro.walkin.ams.common.exception.*`（`BaseException` 体系）
- 禁止：随意抛 `RuntimeException`、吞异常、在 message 中暴露敏感信息
- 全局映射：用 `@Provider` + `ExceptionMapper` 统一转 `ErrorResponse`（见 `.mindmodel/error-handling.md`）

## 7) 前端代码风格（TypeScript/React）

- React：函数组件 + Hooks（禁止 class 组件）
- TypeScript：严格模式；避免 `any`；优先 `import type` 分离类型导入
- 命名：组件/类型 `PascalCase`；函数/变量 `camelCase`；常量 `UPPER_SNAKE_CASE`
- 结构：页面/服务/组件按 feature 拆分；路径别名通常为 `@/* -> src/*`（以项目配置为准）

## 8) 规则文件（Cursor / Copilot）

- 未发现 `.cursor/rules/`、`.cursorrules` 或 `.github/copilot-instructions.md`（如后续添加，请把关键约束同步到本文件）。

## 9) 参考文档（优先级从高到低）

- `CLAUDE.md`：分层/查询规则、常用命令
- `CODE_STYLE.md`：更长的风格与示例
- `.mindmodel/*.md`：模式库（multi-tenant、error-handling、testing 等）
- 各模块：`lib-common/AGENTS.md`、`lib-persistence/AGENTS.md`、`feature-admin/AGENTS.md` ...

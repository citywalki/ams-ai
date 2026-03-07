# AMS-AI AGENTS.md

给自动化编码代理使用的仓库指南。详细规范请查看 `docs/` 目录下的专题文档。

## 技术栈概览

- **后端**: JDK 21/25, Quarkus 3.31.2, Hibernate ORM + Panache, Hazelcast
- **前端**: React 19, TypeScript 5, Vite 7, FSD 架构
- **API**: GraphQL (查询), REST (命令)
- **多租户**: `tenant_id` + Hibernate Filter + `TenantContext`

## 常用命令

### 后端构建与启动
```bash
./gradlew clean                          # 清理构建产物
./gradlew build                          # 完整构建（含测试）
./gradlew build -x test                  # 构建跳过测试
./gradlew :app-boot:quarkusDev           # 开发模式启动
./gradlew :app-boot:quarkusBuild         # 构建可运行包
```

### 后端测试
```bash
./gradlew test                           # 运行所有测试
./gradlew :app-boot:test --tests "*Test"         # 运行指定测试类（按模式匹配）
./gradlew :app-boot:test --tests "UserServiceTest"  # 运行单个测试类
./gradlew :app-boot:test --tests "UserServiceTest.shouldCreateUser"  # 运行单个测试方法
./gradlew :app-boot:test -PrunIntegrationTests     # 运行集成测试（需要 Docker）
./gradlew :app-boot:test --debug-jvm --tests "*Test" # 调试测试
./gradlew :app-boot:test --tests "*PactProviderTest" # 运行契约测试
```

### 代码质量与格式化
```bash
./gradlew spotlessApply                  # 自动格式化代码
./gradlew spotlessCheck                  # 检查代码格式
./gradlew spotbugsMain                   # 运行 SpotBugs 静态分析
./gradlew spotbugsAll                    # 所有模块 SpotBugs 分析
```

### 前端开发（app-web 目录下）
```bash
cd app-web
pnpm dev                                 # 启动开发服务器
pnpm build                               # 构建（tsc + vite）
pnpm preview                             # 预览生产构建
pnpm lint                                # ESLint 检查
pnpm test                                # 运行 Vitest 单元测试（监视模式）
pnpm test:run                            # 单次运行单元测试
pnpm e2e                                 # 运行 Playwright E2E 测试
pnpm e2e:ui                              # E2E 测试 UI 模式
pnpm e2e:debug                           # 调试 E2E 测试
npx shadcn add <component>               # 安装 shadcn/ui 组件
```

## 模块结构

```
lib-common/         # 常量、DTO、安全/租户上下文、统一异常处理
lib-persistence/    # 实体 BaseEntity、Liquibase changelog
lib-cluster/        # 集群缓存、事件广播
feature-*/          # 业务特性（admin/core/graphql/alert-ingestion/notification/ai-analysis）
app-boot/           # Quarkus 聚合启动模块
app-web/            # React 前端工程（FSD 架构）
```

## 代码风格规范

### Java 后端

#### 格式化
- 使用 `./gradlew spotlessApply` 自动格式化，禁止手工对齐
- JDK 版本：21（见 `buildSrc/src/main/kotlin/base-java-convention.gradle.kts`）
- 源码编码：UTF-8

#### Imports 顺序
1. 第三方/项目内包
2. `javax.*`
3. `java.*`
4. static imports

#### 命名规范
- **包**: `pro.walkin.ams.{module}.{layer}`（例：`pro.walkin.ams.admin.system.query`）
- **类/接口**: PascalCase（例：`UserService`, `UserQuery`）
- **方法/变量**: camelCase（例：`findById`, `userName`）
- **常量**: UPPER_SNAKE_CASE（例：`MAX_RETRY_COUNT`）
- **数据库列**: snake_case（例：`tenant_id`, `created_at`）

#### 错误处理
- 业务异常抛 `BaseException` 家族（`lib-common/src/.../exception/`）
- 禁止吞异常、禁止随意抛 `RuntimeException`
- 禁止在日志中暴露敏感信息
- 使用 SLF4J 参数化日志：`log.info("Processing {}", userId)`

#### 实体与 Repository
- 实体必须继承 `BaseEntity`，字段使用 `public`（不用 Lombok）
- Repository 内嵌定义：`public interface Repo extends PanacheRepository<Entity>`
- 访问模式：`Entity_.managedBlocking()` / `Entity_.managed()`

### TypeScript 前端

#### 项目结构（FSD 架构）
```
app-web/src/
├── app/               # 应用层: providers, router, layout
├── pages/             # 页面层（仅组合，不含业务逻辑）
├── features/          # 特性层（包含 schema/, hooks/, components/）
├── store/             # Zustand stores（按 feature 命名）
├── components/        # 共享 UI 组件（shadcn/ui）
├── shared/            # 共享层: api, lib
└── lib/               # 工具库
```

#### 代码规范
- 缩进：2 空格（不使用 tab）
- 行宽：120
- TS 严格模式：`noUnusedLocals`, `noUnusedParameters`
- 路径别名：`@/*` -> `src/*`

#### Imports 顺序
1. React/框架
2. 第三方库
3. 内部模块（`@/...`）
4. 相对路径

#### 命名规范
- **Hooks**: `use{Feature}{Action}`（例：`useUserMenus`, `useAuthStore`）
- **Store 文件**: `src/store/{feature}-store.ts`
- **Schema 文件**: `src/features/{feature}/schema/{feature}.ts`
- **组件**: PascalCase（例：`LoginForm`, `DashboardPage`）
- **工具函数**: camelCase（例：`formatDate`, `cn`）

#### API 调用规范
- **查询（Query）**: 使用 GraphQL (urql)
- **更新（Mutation）**: 必须使用 REST (axios)
- **禁止**创建单独的 API 封装层（如 `features/**/api/`）
- 请求直接在 hook 中调用相应客户端

#### 状态管理
- 服务端状态：GraphQL 用 urql，REST 用 TanStack Query
- 客户端全局状态：Zustand（文件放在 `src/store/`）
- 禁止在组件中直接使用 `localStorage`，应通过 Zustand persist 中间件

## 架构硬规则

### 单体 + 集群
- 不要拆微服务
- 避免引入本地内存缓存（集群一致性风险）
- 缓存失效使用 `cache-invalidate` Topic

### 多租户
- 核心表必须有 `tenant_id` 字段
- 查询/写入必须基于 `TenantContext.getCurrentTenantId()`
- 禁止跨租户访问

### 分层约定
- **读操作**: 放在 `*Query`（例：`UserQuery.java`）
- **写操作**: 放在 `*Service`，且必须 `@Transactional`

### 前端约束
- **禁止**创建 `src/entities/` 目录，所有实体代码放在对应 `features/` 中
- **禁止**在 pages 中编写可复用的业务组件
- shadcn/ui 组件必须通过 CLI 安装：`npx shadcn add <component>`

## 关键入口文件

- `gradle/libs.versions.toml`: 版本与依赖基线
- `lib-common/src/main/java/pro/walkin/ams/common/web/GlobalExceptionHandler.java`: 错误处理
- `lib-common/src/main/java/pro/walkin/ams/common/security/TenantContext.java`: 租户上下文
- `app-web/src/app/routes/`: 前端路由配置

## 参考文档

| 文档 | 内容 |
|------|------|
| [docs/backend-patterns.md](./docs/backend-patterns.md) | 后端开发规范、架构约束、代码风格 |
| [docs/frontend-patterns.md](./docs/frontend-patterns.md) | 前端 FSD 架构、组件规范、状态管理 |
| [docs/api-standards.md](./docs/api-standards.md) | GraphQL/REST API 设计规范 |
| [docs/ui-style-guide.md](./docs/ui-style-guide.md) | UI 主题风格设计规范 |
| [docs/testing-guide.md](./docs/testing-guide.md) | 测试指南 |

# 技术栈约束

## 后端技术栈

### 核心框架
- **Java**: 版本 21+ (目标 25)
- **Quarkus**: 版本 3.31.2
  - 必须使用 Quarkus 依赖注入 (@Inject, @ApplicationScoped)
  - 必须使用 Quarkus 配置 (application.yaml)
  - 必须使用 Quarkus 生命周期钩子

### 持久层
- **Hibernate ORM**: 通过 Quarkus Panache Next
- **Panache Repository**: 必须，禁止直接使用 EntityManager
- **数据库支持**: 
  - PostgreSQL 42.7.3 (主要)
  - Oracle 23.3.0.23.09 (可选)
- **连接池**: HikariCP 5.1.0
- **数据库迁移**: Liquibase 4.27.0
  - 所有表结构变更必须通过 Liquibase changelog
  - 禁止手动修改数据库

### 缓存
- **Hazelcast**: 5.4.0
  - 使用 @Cacheable, @CacheInvalidate, @CacheInvalidateAll
  - 配置在 application.yaml

### 安全
- **JWT**: SmallRye JWT (quarkus-smallrye-jwt)
- **OIDC**: quarkus-oidc (可选)
- **密码哈希**: BCrypt

### API
- **REST**: quarkus-rest, quarkus-rest-jackson
- **GraphQL**: SmallRye GraphQL
- **JSON**: Jackson (quarkus-jackson)

### 测试
- **JUnit 5**: 5.10.2
- **Testcontainers**: 2.0.3
- **AssertJ**: 3.25.3
- **Mockito**: 集成测试 mock

### 监控
- **Micrometer**: 1.12.5
- **Prometheus**: quarkus-micrometer-registry-prometheus

### AI 集成
- **LangChain4j**: 0.29.1
- **Ollama**: langchain4j-ollama 0.29.1

## 前端技术栈

### 核心框架
- **React**: 18.2.0
  - 使用函数组件 + Hooks
  - 禁止使用 Class 组件
- **TypeScript**: 5.5.0
  - strict 模式
  - noUnusedLocals, noUnusedParameters
- **Vite**: 5.2.0

### UI 库
- **Ant Design**: 6.0.0
  - 主要 UI 组件库
  - 遵循 Ant Design 设计规范
- **Lucide React**: 0.575.0 (图标)
- **Framer Motion**: 12.34.3 (动画)

### 状态管理
- **Zustand**: 4.5.2
  - 轻量级状态管理
  - 避免过度使用 Context

### 数据获取
- **TanStack Query**: 5.90.21 (React Query)
  - 服务端状态管理
  - 缓存和同步
- **Axios**: 1.6.2 (HTTP 客户端)
- **GraphQL Request**: 7.4.0

### 表单和验证
- **TanStack Form**: 1.28.3
- **Zod**: 4.3.6 (schema 验证)

### 路由
- **React Router**: 6.23.1 → 7.x
  - 使用最新路由模式

### 样式
- **TailwindCSS**: 4.2.1
- **PostCSS**: 8.5.6
- **clsx**: 2.1.1
- **tailwind-merge**: 3.5.0

### 国际化
- **i18next**: 25.8.13
- **react-i18next**: 16.5.4

### 测试
- **Playwright**: 1.58.2 (E2E 测试)

## 构建工具

### 后端
- **Gradle**: 8.x
  - 版本目录: gradle/libs.versions.toml
  - Kotlin DSL: build.gradle.kts

### 前端
- **pnpm**: 9.0.0
  - 包管理器
  - 使用 workspace (monorepo)

## 约束规则

### 必须使用
1. 所有数据库操作必须通过 Repository 层
2. 所有表结构变更必须通过 Liquibase
3. 所有用户输入必须验证 (Jakarta Validation)
4. 所有 API 必须有权限控制
5. 所有跨租户操作必须过滤 tenant_id

### 禁止使用
1. ❌ Lombok (与 Panache 不兼容)
2. ❌ 直接 EntityManager 操作
3. ❌ 手动数据库 DDL
4. ❌ 微服务架构 (保持单体)
5. ❌ Class 组件 (前端)
6. ❌ any 类型 (TypeScript)

### 版本锁定
- 不要随意升级 Quarkus 主版本
- 不要随意升级 React 主版本
- 所有依赖版本必须在 libs.versions.toml 中定义

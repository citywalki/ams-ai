# AMS-AI Architecture Documentation

> 晶圆厂设备告警管理系统 - 企业级告警解决方案

## Overview

AMS-AI 是专为半导体制造行业设计的云原生告警管理系统。采用 **单体集群架构**（非微服务），基于 Quarkus 3.31.2 + React 18 技术栈，支持多租户、分布式缓存和智能告警处理。

**核心目标**：实时告警接入、智能去重、多渠道通知、AI 辅助分析

---

## Tech Stack

### Backend

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| Runtime | Quarkus | 3.31.2 | 云原生 Java 框架 |
| Language | Java | 21 | LTS 版本 |
| Persistence | Hibernate ORM + Panache Next | - | Repository 模式 |
| Database | PostgreSQL / Oracle | 15+ / 19c+ | 关系型数据库 |
| Migration | Liquibase | 4.27.0 | 数据库版本控制 |
| Cache | Hazelcast | 5.4.0 | 分布式缓存 |
| Security | SmallRye JWT | - | JWT 认证 |
| API | REST + GraphQL (SmallRye) | - | 混合 API 层 |
| AI | LangChain4j + Ollama | 0.29.1 | LLM 集成 |
| Monitoring | Micrometer + Prometheus | 1.12.5 | 可观测性 |

### Frontend

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| Framework | React | 18.2 | UI 框架 |
| Language | TypeScript | 5.2 | 类型安全 |
| Build | Vite | 5.0 | 构建工具 |
| UI | Ant Design + Tailwind CSS | 6.0 / 4.x | 组件库 |
| State | Zustand + TanStack Query | 4.4 / 5.90 | 状态管理 |
| GraphQL | graphql-request + json-bigint | 7.4 | 查询客户端 |
| i18n | i18next | 25.x | 国际化 |
| E2E | Playwright | 1.58 | 端到端测试 |

---

## Directory Structure

```
ams-ai/
├── gradle/                        # Gradle 配置
│   └── libs.versions.toml         # 依赖版本目录 (版本目录模式)
│
├── buildSrc/                      # Gradle 插件和构建逻辑
│
├── lib-common/                    # 📚 公共库
│   ├── exception/                 # 异常体系 (BaseException, BusinessException)
│   ├── dto/                       # 数据传输对象
│   ├── constants/                 # 常量定义
│   ├── security/                  # 安全工具 (TenantContext, RBAC, JWT)
│   │   ├── filter/               # JWT认证、租户过滤、授权
│   │   ├── service/              # TokenService, RbacService
│   │   ├── annotation/           # @RequireRole, @RequirePermission
│   │   ├── TenantContext.java    # 租户上下文
│   │   └── util/                 # SecurityUtils
│   ├── util/                     # 工具类 (Json, Date, IdWorker)
│   ├── cache/                    # 缓存广播
│   ├── event/                    # 事件定义
│   └── web/                      # 全局异常处理
│
├── lib-persistence/               # 📚 持久层
│   ├── entity/                    # Hibernate 实体 (Panache Next)
│   │   ├── BaseEntity.java        # 基础实体 (id, tenant)
│   │   ├── system/                # 系统实体 (User, Role, Permission)
│   │   └── alarm/                 # 告警实体 (Alarm, AlarmRule)
│   └── resources/
│       └── db/changelog/          # Liquibase 迁移脚本
│           ├── tables/             # 表结构
│           └── tests/             # 测试数据
│
├── lib-cluster/                   # 📚 集群模块
│   └── Hazelcast 配置             # 分布式缓存和会话
│
├── feature-core/                  # 🎯 告警流水线核心
│   ├── 告警处理引擎               # 消息队列、状态机
│   ├── 规则评估                   # Drools/自定义规则
│   └── 状态管理                   # 告警生命周期
│
├── feature-admin/                 # 🎯 管理后台
│   ├── auth/                      # 认证授权
│   │   ├── controller/            # AuthController
│   │   └── service/               # TokenService, AuthenticationService
│   └── system/                    # 系统管理
│       ├── UserController.java    # 用户 CRUD
│       ├── RoleController.java    # 角色 CRUD
│       ├── MenuController.java    # 菜单管理
│       └── DictController.java    # 数据字典
│
├── feature-graphql/               # 🎯 GraphQL API
│   ├── entity/                    # 实体查询 API
│   │   ├── user/                  # UserGraphQLApi, UserFilterInput
│   │   ├── role/                  # RoleGraphQLApi
│   │   ├── menu/                  # MenuGraphQLApi
│   │   ├── permission/            # PermissionGraphQLApi
│   │   ├── alarm/                 # AlarmGraphQLApi
│   │   └── dict/                  # DictGraphQLApi
│   ├── connection/                # 分页连接类型 (XxxConnection)
│   └── filter/                    # 过滤条件转换
│       ├── CriteriaTranslator     # JPA Criteria 转换
│       └── CriteriaFilterHelper   # 通用谓词构建
│
├── feature-alert-ingestion/       # 🎯 告警接入
│   ├── connector/                 # 接入连接器
│   │   └── rest/                  # REST Webhook
│   ├── service/                   # 接入服务
│   └── config/                    # 接入配置
│
├── feature-ai-analysis/           # 🎯 AI 智能分析
│   └── LangChain4j 集成           # Ollama 本地模型
│
├── feature-notification/          # 🎯 通知渠道
│   ├── 邮件                       # SMTP
│   ├── 短信                       # SMS Gateway
│   └── IM                         # 钉钉/企业微信
│
├── feature-multi-tenant/          # 🎯 多租户扩展
│   └── 租户隔离                   # 数据、配置、权限隔离
│
├── app-boot/                      # 🚀 Quarkus 主程序
│   ├── src/main/
│   │   ├── java/                  # 启动类、配置类
│   │   └── resources/
│   │       ├── application.yml    # 主配置文件
│   │       ├── hazelcast.yaml     # Hazelcast 配置
│   │       └── *.pem              # JWT 密钥
│   └── src/test/                  # 集成测试
│
└── app-web/                       # 🌐 React 前端
    ├── src/
    │   ├── components/            # 通用组件
    │   │   ├── antd/              # Ant Design 封装
    │   │   ├── common/            # 业务组件
    │   │   ├── layout/            # 布局组件
    │   │   └── tables/            # 表格组件
    │   ├── features/              # 功能模块
    │   │   └── admin/             # 管理后台
    │   ├── pages/                 # 页面
    │   │   ├── admin/             # 管理页面
    │   │   ├── dashboard/         # 告警大盘
    │   │   └── login/             # 登录页
    │   ├── stores/                # Zustand 状态
    │   │   ├── authStore.ts       # 认证状态
    │   │   └── permissionStore.ts # 权限状态
    │   ├── services/              # API 服务
    │   ├── lib/                   # 工具库
    │   │   ├── apiClient.ts       # Axios 客户端
    │   │   ├── graphqlClient.ts   # GraphQL 客户端
    │   │   └── queryClient.ts     # React Query
    │   ├── i18n/                  # 国际化
    │   └── main.tsx               # 入口
    ├── e2e/                       # Playwright 测试
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Core Components

### 1. 持久层 (lib-persistence)

**BaseEntity 模式**：
```java
@MappedSuperclass
@FilterDef(name = "tenant-filter", parameters = @ParamDef(name = "tenant", type = Long.class))
@Filter(name = "tenant-filter")
public abstract class BaseEntity extends PanacheEntityBase {
    @Id @SnowflakeIdGeneratorType 
    public Long id;
    
    @Column(name = "tenant_id", nullable = false)
    public Long tenant;
}
```

**Repository 模式**（Panache Next）：
```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    public String username;
    public String email;
    
    // 内嵌 Repository 接口
    public interface Repo extends PanacheRepository<User> {
        @Find
        Optional<User> findByUsername(String username);
        
        @Find
        Stream<User> findByTenant(Long tenant);
    }
}
```

**访问方式**：
```java
// 阻塞式
User.Repo.managedBlocking().findByUsername("admin");

// 响应式
User.Repo.managed().findByUsername("admin");
```

### 2. 多租户架构

**数据隔离**：
- 所有核心表包含 `tenant_id` 字段
- Hibernate Filter 自动注入租户条件
- `TenantContext` 管理当前租户 ID

**租户上下文**：
```java
// 设置租户
TenantContext.setCurrentTenantId(100L);

// 获取租户
Long tenantId = TenantContext.getCurrentTenantId();

// 清除
TenantContext.clear();
```

**自动过滤**：
```yaml
# application.yml
ams:
  tenant:
    enabled: true
    filter-enabled: true
    header-name: X-Tenant-Id
```

### 3. API 层设计

**混合 API 架构**：
- **GraphQL**: 复杂查询（列表、过滤、分页）
- **REST**: 命令操作（创建、更新、删除）

**GraphQL 查询**：
```java
@GraphQLApi
public class UserGraphQLApi {
    @Inject Session session;
    
    @Query("users")
    @Transactional
    public UserConnection users(
        @Name("where") UserFilterInput where,
        @Name("orderBy") List<OrderByInput> orderBy,
        @DefaultValue("0") @Name("page") int page,
        @DefaultValue("20") @Name("size") int size) {
        
        // 使用 Criteria API 动态查询
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<User> query = UserCriteriaTranslator.translate(builder, where, orderBy);
        List<User> users = session.createQuery(query)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .getResultList();
            
        return new UserConnection(users, total, page, size);
    }
}
```

**REST 命令**：
```java
@Path("/api/system/users")
@Produces(MediaType.APPLICATION_JSON)
public class UserController {
    @Inject UserService userService;
    
    @POST
    @RequireRole("ADMIN")
    public Response create(@Valid UserDto request) {
        UserResponseDto user = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }
}
```

### 4. 安全架构

**JWT 认证流程**：
```
1. 用户登录 → 验证凭证 → 生成 JWT Token (RS256)
2. 请求携带 Token → 验证签名 → 提取用户信息
3. TenantContext → 获取当前租户 ID
4. RBAC 检查 → 验证权限 → 允许/拒绝
```

**RBAC 权限**：
- **全局权限**: 系统管理员
- **租户权限**: 业务线管理员
- **功能权限**: 普通用户（菜单/按钮/API）

**权限注解**：
```java
@RequireRole("ADMIN")
@RequirePermission("user:create")
public Response createUser(UserDto dto) { ... }
```

### 5. 分布式缓存

**Hazelcast 集群**：
- Session 共享
- 二级缓存
- 分布式锁（ShedLock）

**配置**：
```yaml
quarkus:
  hibernate-orm:
    unsupported-properties:
      "hibernate.cache.use_second_level_cache": true
      "hibernate.cache.region.factory_class": 
        com.hazelcast.hibernate.HazelcastCacheRegionFactory
```

---

## Data Flow

### 告警接入流程

```
1. 外部系统 → Webhook/API → IngestionController
2. IngestionController → 告警队列 (内存队列)
3. 消费者线程 → 去重 (指纹计算) → 规则评估
4. 规则引擎 → 优先级计算 → 路由决策
5. 持久化 → PostgreSQL (Alarm 实体)
6. 通知分发 → 多渠道 (邮件/短信/IM)
```

### 查询流程

```
前端 React Query
    ↓
GraphQL Client (graphql-request)
    ↓
GraphQL API (/graphql)
    ↓
CriteriaTranslator → JPA Criteria Query
    ↓
Hibernate Filter → 租户过滤
    ↓
PostgreSQL / Oracle
```

---

## External Integrations

### 数据库

**PostgreSQL**（生产推荐）：
```yaml
quarkus:
  datasource:
    jdbc:
      url: jdbc:postgresql://localhost:5432/ams
    username: ams
    password: secret
```

**Oracle**（企业环境）：
```yaml
quarkus:
  datasource:
    jdbc:
      url: jdbc:oracle:thin:@localhost:1521:ORCL
```

### 消息队列（可选）

**Kafka**：
```yaml
quarkus:
  kafka:
    bootstrap-servers: localhost:9092
```

### AI 集成

**LangChain4j + Ollama**：
```java
@ApplicationScoped
public class AlarmAnalysisService {
    @Inject ChatLanguageModel model;
    
    public String analyzeRootCause(Alarm alarm) {
        return model.generate("分析告警根因: " + alarm.getTitle());
    }
}
```

---

## Configuration

### 主配置文件

**application.yml**（关键配置）：
```yaml
quarkus:
  application:
    name: ams-ai
  http:
    port: 8080
  smallrye-graphql:
    root-path: /graphql
    ui:
      enabled: true
  liquibase:
    migrate-at-start: true
    change-log: db/changelog/db.changelog-master.yaml
  micrometer:
    export:
      prometheus:
        enabled: true

ams:
  tenant:
    enabled: true
    header-name: X-Tenant-Id
  auth:
    jwt:
      access-token-expiration: 15M
      refresh-token-expiration: 7D
      issuer: "ams-ai-auth-service"
      algorithm: "RS256"
```

### 前端配置

**vite.config.ts**：
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080' },
      '/graphql': { target: 'http://localhost:8080' }
    }
  }
});
```

---

## Build & Deploy

### 开发环境

**后端**：
```bash
./gradlew quarkusDev  # 热重载开发模式
./gradlew test        # 运行测试
./gradlew liquibaseUpdate  # 数据库迁移
```

**前端**：
```bash
cd app-web
pnpm install  # 安装依赖
pnpm dev      # 开发服务器
pnpm lint     # 代码检查
```

### 生产构建

**后端 JAR**：
```bash
./gradlew build
java -jar app-boot/build/quarkus-app/quarkus-run.jar
```

**原生镜像**（GraalVM）：
```bash
./gradlew build -Dquarkus.native.enabled=true
./target/ams-ai-1.0.0-runner
```

**前端构建**：
```bash
cd app-web
pnpm build  # 产物在 dist/
```

### Docker 部署

```bash
./gradlew quarkusBuild -Dquarkus.container-image.build=true
docker run -d -p 8080:8080 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://db:5432/ams \
  ams-ai:latest
```

---

## Key Design Decisions

1. **单体集群架构**：避免微服务复杂性，通过 Hazelcast 支持水平扩展
2. **GraphQL + REST 混合 API**：GraphQL 用于复杂查询，REST 用于命令操作
3. **Panache Next Repository 模式**：避免 Active Record 模式的贫血领域模型
4. **多租户数据隔离**：Hibernate Filter + tenant_id 实现
5. **Snowflake ID**：分布式唯一 ID 生成器
6. **Liquibase 数据库迁移**：版本控制的数据库演进
7. **JWT RS256 签名**：非对称加密，支持微服务间 Token 验证

---

## Performance Characteristics

- **告警接入吞吐量**: 1000+ TPS
- **告警处理延迟**: < 100ms
- **GraphQL 查询**: 支持动态过滤、分页、排序
- **缓存命中率**: > 80%（Hazelcast 二级缓存）
- **数据库连接池**: HikariCP（默认 10 连接）

---

## Monitoring & Observability

**健康检查**：
```bash
GET /q/health
```

**Prometheus 指标**：
```bash
GET /metrics
```

**日志**：
- SLF4J + Logback
- 结构化日志（JSON 格式）

**分布式追踪**：
- Micrometer Tracing
- Zipkin Reporter

---

## Security Considerations

- **JWT RS256 签名**：非对称加密
- **租户隔离**：数据库级别过滤
- **RBAC 权限**：菜单/按钮/API 三级权限
- **SQL 注入防护**：JPA Criteria API
- **XSS 防护**：React 自动转义
- **CSRF 防护**：JWT Token 机制

---

*Last Updated: 2026-03-01*

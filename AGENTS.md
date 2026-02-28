# AMS-AI AGENTS.md

## OVERVIEW

晶圆厂设备告警管理系统。Java 25 + Quarkus 3.31.2 + Quarkus Panache Next (Repository 模式) 单体集群架构。多租户设计，支持
PostgreSQL/Oracle，Hazelcast 5.4.0 分布式缓存。前端 React 18 + TypeScript 5 + Vite。

**持久层文档**: https://quarkus.io/version/main/guides/hibernate-panache-next

## STRUCTURE
```
ams-ai/
├── gradle/libs.versions.toml        # 依赖版本
├── buildSrc/                        # Gradle插件
├── lib-common/                      # 工具类、异常、DTO、常量
├── lib-persistence/                 # Hibernate实体 (Panache Repository模式)
├── lib-cluster/                     # Hazelcast缓存
├── lib-security/                    # JWT认证、租户上下文
├── feature-core/                    # 告警流水线
├── feature-admin/                   # 管理后台
├── feature-alert-ingestion/         # Webhook/API接入
├── feature-ai-analysis/             # LLM集成
├── feature-notification/            # 通知渠道
├── feature-multi-tenant/            # 多租户扩展
├── app-web/                         # React前端
└── app-boot/                        # Quarkus主程序
```

## CONVENTIONS
- **实体类**: 继承 `BaseEntity` → `PanacheEntityBase`，`public` 字段，实体内嵌 `Repo extends PanacheRepository<Entity>`
- **Repository**: 使用 `Entity_.managedBlocking()` 或 `Entity_.managed()` 访问，支持 `@Find` 注解
- **多租户**: 核心表包含 `tenant_id`，通过 `TenantContext.getCurrentTenantId()` 获取
- **时间戳**: `created_at`, `updated_at` 使用 `@CreationTimestamp`, `@UpdateTimestamp`
- **JSON字段**: `Map<String, Object>` 配合 `@JdbcTypeCode(SqlTypes.JSON)`
- **常量定义**: 嵌套静态类，如 `Constants.Alarm.STATUS_NEW`

## ANTI-PATTERNS

- 禁止微服务拆分 (保持单体集群)
- 禁止直接数据库访问 (必须通过 Repository 层)
- 禁止跨租户数据访问 (使用 TenantContext 过滤)
- 禁止跳过数据库迁移 (必须使用 Liquibase)
- 禁止使用 Lombok (与 Panache 不兼容)

## BUILD & TEST COMMANDS

### 构建命令
```bash
./gradlew build           # 完整构建 (包含测试)
./gradlew build -x test   # 跳过测试构建
./gradlew quarkusDev      # 开发模式 (热重载)
./gradlew quarkusBuild    # 生产构建 (包含原生镜像)
./gradlew clean           # 清理构建
```

### 测试命令 (重点：运行单个测试)
```bash
./gradlew test                                              # 所有测试
./gradlew :feature-core:test                                # 模块测试
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.ApplicationTest"          # 单个测试类
./gradlew :app-boot:test --tests "pro.walkin.ams.boot.ApplicationTest.testMethod"    # 单个方法
./gradlew :lib-persistence:test --tests "*Alarm*Test"       # 模式匹配
./gradlew :app-boot:test --tests "*Test" --debug-jvm        # 调试测试
./gradlew jacocoTestReport                                  # 测试覆盖率报告
```

### 数据库命令
```bash
./gradlew liquibaseUpdate
./gradlew liquibaseRollback
./gradlew liquibaseDiffChangeLog
```

### 前端命令
```bash
cd app-web && pnpm dev      # 开发服务器
cd app-web && pnpm build    # 生产构建
cd app-web && pnpm lint     # ESLint检查
cd app-web && pnpm install  # 安装依赖
```

### 质量检查命令
```bash
./gradlew spotbugsMain                 # SpotBugs分析（当前模块）
./gradlew spotbugsTest                 # 分析测试代码
./gradlew spotbugsAll                  # 分析所有模块
./gradlew :模块名:spotbugsMain         # 指定模块分析
./gradlew check                        # 运行所有检查任务
```

### 代码格式化命令
```bash
./gradlew spotlessApply                 # 格式化所有Java文件
./gradlew spotlessCheck                 # 验证代码格式（CI用）
```

## CODE STYLE GUIDELINES

### 文件组织
- **包结构**: `pro.walkin.ams.{module}.{layer}` (entity, repository, service, controller, config)
- **导入顺序**: Java标准库 → 第三方库 → 项目内部导入
- **编码**: UTF-8
- **缩进**: 2个空格 (无 Tab)
- **行宽**: 120字符
- **格式化**: 推荐使用 google-java-format

### 命名约定
- **类/接口**: `PascalCase` (`AlarmService`)
- **方法**: `camelCase` (`getAlarmById`)
- **变量**: `camelCase` (`alarmId`)
- **常量**: `UPPER_SNAKE_CASE` (`ALARM_STATUS_NEW`)
- **数据库字段**: `snake_case` (`tenant_id`, `created_at`)

### 实体规范 (Quarkus Panache Next)
```java
@Entity
@Table(name = "alarms")
public class Alarm extends BaseEntity {
    @Column(name = "title")
    public String title;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    public Map<String, Object> metadata;
    
    public interface Repo extends PanacheRepository<Alarm> {
        @Find
        Stream<Alarm> findBySourceId(String sourceId);
    }
}
```

### 类型与注解
- **实体**: `class` 继承 `BaseEntity`，字段 `public`，内嵌 `Repo` 接口
- **Quarkus注解**: `@Inject`, `@ApplicationScoped`, `@Path`, `@GET`, `@POST`
- **事务**: `@Transactional` (Service 层)
- **缓存**: `@Cacheable`, `@CacheInvalidate` 配合 Hazelcast
- **验证**: Jakarta Validation `@NotNull`, `@Size`, `@Email`

### 测试规范
- **测试类命名**: `{被测类名}Test` (`AlarmServiceTest`)
- **测试方法命名**: `test{场景}_{预期}` 或 `should{行为}When{条件}`
- **测试框架**: JUnit 5，`@QuarkusTest` 集成测试，Testcontainers 管理测试数据库
- **断言**: AssertJ (`assertThat(...).isEqualTo(...)`)
- **Mock**: Mockito (`@Mock`, `when`, `verify`)

### 错误处理
- **自定义异常**: 继承 `BaseException` (在 `lib-common` 中定义)
- **异常类型**: `NotFoundException`, `BusinessException`, `ValidationException`
- **全局处理**: 使用 `@Provider` 和 `ExceptionMapper`
- **日志**: SLF4J

### 前端规范

- **框架**: React 18 + TypeScript 5 + Vite
- **UI库**: @ui5/webcomponents-react
- **状态管理**: Zustand
- **路由**: React Router 7
- **路径别名**: `@/*` → `src/*`
- **API客户端**: Axios
- **TypeScript**: strict 模式，noUnusedLocals，noUnusedParameters

## DEVELOPMENT WORKFLOW
- **分支**: 主分支 `main`，功能 `feature/*`，修复 `fix/*`
- **提交**: 约定式提交 (`feat:`, `fix:`, `docs:`, `chore:`)
- **审查**: 所有变更需通过 PR 审查
- **部署**: 单体 JAR 包含前端资源，支持 GraalVM 原生镜像

## AGENT GUIDANCE
- **工作流**: 遵循"分析→计划→实施→验证"循环
- **代码生成**: 必须遵循现有模式和约定
- **测试驱动**: 新功能必须包含相应测试
- **文档更新**: 修改代码时同步更新相关文档

## SKILLS 规范

### 目录结构
- **存放位置**: 所有 skills 存放在 `.agents/skills/` 目录下，每个 skill 有独立的子文件夹
- **链接方式**: 通过符号链接（symlink）将 skills 链接到 `.claude/skills/` 目录
- **文件命名**: 每个 skill 文件夹包含 `SKILL.md` 文件

```
.agents/skills/
├── frontend-development/SKILL.md
├── frontend-ui-verification/SKILL.md
├── graphql-rest-architecture/SKILL.md
├── vercel-react-best-practices/SKILL.md
└── ...

.claude/skills/  (符号链接)
├── frontend-development -> ../../.agents/skills/frontend-development
├── frontend-ui-verification -> ../../.agents/skills/frontend-ui-verification
├── graphql-rest-architecture -> ../../.agents/skills/graphql-rest-architecture
└── ...
```

### 编写规范
- **语言**: Skills 内容使用英文编写，确保通用性和可维护性

---
*最后更新: 2026年2月28日

## AGENTS.md 子目录索引

### lib-common/

- 异常处理框架：BaseException、BusinessException、ValidationException、NotFoundException
- 权限常量定义：前端权限码、错误码常量
- DTO：用户、角色、权限相关数据传输对象

### lib-persistence/

- Hibernate实体层：Panache Repository模式实现
- 多租户数据访问：Entity_.*managedBlocking()调用模式
- Liquibase数据库迁移：表结构和默认数据定义

### feature-admin/

- 管理后台：用户、角色、权限、菜单CRUD功能
- 权限过滤：手动租户过滤实现
- 前端页面：React组件与API集成

### feature-graphql/

- GraphQL API：Users、Roles、Menus、Dict 查询
- Connection 类型：分页响应封装
- FilterInput：动态过滤条件
- CriteriaTranslator：JPA Criteria 查询转换
- CriteriaFilterHelper：通用谓词构建器

### lib-security/

- JWT认证：TokenService、AuthenticationService
- 租户上下文：TenantContext管理
- RBAC权限：RbacService、SecurityConfig初始化*

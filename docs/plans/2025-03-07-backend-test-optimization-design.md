# AMS-AI 后端测试代码优化设计文档

## 文档信息
- **日期**: 2025-03-07
- **主题**: 后端测试代码现代化改造
- **状态**: 已批准

## 1. 现状分析

### 1.1 问题总结

通过对 19 个测试类的分析，发现以下主要问题：

1. **硬编码测试数据**：多处使用硬编码凭据（`"admin"/"admin123"`）
2. **测试顺序依赖**：`UserControllerE2EIT` 使用 `@Order` 导致强耦合
3. **断言风格不统一**：混合使用 JUnit 原生断言和 AssertJ
4. **异常测试不规范**：使用 try-catch 而非 AssertJ 的 `assertThatThrownBy()`
5. **缺少参数化测试**：重复的空值检查可用 `@ParameterizedTest` 合并
6. **测试分层不清晰**：集成测试与 E2E 测试边界模糊
7. **测试覆盖率不足**：部分 Service 仅测试边缘场景

### 1.2 当前测试分布

```
├── feature-admin (9 个测试类)
│   ├── service 层测试: TokenServiceTest, PasswordServiceTest, AuthenticationServiceTest
│   ├── controller 层测试: RoleControllerTest
│   └── system 测试: RoleServiceTest, PermissionServiceTest, RbacServiceTest, MenuServiceTest
├── feature-alert-ingestion (1 个测试类)
│   └── SourceStatusServiceTest
└── app-boot (9 个测试类)
    ├── E2E 测试: *E2EIT (6 个)
    ├── 集成测试: ApplicationIT
    ├── 契约测试: *PactProviderTest
    └── 基础测试: TenantRoleFilterTest
```

## 2. 设计方案

### 2.1 测试分层策略

根据多模块架构特点，采用分层测试策略：

| 模块类型 | 单元测试 | 组件测试 | 集成测试 | 说明 |
|---------|---------|---------|---------|------|
| **lib-*** | ✅ JUnit | ❌ | ❌ | 纯工具类，无外部依赖 |
| **feature-*** | ✅ Mockito | ✅ `@QuarkusComponentTest` | ❌ | 业务逻辑 + Controller |
| **app-boot** | ❌ | ❌ | ✅ `@QuarkusTest` | 全应用集成测试 |

### 2.2 模块测试目录结构

```
# lib-common / lib-persistence / lib-cluster
src/test/java/
└── pro/walkin/ams/{module}/
    └── util/FeatureUtilTest.java          # 纯 JUnit，无 Spring/Quarkus

# feature-admin / feature-core / feature-alert-ingestion  
src/test/java/
├── unit/
│   └── service/UserServiceUnitTest.java   # Mockito 纯单元测试
└── component/
    ├── service/UserServiceComponentTest.java       # @QuarkusComponentTest
    └── controller/UserControllerComponentTest.java # @QuarkusComponentTest + @InjectMock

# app-boot
src/test/java/pro/walkin/ams/boot/
├── integration/                           # @QuarkusTest
│   ├── AuthIntegrationTest.java
│   └── UserIntegrationTest.java
└── support/                               # 测试基础设施
    ├── TestDataFactory.java
    └── PostgresTestResource.java
```

### 2.3 测试命名规范

| 后缀 | 类型 | 注解 | 用途 |
|-----|------|------|------|
| `*UnitTest` | 单元测试 | 纯 JUnit + Mockito | 单个方法的逻辑验证 |
| `*ComponentTest` | 组件测试 | `@QuarkusComponentTest` | 带依赖注入的组件测试 |
| `*IntegrationTest` | 集成测试 | `@QuarkusTest` | 全应用 API 测试（仅限 app-boot） |

### 2.4 关键改进措施

#### 2.4.1 消除硬编码
- 创建 `TestConstants` 类统一管理测试常量
- 使用 `TestDataBuilder` 流式构造测试数据
- 敏感信息（密码、密钥）使用 `@TestConfigProperty` 注入

#### 2.4.2 消除测试依赖
- 移除所有 `@Order` 注解
- 每个测试独立准备数据（`@BeforeEach`）
- 使用 `@Transactional` + `@Rollback` 自动清理

#### 2.4.3 统一断言风格
- 100% 使用 AssertJ
- 自定义断言扩展（如 JWT 验证）
- 异常测试统一使用 `assertThatThrownBy()`

#### 2.4.4 引入参数化测试
- 相似的空值检查使用 `@ParameterizedTest`
- 状态流转测试使用 `@EnumSource`

#### 2.4.5 HTTP 测试现代化
- 使用 **RestAssured** 替代原生 HttpClient
- 封装通用的请求构建器

## 3. 实施计划

### Phase 1: 基础设施（高优先级）

1. **创建测试常量类**
   - 文件: `app-boot/src/test/java/pro/walkin/ams/boot/support/TestConstants.java`
   - 内容: 测试用户、密码、租户ID等常量

2. **创建测试数据构造器**
   - 文件: `app-boot/src/test/java/pro/walkin/ams/boot/support/TestDataBuilder.java`
   - 内容: 流式 API 构建 User、Role、Permission 等实体

3. **引入 RestAssured**
   - 在 `app-boot/build.gradle.kts` 添加依赖
   - 创建 `RestAssuredTestBase` 替代 `E2ETestBase`

### Phase 2: 单元测试优化（高优先级）

1. **优化 TokenServiceTest**
   - 添加 JWT 内容解析验证（不只是格式）
   - 使用参数化测试验证不同用户场景

2. **优化 RbacServiceTest**
   - 补充核心业务逻辑测试
   - 使用 Mockito 模拟 Repository

### Phase 3: 组件测试重构（中优先级）

1. **优化 MenuServiceTest**
   - 将空值检查改为参数化测试
   - 添加正常业务流程测试

2. **重构 RoleControllerTest**
   - 已经是良好范例，可作为模板

### Phase 4: 集成测试重构（中优先级）

1. **重构 UserControllerE2EIT**
   - 重命名为 `UserControllerIntegrationTest`
   - 移除 `@Order` 依赖
   - 每个测试独立创建用户

2. **统一认证流程**
   - 修复硬编码 token 问题
   - 实现真实的登录流程

### Phase 5: 代码质量（低优先级）

1. **删除重复测试**
   - 检查并合并 feature-admin 中的重复 Service 测试

2. **清理废弃类**
   - 移除不再使用的测试工具类

## 4. 验证标准

1. 所有测试使用 AssertJ 断言
2. 没有 `@Order` 注解的测试
3. 没有硬编码的测试数据（除了 uuid）
4. 每个测试类独立运行通过
5. 整体测试执行时间不增加超过 10%

## 5. 风险与回滚

### 5.1 风险
- 重构可能破坏现有 CI/CD 流程
- 新的 RestAssured 学习成本

### 5.2 缓解措施
- 分阶段实施，每个阶段单独 PR
- 保持向后兼容，逐步迁移
- 新测试和旧测试并行运行直到完全迁移

### 5.3 回滚方案
- 使用 git 分支管理，每个 Phase 独立分支
- 发现问题可快速回滚到上一稳定版本

## 6. 附录

### 6.1 相关文件清单

```
需要修改的测试类：
├── feature-admin/src/test/java/pro/walkin/ams/admin/
│   ├── auth/service/TokenServiceTest.java
│   ├── auth/service/PasswordServiceTest.java
│   ├── auth/service/AuthenticationServiceTest.java
│   ├── system/RoleControllerTest.java
│   ├── system/RoleServiceTest.java
│   ├── system/PermissionServiceTest.java
│   ├── system/service/RbacServiceTest.java
│   └── system/service/MenuServiceTest.java
├── feature-alert-ingestion/src/test/java/pro/walkin/ams/ingestion/
│   └── SourceStatusServiceTest.java
└── app-boot/src/test/java/pro/walkin/ams/boot/
    ├── it/auth/AuthFlowE2EIT.java
    ├── it/auth/AuthControllerE2EIT.java
    ├── it/system/MenuControllerE2EIT.java
    ├── it/system/PermissionControllerE2EIT.java
    ├── it/system/RoleControllerE2EIT.java
    ├── it/system/UserControllerE2EIT.java
    ├── it/graphql/UserGraphQLApiE2EIT.java
    └── support/E2ETestBase.java
```

### 6.2 参考文档

- [Quarkus Testing Guide](https://quarkus.io/guides/getting-started-testing)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [RestAssured Wiki](https://github.com/rest-assured/rest-assured/wiki/Usage)

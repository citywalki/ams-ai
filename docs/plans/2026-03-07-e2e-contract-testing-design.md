# E2E 测试与契约测试设计方案

**日期**: 2026-03-07  
**状态**: 已批准  
**作者**: AI Assistant  

---

## 1. 概述

### 1.1 目标

在 monorepo 架构下，为 AMS 项目建立完整的端到端（E2E）测试和契约测试体系，实现：

- **全量 API 覆盖**: 所有 REST 和 GraphQL API 端点
- **前后端契约一致性**: 确保前端期望与后端实现同步
- **快速反馈**: 在 CI/CD 中自动验证 API 兼容性

### 1.2 现状分析

| 层级 | 现状 | 需求 |
|------|------|------|
| 单元测试 | ✅ 已存在 (`feature-*/src/test/`) | 保持不变 |
| 集成测试 | ⚠️ 已存在 (`app-boot/src/test/it/`) | 扩展为完整 E2E |
| E2E 测试 | ❌ 不完整 | 全量覆盖 |
| 契约测试 | ❌ 不存在 | 新增 Pact 测试 |

---

## 2. 架构设计

### 2.1 测试金字塔

```
          ┌─────────────────┐
          │   E2E 测试      │  ← Playwright (前端) + Quarkus Test (后端)
          │  (数量: 少)     │
          └────────┬────────┘
                   │ HTTP / 契约验证
          ┌────────▼────────┐
          │   集成测试      │  ← 无 (合并入 E2E)
          │  (数量: 中)     │
          └────────┬────────┘
                   │
          ┌────────▼────────┐
          │   单元测试      │  ← JUnit + Mockito
          │  (数量: 多)     │
          └─────────────────┘
```

### 2.2 两层测试架构

采用**简化两层**设计，避免目录冗余：

```
┌─────────────────────────────────────────────────────────────┐
│  单元测试层                                                  │
│  位置: feature-*/src/test/                                  │
│  技术: @QuarkusTest + @InjectMock                           │
│  范围: 单类测试，mock 外部依赖                              │
│  执行: ./gradlew test                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  E2E 测试层                                                  │
│  位置: app-boot/src/test/it/                                │
│  技术: @QuarkusTest + Testcontainers + REST Client          │
│  范围: 完整 HTTP 链路，真实数据库                           │
│  执行: ./gradlew :app-boot:test -PrunIntegrationTests       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

### 3.1 后端 E2E 测试

```
app-boot/src/test/java/pro/walkin/ams/boot/
│
├── it/                                           # E2E 测试目录
│   ├── auth/
│   │   ├── AuthControllerE2EIT.java             # /api/auth/login, /api/auth/logout, etc.
│   │   └── AuthFlowE2EIT.java                   # 完整认证流程测试
│   │
│   ├── system/
│   │   ├── UserControllerE2EIT.java             # /api/system/users/*
│   │   ├── RoleControllerE2EIT.java             # /api/system/roles/*
│   │   ├── PermissionControllerE2EIT.java       # /api/system/permissions/*
│   │   ├── MenuControllerE2EIT.java             # /api/system/menus/*
│   │   └── dict/
│   │       ├── DictCategoryControllerE2EIT.java # /api/system/dict/categories/*
│   │       ├── DictItemControllerE2EIT.java     # /api/system/dict/items/*
│   │       └── DictPublicControllerE2EIT.java   # /api/dict/*
│   │
│   ├── graphql/
│   │   ├── UserGraphQLApiE2EIT.java             # users 查询
│   │   ├── RoleGraphQLApiE2EIT.java             # roles 查询
│   │   ├── MenuGraphQLApiE2EIT.java             # menus 查询
│   │   ├── PermissionGraphQLApiE2EIT.java       # permissions 查询
│   │   ├── DictGraphQLApiE2EIT.java             # dictCategories, dictItems 查询
│   │   └── AlarmGraphQLApiE2EIT.java            # alarms 查询
│   │
│   └── support/                                  # 共享支持类
│       ├── E2ETestBase.java                      # 基类：认证、租户设置、数据库清理
│       ├── TestDataFactory.java                  # 测试数据工厂
│       └── E2EResponseMatchers.java              # 自定义 AssertJ 断言
│
└── pacts/                                        # 契约验证测试
    ├── AuthPactProviderTest.java                 # 验证 auth 契约
    ├── UserPactProviderTest.java                 # 验证 users 契约
    └── RolePactProviderTest.java                 # 验证 roles 契约
```

### 3.2 前端 E2E 测试

```
app-web/
├── e2e/
│   ├── specs/                                    # Playwright 测试用例
│   │   ├── auth.spec.ts                          # 登录/登出流程
│   │   ├── user-management.spec.ts               # 用户管理 CRUD
│   │   ├── role-management.spec.ts               # 角色管理 CRUD
│   │   ├── permission-management.spec.ts         # 权限管理
│   │   ├── menu-management.spec.ts               # 菜单管理
│   │   ├── dict-management.spec.ts               # 字典管理
│   │   └── alarm-management.spec.ts              # 告警管理
│   │
│   ├── pages/                                    # Page Object Models
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── UserListPage.ts
│   │   ├── UserFormPage.ts
│   │   ├── RoleListPage.ts
│   │   └── ...
│   │
│   ├── fixtures/                                 # 测试数据
│   │   ├── users.ts                              # 用户测试数据
│   │   ├── roles.ts                              # 角色测试数据
│   │   └── api-mocks.ts                          # API mock 数据
│   │
│   └── pacts/                                    # 生成的契约文件（提交到仓库）
│       ├── auth-login.json                       # 登录契约
│       ├── auth-logout.json                      # 登出契约
│       ├── users-list.json                       # 用户列表契约
│       ├── users-create.json                     # 用户创建契约
│       ├── roles-list.json                       # 角色列表契约
│       └── ...
│
├── playwright.config.ts                          # Playwright 配置
└── pact.config.ts                                # Pact Consumer 配置
```

---

## 4. 技术选型

### 4.1 后端技术栈

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Quarkus Test | 3.31.2 | 测试框架 | 原生支持，与生产一致 |
| Testcontainers | 2.0.3 | 数据库容器 | 提供真实 PostgreSQL 环境 |
| Quarkus REST Client | 3.31.2 | HTTP 客户端 | 类型安全，编译期检查 |
| Pact JVM | 4.6.x | 契约验证 | 业界标准，支持 Provider 验证 |
| AssertJ | 3.25.3 | 断言库 | 流畅 API，已在使用 |
| JUnit 5 | 5.10.2 | 测试运行器 | 标准选择 |

### 4.2 前端技术栈

| 技术 | 版本 | 用途 | 理由 |
|------|------|------|------|
| Playwright | 1.58.x | E2E 测试 | 已存在，功能强大 |
| Pact JS | 13.x | Consumer 测试 | 与后端 Pact 兼容 |
| TypeScript | 5.9.x | 类型安全 | 项目标准 |

### 4.3 为什么不选 REST Assured？

虽然 REST Assured 是流行的 HTTP 测试库，但在 Quarkus 生态中，**Quarkus REST Client** 是更好的选择：

**Quarkus REST Client 优势：**
- ✅ 编译期类型检查
- ✅ IDE 自动补全
- ✅ 自动 JSON 序列化/反序列化
- ✅ 与 Quarkus 配置、安全、拦截器集成
- ✅ 无额外依赖

**REST Assured 缺点：**
- ❌ 运行时类型错误风险
- ❌ 字符串路径，易出错
- ❌ 额外依赖

---

## 5. 契约测试设计

### 5.1 契约文件流转

由于 monorepo 结构，**不需要 Pact Broker**：

```
┌────────────────────────────────────────────────────────────┐
│  前端 Consumer 测试 (Playwright + Pact JS)                 │
│  1. 定义期望的请求/响应                                     │
│  2. mock 后端返回                                           │
│  3. 生成契约文件                                            │
└──────────────────────────┬─────────────────────────────────┘
                           │ 提交到 Git
                           ▼
        app-web/e2e/pacts/*.json
                           │
                           ▼
┌──────────────────────────┬─────────────────────────────────┐
│  后端 Provider 验证 (Pact JVM)                             │
│  1. 读取契约文件                                            │
│  2. 启动真实服务                                            │
│  3. 重放契约请求                                            │
│  4. 验证响应匹配                                            │
└──────────────────────────┴─────────────────────────────────┘
```

### 5.2 契约文件格式示例

```json
{
  "consumer": {
    "name": "ams-web"
  },
  "provider": {
    "name": "ams-api"
  },
  "interactions": [
    {
      "description": "用户登录成功",
      "providerState": "用户存在且密码正确",
      "request": {
        "method": "POST",
        "path": "/api/auth/login",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "username": "admin",
          "password": "password123"
        }
      },
      "response": {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "accessToken": "eyJhbGc...",
          "refreshToken": "eyJhbGc...",
          "expiresIn": 3600,
          "tokenType": "Bearer"
        },
        "matchingRules": {
          "$.body.accessToken": {
            "match": "type"
          },
          "$.body.refreshToken": {
            "match": "type"
          }
        }
      }
    }
  ],
  "metadata": {
    "pactSpecification": {
      "version": "3.0.0"
    }
  }
}
```

---

## 6. 测试数据管理

### 6.1 数据策略

每个 E2E 测试类独立管理数据，测试后清理：

```java
@QuarkusTest
class UserControllerE2EIT {
    
    @BeforeEach
    void setUp() {
        // 创建测试数据
        testUser = TestDataFactory.createUser("test_user_" + UUID.randomUUID());
    }
    
    @AfterEach
    void tearDown() {
        // 清理测试数据
        TestDataFactory.deleteUser(testUser.id);
    }
    
    @Test
    void shouldCreateUser() { ... }
}
```

### 6.2 数据工厂

```java
public class TestDataFactory {
    
    public static User createUser(String username) {
        return User.builder()
            .username(username)
            .email(username + "@test.com")
            .role("USER")
            .build();
    }
    
    public static Role createRole(String code) {
        return Role.builder()
            .code(code)
            .name("Test " + code)
            .build();
    }
    
    // 清理方法
    public static void deleteUser(Long id) { ... }
    public static void deleteRole(Long id) { ... }
}
```

---

## 7. 测试执行策略

### 7.1 本地开发

```bash
# 1. 运行单元测试（快速）
./gradlew test

# 2. 运行 E2E 测试（需要 Docker）
./gradlew :app-boot:test -PrunIntegrationTests

# 3. 运行契约验证
./gradlew :app-boot:test --tests "*PactProviderTest"

# 4. 运行前端 E2E（生成契约）
cd app-web && pnpm e2e

# 5. 仅验证契约（不生成新契约）
cd app-web && pnpm e2e:verify
```

### 7.2 CI/CD 集成

```yaml
# .github/workflows/test.yml
jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Unit Tests
        run: ./gradlew test

  e2e-test:
    runs-on: ubuntu-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - name: Start PostgreSQL Container
        run: docker run -d -p 5432:5432 postgres:16-alpine
      - name: Run E2E Tests
        run: ./gradlew :app-boot:test -PrunIntegrationTests
      - name: Run Pact Provider Tests
        run: ./gradlew :app-boot:test --tests "*PactProviderTest"

  frontend-e2e:
    runs-on: ubuntu-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - name: Install Dependencies
        run: cd app-web && pnpm install
      - name: Generate Pacts
        run: cd app-web && pnpm e2e
      - name: Check Pact Changes
        run: git diff --exit-code app-web/e2e/pacts/ || echo "Pacts updated"
```

---

## 8. 错误处理与边界情况

### 8.1 测试失败诊断

| 失败类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 契约验证失败 | 后端 API 变更 | 检查契约差异，更新或回滚 |
| E2E 测试失败 | 数据库状态污染 | 确保清理逻辑正确 |
| 前端 E2E 失败 | UI 变更 | 更新 Page Objects |
| 超时失败 | 性能问题 | 增加超时或优化性能 |

### 8.2 重试机制

```java
@Test
@RetryOnFailure(attempts = 3, delay = 1000)
void shouldCreateUserWithRetry() { ... }
```

---

## 9. 维护与演进

### 9.1 新增 API 的流程

1. **开发阶段**: 编写单元测试（`feature-*/src/test/`）
2. **联调阶段**: 更新前端 E2E，生成新契约
3. **验证阶段**: 后端 Provider 验证契约
4. **部署阶段**: CI 全量测试通过

### 9.2 契约变更管理

- **向后兼容**: 允许新增字段，不允许删除或修改现有字段
- **契约版本**: 使用 Git 历史追踪，无需显式版本号
- **破坏性变更**: 需要同时更新前后端，一次性合并

---

## 10. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 测试运行时间过长 | CI 反馈慢 | 并行执行，选择性运行 |
| 测试不稳定 | 误报 | 重试机制，稳定环境 |
| 契约文件过多 | 仓库膨胀 | 定期归档，只保留有效契约 |
| 维护成本高 | 开发效率低 | 代码生成，自动化 |

---

## 11. 成功标准

- [ ] 所有 REST API 端点有 E2E 测试
- [ ] 所有 GraphQL 查询有 E2E 测试
- [ ] 核心业务流程有前端 E2E 测试
- [ ] 所有 API 有契约测试
- [ ] CI 中测试通过率 > 95%
- [ ] 测试运行时间 < 10 分钟

---

## 12. 附录

### 12.1 参考文档

- [Quarkus Testing Guide](https://quarkus.io/guides/getting-started-testing)
- [Quarkus REST Client](https://quarkus.io/guides/rest-client)
- [Pact Documentation](https://docs.pact.io/)
- [Playwright Documentation](https://playwright.dev/)

### 12.2 术语表

| 术语 | 定义 |
|------|------|
| E2E | End-to-End，端到端测试 |
| Pact | 消费者驱动契约测试框架 |
| Consumer | 契约测试中的调用方（前端） |
| Provider | 契约测试中的提供方（后端） |
| Testcontainers | 测试中使用的容器化技术 |
| REST Client | Quarkus 的类型安全 HTTP 客户端 |

---

**批准日期**: 2026-03-07  
**实施状态**: 待执行

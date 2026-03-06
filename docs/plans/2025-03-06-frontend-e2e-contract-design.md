# 前端 E2E 测试与契约测试设计方案（单仓库版）

**日期**: 2025-03-06  
**阶段**: 阶段 2 - 契约测试（前后端协作）  
**目标**: 实现不依赖服务启动的 E2E 测试 + API 契约验证  
**约束**: 前后端在同一 Git 仓库

---

## 1. 方案概述

本方案针对**单仓库（Monorepo）**环境优化，通过**文件共享**方式传递契约，无需 Pact Broker，简化协作流程。

### 核心优势

- ✅ **无需外部服务**：不需要 Pact Broker，契约文件直接提交到 Git
- ✅ **原子性变更**：同一个 PR 可以同时修改前后端契约
- ✅ **快速反馈**：前端 Mock 测试秒级启动
- ✅ **CI 集成**：自动验证契约兼容性
- ✅ **双协议支持**：同时支持 REST API 和 GraphQL 契约验证

---

## 2. 整体架构

```
┌────────────────────────────────────────────────────────────────┐
│                     单仓库 E2E 架构                             │
│                      (ams-ai 项目)                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────┐          ┌────────────────────┐       │
│  │   app-web/         │          │   app-boot/        │       │
│  │   (Frontend)       │          │   (Backend)        │       │
│  │                    │          │                    │       │
│  │  ┌──────────────┐  │          │  ┌──────────────┐  │       │
│  │  │ E2E Tests    │──┼───┐      │  │ Provider     │  │       │
│  │  │ (Playwright) │  │   │      │  │ Tests        │  │       │
│  │  └──────────────┘  │   │      │  └──────────────┘  │       │
│  │         │          │   │      │         ▲          │       │
│  │         ▼          │   │      │         │          │       │
│  │  ┌──────────────┐  │   │      │  ┌──────┴──────┐   │       │
│  │  │ Pact JS      │──┼───┼──────┼─▶│ Pact JVM    │   │       │
│  │  │ (Mock)       │  │   │      │  │ (Verify)    │   │       │
│  │  └──────────────┘  │   │      │  └─────────────┘   │       │
│  │         │          │   │      │                    │       │
│  │         ▼          │   │      │                    │       │
│  │  ┌──────────────┐  │   │      └────────────────────┘       │
│  │  │ Contract     │──┼───┘                                     │
│  │  │ Files        │  │                                         │
│  │  │ (*.pact.json)│  │                                         │
│  │  └──────────────┘  │                                         │
│  │         │          │                                         │
│  │         ▼          │                                         │
│  │  ┌──────────────┐  │                                         │
│  │  │ contracts/   │  │  ◀── 共享契约目录                       │
│  │  │ (Git 管理)    │  │                                         │
│  │  └──────────────┘  │                                         │
│  └────────────────────┘                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**数据流**：
1. 前端编写 E2E 测试，Pact JS 生成契约文件
2. 契约文件保存到 `contracts/` 目录并提交到 Git
3. 后端直接从文件系统加载契约文件验证
4. CI 中自动验证：前端 E2E + 后端契约验证

---

## 3. 共享契约目录

### 3.1 目录位置

```
ams-ai/
├── contracts/                      # 共享契约目录（新增）
│   └── pacts/                      # Pact 契约文件
│       ├── ams-web-ams-api.json   # 前端-后端契约
│       └── README.md               # 契约说明
├── app-web/                        # 前端项目
│   └── e2e/
│       └── mocks/
│           └── pact/               # Pact 配置
│               ├── setup.ts
│               └── contracts/      # 生成契约到此处，再复制到根目录
├── app-boot/                       # 后端项目
│   └── src/test/
│       └── resources/
│           └── pacts/              # 从根目录 contracts/ 软链接或复制
└── .github/
    └── workflows/
        └── contract-test.yml       # 契约验证 CI
```

### 3.2 契约文件结构

**contracts/pacts/ams-web-ams-api.json**:

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
      "description": "使用有效凭据登录",
      "providerState": "用户已存在",
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
          "success": true,
          "data": {
            "token": "jwt.token.here",
            "user": {
              "id": 1,
              "username": "admin",
              "role": "admin"
            }
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

### 3.3 GraphQL 契约文件示例

**GraphQL 契约与 REST 的区别**：
- 所有请求都发送到 `/graphql` endpoint
- 通过 `body.query` 区分不同操作
- `body.variables` 传递参数

**contracts/pacts/ams-web-ams-api.json (GraphQL 片段)**:

```json
{
  "consumer": { "name": "ams-web" },
  "provider": { "name": "ams-api" },
  "interactions": [
    {
      "description": "GetUsers Query",
      "providerState": "用户列表已存在",
      "request": {
        "method": "POST",
        "path": "/graphql",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer token"
        },
        "body": {
          "query": "query GetUsers($where: UserFilter, $page: Int, $size: Int) { users(where: $where, page: $page, size: $size) { content { id username email status roles { id code name } lastLoginAt createdAt updatedAt } totalElements totalPages page size } }",
          "variables": {
            "where": {},
            "page": 0,
            "size": 20
          }
        }
      },
      "response": {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "data": {
            "users": {
              "content": [
                {
                  "id": 1,
                  "username": "admin",
                  "email": "admin@test.com",
                  "status": "active",
                  "roles": [
                    {
                      "id": 1,
                      "code": "admin",
                      "name": "管理员"
                    }
                  ],
                  "lastLoginAt": "2024-01-01T00:00:00Z",
                  "createdAt": "2024-01-01T00:00:00Z",
                  "updatedAt": "2024-01-01T00:00:00Z"
                }
              ],
              "totalElements": 1,
              "totalPages": 1,
              "page": 0,
              "size": 20
            }
          }
        }
      }
    }
  ]
}
```

---

## 4. 前端实施内容

### 4.1 新增依赖

**app-web/package.json**:

```json
{
  "devDependencies": {
    "@pact-foundation/pact": "^12.0.0",
    "@faker-js/faker": "^9.0.0",
    "factory.ts": "^1.4.0",
    "tsx": "^4.0.0"
  }
}
```

安装命令：
```bash
cd app-web
pnpm add -D @pact-foundation/pact @faker-js/faker factory.ts tsx
```

### 4.2 目录结构

```
app-web/e2e/
├── mocks/                          # Mock 层
│   ├── handlers/                   # API Mock 处理器
│   │   ├── auth-handlers.ts        # REST: 认证 API
│   │   ├── user-handlers.ts        # REST: 用户 API
│   │   ├── graphql-handlers.ts     # GraphQL: 统一处理
│   │   └── index.ts                # 统一导出
│   ├── data/                       # 测试数据工厂
│   │   ├── user.factory.ts
│   │   ├── auth.factory.ts
│   │   └── index.ts
│   └── pact/                       # 契约相关
│       ├── setup.ts                # Pact 配置
│       ├── copy-contracts.ts       # 复制契约到根目录
│       └── contracts/              # 本地生成目录
│           └── (gitignore)
├── pages/                          # Page Objects
├── components/
├── fixtures/
├── utils/
├── specs/
│   ├── smoke/
│   ├── regression/
│   └── contract/                   # 契约测试专用
│       ├── rest/                   # REST API 契约
│       └── graphql/                # GraphQL 契约
├── setup/
│   ├── global-setup.ts
│   └── mock-setup.ts
└── playwright.config.ts
```

### 4.3 Pact 配置

**e2e/mocks/pact/setup.ts**:

```typescript
import { Pact } from '@pact-foundation/pact';
import path from 'path';

const CONTRACTS_DIR = path.resolve(process.cwd(), '../../contracts/pacts');

export const provider = new Pact({
  consumer: 'ams-web',
  provider: 'ams-api',
  port: 1234,
  log: path.resolve(process.cwd(), 'e2e/logs/pact.log'),
  dir: CONTRACTS_DIR,                    // 直接生成到根目录 contracts/
  logLevel: 'info',
  pactfileWriteMode: 'merge',
});

// 简化的契约配置（不需要 Broker）
export const mockProvider = new Pact({
  consumer: 'ams-web',
  provider: 'ams-api',
  port: 1234,
  log: path.resolve(process.cwd(), 'e2e/logs/pact-mock.log'),
  dir: path.resolve(process.cwd(), 'e2e/mocks/pact/contracts'),
  logLevel: 'warn',
  pactfileWriteMode: 'update',
});
```

### 4.4 复制契约脚本

**e2e/mocks/pact/copy-contracts.ts**:

```typescript
import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve(process.cwd(), 'e2e/mocks/pact/contracts');
const targetDir = path.resolve(process.cwd(), '../../contracts/pacts');

function copyContracts() {
  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 复制所有契约文件
  const files = fs.readdirSync(sourceDir);
  
  for (const file of files) {
    if (file.endsWith('.pact.json')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file.replace('.pact.json', '.json'));
      
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Copied ${file} to contracts/pacts/`);
    }
  }
  
  console.log('Contracts copied successfully!');
}

copyContracts();
```

### 4.5 数据工厂

**e2e/mocks/data/user.factory.ts**:

```typescript
import { Factory } from 'factory.ts';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

// 使用 Zod 定义 schema（与后端共享类型）
export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  status: z.enum(['active', 'inactive', 'locked']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// 工厂生成
export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: sequence,
  username: faker.internet.userName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(['admin', 'user', 'guest']),
  status: 'active',
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

// 预定义用户（用于 E2E 测试）
export const predefinedUsers = {
  admin: userFactory.build({
    id: 1,
    username: 'test-admin',
    email: 'admin@test.com',
    role: 'admin',
  }),
  user: userFactory.build({
    id: 2,
    username: 'test-user',
    email: 'user@test.com',
    role: 'user',
  }),
};
```

### 4.6 Mock Handler

**e2e/mocks/handlers/auth-handlers.ts**:

```typescript
import { Page } from '@playwright/test';
import { predefinedUsers } from '../data/user.factory';

export function setupAuthMocks(page: Page) {
  // 登录 API
  page.route('**/api/auth/login', async (route, request) => {
    const { username, password } = await request.postDataJSON();
    
    const user = Object.values(predefinedUsers).find(u => u.username === username);
    
    if (user && password === 'Test@123456') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            token: `mock-jwt-token-${Date.now()}`,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
            },
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'AUTH_INVALID_CREDENTIALS',
            message: '用户名或密码错误',
          },
        }),
      });
    }
  });

  // 获取当前用户
  page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: predefinedUsers.admin,
      }),
    });
  });

  // 登出
  page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    });
  });
}
```

### 4.7 GraphQL Mock Handler

GraphQL 所有请求都发送到 `/graphql` endpoint，通过 `query` 字段区分不同操作：

**e2e/mocks/handlers/graphql-handlers.ts**:

```typescript
import { Page } from '@playwright/test';
import { predefinedUsers } from '../data/user.factory';

// GraphQL Query 匹配器
function matchQuery(body: string, operationName: string): boolean {
  try {
    const parsed = JSON.parse(body);
    const query = parsed.query || '';
    // 匹配 query/mutation 名称
    return query.includes(operationName) || 
           query.includes(`query ${operationName}`) ||
           query.includes(`mutation ${operationName}`);
  } catch {
    return false;
  }
}

export function setupGraphQLMocks(page: Page) {
  page.route('**/graphql', async (route, request) => {
    const body = await request.postData();
    
    // GetUsers Query
    if (matchQuery(body, 'GetUsers')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            users: {
              content: Object.values(predefinedUsers).map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                roles: [],
                lastLoginAt: null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              })),
              totalElements: 2,
              totalPages: 1,
              page: 0,
              size: 20,
            },
          },
        }),
      });
      return;
    }
    
    // GetUser Query
    if (matchQuery(body, 'GetUser')) {
      const parsed = JSON.parse(body);
      const userId = parsed.variables?.id;
      const user = Object.values(predefinedUsers).find(u => u.id === userId);
      
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: { user },
        }),
      });
      return;
    }
    
    // 默认：未匹配的 GraphQL 请求
    await route.fulfill({
      status: 400,
      body: JSON.stringify({
        errors: [{ message: 'Mock not implemented for this GraphQL operation' }],
      }),
    });
  });
}
```

### 4.8 GraphQL 契约测试示例

**e2e/specs/contract/graphql-user-contract.spec.ts**:

```typescript
import { test, expect } from '@playwright/test';
import { mockProvider } from '../../mocks/pact/setup';
import { matchers } from '@pact-foundation/pact';

const { like, eachLike, string, boolean, integer } = matchers;

test.describe('GraphQL User API Contract', () => {
  test.beforeAll(async () => {
    await mockProvider.setup();
  });

  test.afterAll(async () => {
    await mockProvider.finalize();
  });

  test.afterEach(async () => {
    await mockProvider.verify();
  });

  test('GetUsers Query 契约', async ({ page }) => {
    const query = `
      query GetUsers($where: UserFilter, $page: Int, $size: Int) {
        users(where: $where, page: $page, size: $size) {
          content {
            id
            username
            email
            status
            roles { id code name }
            lastLoginAt
            createdAt
            updatedAt
          }
          totalElements
          totalPages
          page
          size
        }
      }
    `;

    await mockProvider.addInteraction({
      state: '用户列表已存在',
      uponReceiving: '获取用户列表',
      withRequest: {
        method: 'POST',
        path: '/graphql',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': like('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
        },
        body: {
          query: like(query),
          variables: {
            where: like({}),
            page: integer(0),
            size: integer(20),
          },
        },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          data: {
            users: {
              content: eachLike({
                id: integer(1),
                username: like('admin'),
                email: like('admin@test.com'),
                status: like('active'),
                roles: eachLike({
                  id: integer(1),
                  code: like('admin'),
                  name: like('管理员'),
                }),
                lastLoginAt: like('2024-01-01T00:00:00Z'),
                createdAt: like('2024-01-01T00:00:00Z'),
                updatedAt: like('2024-01-01T00:00:00Z'),
              }),
              totalElements: integer(2),
              totalPages: integer(1),
              page: integer(0),
              size: integer(20),
            },
          },
        },
      },
    });

    // E2E 测试：访问用户管理页面
    await page.goto('/system/users');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-row"]')).toHaveCount(2);
  });
});
```

### 4.9 契约测试示例

**e2e/specs/contract/auth-contract.spec.ts**:

```typescript
import { test, expect } from '@playwright/test';
import { mockProvider } from '../../mocks/pact/setup';
import { predefinedUsers } from '../../mocks/data/user.factory';
import { LoginPage } from '../../pages/LoginPage';
import { matchers } from '@pact-foundation/pact';

const { like, string, boolean, integer } = matchers;

test.describe('Auth API Contract', () => {
  test.beforeAll(async () => {
    await mockProvider.setup();
  });

  test.afterAll(async () => {
    await mockProvider.finalize();
  });

  test.afterEach(async () => {
    await mockProvider.verify();
  });

  test('登录成功契约', async ({ page }) => {
    const user = predefinedUsers.admin;
    
    await mockProvider.addInteraction({
      state: '用户已存在',
      uponReceiving: '使用有效凭据登录',
      withRequest: {
        method: 'POST',
        path: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username: like(user.username),
          password: like('Test@123456'),
        },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: boolean(true),
          data: {
            token: string('jwt.token.here'),
            user: {
              id: integer(user.id),
              username: like(user.username),
              email: like(user.email),
              role: like(user.role),
            },
          },
        },
      },
    });

    // E2E 测试验证 UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.username, 'Test@123456');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('登录失败契约', async ({ page }) => {
    await mockProvider.addInteraction({
      state: '用户已存在',
      uponReceiving: '使用无效凭据登录',
      withRequest: {
        method: 'POST',
        path: '/api/auth/login',
        body: {
          username: like('test-admin'),
          password: like('wrong-password'),
        },
      },
      willRespondWith: {
        status: 401,
        body: {
          success: boolean(false),
          error: {
            code: string('AUTH_INVALID_CREDENTIALS'),
            message: like('用户名或密码错误'),
          },
        },
      },
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test-admin', 'wrong-password');
    await loginPage.expectErrorMessage('用户名或密码错误');
  });
});
```

### 4.8 Package.json 脚本

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:contract": "playwright test e2e/specs/contract",
    "e2e:smoke": "playwright test e2e/specs/smoke",
    "e2e:regression": "playwright test e2e/specs/regression",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    
    "contract:copy": "tsx e2e/mocks/pact/copy-contracts.ts",
    "contract:generate": "pnpm e2e:contract && pnpm contract:copy",
    "contract:verify": "echo '在后端执行: ./gradlew contractTest'"
  }
}
```

---

## 5. 后端实施内容

### 5.1 新增依赖

**app-boot/build.gradle.kts**:

```kotlin
dependencies {
    // ... 现有依赖
    
    testImplementation("au.com.dius.pact.provider:junit5:4.6.9")
    testImplementation("au.com.dius.pact.provider:spring6:4.6.9")
}
```

### 5.2 契约验证测试

**app-boot/src/test/java/pro/walkin/ams/boot/contract/ContractVerificationTest.java**:

```java
package pro.walkin.ams.boot.contract;

import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.common.QuarkusTestResource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

/**
 * 契约验证测试
 * 
 * 从根目录 contracts/pacts/ 加载契约文件验证后端实现
 */
@QuarkusTest
@Provider("ams-api")
@PactFolder("../../../contracts/pacts")
@QuarkusTestResource(PostgresTestResource.class)  // 复用现有的 PostgreSQL Testcontainer
public class ContractVerificationTest {

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void pactVerificationTestTemplate(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @BeforeEach
    void before(PactVerificationContext context) {
        // 使用 HTTP 目标验证
        context.setTarget(new HttpTestTarget("localhost", 8081));
    }

    // ========== 状态准备方法 ==========

    @State("用户已存在")
    void userExistsState() {
        // 准备测试数据：创建 test-admin 用户
        TestDataService.createUser("test-admin", "Test@123456", "admin", "admin@test.com");
        TestDataService.createUser("test-user", "Test@123456", "user", "user@test.com");
    }

    @State("用户不存在")
    void userNotExistsState() {
        // 清理数据
        TestDataService.deleteUser("nonexistent-user");
    }

    @State("未登录")
    void notLoggedInState() {
        // 无需特殊准备
    }

    @State("已登录")
    void loggedInState() {
        // 准备登录状态（如需）
    }

    @State("用户列表已存在")
    void userListExistsState() {
        // GraphQL GetUsers Query 需要的数据
        TestDataService.createUser("test-admin", "Test@123456", "admin", "admin@test.com");
        TestDataService.createUser("test-user", "Test@123456", "user", "user@test.com");
    }
}
```

### 5.3 GraphQL 契约验证说明

Pact JVM 验证 GraphQL 契约时，与 REST API 的验证方式相同：

1. **契约匹配**：Pact 会自动匹配 GraphQL 请求的 `query` 字段
2. **变量匹配**：`variables` 作为请求体的一部分参与匹配
3. **响应验证**：验证 GraphQL 响应的 `data` 结构

**GraphQL 契约的特殊性**：
- 所有 GraphQL 请求都发送到 `/graphql` endpoint
- Pact 通过 `body.query` 内容匹配不同的 GraphQL 操作
- 验证时需要确保后端 GraphQL Schema 与契约中的字段一致

**GraphQL Schema 变更检查**（可选增强）：

```java
// GraphQLSchemaVerificationTest.java
@QuarkusTest
public class GraphQLSchemaVerificationTest {
    
    @Test
    void verifyGraphQLSchemaCompatibility() {
        // 加载契约中的 GraphQL queries
        List<String> queries = loadQueriesFromContracts();
        
        // 验证每个 query 都能被 Schema 解析
        for (String query : queries) {
            ExecutionResult result = graphQL.execute(query);
            assertThat(result.getErrors()).isEmpty();
        }
    }
}
```

### 5.4 测试数据服务

**app-boot/src/test/java/pro/walkin/ams/boot/contract/TestDataService.java**:

```java
package pro.walkin.ams.boot.contract;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.entity.User;

/**
 * 契约测试数据准备服务
 */
@ApplicationScoped
public class TestDataService {

    @Inject
    User.Repo userRepo;

    @Transactional
    public void createUser(String username, String password, String role, String email) {
        // 删除已存在的用户
        userRepo.findByUsername(username).ifPresent(u -> userRepo.delete(u));
        
        // 创建新用户
        User user = new User();
        user.username = username;
        user.password = hashPassword(password);  // 使用相同的加密方式
        user.role = role;
        user.email = email;
        user.status = "active";
        user.persist();
    }

    @Transactional
    public void deleteUser(String username) {
        userRepo.findByUsername(username).ifPresent(userRepo::delete);
    }

    private String hashPassword(String password) {
        // 使用与生产环境相同的密码加密
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
}
```

### 5.4 Gradle 任务

**app-boot/build.gradle.kts**:

```kotlin
// 添加契约测试任务
tasks.register<Test>("contractTest") {
    description = "运行契约验证测试"
    group = "verification"
    
    testClassesDirs = sourceSets.test.get().output.classesDirs
    classpath = sourceSets.test.get().runtimeClasspath
    
    filter {
        includeTestsMatching("*ContractVerificationTest*")
    }
    
    systemProperty("pact.provider.version", project.version)
    systemProperty("pact.verifier.publishResults", "true")
}

// CI 任务
tasks.register("ci") {
    description = "CI 完整测试"
    group = "verification"
    dependsOn("test", "contractTest")
}
```

### 5.5 运行命令

```bash
# 运行契约验证测试
./gradlew :app-boot:contractTest

# 包含契约验证的完整 CI 测试
./gradlew :app-boot:ci
```

---

## 6. 协作流程（单仓库）

### 6.1 API 变更流程

```
1. 需求变更 / 新功能
        │
        ▼
2. 前端开发者
   ├─ 更新 E2E 测试（定义新契约）
   ├─ 运行 pnpm contract:generate
   └─ 提交契约文件到 contracts/pacts/
        │
        ▼
3. 同一个 PR 中
   ├─ 契约文件变更（contracts/pacts/*.json）
   └─ 前端 Mock Handler 更新
        │
        ▼
4. CI 自动检查
   ├─ 前端 E2E 测试通过
   ├─ 后端契约验证测试
   │   （如果失败，说明后端未实现）
   └─ PR 状态显示
        │
        ▼
5. 后端开发者（同 PR 或后续 PR）
   ├─ 拉取契约文件
   ├─ 实现 API
   └─ 契约验证测试通过
        │
        ▼
6. PR 合并（前后端都通过）
```

### 6.2 文件变更示例

**前端开发者 PR**：

```
contracts/pacts/ams-web-ams-api.json    [修改：新增 API 契约]
app-web/e2e/mocks/handlers/...          [修改：更新 Mock Handler]
app-web/e2e/specs/...                   [修改：新增 E2E 测试]
```

**后端开发者 PR（基于上述）**：

```
app-boot/src/main/java/...              [修改：实现 API]
app-boot/src/test/java/.../contract/... [修改：状态准备方法]
contracts/pacts/ams-web-ams-api.json    [不变：契约已定义]
```

---

## 7. CI/CD 集成

### 7.1 GitHub Actions 工作流

**.github/workflows/contract-test.yml**:

```yaml
name: Contract Test

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'contracts/**'
      - 'app-web/e2e/**'
      - 'app-boot/**'
  pull_request:
    paths:
      - 'contracts/**'
      - 'app-web/e2e/**'
      - 'app-boot/**'

jobs:
  frontend-e2e:
    name: Frontend E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: 'app-web/pnpm-lock.yaml'
      
      - name: Install dependencies
        working-directory: app-web
        run: pnpm install
      
      - name: Install Playwright
        working-directory: app-web
        run: pnpm exec playwright install chromium
      
      - name: Run E2E Tests
        working-directory: app-web
        run: pnpm e2e
      
      - name: Upload E2E Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-report
          path: app-web/e2e-report/
          retention-days: 7

  contract-verify:
    name: Backend Contract Verification
    runs-on: ubuntu-latest
    needs: frontend-e2e
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ams_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
      
      - name: Run Contract Tests
        run: ./gradlew :app-boot:contractTest
        env:
          QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://localhost:5432/ams_test
          QUARKUS_DATASOURCE_USERNAME: test
          QUARKUS_DATASOURCE_PASSWORD: test
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: contract-test-results
          path: app-boot/build/reports/
          retention-days: 7

  contract-status:
    name: Contract Compatibility Check
    runs-on: ubuntu-latest
    needs: [frontend-e2e, contract-verify]
    if: always()
    
    steps:
      - name: Check Results
        run: |
          if [ "${{ needs.frontend-e2e.result }}" == "success" ] && [ "${{ needs.contract-verify.result }}" == "success" ]; then
            echo "✅ All contract tests passed!"
            exit 0
          else
            echo "❌ Contract tests failed"
            exit 1
          fi
```

### 7.2 本地开发脚本

**scripts/test-contract.sh**:

```bash
#!/bin/bash
set -e

echo "🧪 Running Contract Tests..."

# 1. 前端 E2E 测试（生成契约）
echo "📦 Running Frontend E2E..."
cd app-web
pnpm e2e:contract
pnpm contract:copy
cd ..

# 2. 后端契约验证
echo "🔍 Running Backend Contract Verification..."
./gradlew :app-boot:contractTest

echo "✅ All contract tests passed!"
```

---

## 8. 运行命令汇总

### 8.1 前端（app-web）

```bash
cd app-web

# 开发测试
pnpm e2e                    # 运行所有 E2E 测试
pnpm e2e:contract           # 运行契约测试（生成契约文件）
pnpm e2e:smoke              # 冒烟测试
pnpm e2e:ui                 # UI 调试模式

# 契约管理
pnpm contract:generate      # 生成并复制契约文件
pnpm contract:copy          # 复制契约到根目录 contracts/
```

### 8.2 后端（根目录）

```bash
# 契约验证
./gradlew :app-boot:contractTest

# 包含契约的完整测试
./gradlew :app-boot:ci

# 单个测试
./gradlew :app-boot:test --tests "ContractVerificationTest"
```

### 8.3 一键测试（根目录）

```bash
# 运行完整契约测试流程
./scripts/test-contract.sh

# 或手动执行
./gradlew clean
./gradlew :app-web:e2e:contract
./gradlew :app-web:contract:copy
./gradlew :app-boot:contractTest
```

---

## 9. 注意事项

### 9.1 契约文件管理

1. **必须提交到 Git**：契约文件是前后端协作的基础
2. **Review 时注意**：契约变更会影响后端实现
3. **破坏性变更**：如果修改现有契约，需要同步修改后端

### 9.2 与现有测试的关系

| 测试类型 | 目的 | 是否依赖后端 |
|---------|------|-------------|
| 单元测试 | 验证函数逻辑 | ❌ 无依赖 |
| Mock E2E | 验证 UI 流程 | ❌ Mock |
| 契约测试 | 验证 API 兼容性 | ⚠️ 轻量依赖（数据库） |
| 集成测试 | 验证模块集成 | ✅ 需要部分服务 |

### 9.3 常见问题

**Q: 契约文件冲突怎么办？**  
A: 和代码冲突一样处理，合并时确保前后端都通过测试。

**Q: 后端还没实现，前端怎么开发？**  
A: 前端先定义契约，后端实现后验证。契约驱动开发（CDD）。

**Q: 契约需要版本管理吗？**  
A: Git 已经管理了，通过分支和 PR 控制变更。

---

## 10. 验收标准

- [ ] 前端可以独立运行 Mock E2E 测试（无需后端启动）
- [ ] 契约文件自动生成到 `contracts/pacts/` 目录
- [ ] 后端可以加载契约文件并验证 API 实现
- [ ] CI 中自动运行：前端 E2E + 后端契约验证
- [ ] 前后端 API 不兼容时 CI 失败
- [ ] 契约文件变更必须提交到 Git
- [ ] 提供一键测试脚本 `scripts/test-contract.sh`

---

**设计确认**: 等待用户确认后，将创建详细实施计划。

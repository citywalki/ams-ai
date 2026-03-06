# Playwright E2E 测试设计方案

**日期**: 2026-03-06  
**状态**: 已批准  
**作者**: AI Assistant  

---

## 1. 项目背景

### 1.1 技术栈
- **前端框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite 7
- **架构模式**: Feature-Sliced Design (FSD)
- **状态管理**: Zustand 5 + TanStack Query 5
- **路由**: React Router 7

### 1.2 业务模块
- **auth**: 用户认证
- **user**: 用户管理
- **dashboard**: 仪表盘
- **analysis**: 分析
- **config**: 配置
- **menu**: 菜单
- **system**: 系统管理

---

## 2. 测试范围

### 2.1 关键业务流程

#### 场景 A: 用户认证流程
- 正常登录
- 登录失败（错误密码、用户不存在）
- 登出功能
- Token 刷新

#### 场景 B: 用户管理流程
- 查看用户列表
- 创建用户
- 编辑用户
- 删除用户
- 搜索用户
- 表单验证

---

## 3. 架构设计

### 3.1 目录结构

```
app-web/
├── e2e/                          # E2E 测试根目录
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts           # 基础页面类（通用方法）
│   │   ├── LoginPage.ts          # 登录页
│   │   ├── DashboardPage.ts      # 仪表盘页
│   │   └── UserManagementPage.ts # 用户管理页
│   ├── components/               # 可复用组件封装
│   │   └── TableComponent.ts
│   ├── fixtures/                 # 测试数据
│   │   ├── users.ts              # 用户测试数据
│   │   └── auth.ts               # 认证相关数据
│   ├── utils/                    # 测试工具函数
│   │   └── test-helpers.ts
│   ├── specs/                    # 测试用例
│   │   ├── auth.spec.ts          # 认证测试
│   │   └── user-management.spec.ts # 用户管理测试
│   └── setup/                    # 测试配置
│       ├── global-setup.ts       # 全局初始化
│       └── global-teardown.ts    # 全局清理
├── playwright.config.ts          # Playwright 配置
└── package.json                  # 添加测试脚本
```

### 3.2 模式选择: Page Object Model (POM)

**选择理由**:
- 页面元素集中管理，UI 变更只需修改一处
- 测试代码可读性高，业务意图清晰
- 便于复用页面操作
- 适合中长期维护

---

## 4. 测试用例详细设计

### 4.1 用户认证流程 (auth.spec.ts)

| 用例 ID | 测试用例 | 前置条件 | 操作步骤 | 预期结果 |
|---------|----------|----------|----------|----------|
| AUTH-01 | 正常登录 | 用户存在 | 输入有效用户名密码 → 点击登录 | 跳转仪表盘，显示用户信息 |
| AUTH-02 | 登录失败-错误密码 | 用户存在 | 输入正确用户名、错误密码 | 显示"用户名或密码错误" |
| AUTH-03 | 登录失败-用户不存在 | - | 输入不存在的用户名 | 显示"用户名或密码错误" |
| AUTH-04 | 登出功能 | 已登录 | 点击用户头像 → 选择登出 | 跳转登录页，清除 Token |
| AUTH-05 | Token 刷新 | 已登录且 Token 将过期 | 保持页面活跃 | 自动刷新 Token，用户无感知 |

### 4.2 用户管理流程 (user-management.spec.ts)

| 用例 ID | 测试用例 | 前置条件 | 操作步骤 | 预期结果 |
|---------|----------|----------|----------|----------|
| USER-01 | 查看用户列表 | 管理员登录 | 进入用户管理页 | 显示用户表格，含分页 |
| USER-02 | 创建用户 | 管理员登录 | 点击新建 → 填写信息 → 保存 | 列表出现新用户，显示成功提示 |
| USER-03 | 编辑用户 | 存在测试用户 | 点击编辑 → 修改信息 → 保存 | 信息更新成功 |
| USER-04 | 删除用户 | 存在可删除用户 | 点击删除 → 确认 | 用户从列表消失 |
| USER-05 | 搜索用户 | 存在多个用户 | 输入用户名关键词搜索 | 显示匹配结果 |
| USER-06 | 表单验证 | - | 提交空表单 | 显示字段验证错误 |

---

## 5. 技术配置

### 5.1 Playwright 配置 (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5.2 npm 脚本

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:codegen": "playwright codegen http://localhost:5173"
  }
}
```

### 5.3 关键特性

| 特性 | 说明 |
|------|------|
| 自动等待 | Playwright 自动等待元素可操作，无需手动 sleep |
| 截图录屏 | 失败时自动捕获，便于排查问题 |
| 并行执行 | 支持多 worker 并行，加速测试 |
| 可视化调试 | `pnpm e2e:ui` 打开 UI 模式，可逐步调试 |
| 代码生成 | `pnpm e2e:codegen` 录制操作自动生成代码 |

### 5.4 测试数据管理

- **环境变量**: `e2e/.env.test` 存储测试环境配置
- **测试账号**: 使用专用测试账号（test-admin / test-user）
- **数据清理**: `global-teardown.ts` 测试后清理创建的数据

---

## 6. 开发规范

### 6.1 Page Object 规范

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-btn"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### 6.2 测试用例规范

```typescript
// e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers } from '../fixtures/users';

test.describe('用户认证流程', () => {
  test('正常登录', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('登录失败-错误密码', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, 'wrong-password');
    
    await loginPage.expectErrorMessage('用户名或密码错误');
    await expect(page).toHaveURL('/login');
  });
});
```

---

## 7. 执行计划

### 7.1 第一阶段：基础设施
1. 安装 Playwright 依赖
2. 配置 playwright.config.ts
3. 创建目录结构
4. 编写 BasePage 基类

### 7.2 第二阶段：认证流程
1. 创建 LoginPage POM
2. 创建 DashboardPage POM
3. 编写 auth.spec.ts 测试用例
4. 配置测试账号数据

### 7.3 第三阶段：用户管理
1. 创建 UserManagementPage POM
2. 创建 TableComponent 组件封装
3. 编写 user-management.spec.ts 测试用例
4. 实现数据清理逻辑

### 7.4 第四阶段：CI/CD 集成
1. 配置 GitHub Actions 工作流
2. 设置测试报告上传
3. 配置失败通知

---

## 8. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 前端 UI 频繁变更 | 高 | POM 模式集中管理选择器，变更时只改一处 |
| 测试数据依赖后端 | 中 | 使用专用测试账号，避免影响生产数据 |
| 测试执行时间长 | 低 | 并行执行，关键路径优先 |
| 测试环境不稳定 | 中 | 添加重试机制，失败时截图录屏 |

---

## 9. 附录

### 9.1 相关文档
- [Playwright 官方文档](https://playwright.dev/)
- [FSD 架构指南](./2025-03-06-ams-frontend-design.md)
- [UI 风格指南](../ui-style-guide.md)

### 9.2 术语表
- **POM**: Page Object Model，页面对象模式
- **E2E**: End-to-End，端到端测试
- **FSD**: Feature-Sliced Design，特性切片设计

---

**批准日期**: 2026-03-06  
**实施状态**: 待实施

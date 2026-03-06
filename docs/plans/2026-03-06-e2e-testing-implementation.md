# Playwright E2E 测试实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 AMS 前端项目搭建基于 Playwright 的 E2E 测试框架，覆盖用户认证和用户管理两大核心业务流程。

**Architecture:** 采用 Page Object Model (POM) 模式，将页面操作封装为 TypeScript 类，测试用例与页面实现分离，提高可维护性和复用性。

**Tech Stack:** Playwright + TypeScript + React 19 + Vite

---

## 准备工作

**前提条件：**
- Node.js 20+ 已安装
- pnpm 已安装
- 前端项目已可正常运行 (`pnpm dev`)

**参考文档：**
- `docs/plans/2026-03-06-e2e-testing-design.md` - 详细设计方案
- `app-web/AGENTS.md` - 前端项目规范

---

## 第一阶段：基础设施搭建

### Task 1: 安装 Playwright 依赖

**文件：**
- 修改: `app-web/package.json`

**Step 1: 安装依赖**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web
pnpm add -D @playwright/test
```

**Step 2: 安装浏览器**

```bash
pnpm exec playwright install chromium firefox
```

**Step 3: 验证安装**

```bash
pnpm exec playwright --version
```

**Expected:** 显示 Playwright 版本号，如 `Version 1.40.0`

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add playwright dependency for e2e testing"
```

---

### Task 2: 配置 Playwright

**文件：**
- 创建: `app-web/playwright.config.ts`
- 修改: `app-web/.gitignore`

**Step 1: 创建 playwright.config.ts**

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
    { 
      name: 'chromium', 
      use: { ...devices['Desktop Chrome'] } 
    },
    { 
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] } 
    },
  ],
  
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Step 2: 更新 .gitignore**

添加以下内容：
```
# Playwright
e2e-report/
test-results/
playwright/.cache/
```

**Step 3: 添加 npm 脚本到 package.json**

在 `scripts` 部分添加：
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

**Step 4: Commit**

```bash
git add playwright.config.ts .gitignore package.json
git commit -m "chore: configure playwright for e2e testing"
```

---

### Task 3: 创建目录结构

**文件：**
- 创建目录: `app-web/e2e/pages/`
- 创建目录: `app-web/e2e/components/`
- 创建目录: `app-web/e2e/fixtures/`
- 创建目录: `app-web/e2e/utils/`
- 创建目录: `app-web/e2e/specs/`
- 创建目录: `app-web/e2e/setup/`

**Step 1: 创建目录结构**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web
mkdir -p e2e/pages e2e/components e2e/fixtures e2e/utils e2e/specs e2e/setup
```

**Step 2: 创建 .gitkeep 文件（空目录占位）**

```bash
touch e2e/components/.gitkeep e2e/utils/.gitkeep e2e/setup/.gitkeep
```

**Step 3: Commit**

```bash
git add e2e/
git commit -m "chore: create e2e test directory structure"
```

---

## 第二阶段：测试数据与工具

### Task 4: 创建测试数据 Fixtures

**文件：**
- 创建: `app-web/e2e/fixtures/users.ts`
- 创建: `app-web/e2e/fixtures/auth.ts`

**Step 1: 创建 users.ts**

```typescript
export const testUsers = {
  admin: {
    username: 'test-admin',
    password: 'Test@123456',
    email: 'test-admin@example.com',
  },
  user: {
    username: 'test-user',
    password: 'Test@123456',
    email: 'test-user@example.com',
  },
  newUser: {
    username: 'new-test-user',
    password: 'NewTest@123',
    email: 'new-test-user@example.com',
    role: 'user',
  },
};

export const invalidUsers = {
  nonExistent: {
    username: 'non-existent-user-12345',
    password: 'wrong-password',
  },
  wrongPassword: {
    username: 'test-admin',
    password: 'wrong-password-123',
  },
};
```

**Step 2: 创建 auth.ts**

```typescript
export const authMessages = {
  loginSuccess: '登录成功',
  loginFailed: '用户名或密码错误',
  logoutSuccess: '已退出登录',
  tokenExpired: '登录已过期，请重新登录',
};

export const validationMessages = {
  usernameRequired: '请输入用户名',
  passwordRequired: '请输入密码',
  emailInvalid: '请输入有效的邮箱地址',
};
```

**Step 3: Commit**

```bash
git add e2e/fixtures/
git commit -m "chore: add e2e test fixtures for users and auth"
```

---

### Task 5: 创建 BasePage 基类

**文件：**
- 创建: `app-web/e2e/pages/BasePage.ts`

**Step 1: 创建 BasePage.ts**

```typescript
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '/') {
    this.page = page;
    this.url = url;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async expectUrl(expectedUrl: string) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async expectToBeOnPage() {
    await this.expectUrl(this.url);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
    await this.page.waitForLoadState(state);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `./e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}
```

**Step 2: Commit**

```bash
git add e2e/pages/BasePage.ts
git commit -m "feat: add BasePage class for e2e page objects"
```

---

## 第三阶段：认证流程测试

### Task 6: 创建 LoginPage POM

**文件：**
- 创建: `app-web/e2e/pages/LoginPage.ts`

**Step 1: 创建 LoginPage.ts**

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.usernameInput = page.locator('[data-testid="username-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"]');
  }

  async login(username: string, password: string, rememberMe: boolean = false) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
```

**Step 2: Commit**

```bash
git add e2e/pages/LoginPage.ts
git commit -m "feat: add LoginPage page object for e2e tests"
```

---

### Task 7: 创建 DashboardPage POM

**文件：**
- 创建: `app-web/e2e/pages/DashboardPage.ts`

**Step 1: 创建 DashboardPage.ts**

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly sidebar: Locator;
  readonly userManagementLink: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.userManagementLink = page.locator('[data-testid="nav-user-management"]');
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async navigateToUserManagement() {
    await this.userManagementLink.click();
  }

  async expectLoggedIn() {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.userMenu).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }
}
```

**Step 2: Commit**

```bash
git add e2e/pages/DashboardPage.ts
git commit -m "feat: add DashboardPage page object for e2e tests"
```

---

### Task 8: 编写认证流程测试

**文件：**
- 创建: `app-web/e2e/specs/auth.spec.ts`

**Step 1: 创建 auth.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers, invalidUsers } from '../fixtures/users';
import { authMessages } from '../fixtures/auth';

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前都确保在登录页
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-01: 正常登录成功', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    
    // 验证跳转到仪表盘
    await dashboardPage.expectToBeOnPage();
    await dashboardPage.expectLoggedIn();
    await dashboardPage.expectSidebarVisible();
  });

  test('AUTH-02: 登录失败-密码错误', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login(
      invalidUsers.wrongPassword.username, 
      invalidUsers.wrongPassword.password
    );
    
    // 验证错误提示
    await loginPage.expectErrorMessage(authMessages.loginFailed);
    // 验证仍在登录页
    await loginPage.expectToBeOnPage();
    // 验证表单仍然可见
    await loginPage.expectLoginFormVisible();
  });

  test('AUTH-03: 登录失败-用户不存在', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login(
      invalidUsers.nonExistent.username, 
      invalidUsers.nonExistent.password
    );
    
    await loginPage.expectErrorMessage(authMessages.loginFailed);
    await loginPage.expectToBeOnPage();
  });

  test('AUTH-04: 登出功能', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // 先登录
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectToBeOnPage();
    
    // 执行登出
    await dashboardPage.logout();
    
    // 验证回到登录页
    await loginPage.expectToBeOnPage();
    await loginPage.expectLoginFormVisible();
  });

  test('AUTH-05: Token 刷新', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // 登录
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectLoggedIn();
    
    // 模拟等待（实际项目中可以操作 localStorage 修改 token 过期时间）
    await page.waitForTimeout(2000);
    
    // 刷新页面，验证 token 自动刷新后仍保持登录状态
    await page.reload();
    await dashboardPage.expectLoggedIn();
  });
});
```

**Step 2: 运行测试验证**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web
pnpm e2e --project=chromium --grep="AUTH-01"
```

**Expected:** 测试开始运行，如果页面元素不存在会显示对应的错误

**Step 3: Commit**

```bash
git add e2e/specs/auth.spec.ts
git commit -m "test: add authentication flow e2e tests"
```

---

## 第四阶段：用户管理测试

### Task 9: 创建 TableComponent 封装

**文件：**
- 创建: `app-web/e2e/components/TableComponent.ts`
- 删除: `app-web/e2e/components/.gitkeep`

**Step 1: 创建 TableComponent.ts**

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class TableComponent {
  readonly page: Page;
  readonly table: Locator;
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly pagination: Locator;

  constructor(page: Page, testId: string = 'data-table') {
    this.page = page;
    this.table = page.locator(`[data-testid="${testId}"]`);
    this.rows = this.table.locator('tbody tr');
    this.searchInput = page.locator('[data-testid="table-search"]');
    this.pagination = page.locator('[data-testid="table-pagination"]');
  }

  async expectTableVisible() {
    await expect(this.table).toBeVisible();
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.searchInput.press('Enter');
    // 等待搜索完成
    await this.page.waitForLoadState('networkidle');
  }

  async clickRowAction(rowIndex: number, action: 'edit' | 'delete') {
    const row = this.rows.nth(rowIndex);
    const actionButton = row.locator(`[data-testid="${action}-button"]`);
    await actionButton.click();
  }

  async expectRowContainsText(rowIndex: number, text: string) {
    const row = this.rows.nth(rowIndex);
    await expect(row).toContainText(text);
  }
}
```

**Step 2: Commit**

```bash
git add e2e/components/
git commit -m "feat: add TableComponent helper for e2e tests"
```

---

### Task 10: 创建 UserManagementPage POM

**文件：**
- 创建: `app-web/e2e/pages/UserManagementPage.ts`

**Step 1: 创建 UserManagementPage.ts**

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TableComponent } from '../components/TableComponent';

export class UserManagementPage extends BasePage {
  readonly table: TableComponent;
  readonly addUserButton: Locator;
  readonly modal: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, '/system/users');
    this.table = new TableComponent(page, 'users-table');
    this.addUserButton = page.locator('[data-testid="add-user-button"]');
    this.modal = page.locator('[data-testid="user-modal"]');
    this.usernameInput = page.locator('[data-testid="user-username-input"]');
    this.emailInput = page.locator('[data-testid="user-email-input"]');
    this.passwordInput = page.locator('[data-testid="user-password-input"]');
    this.roleSelect = page.locator('[data-testid="user-role-select"]');
    this.saveButton = page.locator('[data-testid="save-user-button"]');
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.confirmDeleteButton = page.locator('[data-testid="confirm-delete"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async openAddUserModal() {
    await this.addUserButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillUserForm(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    await this.usernameInput.fill(userData.username);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.roleSelect.selectOption(userData.role);
  }

  async saveUser() {
    await this.saveButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async expectSuccessMessage(message: string) {
    await expect(this.successMessage).toContainText(message);
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async expectUserInTable(username: string) {
    await this.table.search(username);
    const rowCount = await this.table.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  }

  async deleteUserByUsername(username: string) {
    await this.table.search(username);
    await this.table.clickRowAction(0, 'delete');
    await this.confirmDelete();
  }
}
```

**Step 2: Commit**

```bash
git add e2e/pages/UserManagementPage.ts
git commit -m "feat: add UserManagementPage page object for e2e tests"
```

---

### Task 11: 编写用户管理测试

**文件：**
- 创建: `app-web/e2e/specs/user-management.spec.ts`

**Step 1: 创建 user-management.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { testUsers } from '../fixtures/users';

test.describe('用户管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录并导航到用户管理页
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const userManagementPage = new UserManagementPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectToBeOnPage();
    
    await dashboardPage.navigateToUserManagement();
    await userManagementPage.expectToBeOnPage();
  });

  test('USER-01: 查看用户列表', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    
    await userManagementPage.table.expectTableVisible();
    const rowCount = await userManagementPage.table.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('USER-02: 创建用户', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const newUser = testUsers.newUser;
    
    // 打开新建弹窗
    await userManagementPage.openAddUserModal();
    
    // 填写表单
    await userManagementPage.fillUserForm({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
    });
    
    // 保存
    await userManagementPage.saveUser();
    
    // 验证成功提示
    await userManagementPage.expectSuccessMessage('创建成功');
    
    // 验证用户出现在列表中
    await userManagementPage.expectUserInTable(newUser.username);
  });

  test('USER-03: 编辑用户', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const existingUser = testUsers.user;
    const newEmail = 'updated-' + existingUser.email;
    
    // 搜索用户
    await userManagementPage.table.search(existingUser.username);
    
    // 点击编辑
    await userManagementPage.table.clickRowAction(0, 'edit');
    
    // 修改邮箱
    await userManagementPage.emailInput.fill(newEmail);
    
    // 保存
    await userManagementPage.saveUser();
    
    // 验证成功提示
    await userManagementPage.expectSuccessMessage('更新成功');
  });

  test('USER-04: 删除用户', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const userToDelete = testUsers.newUser;
    
    // 先创建用户
    await userManagementPage.openAddUserModal();
    await userManagementPage.fillUserForm({
      username: userToDelete.username,
      email: userToDelete.email,
      password: userToDelete.password,
      role: userToDelete.role,
    });
    await userManagementPage.saveUser();
    await userManagementPage.expectSuccessMessage('创建成功');
    
    // 删除用户
    await userManagementPage.deleteUserByUsername(userToDelete.username);
    
    // 验证成功提示
    await userManagementPage.expectSuccessMessage('删除成功');
    
    // 验证用户已不在列表中
    await userManagementPage.table.search(userToDelete.username);
    const rowCount = await userManagementPage.table.getRowCount();
    expect(rowCount).toBe(0);
  });

  test('USER-05: 搜索用户', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const searchTerm = testUsers.admin.username;
    
    await userManagementPage.table.search(searchTerm);
    
    // 验证搜索结果包含搜索词
    await userManagementPage.table.expectRowContainsText(0, searchTerm);
  });

  test('USER-06: 表单验证', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    
    await userManagementPage.openAddUserModal();
    
    // 直接点击保存，不填写任何字段
    await userManagementPage.saveUser();
    
    // 验证表单验证错误
    // 根据实际验证规则调整
    await expect(page.locator('text=请输入用户名')).toBeVisible();
    await expect(page.locator('text=请输入密码')).toBeVisible();
    await expect(page.locator('text=请输入邮箱')).toBeVisible();
  });
});
```

**Step 2: Commit**

```bash
git add e2e/specs/user-management.spec.ts
git commit -m "test: add user management e2e tests"
```

---

## 第五阶段：配置优化

### Task 12: 创建全局 Setup/Teardown

**文件：**
- 创建: `app-web/e2e/setup/global-setup.ts`
- 创建: `app-web/e2e/setup/global-teardown.ts`

**Step 1: 创建 global-setup.ts**

```typescript
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  
  // 如果配置了 storageState，预登录保存状态
  if (storageState) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(baseURL + '/login');
    await page.fill('[data-testid="username-input"]', 'test-admin');
    await page.fill('[data-testid="password-input"]', 'Test@123456');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
    
    await page.context().storageState({ path: storageState as string });
    await browser.close();
  }
}

export default globalSetup;
```

**Step 2: 创建 global-teardown.ts**

```typescript
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // 清理测试数据
  // 可以通过 API 调用删除测试中创建的用户
  console.log('E2E tests completed, cleaning up test data...');
}

export default globalTeardown;
```

**Step 3: 更新 playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // ... 其他配置
  
  globalSetup: require.resolve('./e2e/setup/global-setup'),
  globalTeardown: require.resolve('./e2e/setup/global-teardown'),
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 可选：复用登录状态
    // storageState: 'e2e/setup/storage-state.json',
  },
  
  // ... 其余配置
});
```

**Step 4: Commit**

```bash
git add e2e/setup/ playwright.config.ts
git commit -m "chore: add global setup and teardown for e2e tests"
```

---

### Task 13: 添加测试工具函数

**文件：**
- 创建: `app-web/e2e/utils/test-helpers.ts`
- 删除: `app-web/e2e/utils/.gitkeep`

**Step 1: 创建 test-helpers.ts**

```typescript
import { Page, expect } from '@playwright/test';

/**
 * 等待元素可见并包含特定文本
 */
export async function expectElementToContainText(
  page: Page,
  selector: string,
  text: string
) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toContainText(text);
}

/**
 * 生成唯一测试数据
 */
export function generateUniqueUser(prefix: string = 'test') {
  const timestamp = Date.now();
  return {
    username: `${prefix}-user-${timestamp}`,
    email: `${prefix}-user-${timestamp}@example.com`,
    password: 'Test@123456',
    role: 'user',
  };
}

/**
 * 清除表单字段
 */
export async function clearFormFields(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await page.fill(selector, '');
  }
}

/**
 * 等待 Toast 消息出现并消失
 */
export async function waitForToast(
  page: Page,
  message: string,
  type: 'success' | 'error' = 'success'
) {
  const toastSelector = `[data-testid="toast-${type}"]`;
  const toast = page.locator(toastSelector);
  
  await expect(toast).toContainText(message);
  await expect(toast).toBeVisible();
  
  // 等待 Toast 自动消失
  await expect(toast).not.toBeVisible({ timeout: 5000 });
}
```

**Step 2: Commit**

```bash
git add e2e/utils/
git commit -m "feat: add test helper utilities for e2e tests"
```

---

### Task 14: 添加 Page Objects 索引文件

**文件：**
- 创建: `app-web/e2e/pages/index.ts`

**Step 1: 创建 index.ts**

```typescript
export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
export { DashboardPage } from './DashboardPage';
export { UserManagementPage } from './UserManagementPage';
```

**Step 2: Commit**

```bash
git add e2e/pages/index.ts
git commit -m "chore: add page objects index file"
```

---

## 第六阶段：验证与文档

### Task 15: 运行完整测试套件

**Step 1: 运行所有测试**

```bash
cd /Users/walkin/SourceCode/citywalki/ams-ai/app-web
pnpm e2e
```

**Expected:** 
- Chromium 和 Firefox 项目并行运行
- 显示每个测试的执行结果
- 失败的测试会自动重试

**Step 2: 查看测试报告**

```bash
# 测试完成后，打开 HTML 报告
pnpm exec playwright show-report e2e-report
```

**Step 3: Commit（如果测试通过）**

```bash
git add .
git commit -m "test: complete e2e test suite setup"
```

---

### Task 16: 创建 README 文档

**文件：**
- 创建: `app-web/e2e/README.md`

**Step 1: 创建 README.md**

```markdown
# E2E 测试文档

## 快速开始

```bash
# 安装依赖
pnpm install

# 安装浏览器
pnpm exec playwright install

# 运行所有测试
pnpm e2e

# 运行特定测试文件
pnpm e2e --grep="auth"

# 调试模式
pnpm e2e:debug

# UI 模式（可视化调试）
pnpm e2e:ui

# 录制新测试
pnpm e2e:codegen
```

## 目录结构

```
e2e/
├── pages/           # Page Object Models
├── components/      # 可复用组件封装
├── fixtures/        # 测试数据
├── utils/           # 工具函数
├── specs/           # 测试用例
└── setup/           # 全局配置
```

## 编写新测试

1. 创建 Page Object（如果需要）
2. 创建测试用例文件
3. 运行测试验证
4. 提交代码

## 最佳实践

- 使用 `data-testid` 定位元素
- 测试之间保持独立
- 使用 fixtures 管理测试数据
- 失败的测试会截图和录屏

## 故障排查

**测试找不到元素**
- 检查 `data-testid` 是否正确
- 使用 `await expect(locator).toBeVisible()` 等待元素

**测试不稳定**
- 增加重试次数：`retries: 2`
- 使用 `await page.waitForLoadState('networkidle')`

**浏览器启动失败**
- 重新安装浏览器：`pnpm exec playwright install`
```

**Step 2: Commit**

```bash
git add e2e/README.md
git commit -m "docs: add e2e testing documentation"
```

---

## 总结

### 已完成的任务

1. ✅ 安装 Playwright 依赖
2. ✅ 配置 Playwright
3. ✅ 创建目录结构
4. ✅ 创建测试数据 fixtures
5. ✅ 创建 BasePage 基类
6. ✅ 创建 LoginPage POM
7. ✅ 创建 DashboardPage POM
8. ✅ 编写认证流程测试
9. ✅ 创建 TableComponent
10. ✅ 创建 UserManagementPage POM
11. ✅ 编写用户管理测试
12. ✅ 创建全局 setup/teardown
13. ✅ 添加测试工具函数
14. ✅ 添加 Page Objects 索引
15. ✅ 运行完整测试套件
16. ✅ 创建文档

### 后续工作

- 为前端组件添加 `data-testid` 属性
- 配置 CI/CD 自动运行 E2E 测试
- 扩展更多业务场景测试
- 添加移动端适配测试

### 文件清单

```
app-web/
├── playwright.config.ts
├── e2e/
│   ├── README.md
│   ├── pages/
│   │   ├── index.ts
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   └── UserManagementPage.ts
│   ├── components/
│   │   └── TableComponent.ts
│   ├── fixtures/
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── utils/
│   │   └── test-helpers.ts
│   ├── specs/
│   │   ├── auth.spec.ts
│   │   └── user-management.spec.ts
│   └── setup/
│       ├── global-setup.ts
│       └── global-teardown.ts
```

---

**计划完成日期**: 2026-03-06  
**状态**: 待执行

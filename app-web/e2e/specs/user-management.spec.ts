import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserListPage } from '../pages/UserListPage';
import { testUsers } from '../fixtures/users';

test.describe('用户管理流程', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    
    // 直接导航到用户管理页
    await page.goto('http://localhost:5173/admin/users');
    await page.waitForLoadState('networkidle');
  });

  test('USER-01: 查看用户列表页面', async ({ page }) => {
    // 验证 URL 正确
    await expect(page).toHaveURL(/\/admin\/users/);
    // 验证页面包含表格
    await expect(page.locator('table, [role="table"]').first()).toBeVisible();
  });

  test('USER-02: 页面包含新增按钮', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /新增|添加|创建|Add/i });
    await expect(addButton).toBeVisible();
  });

  test('USER-03: 页面包含搜索功能', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/搜索|Search/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('USER-E2E-01: 管理员可以查看用户列表', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const userListPage = new UserListPage(page);

    // 登录
    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectToBeOnPage();

    // 导航到用户管理
    await dashboardPage.navigateToUserManagement();
    await userListPage.expectToBeOnPage();
    await userListPage.expectUserTableVisible();
  });

  test('USER-E2E-02: 管理员可以搜索用户', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const userListPage = new UserListPage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.navigateToUserManagement();
    
    await userListPage.searchUser('admin');
    
    // 验证搜索结果
    const table = page.locator('[data-testid="user-table"]');
    await expect(table).toContainText('admin');
  });
});

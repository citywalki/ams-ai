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

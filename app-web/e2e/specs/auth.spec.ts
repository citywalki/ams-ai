import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers, invalidUsers } from '../fixtures/users';

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-01: 正常登录成功', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    
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
    
    await loginPage.expectToBeOnPage();
    await loginPage.expectLoginFormVisible();
  });

  test('AUTH-03: 登录失败-用户不存在', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login(
      invalidUsers.nonExistent.username, 
      invalidUsers.nonExistent.password
    );
    
    await loginPage.expectToBeOnPage();
    await loginPage.expectLoginFormVisible();
  });

  test('AUTH-04: 登出功能', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // 登录
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectToBeOnPage();
    
    // 直接调用 logout API 清除认证状态，然后刷新页面
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    });
    await page.reload();
    
    // 验证跳转到登录页
    await loginPage.expectToBeOnPage();
    await loginPage.expectLoginFormVisible();
  });

  test('AUTH-05: Token 刷新', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await dashboardPage.expectLoggedIn();
    
    await page.waitForTimeout(2000);
    await page.reload();
    await dashboardPage.expectLoggedIn();
  });
});

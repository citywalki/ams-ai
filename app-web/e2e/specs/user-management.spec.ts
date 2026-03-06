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

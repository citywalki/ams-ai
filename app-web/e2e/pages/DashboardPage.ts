import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly sidebar: Locator;
  readonly systemManagementButton: Locator;
  readonly userManagementLink: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.welcomeMessage = page.getByRole('heading').first();
    // 用户菜单是 header 右上角的最后一个圆形按钮（头像）
    this.userMenu = page.locator('header button').filter({ has: page.locator('.rounded-full') }).last();
    this.logoutButton = page.getByRole('menuitem', { name: '退出登录' });
    this.sidebar = page.locator('nav, aside, [role="navigation"]').first();
    this.systemManagementButton = page.getByRole('button', { name: '系统管理' });
    this.userManagementLink = page.getByRole('link', { name: '用户管理' });
  }

  async logout() {
    await this.userMenu.click();
    await this.page.waitForTimeout(500);
    await this.logoutButton.click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToUserManagement() {
    await this.systemManagementButton.click();
    await this.userManagementLink.click();
  }

  async expectLoggedIn() {
    await this.expectToBeOnPage();
    await expect(this.welcomeMessage).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }
}

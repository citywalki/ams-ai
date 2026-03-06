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
    // 使用更通用的定位器，不依赖 data-testid
    this.welcomeMessage = page.getByRole('heading').first();
    this.userMenu = page.getByRole('button').filter({ hasText: /用户|User|Admin/i }).first();
    this.logoutButton = page.getByRole('menuitem', { name: /退出|登出|Logout/i });
    this.sidebar = page.locator('nav, aside, [role="navigation"]').first();
    this.userManagementLink = page.getByRole('link', { name: /用户管理|Users/i });
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async navigateToUserManagement() {
    await this.userManagementLink.click();
  }

  async expectLoggedIn() {
    // 检查是否跳转到 dashboard
    await this.expectToBeOnPage();
    // 检查页面标题或主要内容
    await expect(this.welcomeMessage).toBeVisible();
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }
}

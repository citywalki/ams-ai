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

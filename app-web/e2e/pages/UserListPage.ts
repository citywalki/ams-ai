import { Page, Locator, expect } from '@playwright/test';

export class UserListPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly userTable: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.locator('[data-testid="add-user-btn"]');
    this.userTable = page.locator('[data-testid="user-table"]');
    this.searchInput = page.locator('[data-testid="search-users"]');
  }

  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(/.*users.*/);
  }

  async expectUserTableVisible() {
    await expect(this.userTable).toBeVisible();
  }

  async clickAddUser() {
    await this.addButton.click();
    await this.page.waitForURL(/.*users\/new.*/);
  }

  async searchUser(username: string) {
    await this.searchInput.fill(username);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(500); // 等待搜索结果
  }
}

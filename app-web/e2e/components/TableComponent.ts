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

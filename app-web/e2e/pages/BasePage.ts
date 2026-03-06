import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '/') {
    this.page = page;
    this.url = url;
  }

  async goto() {
    const baseURL = 'http://localhost:5173';
    await this.page.goto(baseURL + this.url);
  }

  async expectUrl(expectedUrl: string) {
    // 支持部分匹配，处理完整 URL 和相对路径
    await expect(this.page).toHaveURL(new RegExp(expectedUrl.replace(/\//g, '\\/') + '$'));
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

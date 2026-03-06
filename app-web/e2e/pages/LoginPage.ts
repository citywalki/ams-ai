import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page, '/login');
    // 使用 placeholder 和 role 定位器，不依赖 data-testid
    this.usernameInput = page.getByPlaceholder('请输入用户名');
    this.passwordInput = page.getByPlaceholder('请输入密码');
    this.loginButton = page.getByRole('button', { name: '登录' });
    this.errorMessage = page.locator('text=用户名或密码错误');
    this.rememberMeCheckbox = page.locator('label:has-text("记住我"), input[type="checkbox"]');
  }

  async login(username: string, password: string, rememberMe: boolean = false) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    // 点击登录并等待导航完成
    await Promise.all([
      this.page.waitForURL('**/dashboard', { timeout: 10000 }),
      this.loginButton.click(),
    ]);
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}

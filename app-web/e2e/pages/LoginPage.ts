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
    // Sonner toast 错误消息 - 使用更通用的选择器
    this.errorMessage = page.locator('[role="region"][aria-label="Notifications"]').getByText(/登录失败|错误|Error/i);
    this.rememberMeCheckbox = page.locator('label:has-text("记住我"), input[type="checkbox"]');
  }

  async login(username: string, password: string, rememberMe: boolean = false) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.loginButton.click();
    // 等待登录完成：成功跳转或显示错误
    await this.page.waitForTimeout(2000);
  }

  async expectErrorMessage(message?: string) {
    // 检查是否有错误通知出现
    const errorLocator = message 
      ? this.page.getByText(message).first()
      : this.page.locator('[role="region"][aria-label="Notifications"]').getByText(/登录失败|错误|失败|Error|Failed/i).first();
    await expect(errorLocator).toBeVisible();
  }

  async expectLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}

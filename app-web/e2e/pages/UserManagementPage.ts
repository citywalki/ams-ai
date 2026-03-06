import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TableComponent } from '../components/TableComponent';

export class UserManagementPage extends BasePage {
  readonly table: TableComponent;
  readonly addUserButton: Locator;
  readonly modal: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    // 从页面快照看到实际路径是 /admin/users
    super(page, '/admin/users');
    this.table = new TableComponent(page, 'users-table');
    // 使用更通用的定位器
    this.addUserButton = page.getByRole('button', { name: /新增|添加|创建|Add/i });
    this.modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    this.usernameInput = page.getByPlaceholder(/用户名|username/i).or(page.getByLabel(/用户名/i));
    this.emailInput = page.getByPlaceholder(/邮箱|email/i).or(page.getByLabel(/邮箱/i));
    this.passwordInput = page.getByPlaceholder(/密码|password/i).or(page.getByLabel(/密码/i));
    this.roleSelect = page.getByLabel(/角色|role/i).or(page.locator('select').first());
    this.saveButton = page.getByRole('button', { name: /保存|确定|提交|Save/i });
    this.cancelButton = page.getByRole('button', { name: /取消|关闭|Cancel/i });
    this.confirmDeleteButton = page.getByRole('button', { name: /确定|删除|确认|Confirm/i });
    this.successMessage = page.getByText(/成功|success/i).first();
  }

  async openAddUserModal() {
    await this.addUserButton.click();
    await expect(this.modal).toBeVisible();
  }

  async fillUserForm(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    await this.usernameInput.fill(userData.username);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.roleSelect.selectOption(userData.role);
  }

  async saveUser() {
    await this.saveButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async expectSuccessMessage(message: string) {
    await expect(this.successMessage).toContainText(message);
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async expectUserInTable(username: string) {
    await this.table.search(username);
    const rowCount = await this.table.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  }

  async deleteUserByUsername(username: string) {
    await this.table.search(username);
    await this.table.clickRowAction(0, 'delete');
    await this.confirmDelete();
  }
}

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
    super(page, '/system/users');
    this.table = new TableComponent(page, 'users-table');
    this.addUserButton = page.locator('[data-testid="add-user-button"]');
    this.modal = page.locator('[data-testid="user-modal"]');
    this.usernameInput = page.locator('[data-testid="user-username-input"]');
    this.emailInput = page.locator('[data-testid="user-email-input"]');
    this.passwordInput = page.locator('[data-testid="user-password-input"]');
    this.roleSelect = page.locator('[data-testid="user-role-select"]');
    this.saveButton = page.locator('[data-testid="save-user-button"]');
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.confirmDeleteButton = page.locator('[data-testid="confirm-delete"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
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

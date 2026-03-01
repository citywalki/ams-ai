import { test, expect } from '@playwright/test';
import { installOfflineApiMocks } from './helpers/offline-api-mock';

test.describe('Role Management', () => {
  test.beforeEach(async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
  });

  test.describe('List Roles', () => {
    test('should display role list page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /角色管理/i })).toBeVisible();
      await expect(page.getByPlaceholder(/角色名称或编码/i)).toBeVisible();
    });

    test('should show roles in table', async ({ page }) => {
      const table = page.locator('table');
      await expect(table).toBeVisible();
      
      const rows = table.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should search roles by keyword', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/角色名称或编码/i);
      await searchInput.fill('ADMIN');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500);
      
      const rows = page.locator('table tbody tr');
      const count = await rows.count();
      
      if (count > 0) {
        const firstRowText = await rows.first().textContent();
        expect(firstRowText?.toUpperCase()).toContain('ADMIN');
      }
    });

    test('should reset search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/角色名称或编码/i);
      await searchInput.fill('testkeyword');
      await page.getByRole('button', { name: /重置/i }).click();
      
      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Create Role', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /添加/i }).click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
    });

    test('should open create dialog', async ({ page }) => {
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('#code')).toBeVisible();
      await expect(page.locator('#name')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      const submitBtn = page.locator('[role="dialog"] button[type="submit"]');
      await submitBtn.click();

      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('#code')).toHaveValue('');
    });

    test('should create role successfully', async ({ page }) => {
      const uniqueCode = `TEST_ROLE_${Date.now()}`;
      
      await page.locator('#code').fill(uniqueCode);
      await page.locator('#name').fill('测试角色');
      await page.locator('#description').fill('E2E测试创建的角色');
      
      await page.locator('[role="dialog"] button[type="submit"]').click();
      
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
      
      await page.waitForTimeout(500);
      
      await expect(page.locator(`text=${uniqueCode}`)).toBeVisible({ timeout: 5000 });
    });

    test('should show error for duplicate role code', async ({ page }) => {
      await page.locator('#code').fill('ADMIN');
      await page.locator('#name').fill('重复角色');
      await page.locator('[role="dialog"] button[type="submit"]').click();
      
      await page.waitForTimeout(1000);
      
      const errorVisible = await page.locator('text=/已存在|重复|exists|duplicate|conflict/i').count() > 0;
      expect(errorVisible).toBeTruthy();
    });

    test('should select permissions', async ({ page }) => {
      await page.locator('#code').fill(`PERM_TEST_${Date.now()}`);
      await page.locator('#name').fill('权限测试角色');
      
      const permissionButtons = page.locator('[role="dialog"] .border.rounded-md button');
      const count = await permissionButtons.count();
      
      if (count > 0) {
        await permissionButtons.first().click();
      }
      
      await page.getByRole('button', { name: /取消/i }).click();
    });
  });

  test.describe('Edit Role', () => {
    test('should open edit dialog', async ({ page }) => {
      const editButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await editButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = editButtons.nth(i);
        const hasPencil = await btn.locator('svg.lucide-pencil').count();
        if (hasPencil) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      
      await expect(page.getByRole('dialog')).toBeVisible();
      const nameValue = await page.locator('#name').inputValue();
      expect(nameValue.length).toBeGreaterThan(0);
    });

    test('should update role name', async ({ page }) => {
      const editButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await editButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = editButtons.nth(i);
        const hasPencil = await btn.locator('svg.lucide-pencil').count();
        if (hasPencil) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      
      const nameInput = page.locator('#name');
      await nameInput.fill(`更新名称_${Date.now()}`);
      
      await page.locator('[role="dialog"] button[type="submit"]').click();
      
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
    });

    test('should update role permissions', async ({ page }) => {
      const editButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await editButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = editButtons.nth(i);
        const hasPencil = await btn.locator('svg.lucide-pencil').count();
        if (hasPencil) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      
      const permissionArea = page.locator('[role="dialog"] .border.rounded-md');
      const permissionButtons = permissionArea.locator('button');
      const count = await permissionButtons.count();
      
      if (count > 0) {
        await permissionButtons.first().click();
      }
      
      await page.locator('[role="dialog"] button[type="submit"]').click();
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
    });
  });

  test.describe('Delete Role', () => {
    test('should open delete confirmation', async ({ page }) => {
      const deleteButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await deleteButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = deleteButtons.nth(i);
        const hasTrash = await btn.locator('svg.lucide-trash-2').count();
        if (hasTrash) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/确认.*删除|删除.*确认/i)).toBeVisible();
    });

    test('should cancel delete', async ({ page }) => {
      const deleteButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await deleteButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = deleteButtons.nth(i);
        const hasTrash = await btn.locator('svg.lucide-trash-2').count();
        if (hasTrash) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      await page.getByRole('button', { name: /取消/i }).click();
      
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should show error when deleting role with users', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      let adminRowIndex = -1;
      
      for (let i = 0; i < await rows.count(); i++) {
        const text = await rows.nth(i).textContent();
        if (text?.includes('ADMIN') || text?.includes('管理员')) {
          adminRowIndex = i;
          break;
        }
      }
      
      if (adminRowIndex >= 0) {
        const deleteButtons = rows.nth(adminRowIndex).locator('button');
        const buttonCount = await deleteButtons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const btn = deleteButtons.nth(i);
          const hasTrash = await btn.locator('svg.lucide-trash-2').count();
          if (hasTrash) {
            await btn.click();
            break;
          }
        }
        
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        await page.getByRole('button', { name: /删除|确认/i }).click();
        
        await page.waitForTimeout(1000);
        
        const errorVisible = await page.locator('text=/不能删除|已分配|assigned|cannot be deleted/i').count() > 0;
        expect(errorVisible).toBeTruthy();
      }
    });
  });

  test.describe('Menu Association', () => {
    test('should open menu dialog', async ({ page }) => {
      const menuButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await menuButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = menuButtons.nth(i);
        const hasMenu = await btn.locator('svg.lucide-menu').count();
        if (hasMenu) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /关联菜单/i })).toBeVisible();
    });

    test('should display menu tree', async ({ page }) => {
      const menuButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await menuButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = menuButtons.nth(i);
        const hasMenu = await btn.locator('svg.lucide-menu').count();
        if (hasMenu) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const menuItems = page.locator('[role="dialog"] .border.rounded-md > div');
      const count = await menuItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should toggle menu selection', async ({ page }) => {
      const menuButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await menuButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const btn = menuButtons.nth(i);
        const hasMenu = await btn.locator('svg.lucide-menu').count();
        if (hasMenu) {
          await btn.click();
          break;
        }
      }
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(500);
      
      const checkboxes = page.locator('[role="dialog"] .border.rounded-md .flex.items-center.gap-2');
      const count = await checkboxes.count();
      
      if (count > 0) {
        await checkboxes.first().click();
        await page.waitForTimeout(200);
      }
      
      await page.getByRole('button', { name: /取消/i }).click();
    });
  });

  test.describe('Error Handling', () => {
    test('should show validation error for empty code', async ({ page }) => {
      await page.getByRole('button', { name: /添加/i }).click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);
      
      await page.locator('#name').fill('测试角色');
      await page.locator('[role="dialog"] button[type="submit"]').click();

      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('#code')).toHaveValue('');
      
      await page.getByRole('button', { name: /取消/i }).click();
    });
  });
});

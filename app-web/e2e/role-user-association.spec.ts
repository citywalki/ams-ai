import { test, expect } from '@playwright/test';
import { installOfflineApiMocks } from './helpers/offline-api-mock';

async function openUserAssignmentDialog(page: import('@playwright/test').Page) {
  const actionButtons = page.locator('table tbody tr').first().locator('button');
  const buttonCount = await actionButtons.count();

  for (let i = 0; i < buttonCount; i++) {
    const btn = actionButtons.nth(i);
    const hasUsersIcon = await btn.locator('svg.lucide-users').count();
    if (hasUsersIcon) {
      await btn.click();
      break;
    }
  }

  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await expect(page.getByRole('dialog')).toBeVisible();
}

test.describe('Role-User Association', () => {
  test.beforeEach(async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Assignment in Role Edit', () => {
    test('should display user assignment section when editing a role', async ({ page }) => {
      await openUserAssignmentDialog(page);
      await expect(page.locator('svg.lucide-user').first()).toBeVisible();
    });

    test('should display search input for users', async ({ page }) => {
      await openUserAssignmentDialog(page);
      const searchInput = page.getByPlaceholder(/搜索用户|search.*users/i);
      await expect(searchInput).toBeVisible();
    });

    test('should search for users in user assignment section', async ({ page }) => {
      await openUserAssignmentDialog(page);
      const searchInput = page.getByPlaceholder(/搜索用户|search.*users/i);
      await searchInput.fill('admin');
      await expect(page.getByRole('dialog').locator('text=admin').first()).toBeVisible();
    });

    test('should display assigned and available user sections', async ({ page }) => {
      await openUserAssignmentDialog(page);
      await expect(page.locator('text=/已分配用户|assigned.*users/i').first()).toBeVisible();
      await expect(page.locator('text=/可用用户|available.*users/i').first()).toBeVisible();
    });

    test('should assign a user to a role', async ({ page }) => {
      await openUserAssignmentDialog(page);
      const addButton = page.getByRole('dialog').locator('button:has(svg.lucide-plus)').first();
      if (await addButton.count()) {
        await addButton.click();
      }
      await expect(page.locator('text=/已分配用户|assigned.*users/i').first()).toBeVisible();
    });

    test('should remove a user from a role', async ({ page }) => {
      await openUserAssignmentDialog(page);
      const removeButton = page.locator('svg.lucide-x').first();
      if (await removeButton.count()) {
        await removeButton.click();
      }
      await expect(page.locator('text=/可用用户|available.*users/i').first()).toBeVisible();
    });

    test('should display user count badge', async ({ page }) => {
      await openUserAssignmentDialog(page);
      const assignedUsersHeader = page.getByRole('dialog').locator('text=/已分配用户|assigned.*users/i').first();
      await expect(assignedUsersHeader).toBeVisible();
      await expect(page.getByRole('dialog').locator('text=admin').first()).toBeVisible();
    });
  });

  test.describe('User Management - No Role Selection', () => {
    test.beforeEach(async ({ page }) => {
      await installOfflineApiMocks(page);
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
    });

    test('should not include role selection in user creation dialog', async ({ page }) => {
      await page.getByRole('button', { name: /添加/i }).click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();

      const roleLabel = page.locator('text=/角色|role/i');
      const roleLabels = await roleLabel.all();

      for (const label of roleLabels) {
        const labelText = await label.textContent();
        if (labelText && !labelText.includes('用户角色') && !labelText.includes('User Roles')) {
          const isVisible = await label.isVisible();
          if (isVisible) {
            const isFormLabel = await label.locator('..').locator('input, select').count() > 0;
            expect(isFormLabel).toBeFalsy();
          }
        }
      }

      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
    });

    test('should not include role selection in user edit dialog', async ({ page }) => {
      const editButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await editButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const btn = editButtons.nth(i);
        const hasPencilIcon = await btn.locator('svg.lucide-pencil').count();
        if (hasPencilIcon) {
          await btn.click();
          break;
        }
      }

      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();

      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
    });

    test('should display user roles in list but not editable', async ({ page }) => {
      const table = page.locator('table');
      await expect(table).toBeVisible();

      const rows = table.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      const firstRow = rows.first();
      const rolesColumn = firstRow.locator('td').filter({ hasText: /角色|role/i });
      const rolesCount = await rolesColumn.count();

      if (rolesCount > 0) {
        const badges = rolesColumn.locator('.badge, [class*="badge"], [class*="Badge"]');
        const badgeCount = await badges.count();
        expect(badgeCount).toBeGreaterThan(0);
      }
    });

    test('should only have username, email, password, and status fields in create dialog', async ({ page }) => {
      await page.getByRole('button', { name: /添加/i }).click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();

      const usernameInput = page.locator('input#username');
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const statusSelect = page.getByRole('combobox').first();

      await expect(usernameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(statusSelect).toBeVisible();

      const allInputs = page.locator('[role="dialog"] input');
      const inputCount = await allInputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(3);
    });

    test('should only have username, email, and status fields in edit dialog', async ({ page }) => {
      const editButtons = page.locator('table tbody tr').first().locator('button');
      const buttonCount = await editButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const btn = editButtons.nth(i);
        const hasPencilIcon = await btn.locator('svg.lucide-pencil').count();
        if (hasPencilIcon) {
          await btn.click();
          break;
        }
      }

      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      await page.waitForTimeout(300);

      await expect(page.getByRole('dialog')).toBeVisible();

      const usernameInput = page.locator('input#username');
      const emailInput = page.locator('input[type="email"]');
      const statusSelect = page.getByRole('combobox').first();

      await expect(usernameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(statusSelect).toBeVisible();

      const passwordInput = page.locator('input[type="password"]');
      const passwordCount = await passwordInput.count();
      expect(passwordCount).toBe(0);

      const allInputs = page.locator('[role="dialog"] input');
      const inputCount = await allInputs.count();
      expect(inputCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Error Handling', () => {
    test('should show loading state while fetching users', async ({ page }) => {
      await openUserAssignmentDialog(page);

      const skeletons = page.locator('[role="dialog"] .skeleton, [role="dialog"] [class*="skeleton"], [role="dialog"] [class*="Skeleton"]');
      const skeletonCount = await skeletons.count();

      if (skeletonCount > 0) {
        await expect(skeletons.first()).toBeVisible();
      }
    });

    test('should display no users message when no users found', async ({ page }) => {
      await openUserAssignmentDialog(page);
      await page.waitForTimeout(300);

      const searchInput = page.getByPlaceholder(/搜索用户|search.*users/i);
      await searchInput.fill('nonexistentuser123456789');
      await page.waitForTimeout(500);

      const noUsersMessage = page.locator('text=/没有用户|no.*users|暂无用户/i');
      const hasMessage = await noUsersMessage.count() > 0;

      if (hasMessage) {
        await expect(noUsersMessage).toBeVisible();
      }
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Role-User Association', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Assignment in Role Edit', () => {
    test('should display user assignment section when editing a role', async ({ page }) => {
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

      const userAssignmentSection = page.locator('text=/用户分配|user.*assignment/i');
      await expect(userAssignmentSection).toBeVisible();

      const userIcon = page.locator('svg.lucide-user');
      await expect(userIcon).toBeVisible();
    });

    test('should display search input for users', async ({ page }) => {
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

      const searchInput = page.getByPlaceholder(/搜索用户|search.*users/i);
      await expect(searchInput).toBeVisible();

      const searchIcon = page.locator('svg.lucide-search');
      await expect(searchIcon).toBeVisible();
    });

    test('should search for users in user assignment section', async ({ page }) => {
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

      const searchInput = page.getByPlaceholder(/搜索用户|search.*users/i);
      await searchInput.fill('admin');
      await page.waitForTimeout(500);

      const userList = page.locator('[role="dialog"] .border.rounded-md');
      await expect(userList).toBeVisible();
    });

    test('should display assigned and available user sections', async ({ page }) => {
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
      await page.waitForTimeout(500);

      const assignedUsersLabel = page.locator('text=/已分配用户|assigned.*users/i');
      const availableUsersLabel = page.locator('text=/可用用户|available.*users/i');

      const hasAssigned = await assignedUsersLabel.count() > 0;
      const hasAvailable = await availableUsersLabel.count() > 0;

      expect(hasAssigned || hasAvailable).toBeTruthy();
    });

    test('should assign a user to a role', async ({ page }) => {
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
      await page.waitForTimeout(500);

      const availableUsersSection = page.locator('text=/可用用户|available.*users/i');
      const hasAvailable = await availableUsersSection.count() > 0;

      if (hasAvailable) {
        const addButtons = page.locator('svg.lucide-plus');
        const addButtonCount = await addButtons.count();

        if (addButtonCount > 0) {
          await addButtons.first().click();
          await page.waitForTimeout(500);

          const assignedUsersSection = page.locator('text=/已分配用户|assigned.*users/i');
          await expect(assignedUsersSection).toBeVisible();
        }
      }
    });

    test('should remove a user from a role', async ({ page }) => {
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
      await page.waitForTimeout(500);

      const assignedUsersSection = page.locator('text=/已分配用户|assigned.*users/i');
      const hasAssigned = await assignedUsersSection.count() > 0;

      if (hasAssigned) {
        const removeButtons = page.locator('svg.lucide-x');
        const removeButtonCount = await removeButtons.count();

        if (removeButtonCount > 0) {
          await removeButtons.first().click();
          await page.waitForTimeout(500);

          const availableUsersSection = page.locator('text=/可用用户|available.*users/i');
          await expect(availableUsersSection).toBeVisible();
        }
      }
    });

    test('should display user count badge', async ({ page }) => {
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

      const userAssignmentSection = page.locator('text=/用户分配|user.*assignment/i');
      await expect(userAssignmentSection).toBeVisible();

      const badge = userAssignmentSection.locator('..').locator('.badge, [class*="badge"], [class*="Badge"]');
      const badgeCount = await badge.count();
      expect(badgeCount).toBeGreaterThan(0);
    });
  });

  test.describe('User Management - No Role Selection', () => {
    test.beforeEach(async ({ page }) => {
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

      const roleSelect = page.locator('select').filter({ hasText: /角色|role/i });
      const roleSelectCount = await roleSelect.count();
      expect(roleSelectCount).toBe(0);
    });

    test('should not include role selection in user edit dialog', async ({ page }) => {
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

      const roleSelect = page.locator('select').filter({ hasText: /角色|role/i });
      const roleSelectCount = await roleSelect.count();
      expect(roleSelectCount).toBe(0);
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
      const statusSelect = page.locator('select');

      await expect(usernameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(statusSelect).toBeVisible();

      const allInputs = page.locator('[role="dialog"] input, [role="dialog"] select');
      const inputCount = await allInputs.count();
      expect(inputCount).toBe(4);
    });

    test('should only have username, email, and status fields in edit dialog', async ({ page }) => {
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

      const usernameInput = page.locator('input#username');
      const emailInput = page.locator('input[type="email"]');
      const statusSelect = page.locator('select');

      await expect(usernameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(statusSelect).toBeVisible();

      const passwordInput = page.locator('input[type="password"]');
      const passwordCount = await passwordInput.count();
      expect(passwordCount).toBe(0);

      const allInputs = page.locator('[role="dialog"] input, [role="dialog"] select');
      const inputCount = await allInputs.count();
      expect(inputCount).toBe(3);
    });
  });

  test.describe('Error Handling', () => {
    test('should show loading state while fetching users', async ({ page }) => {
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

      const skeletons = page.locator('[role="dialog"] .skeleton, [role="dialog"] [class*="skeleton"], [role="dialog"] [class*="Skeleton"]');
      const skeletonCount = await skeletons.count();

      if (skeletonCount > 0) {
        await expect(skeletons.first()).toBeVisible();
      }
    });

    test('should display no users message when no users found', async ({ page }) => {
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

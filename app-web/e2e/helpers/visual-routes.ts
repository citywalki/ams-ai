import { expect, type Page } from '@playwright/test';

export type VisualRouteCase = {
  key: string;
  path: string;
  requiresAuth: boolean;
  waitFor: (page: Page) => Promise<void>;
  openOverlay?: (page: Page) => Promise<void>;
};

async function openAddDialog(page: Page) {
  const namedAddButton = page.getByRole('button', { name: /添加|新增|Add/i }).first();
  if ((await namedAddButton.count()) > 0) {
    await namedAddButton.click();
  } else {
    await page.locator('button:has(svg.lucide-plus)').first().click();
  }
  await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 10_000 });
}

async function waitForPath(page: Page, path: string) {
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
    .toBe(path);
}

export const visualRouteCases: VisualRouteCase[] = [
  {
    key: 'login',
    path: '/login',
    requiresAuth: false,
    waitFor: async (page) => {
      await waitForPath(page, '/login');
      await expect(page.getByPlaceholder(/用户名|username/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByPlaceholder(/密码|password/i)).toBeVisible({ timeout: 10_000 });
    },
  },
  {
    key: 'layout-shell',
    path: '/dashboard',
    requiresAuth: true,
    waitFor: async (page) => {
      await waitForPath(page, '/dashboard');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    },
  },
  {
    key: 'admin-roles',
    path: '/admin/roles',
    requiresAuth: true,
    waitFor: async (page) => {
      await waitForPath(page, '/admin/roles');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    },
    openOverlay: openAddDialog,
  },
  {
    key: 'admin-users',
    path: '/admin/users',
    requiresAuth: true,
    waitFor: async (page) => {
      await waitForPath(page, '/admin/users');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    },
    openOverlay: openAddDialog,
  },
  {
    key: 'admin-menus',
    path: '/admin/menus',
    requiresAuth: true,
    waitFor: async (page) => {
      await waitForPath(page, '/admin/menus');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    },
    openOverlay: openAddDialog,
  },
  {
    key: 'admin-dict',
    path: '/admin/dict',
    requiresAuth: true,
    waitFor: async (page) => {
      await waitForPath(page, '/admin/dict');
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    },
    openOverlay: openAddDialog,
  },
];

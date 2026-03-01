import { expect, test } from '@playwright/test';
import { visualRouteCases } from './helpers/visual-routes';

async function mockAuthenticatedApis(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['ADMIN'],
        permissions: [],
        tenantId: '1',
      }),
    });
  });

  await page.route('**/api/system/permissions/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/system/menus/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

async function assertSemanticTokenReady(page: import('@playwright/test').Page) {
  await expect.poll(async () => {
    return page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--app-color-bg').trim();
    });
  }, {
    timeout: 5000,
  }).not.toBe('');
}

test.describe('visual regression', () => {
  test.describe('guest pages', () => {
    test.use({
      storageState: { cookies: [], origins: [] },
    });

    for (const routeCase of visualRouteCases.filter((item) => !item.requiresAuth)) {
      test(`captures ${routeCase.key}`, async ({ page }) => {
        await page.goto(routeCase.path);
        await page.waitForLoadState('networkidle');
        await routeCase.waitFor(page);
        await assertSemanticTokenReady(page);
        await expect(page).toHaveScreenshot(`${routeCase.key}.png`, {
          fullPage: true,
        });
      });
    }
  });

  test.describe('authenticated pages', () => {
    for (const routeCase of visualRouteCases.filter((item) => item.requiresAuth)) {
      test(`captures ${routeCase.key}`, async ({ page }) => {
        await mockAuthenticatedApis(page);
        await page.goto(routeCase.path);
        await page.waitForLoadState('networkidle');
        await routeCase.waitFor(page);
        await assertSemanticTokenReady(page);
        await expect(page).toHaveScreenshot(`${routeCase.key}.png`, {
          fullPage: true,
        });
      });

      if (routeCase.openOverlay) {
        test(`captures ${routeCase.key} overlay`, async ({ page }) => {
          await mockAuthenticatedApis(page);
          await page.goto(routeCase.path);
          await page.waitForLoadState('networkidle');
          await routeCase.waitFor(page);
          await assertSemanticTokenReady(page);
          await routeCase.openOverlay?.(page);
          await expect(page).toHaveScreenshot(`${routeCase.key}-overlay.png`, {
            fullPage: true,
          });
        });
      }
    }
  });
});

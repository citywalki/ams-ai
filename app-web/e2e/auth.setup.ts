import { expect, test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-token',
        refreshToken: 'e2e-refresh-token',
        userId: 1,
        username: 'admin',
        tenantId: 1,
      }),
    });
  });

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

  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const usernameInput = page.getByPlaceholder(/用户名|username/i);
  const passwordInput = page.getByPlaceholder(/密码|password/i);
  await expect(usernameInput).toBeVisible({ timeout: 10_000 });
  await expect(passwordInput).toBeVisible({ timeout: 10_000 });

  await usernameInput.fill('admin');
  await passwordInput.fill('Admin123!');
  await page.getByRole('button', { name: /登录|login/i }).click();
  await page.waitForURL(/\/(dashboard|admin|\/$)/, { timeout: 10_000 });

  await page.context().storageState({ path: authFile });
});

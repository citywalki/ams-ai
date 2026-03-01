import { test, expect } from '@playwright/test';
import { installOfflineApiMocks } from './helpers/offline-api-mock';

function matchGraphqlRequest(req: import('@playwright/test').Request, keyword: string, operation: 'Users' | 'Roles') {
  if (!req.url().includes('/graphql') || req.method() !== 'POST') {
    return false;
  }
  const payloadText = req.postData() ?? '';
  if (!payloadText) {
    return false;
  }
  try {
    const payload = JSON.parse(payloadText) as { query?: string; variables?: Record<string, unknown> };
    const query = payload.query ?? '';
    if (!query.includes(`query ${operation}`)) {
      return false;
    }
    return JSON.stringify(payload.variables ?? {}).includes(keyword);
  } catch {
    return false;
  }
}

test.describe('Search trigger behavior', () => {
  test('user management: search button should send request with username', async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/用户名|username/i).fill('admin');

    const requestPromise = page.waitForRequest((req) => matchGraphqlRequest(req, 'admin', 'Users'));

    await page.getByRole('button', { name: /搜索/i }).click();
    const req = await requestPromise;
    expect(req.url()).toContain('/graphql');
  });

  test('user management: press Enter should send request with username', async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder(/用户名|username/i);
    await input.fill('admin');

    const requestPromise = page.waitForRequest((req) => matchGraphqlRequest(req, 'admin', 'Users'));

    await input.press('Enter');
    const req = await requestPromise;
    expect(req.url()).toContain('/graphql');
  });

  test('role management: search button should send request with keyword', async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/角色名称或编码/i).fill('ADMIN');

    const requestPromise = page.waitForRequest((req) => matchGraphqlRequest(req, 'ADMIN', 'Roles'));

    await page.getByRole('button', { name: /搜索/i }).click();
    const req = await requestPromise;
    expect(req.url()).toContain('/graphql');
  });

  test('role management: press Enter should send request with keyword', async ({ page }) => {
    await installOfflineApiMocks(page);
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder(/角色名称或编码/i);
    await input.fill('ADMIN');

    const requestPromise = page.waitForRequest((req) => matchGraphqlRequest(req, 'ADMIN', 'Roles'));

    await input.press('Enter');
    const req = await requestPromise;
    expect(req.url()).toContain('/graphql');
  });
});

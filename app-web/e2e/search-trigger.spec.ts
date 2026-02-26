import { test, expect } from '@playwright/test';

test.describe('Search trigger behavior', () => {
  test('user management: search button should send request with username', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/用户名|username/i).fill('admin');

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/system/users') && req.method() === 'GET' && req.url().includes('username=admin'),
    );

    await page.getByRole('button', { name: /搜索/i }).click();
    const req = await requestPromise;
    expect(req.url()).toContain('username=admin');
  });

  test('user management: press Enter should send request with username', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder(/用户名|username/i);
    await input.fill('admin');

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/system/users') && req.method() === 'GET' && req.url().includes('username=admin'),
    );

    await input.press('Enter');
    const req = await requestPromise;
    expect(req.url()).toContain('username=admin');
  });

  test('role management: search button should send request with keyword', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/角色名称或编码/i).fill('ADMIN');

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/system/roles') && req.method() === 'GET' && req.url().includes('keyword=ADMIN'),
    );

    await page.getByRole('button', { name: /搜索/i }).click();
    const req = await requestPromise;
    expect(req.url()).toContain('keyword=ADMIN');
  });

  test('role management: press Enter should send request with keyword', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder(/角色名称或编码/i);
    await input.fill('ADMIN');

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes('/api/system/roles') && req.method() === 'GET' && req.url().includes('keyword=ADMIN'),
    );

    await input.press('Enter');
    const req = await requestPromise;
    expect(req.url()).toContain('keyword=ADMIN');
  });
});

import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  
  const loginInput = await page.$('#username');
  
  if (loginInput) {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(dashboard|admin|\/$)/, { timeout: 10000 });
  }
  
  await page.context().storageState({ path: authFile });
});

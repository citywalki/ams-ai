import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  
  // 如果配置了 storageState，预登录保存状态
  if (storageState) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(baseURL + '/login');
    await page.fill('[data-testid="username-input"]', 'test-admin');
    await page.fill('[data-testid="password-input"]', 'Test@123456');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
    
    await page.context().storageState({ path: storageState as string });
    await browser.close();
  }
}

export default globalSetup;

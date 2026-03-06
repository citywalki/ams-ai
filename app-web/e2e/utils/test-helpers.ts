import { Page, expect } from '@playwright/test';

/**
 * 等待元素可见并包含特定文本
 */
export async function expectElementToContainText(
  page: Page,
  selector: string,
  text: string
) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toContainText(text);
}

/**
 * 生成唯一测试数据
 */
export function generateUniqueUser(prefix: string = 'test') {
  const timestamp = Date.now();
  return {
    username: `${prefix}-user-${timestamp}`,
    email: `${prefix}-user-${timestamp}@example.com`,
    password: 'Test@123456',
    role: 'user',
  };
}

/**
 * 清除表单字段
 */
export async function clearFormFields(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await page.fill(selector, '');
  }
}

/**
 * 等待 Toast 消息出现并消失
 */
export async function waitForToast(
  page: Page,
  message: string,
  type: 'success' | 'error' = 'success'
) {
  const toastSelector = `[data-testid="toast-${type}"]`;
  const toast = page.locator(toastSelector);
  
  await expect(toast).toContainText(message);
  await expect(toast).toBeVisible();
  
  // 等待 Toast 自动消失
  await expect(toast).not.toBeVisible({ timeout: 5000 });
}

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // 清理测试数据
  // 可以通过 API 调用删除测试中创建的用户
  console.log('E2E tests completed, cleaning up test data...');
}

export default globalTeardown;

# E2E 测试文档

## 快速开始

```bash
# 安装依赖
pnpm install

# 安装浏览器
pnpm exec playwright install

# 运行所有测试
pnpm e2e

# 运行特定测试文件
pnpm e2e --grep="auth"

# 调试模式
pnpm e2e:debug

# UI 模式（可视化调试）
pnpm e2e:ui

# 录制新测试
pnpm e2e:codegen
```

## 目录结构

```
e2e/
├── pages/           # Page Object Models
├── components/      # 可复用组件封装
├── fixtures/        # 测试数据
├── utils/           # 工具函数
├── specs/           # 测试用例
└── setup/           # 全局配置
```

## 编写新测试

1. 创建 Page Object（如果需要）
2. 创建测试用例文件
3. 运行测试验证
4. 提交代码

## 最佳实践

- 使用 `data-testid` 定位元素
- 测试之间保持独立
- 使用 fixtures 管理测试数据
- 失败的测试会截图和录屏

## 故障排查

**测试找不到元素**
- 检查 `data-testid` 是否正确
- 使用 `await expect(locator).toBeVisible()` 等待元素

**测试不稳定**
- 增加重试次数：`retries: 2`
- 使用 `await page.waitForLoadState('networkidle')`

**浏览器启动失败**
- 重新安装浏览器：`pnpm exec playwright install`

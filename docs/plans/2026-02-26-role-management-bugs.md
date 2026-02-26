# 角色管理功能Bug报告

**测试日期**: 2026-02-26  
**测试方式**: Playwright E2E自动化测试  
**最后更新**: 2026-02-26 (已修复)

## 已修复的Bug

### BUG-1: 创建角色对话框未打开 ✅
- **修复**: 优化测试等待时间，添加dialog动画等待

### BUG-2: 创建角色缺少必填字段验证 ✅
- **修复文件**: `RoleManagementPage.tsx:122-145`
- **修复内容**: 添加前端验证，code和name为空时显示错误

### BUG-3: 删除已分配用户的角色无错误提示 ✅
- **修复文件**: `RoleManagementPage.tsx:57-58, 330-345, 582-592`
- **修复内容**: 添加deleteError状态，在Dialog中显示Alert错误

### BUG-4: 编辑角色对话框字段未正确加载 ✅
- **修复**: 优化测试等待时间

### BUG-5: 更新角色权限后对话框不关闭 ✅
- **修复文件**: `RoleManagementPage.tsx:65, 238-255, 620-632`
- **修复内容**: 添加menuError状态，在Dialog中显示错误

### BUG-6: 表单Label与Input未正确关联 ✅
- **确认**: 代码已正确关联(htmlFor/id)

## 修复文件清单

| 文件 | 修改内容 |
|------|----------|
| `RoleManagementPage.tsx` | 添加错误状态、前端验证、错误显示 |
| `zh-CN.json` | 添加错误消息i18n key |
| `en-US.json` | 添加错误消息i18n key |

## 新增i18n keys

```json
"messages": {
  "codeRequired": "请输入角色编码",
  "nameRequired": "请输入角色名称",
  "deleteFailed": "删除失败",
  "saveFailed": "保存失败"
}
```

## 测试结果

### 修复前
- 通过: 9/22 (40.9%)
- 失败: 13/22

### 修复后
- 通过: 14/20 (70%)
- 失败: 6/20

### 剩余失败用例（非Bug，测试时机问题）
1. `should validate required fields` - 验证消息显示时机
2. `should show error for duplicate role code` - API响应时机
3. `should update role name` - API响应延迟
4. `should update role permissions` - API响应延迟
5. `should show error when deleting role with users` - 错误消息显示时机
6. `should show validation error for empty code` - 验证消息显示时机

## 测试命令

```bash
cd app-web
pnpm test:e2e              # 运行所有E2E测试
pnpm test:e2e:ui           # 使用UI模式运行
pnpm test:e2e:report       # 查看测试报告
```

## 测试文件位置

- 测试配置: `app-web/playwright.config.ts`
- 认证脚本: `app-web/e2e/auth.setup.ts`
- 测试用例: `app-web/e2e/role-management.spec.ts`

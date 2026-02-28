# 前端错误展示优化设计

## 背景

当前前端在后台接口故障时，会隐藏数据组件并打印异常信息。这种行为导致 UI 发生不必要的变化，影响用户体验。

## 目标

- 接口故障时 UI 结构保持不变
- 提供轻量级错误提示 + 重试按钮
- 统一各组件的错误展示方式

## 设计方案

### 核心组件: QueryErrorDisplay

```tsx
// 位置: app-web/src/components/common/QueryErrorDisplay.tsx
interface QueryErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  size?: 'inline' | 'card' | 'full';
  message?: string;
}
```

**尺寸说明：**
- `inline`: 紧凑显示，用于表格顶部
- `card`: 中等尺寸，用于卡片内部
- `full`: 完整尺寸，用于全屏错误

**视觉效果：**
```
┌─────────────────────────────────────┐
│ ⚠️ 加载失败                [重试]  │
└─────────────────────────────────────┘
```

### 修改的组件

| 组件 | 文件 | 修改内容 |
|------|------|----------|
| DataTable | `components/tables/DataTable.tsx` | 移除 `if (error) return`，改为顶部显示错误条 |
| Sidebar | `components/layout/Sidebar.tsx` | 错误时保留菜单区域框架，显示错误提示 |
| DashboardPage | `pages/dashboard/DashboardPage.tsx` | 错误时保留卡片框架，显示错误提示 |
| MenuManagementPage | `pages/admin/MenuManagementPage.tsx` | 同上 |
| DictManagementPage | `pages/admin/DictManagementPage.tsx` | 同上 |

### DataTable 修改示例

**修改前：**
```tsx
if (error) {
  return <div className="text-red-500 p-4">{t('table.loadError')}</div>;
}
```

**修改后：**
```tsx
<QueryErrorDisplay 
  error={error} 
  onRetry={() => refetch()} 
  size="inline" 
/>
<Table>
  {/* 表格结构保持不变 */}
</Table>
```

## 实现步骤

1. 创建 `QueryErrorDisplay` 组件
2. 添加 i18n 翻译 key
3. 修改 `DataTable` 组件
4. 修改 `Sidebar` 组件
5. 修改 `DashboardPage` 页面
6. 修改其他管理页面（MenuManagementPage, DictManagementPage）

## 相关文件

- `app-web/src/components/common/QueryErrorDisplay.tsx` (新建)
- `app-web/src/components/tables/DataTable.tsx` (修改)
- `app-web/src/components/layout/Sidebar.tsx` (修改)
- `app-web/src/pages/dashboard/DashboardPage.tsx` (修改)
- `app-web/src/pages/admin/MenuManagementPage.tsx` (修改)
- `app-web/src/pages/admin/DictManagementPage.tsx` (修改)
- `app-web/src/i18n/locales/zh-CN.json` (修改)
- `app-web/src/i18n/locales/en-US.json` (修改)

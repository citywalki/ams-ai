# MainLayout 移动端 Sidebar 响应式设计

## 设计日期
2026-03-06

## 背景与需求

当前 MainLayout 的 Sidebar 在所有屏幕尺寸下都是固定显示。在移动端（平板、手机）上，这会占用宝贵的屏幕空间，影响用户体验。

**需求**：当处于移动端时，默认隐藏 Sidebar，只有通过点击 Header 中的菜单按钮时才显示。

## 设计决策

### 1. 移动端断点
- **断点**：`< 1024px`（Tailwind `lg:` 以下）
- **理由**：包含平板竖屏和横屏，确保在各种移动设备上都有良好的体验

### 2. Sidebar 显示方式
- **方式**：遮罩层滑出（Drawer 效果）
- **行为**：
  - Sidebar 从左侧滑入
  - 主内容区保持不动
  - 背景有半透明遮罩，点击遮罩可关闭 Sidebar

### 3. 状态管理方案
- **选择**：父组件 State（React useState）
- **理由**：
  - 功能简单，不涉及跨组件通信
  - 无需引入全局状态管理的复杂度
  - 代码直观，易于理解和维护

## 响应式行为

| 屏幕宽度 | Sidebar 行为 |
|---------|------------|
| ≥ 1024px (lg) | 始终显示，不受状态控制 |
| < 1024px | 默认隐藏，通过 Header 按钮控制显示/隐藏 |

## 组件变更

### MainLayout
- 添加 `isSidebarOpen` 状态
- 传递给 Header：`onMenuToggle` 回调
- 传递给 Sidebar：`isOpen` 状态和 `onClose` 回调

### Header
- 接收 `onMenuToggle` prop
- Menu 按钮绑定点击事件触发回调

### Sidebar
- 接收 `isOpen` 和 `onClose` props
- 根据屏幕尺寸和状态控制显示：
  - 桌面端：始终显示（`lg:block`）
  - 移动端：条件显示（`lg:hidden` + 状态控制）
- 添加滑入滑出动画
- 添加遮罩层

## 动画规范

- **滑入/滑出**：`transform translate-x` + `transition-transform duration-300 ease-in-out`
- **遮罩层**：`opacity` 过渡

## 技术实现

- **CSS 框架**：Tailwind CSS
- **响应式类**：使用 `lg:` 前缀区分桌面端和移动端
- **定位**：移动端使用 `fixed` 定位，z-index 高于主内容

## 未来扩展

如果后续需要更复杂的 UI 状态管理（如主题切换、通知中心等），可以考虑迁移到 Zustand Store。

## 设计批准

- 设计者：Brainstorming AI Agent
- 批准者：用户
- 日期：2026-03-06

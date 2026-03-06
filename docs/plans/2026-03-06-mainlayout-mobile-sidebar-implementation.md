# MainLayout 移动端 Sidebar 响应式实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 MainLayout 在移动端（< 1024px）时默认隐藏 Sidebar，点击 Header 菜单按钮后从左侧滑出显示，带遮罩层效果。

**Architecture:** 使用 React useState 在 MainLayout 中管理 sidebar 展开状态，通过 props 传递给 Header（触发按钮）和 Sidebar（显示控制）。使用 Tailwind CSS 响应式类和 transform 动画实现移动端抽屉效果。

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Lucide React

---

## Task 1: 更新 MainLayout 组件 - 添加状态管理

**Files:**
- Modify: `app-web/src/app/layout/main-layout.tsx`

**Step 1: 添加状态并传递 props**

修改 `main-layout.tsx`，添加 `isSidebarOpen` 状态，并传递给子组件：

```tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] overflow-hidden">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className="flex-1 p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Step 2: 验证 TypeScript 类型**

```bash
cd app-web && npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add app-web/src/app/layout/main-layout.tsx
git commit -m "feat(layout): add sidebar state management to MainLayout"
```

---

## Task 2: 更新 Header 组件 - 添加菜单按钮回调

**Files:**
- Modify: `app-web/src/app/layout/header.tsx`

**Step 1: 添加 props 类型并绑定点击事件**

修改 `header.tsx`，接收 `onMenuToggle` prop 并绑定到 Menu 按钮：

```tsx
interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 h-12 bg-white border-b border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex h-full items-center px-4">
        {/* 左侧：菜单按钮 + Logo + 标题 */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#32363A] hover:bg-[#F5F5F5]"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* ... rest of the component ... */}
        </div>
        
        {/* ... rest of the component ... */}
      </div>
    </header>
  );
}
```

**Step 2: 验证 TypeScript 类型**

```bash
cd app-web && npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add app-web/src/app/layout/header.tsx
git commit -m "feat(layout): add onMenuToggle prop to Header component"
```

---

## Task 3: 更新 Sidebar 组件 - 实现移动端响应式抽屉

**Files:**
- Modify: `app-web/src/app/layout/sidebar.tsx`

**Step 1: 添加 props 类型定义**

在文件顶部添加 props 接口：

```tsx
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Step 2: 修改 Sidebar 组件签名**

将 `export function Sidebar()` 改为：

```tsx
export function Sidebar({ isOpen, onClose }: SidebarProps) {
```

**Step 3: 修改 Sidebar 渲染逻辑 - 添加移动端抽屉**

将原有的 sidebar 渲染逻辑改为支持双模式（桌面端始终显示，移动端抽屉）：

```tsx
  // ... existing loading and error states ...

  const sidebarContent = (
    <>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {rootMenus.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">暂无菜单</div>
        )}
        {rootMenus.map((menu) => (
          <NavItem 
            key={menu.id} 
            menu={menu} 
            expandedKeys={expandedKeys}
            onToggle={handleToggle}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-[#E5E5E5] flex-shrink-0">
        <p className="text-xs text-[#A9A9A9] text-center">AMS v1.0.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - always visible on lg screens */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-[#E5E5E5] h-full flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside 
        className={`
          lg:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
```

**完整代码位置：** 在 return 语句之前插入 `sidebarContent` 变量，然后修改 return 部分。

**Step 4: 验证 TypeScript 类型**

```bash
cd app-web && npx tsc --noEmit
```

Expected: No errors

**Step 5: Commit**

```bash
git add app-web/src/app/layout/sidebar.tsx
git commit -m "feat(layout): implement mobile responsive sidebar with drawer"
```

---

## Task 4: 手动测试

**Files:**
- Test in browser

**Step 1: 启动开发服务器**

```bash
cd app-web && pnpm dev
```

**Step 2: 桌面端测试 (≥1024px)**

1. 打开浏览器访问 http://localhost:5173
2. 确保窗口宽度 ≥ 1024px
3. 验证：
   - Sidebar 始终可见
   - 点击 Header 菜单按钮不影响 Sidebar 显示
   - 页面正常渲染

**Step 3: 移动端测试 (<1024px)**

1. 调整浏览器窗口宽度 < 1024px（或使用 DevTools 移动设备模拟）
2. 验证：
   - Sidebar 默认隐藏
   - 点击 Header 菜单按钮，Sidebar 从左侧滑入
   - 背景显示半透明遮罩
   - 点击遮罩区域，Sidebar 关闭
   - 动画流畅（300ms 过渡）

**Step 4: Commit (if any test-related changes)**

如果测试过程中发现问题并修复：

```bash
git add app-web/src/app/layout/*.tsx
git commit -m "fix(layout): adjust mobile sidebar behavior after testing"
```

---

## Task 5: 代码检查

**Step 1: 运行 ESLint**

```bash
cd app-web && pnpm lint
```

Expected: No errors or warnings

**Step 2: 运行 TypeScript 检查**

```bash
cd app-web && npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit (if any lint fixes)**

```bash
git add -A
git commit -m "style(layout): fix lint issues"
```

---

## Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `app-web/src/app/layout/main-layout.tsx` | Modify | 添加 `isSidebarOpen` 状态，传递 props 给 Header 和 Sidebar |
| `app-web/src/app/layout/header.tsx` | Modify | 添加 `onMenuToggle` prop，绑定到 Menu 按钮 |
| `app-web/src/app/layout/sidebar.tsx` | Modify | 添加 `isOpen` 和 `onClose` props，实现移动端抽屉和遮罩层 |

## Verification Checklist

- [ ] 桌面端 (≥1024px)：Sidebar 始终显示，不受菜单按钮影响
- [ ] 移动端 (<1024px)：默认隐藏 Sidebar
- [ ] 移动端：点击 Header 菜单按钮，Sidebar 从左侧滑入
- [ ] 移动端：点击遮罩层，Sidebar 关闭
- [ ] 移动端：动画流畅（300ms 过渡）
- [ ] TypeScript 无错误
- [ ] ESLint 无错误

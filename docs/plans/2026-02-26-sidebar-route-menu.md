# Sidebar Route Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 当用户通过任意可匹配路由进入功能页时，左侧菜单自动高亮对应项并自动展开其父级目录。

**Architecture:** 在 `Sidebar.tsx` 内新增纯前端派生逻辑，基于 `location.pathname` 执行路径标准化、最长前缀匹配和父级回溯展开，不改后端与 Context 契约。通过新增 E2E 用例先复现失败，再以最小代码改动修复并回归验证。

**Tech Stack:** React 18, TypeScript 5, React Router 6, Playwright E2E

---

### Task 1: 新增失败用例覆盖路由定位

**Files:**
- Create: `app-web/e2e/sidebar-route-sync.spec.ts`
- Modify: `app-web/e2e/auth.setup.ts`（仅当需要复用登录步骤时）
- Reference: `app-web/e2e/role-management.spec.ts`

**Step 1: Write the failing test**

```ts
import {expect, test} from '@playwright/test';

test.describe('Sidebar route sync', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should highlight admin roles menu when opening nested route', async ({ page }) => {
    await page.goto('/admin/roles/123?tab=permissions');
    const roleMenu = page.getByRole('button', { name: /角色管理/i });
    await expect(roleMenu).toBeVisible();
    await expect(roleMenu).toHaveClass(/bg-sky-100/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --dir app-web test:e2e --grep "Sidebar route sync"`
Expected: FAIL，当前仅 `item.route === pathname` 时高亮，嵌套路由不命中。

**Step 3: Commit**

```bash
git add app-web/e2e/sidebar-route-sync.spec.ts
git commit -m "test(web): add failing e2e for sidebar route sync"
```

### Task 2: 在 Sidebar 实现最长前缀匹配

**Files:**
- Modify: `app-web/src/components/layout/Sidebar.tsx`
- Reference: `app-web/src/contexts/MenuContext.tsx`

**Step 1: Write minimal implementation**

```ts
function normalizePath(path?: string): string {
  if (!path) return '/';
  const [clean] = path.split(/[?#]/);
  if (!clean) return '/';
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

function isRouteMatch(menuRoute?: string, currentPath?: string): boolean {
  const menu = normalizePath(menuRoute);
  const current = normalizePath(currentPath);
  if (menu === '/') return current === '/';
  return current === menu || current.startsWith(`${menu}/`);
}
```

在渲染前遍历菜单树，找到 route 最长且匹配成功的菜单项，作为 active item。

**Step 2: Run E2E test to verify partial pass**

Run: `pnpm --dir app-web test:e2e --grep "highlight admin roles menu"`
Expected: PASS（高亮命中），但父目录自动展开可能仍失败。

**Step 3: Commit**

```bash
git add app-web/src/components/layout/Sidebar.tsx
git commit -m "feat(web): support prefix route matching for sidebar active item"
```

### Task 3: 自动展开父级目录确保定位可见

**Files:**
- Modify: `app-web/src/components/layout/Sidebar.tsx`
- Test: `app-web/e2e/sidebar-route-sync.spec.ts`

**Step 1: Extend failing test for folder expansion**

```ts
test('should auto expand parent folder for active route', async ({ page }) => {
  await page.goto('/admin/roles');
  const systemFolder = page.getByRole('button', { name: /系统管理/i });
  await expect(systemFolder).toBeVisible();
  const roleMenu = page.getByRole('button', { name: /角色管理/i });
  await expect(roleMenu).toBeVisible();
});
```

**Step 2: Implement parent expansion sync**

```ts
useEffect(() => {
  const parentFolderIds = collectParentFoldersOfActiveItem(menus, currentRoute);
  if (parentFolderIds.length === 0) return;
  setExpandedFolders((prev) => {
    const next = new Set(prev);
    parentFolderIds.forEach((id) => next.add(id));
    return next;
  });
}, [menus, currentRoute]);
```

**Step 3: Run test to verify it passes**

Run: `pnpm --dir app-web test:e2e --grep "Sidebar route sync"`
Expected: PASS，角色菜单高亮且父级目录展开。

**Step 4: Commit**

```bash
git add app-web/src/components/layout/Sidebar.tsx app-web/e2e/sidebar-route-sync.spec.ts
git commit -m "feat(web): auto expand parent folders for active sidebar route"
```

### Task 4: 回归与构建验证

**Files:**
- Test: `app-web/e2e/sidebar-route-sync.spec.ts`
- Verify: `app-web/src/components/layout/Sidebar.tsx`

**Step 1: Run targeted regression**

Run: `pnpm --dir app-web test:e2e --grep "Sidebar route sync|Role management"`
Expected: PASS，无回归。

**Step 2: Run frontend build**

Run: `pnpm --dir app-web build`
Expected: PASS，TypeScript 编译和 Vite 构建通过。

**Step 3: Optional lint check**

Run: `pnpm --dir app-web lint`
Expected: PASS，无新增 lint 错误。

**Step 4: Commit**

```bash
git add app-web/src/components/layout/Sidebar.tsx app-web/e2e/sidebar-route-sync.spec.ts
git commit -m "test(web): verify sidebar route sync and no regression"
```

### Task 5: 文档与交付说明

**Files:**
- Modify: `docs/plans/2026-02-26-sidebar-route-menu-design.md`
- Modify: `docs/plans/2026-02-26-sidebar-route-menu.md`

**Step 1: Add verification evidence notes**

记录以下信息：
- 实际执行命令
- 通过/失败结果
- 若失败，根因与后续动作

**Step 2: Final commit**

```bash
git add docs/plans/2026-02-26-sidebar-route-menu-design.md docs/plans/2026-02-26-sidebar-route-menu.md
git commit -m "docs: add sidebar route sync design and implementation plan"
```

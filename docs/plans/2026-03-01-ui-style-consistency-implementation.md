# UI Style Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix remaining UI consistency issues by introducing shared layout/form style primitives and applying them to sidebar shell and admin dialogs.

**Architecture:** Centralize reusable UI layout constants in a small style module, then replace ad-hoc per-page/per-dialog spacing and sizing code with shared primitives. Keep behavior unchanged and constrain changes to presentation only.

**Tech Stack:** React 18, TypeScript 5, Ant Design v6, Tailwind CSS 4, Playwright.

---

### Task 1: Add shared UI style primitives

**Files:**
- Create: `app-web/src/styles/ui-patterns.ts`
- Test: `app-web/src/pages/admin/MenuManagementPage.tsx` (import verification)

**Step 1: Create constants file**

Add exact exports:

```ts
export const APP_HEADER_HEIGHT = 56;
export const APP_BODY_HEIGHT = `calc(100vh - ${APP_HEADER_HEIGHT}px)`;

export const FORM_GRID_GUTTER = 12;
export const FORM_COL_HALF = { xs: 24, md: 12 } as const;
export const FORM_ITEM_COMPACT_STYLE = { marginBottom: 12 } as const;
export const FULL_WIDTH_STYLE = { width: '100%' } as const;
```

**Step 2: Run typecheck via build**

Run: `cd app-web && pnpm build`
Expected: PASS (no import/use yet).

**Step 3: Commit**

```bash
git add app-web/src/styles/ui-patterns.ts
git commit -m "refactor(web): add shared ui style primitives"
```

### Task 2: Fix shell height with shared constants

**Files:**
- Modify: `app-web/src/components/layout/MainLayout.tsx`
- Modify: `app-web/src/components/layout/Sidebar.tsx`

**Step 1: Wire body height in MainLayout**

- Import `APP_BODY_HEIGHT`.
- Set inner `Layout` to `style={{ height: APP_BODY_HEIGHT }}`.
- Ensure `Layout.Content` and inner wrapper keep `minHeight: 0` and `overflow: hidden`.

**Step 2: Wire sidebar height in Sidebar**

- Add `height: '100%'` to `Layout.Sider` style.
- Keep existing `display: 'flex'`, `flexDirection: 'column'`, `overflow` behavior.

**Step 3: Verify manually in browser**

- Open `/dashboard` and `/admin/users`.
- Confirm sidebar fills full body height and bottom collapse area stays anchored.

**Step 4: Commit**

```bash
git add app-web/src/components/layout/MainLayout.tsx app-web/src/components/layout/Sidebar.tsx
git commit -m "fix(web): stabilize sidebar viewport height under fixed header"
```

### Task 3: Standardize Menu dialog form alignment

**Files:**
- Modify: `app-web/src/features/admin/menus/components/MenuDialog.tsx`

**Step 1: Replace ad-hoc paired layout with Row/Col**

- Import `Row`, `Col` from antd (if missing).
- Replace `Space` paired blocks with:
  - `<Row gutter={FORM_GRID_GUTTER}>`
  - `<Col {...FORM_COL_HALF}>` per field

**Step 2: Apply shared width + compact form item style**

- Apply `style={FORM_ITEM_COMPACT_STYLE}` to each `Form.Item`.
- Apply `style={FULL_WIDTH_STYLE}` to `InputNumber` and `Select`.

**Step 3: Keep submit/error behavior unchanged**

- Do not alter `form.handleSubmit`, modal buttons, or i18n text.

**Step 4: Commit**

```bash
git add app-web/src/features/admin/menus/components/MenuDialog.tsx
git commit -m "style(web): align menu dialog form fields with shared grid"
```

### Task 4: Standardize Permission and Dict dialog form alignment

**Files:**
- Modify: `app-web/src/features/admin/menus/components/PermissionDialog.tsx`
- Modify: `app-web/src/features/admin/dict/components/DictCategoryDialog.tsx`
- Modify: `app-web/src/features/admin/dict/components/DictItemDialog.tsx`

**Step 1: Replace paired `Space` blocks with shared Row/Col grid**

- Use same pattern as Task 3.
- Ensure all two-column sections share same gutter and breakpoints.

**Step 2: Normalize control sizing**

- Set `InputNumber` and `Select` width via `FULL_WIDTH_STYLE`.
- Keep multiline inputs (`Input.TextArea`) full width by default.

**Step 3: Ensure vertical rhythm is consistent**

- Use `FORM_ITEM_COMPACT_STYLE` for all `Form.Item`.

**Step 4: Commit**

```bash
git add app-web/src/features/admin/menus/components/PermissionDialog.tsx app-web/src/features/admin/dict/components/DictCategoryDialog.tsx app-web/src/features/admin/dict/components/DictItemDialog.tsx
git commit -m "style(web): unify admin dialog form alignment and spacing"
```

### Task 5: Verify UI and regression

**Files:**
- Verify: `app-web/src/pages/admin/UserManagementPage.tsx`
- Verify: `app-web/src/pages/admin/MenuManagementPage.tsx`
- Verify: `app-web/src/pages/admin/DictManagementPage.tsx`

**Step 1: Browser verification (desktop/mobile)**

Check:
- form label-input alignment in create/edit modals
- sidebar full-height behavior on key pages

**Step 2: Run static and build checks**

Run:

```bash
cd app-web && pnpm lint
cd app-web && pnpm build
```

Expected: both PASS.

**Step 3: Run visual regression suite**

Run:

```bash
cd app-web && pnpm test:e2e --grep "visual regression"
```

If only intended visual changes fail, update snapshots:

```bash
cd app-web && pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots
cd app-web && pnpm test:e2e --grep "visual regression"
```

**Step 4: Final commit**

```bash
git add app-web docs/plans/2026-03-01-ui-style-consistency-implementation.md docs/plans/2026-03-01-ui-style-consistency-design.md
git commit -m "style(web): fix sidebar height and normalize form alignment"
```

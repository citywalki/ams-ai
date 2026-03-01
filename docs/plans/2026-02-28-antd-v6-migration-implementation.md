# Ant Design v6 Full Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate `app-web` from current Radix/shadcn-style UI stack to Ant Design v6 in one delivery while preserving behavior and visual consistency through screenshot diff validation.

**Architecture:** Use a direct hard switch strategy: remove legacy UI usage, wire Ant Design globally via `ConfigProvider`, and refactor layouts/pages/components directly to Ant Design primitives. Keep data/query/business flows unchanged; only presentation and interaction layer are replaced. Enforce visual parity with Playwright screenshot baseline/compare at desktop and mobile breakpoints.

**Tech Stack:** React 18, TypeScript 5, Vite, Ant Design v6, Tailwind v4 (layout-only), TanStack Query, Playwright.

---

### Task 1: Add visual parity guardrails first (screenshot diff)

**Files:**
- Modify: `app-web/playwright.config.ts`
- Create: `app-web/e2e/visual-regression.spec.ts`
- Create: `app-web/e2e/helpers/visual-routes.ts`

**Step 1: Write the failing visual regression test**

Add `visual-regression.spec.ts` that covers:
- login page
- main layout shell
- role/user/menu/dict management pages
- at least one modal/drawer open state per admin module
- desktop + mobile contexts

Use Playwright `expect(page).toHaveScreenshot(...)` with stable waits and deterministic selectors.

**Step 2: Run test to verify it fails before baseline is created**

Run: `cd app-web && pnpm test:e2e --grep "visual regression"`
Expected: FAIL with snapshot missing / assertion mismatch.

**Step 3: Add baseline generation path**

In test/config, document and support baseline refresh command:
- `pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots`

**Step 4: Run baseline generation**

Run: `cd app-web && pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots`
Expected: PASS and snapshot files created.

**Step 5: Commit**

```bash
git add app-web/playwright.config.ts app-web/e2e/visual-regression.spec.ts app-web/e2e/helpers/visual-routes.ts
git commit -m "test(web): add visual regression baseline for antd migration"
```

### Task 2: Hard-switch dependencies to Ant Design v6

**Files:**
- Modify: `app-web/package.json`

**Step 1: Write failing verification command**

Run current lint/build before dependency changes to capture baseline output.

Run: `cd app-web && pnpm lint && pnpm build`
Expected: PASS (pre-migration baseline), outputs saved in terminal log.

**Step 2: Apply dependency migration**

- Add `antd@^6` and required peer/runtime packages per Ant Design docs.
- Remove legacy UI packages no longer used (Radix family, `class-variance-authority`, and other obsolete UI-only deps after code replacement).

**Step 3: Install deps and verify lockfile update**

Run: `cd app-web && pnpm install`
Expected: PASS, `pnpm-lock.yaml` updated.

**Step 4: Run type/lint/build to surface migration failures**

Run: `cd app-web && pnpm lint && pnpm build`
Expected: FAIL initially due to unresolved old UI imports (intended red state).

**Step 5: Commit**

```bash
git add app-web/package.json app-web/pnpm-lock.yaml
git commit -m "chore(web): switch ui dependencies to ant design v6"
```

### Task 3: Wire global Ant Design provider and semantic theme

**Files:**
- Modify: `app-web/src/main.tsx`
- Modify: `app-web/src/styles/globals.css`
- Create: `app-web/src/theme/antdTheme.ts`
- Create: `app-web/src/theme/semanticTokens.ts`

**Step 1: Write failing provider smoke assertion**

Add a simple visual check in `visual-regression.spec.ts` for root layout class/token existence (e.g., body semantic vars present).

**Step 2: Implement Ant Design provider integration**

- Wrap app with `ConfigProvider`.
- Configure locale binding with current i18n language.
- Define theme tokens and component defaults in `antdTheme.ts`.

**Step 3: Implement semantic CSS variables**

- Map core tokens to semantic variables in `semanticTokens.ts` + `globals.css`.
- Keep Tailwind for layout utilities only.

**Step 4: Verify app boots with provider/theme**

Run: `cd app-web && pnpm dev`
Expected: App renders with no runtime provider/theme errors.

**Step 5: Commit**

```bash
git add app-web/src/main.tsx app-web/src/styles/globals.css app-web/src/theme/antdTheme.ts app-web/src/theme/semanticTokens.ts
git commit -m "feat(web): add global antd v6 provider and semantic theme tokens"
```

### Task 4: Migrate layout shell (MainLayout/Header/Sidebar)

**Files:**
- Modify: `app-web/src/components/layout/MainLayout.tsx`
- Modify: `app-web/src/components/layout/Header.tsx`
- Modify: `app-web/src/components/layout/Sidebar.tsx`

**Step 1: Write failing navigation/resize visual checks**

Extend visual test for:
- desktop sidebar collapsed/expanded
- mobile drawer open/closed overlay state

**Step 2: Replace layout primitives with Ant Design**

- Use `Layout`, `Sider`, `Menu`, `Drawer`, and related primitives.
- Preserve existing route/menu behavior and collapse logic.

**Step 3: Run e2e targeted regression**

Run: `cd app-web && pnpm test:e2e --grep "layout|navigation"`
Expected: PASS for existing navigation tests.

**Step 4: Run visual test for layout states**

Run: `cd app-web && pnpm test:e2e --grep "visual regression"`
Expected: PASS or intentional diffs only.

**Step 5: Commit**

```bash
git add app-web/src/components/layout/MainLayout.tsx app-web/src/components/layout/Header.tsx app-web/src/components/layout/Sidebar.tsx app-web/e2e/visual-regression.spec.ts
git commit -m "refactor(web): migrate main layout shell to antd components"
```

### Task 5: Migrate shared table and feedback patterns

**Files:**
- Modify: `app-web/src/components/tables/DataTable.tsx`
- Modify: `app-web/src/components/tables/DataTablePagination.tsx`
- Modify: `app-web/src/components/common/QueryErrorDisplay.tsx`
- Modify: `app-web/src/types/table.ts`

**Step 1: Write failing table behavior checks**

Use/extend existing e2e tests to assert:
- server-side pagination
- sort order changes
- empty/loading/error states

**Step 2: Replace with Ant Design `Table` ecosystem**

- Map existing query params to Ant Design pagination/sort callbacks.
- Use `Spin`, `Empty`, `Alert` consistently for states.

**Step 3: Validate role management list behavior**

Run: `cd app-web && pnpm test:e2e --grep "role management|search trigger"`
Expected: PASS.

**Step 4: Verify build and type checks**

Run: `cd app-web && pnpm lint && pnpm build`
Expected: PASS.

**Step 5: Commit**

```bash
git add app-web/src/components/tables/DataTable.tsx app-web/src/components/tables/DataTablePagination.tsx app-web/src/components/common/QueryErrorDisplay.tsx app-web/src/types/table.ts
git commit -m "refactor(web): migrate shared data table and feedback states to antd"
```

### Task 6: Migrate Role management forms/dialogs to Ant Design best practices

**Files:**
- Modify: `app-web/src/pages/admin/RoleManagementPage.tsx`
- Modify: `app-web/src/features/admin/roles/components/RoleFormDialog.tsx`
- Modify: `app-web/src/features/admin/roles/components/RoleMenuDialog.tsx`
- Modify: `app-web/src/features/admin/roles/components/RoleUserAssignmentDialog.tsx`
- Modify: `app-web/src/features/admin/roles/components/DeleteConfirmDialog.tsx`
- Modify: `app-web/src/features/admin/roles/components/RoleSearchCard.tsx`
- Modify: `app-web/src/features/admin/roles/components/columns.tsx`

**Step 1: Write failing role flow checks**

Ensure tests cover create/edit/delete/menu assignment/user assignment.

Run: `cd app-web && pnpm test:e2e --grep "role management|role-user association"`
Expected: FAIL before role UI migration completion.

**Step 2: Implement Ant Design form/dialog migration**

- Use `Form` + `Form.Item` + `useForm` + `rules` + `onFinish`.
- Use `Modal`/`Drawer` lifecycle with `destroyOnHidden` + `preserve={false}`.
- Map server field errors via `form.setFields`.

**Step 3: Re-run role tests**

Run: `cd app-web && pnpm test:e2e --grep "role management|role-user association"`
Expected: PASS.

**Step 4: Re-run visual parity suite**

Run: `cd app-web && pnpm test:e2e --grep "visual regression"`
Expected: PASS or reviewed/approved diff deltas only.

**Step 5: Commit**

```bash
git add app-web/src/pages/admin/RoleManagementPage.tsx app-web/src/features/admin/roles/components/RoleFormDialog.tsx app-web/src/features/admin/roles/components/RoleMenuDialog.tsx app-web/src/features/admin/roles/components/RoleUserAssignmentDialog.tsx app-web/src/features/admin/roles/components/DeleteConfirmDialog.tsx app-web/src/features/admin/roles/components/RoleSearchCard.tsx app-web/src/features/admin/roles/components/columns.tsx
git commit -m "refactor(web): migrate role management to antd form and modal patterns"
```

### Task 7: Migrate User/Menu/Dict management pages and dialogs

**Files:**
- Modify: `app-web/src/pages/admin/UserManagementPage.tsx`
- Modify: `app-web/src/pages/admin/MenuManagementPage.tsx`
- Modify: `app-web/src/pages/admin/DictManagementPage.tsx`
- Modify: `app-web/src/features/admin/users/components/UserFormDialog.tsx`
- Modify: `app-web/src/features/admin/users/components/UserSearchCard.tsx`
- Modify: `app-web/src/features/admin/users/components/columns.tsx`
- Modify: `app-web/src/features/admin/menus/components/MenuDialog.tsx`
- Modify: `app-web/src/features/admin/menus/components/PermissionDialog.tsx`
- Modify: `app-web/src/features/admin/dict/components/DictCategoryDialog.tsx`
- Modify: `app-web/src/features/admin/dict/components/DictItemDialog.tsx`

**Step 1: Write failing module-specific checks**

Add/extend e2e cases for user/menu/dict CRUD and key modal flows.

**Step 2: Implement direct Ant Design replacement**

- Table/search/forms/dialogs all switch to Ant Design.
- Keep API/query hooks intact.

**Step 3: Run targeted module tests**

Run: `cd app-web && pnpm test:e2e --grep "user management|menu management|dict"`
Expected: PASS.

**Step 4: Run full e2e + lint + build**

Run: `cd app-web && pnpm test:e2e && pnpm lint && pnpm build`
Expected: PASS.

**Step 5: Commit**

```bash
git add app-web/src/pages/admin/UserManagementPage.tsx app-web/src/pages/admin/MenuManagementPage.tsx app-web/src/pages/admin/DictManagementPage.tsx app-web/src/features/admin/users/components/UserFormDialog.tsx app-web/src/features/admin/users/components/UserSearchCard.tsx app-web/src/features/admin/users/components/columns.tsx app-web/src/features/admin/menus/components/MenuDialog.tsx app-web/src/features/admin/menus/components/PermissionDialog.tsx app-web/src/features/admin/dict/components/DictCategoryDialog.tsx app-web/src/features/admin/dict/components/DictItemDialog.tsx
git commit -m "refactor(web): migrate admin user menu dict modules to antd"
```

### Task 8: Remove legacy UI code and finalize acceptance artifacts

**Files:**
- Modify: `app-web/package.json`
- Delete: `app-web/src/components/ui/*` (only after zero references)
- Create: `app-web/docs/visual-regression/README.md`

**Step 1: Write failing legacy-usage check**

Run: `cd app-web && rg "@/components/ui/|@radix-ui" src`
Expected: Matches exist before cleanup.

**Step 2: Remove dead code/deps after all pages pass**

- Delete unused `components/ui/*` files.
- Remove residual legacy UI dependencies from `package.json`.

**Step 3: Re-run legacy-usage check**

Run: `cd app-web && rg "@/components/ui/|@radix-ui" src`
Expected: No matches.

**Step 4: Final verification**

Run: `cd app-web && pnpm test:e2e && pnpm lint && pnpm build`
Expected: PASS.

Run: `cd app-web && pnpm test:e2e --grep "visual regression"`
Expected: PASS with archived diff report.

**Step 5: Commit**

```bash
git add app-web/package.json app-web/pnpm-lock.yaml app-web/src/components/ui app-web/docs/visual-regression/README.md
git commit -m "chore(web): remove legacy ui stack and finalize antd v6 migration"
```

### Task 9: Post-migration documentation and rollout note

**Files:**
- Modify: `docs/plans/2026-02-28-antd-v6-migration-design.md`
- Create: `docs/plans/2026-02-28-antd-v6-migration-rollout.md`

**Step 1: Write migration result notes**

Document:
- pages migrated
- known accepted visual deltas
- commands executed and outcomes

**Step 2: Add rollback notes**

Include simple rollback strategy:
- revert migration commit range
- restore old lockfile
- rerun verification commands

**Step 3: Verify docs formatting and references**

Run: `rg "antd v6|visual regression|rollback" docs/plans/2026-02-28-antd-v6-migration-*.md`
Expected: Key sections present.

**Step 4: Commit**

```bash
git add docs/plans/2026-02-28-antd-v6-migration-design.md docs/plans/2026-02-28-antd-v6-migration-rollout.md
git commit -m "docs(web): add antd v6 migration rollout and verification record"
```

## Final Acceptance Checklist

- [ ] All targeted pages/components run on Ant Design v6.
- [ ] Ant Design form best practices are consistently applied.
- [ ] Tailwind is used for layout; visual styling is token-driven.
- [ ] Screenshot diff checks pass (desktop + mobile) or have explicit waivers.
- [ ] `pnpm test:e2e`, `pnpm lint`, `pnpm build` all pass.
- [ ] No residual `@radix-ui/*` or `@/components/ui/*` references in runtime code.

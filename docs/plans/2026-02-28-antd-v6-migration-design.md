# Ant Design v6 Full Migration Design (app-web)

Date: 2026-02-28  
Status: Approved

## 1. Scope and Goal

- Perform a one-shot full migration of `app-web` UI from current Radix/shadcn-style components to Ant Design v6.
- Keep business behavior unchanged while replacing UI component implementations.
- Use Ant Design v6 + Tailwind (layout utility only) + semantic theme tokens.
- Follow Ant Design best practices for form architecture.

In scope:
- `MainLayout`, `Header`, `Sidebar`, login, dashboard, admin pages (`Role`, `User`, `Menu`, `Dict`).
- Shared table/form/dialog interactions used by those pages.
- Theme/token unification and visual consistency.

Out of scope:
- Backend API protocol changes.
- Domain logic refactors unrelated to UI migration.

## 2. Migration Strategy (Approach A: Direct Hard Switch)

- Remove old UI dependency stack and direct usage of `components/ui/*` in one migration batch.
- Add and configure `antd@v6` based on Ant Design guidance (`https://ant.design/llms-full.txt`).
- Refactor pages/components directly to Ant Design components without a compatibility wrapper layer.
- Complete all target pages and shared patterns in the same delivery.

Rationale:
- User-selected strategy prioritizes single-cut final state and no dual-stack maintenance.

## 3. Architecture and Technical Design

### 3.1 App Entry and Provider Layer

- Add `ConfigProvider` in `app-web/src/main.tsx`.
- Centralize locale, design token config, component sizing, and global behavior.
- Ensure i18n language selection integrates with Ant Design locale.

### 3.2 Theme: Tailwind + Semantic Tokens

- Ant Design `theme` is the source of truth for visual tokens.
- Export semantic CSS variables from theme tokens (for example: `--color-bg-page`, `--color-bg-card`, `--color-text-primary`, `--color-border-default`).
- Tailwind usage is limited to layout/spacing/responsive utilities.
- Colors, radius, shadows, and control visuals come from Ant Design token system.
- Use algorithm-based theming (`defaultAlgorithm` / optional `darkAlgorithm`) with semantic variable linkage.

### 3.3 Component Replacement Matrix

- Dialogs: `Dialog` -> `Modal`/`Drawer` (based on information density and flow).
- Tables: custom/legacy table wrappers -> Ant Design `Table` with server-side pagination/sort adapters.
- Forms: adopt Ant Design `Form` best practices (`Form`, `Form.Item`, `useForm`, `rules`, `onFinish`).
- Inputs/selectors: move to Ant Design `Input`, `Select`, `Tree`, `TreeSelect`, `Checkbox`, `Switch`, `DatePicker` where relevant.
- Feedback/state: `message`, `notification`, `Alert`, `Spin`, `Empty`, `Result` unified across pages.
- Layout/nav: `Layout`, `Sider`, `Menu`, and mobile `Drawer` for responsive sidebar behavior.

## 4. Data Flow and Interaction Parity

- Keep existing API contracts and React Query patterns (`queryKey` + query functions).
- Table pagination/sorting/filtering map exactly between Ant Design callbacks and backend request params.
- Form submit flow uses mutation pending states for loading and submit lock.
- Server validation errors map to field-level errors via `form.setFields`; global errors use `message.error`.
- Modal/drawer form lifecycle uses `destroyOnHidden` and `preserve={false}` to avoid stale form state.
- Tree selection logic must preserve current parent-child linkage semantics.

## 5. Risk Areas

- Table param mapping mismatch causing pagination/sort regressions.
- Form initial value/reset lifecycle inconsistencies in edit/create dialogs.
- Modal/drawer double-submit or stale state issues.
- Responsive layout regressions in mobile sidebar and overlay behavior.
- Tree half-check/full-check behavior drift in role-menu assignment.

## 6. Validation and Acceptance Criteria

### 6.1 Functional Regression Coverage (Must Pass)

- Authentication: login/logout.
- Main layout: navigation, permission-based menu visibility.
- Admin pages: `Role/User/Menu/Dict` full CRUD and association flows.
- Role-menu authorization and role-user assignment full path.
- Loading/error/empty states and retry behavior.
- Desktop and mobile core usability.

### 6.2 Structural Acceptance (Must Pass)

- No runtime usage of legacy `components/ui/*`.
- No unused Radix UI dependencies left in `app-web/package.json`.
- Visual tokens are centralized in Ant Design theme + semantic CSS vars (no hard-coded brand colors in pages).
- `pnpm lint` and `pnpm build` pass in `app-web`.

### 6.3 Visual Consistency via Screenshot Diff (Must Pass)

- Build screenshot baselines before migration and compare after migration.
- Coverage includes: login, main layout, and key admin pages with dialog/drawer states.
- Compare at least desktop (`>=1280`) and mobile (`<=768`) breakpoints.
- Verify layout, spacing, typography hierarchy, semantic colors, and interaction states (`hover/active/disabled/loading`).
- Any diff beyond threshold must be fixed or explicitly waived with reason.
- Deliverables: baseline screenshots, after-migration screenshots, and diff report archive.

## 7. Implementation Sequence (High-Level)

1. Install and wire Ant Design v6 provider/theme.
2. Replace global layout shell (`MainLayout/Header/Sidebar`) and top-level pages.
3. Migrate shared interaction patterns (table/form/modal/feedback).
4. Migrate admin modules (`Role` -> `User` -> `Menu` -> `Dict`).
5. Run lint/build + screenshot diff + manual smoke tests.
6. Remove obsolete dependencies and dead UI code.

## 8. Notes

- This document records the approved design and constraints for full one-shot migration.
- Detailed execution tasks are generated in the next phase by the implementation planning step.

# UI Style Consistency Design (Antd v6)

## Context

After the Antd v6 migration, two classes of visual issues remain:

1. Form control alignment is inconsistent in several admin dialogs (mixed layout primitives and non-uniform control widths).
2. Left sidebar does not always fully occupy viewport height under the fixed header layout.

## Root Cause

- **Form alignment**: dialogs currently mix vertical stacks and ad-hoc horizontal `Space` blocks for paired fields. This causes inconsistent label baselines and field widths when component types differ (`Input`, `InputNumber`, `Select`, `Switch`).
- **Sidebar height**: content area below header is not constrained to an explicit height, so `Sider` can collapse to content height in some states.

## Chosen Approach (Option B)

Build a small shared style system for admin forms and layout shells, then migrate affected pages/dialogs to use it.

### 1) Form Style System

- Add a lightweight form layout helper in `app-web/src/styles/ui-patterns.ts`:
  - `FORM_GRID_TWO_COL = { gutter: 12 }`
  - `FORM_COL_HALF = { xs: 24, md: 12 }`
  - `FORM_ITEM_STYLE.compact = { marginBottom: 12 }`
  - `FULL_WIDTH_STYLE = { width: '100%' }`
- Standardize all paired fields in admin dialogs to `Row/Col` grid.
- Standardize `InputNumber` and `Select` width to full width.
- Keep i18n text and behavior unchanged.

### 2) Shell Height System

- Add layout constants in `app-web/src/styles/ui-patterns.ts`:
  - `APP_HEADER_HEIGHT = 56`
  - `APP_BODY_HEIGHT = calc(100vh - APP_HEADER_HEIGHT)`
- Apply these constants in `MainLayout` and `Sidebar` so:
  - body area has fixed available height,
  - sidebar uses full body height with internal scroll,
  - menu collapse footer stays pinned at bottom.

### 3) Verification Strategy

- Browser verify (desktop + mobile):
  - admin/users create/edit dialog alignment
  - admin/menus create/edit dialog alignment
  - admin/dict category/item dialog alignment
  - sidebar height fill on dashboard + admin pages
- Regression checks:
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:e2e --grep "visual regression"`

## Non-goals

- No business logic changes.
- No API contract changes.
- No token redesign outside this repo's existing theme setup.

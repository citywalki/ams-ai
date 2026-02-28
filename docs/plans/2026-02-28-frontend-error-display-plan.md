# Frontend Error Display Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize frontend error display to preserve UI structure while showing lightweight error messages with retry buttons.

**Architecture:** Create a reusable `QueryErrorDisplay` component that can be embedded in data components (DataTable, Sidebar, Dashboard) to show errors inline without breaking the UI layout.

**Tech Stack:** React 18, TypeScript, TanStack Query, shadcn/ui, i18next

---

## Task 1: Create QueryErrorDisplay Component

**Files:**
- Create: `app-web/src/components/common/QueryErrorDisplay.tsx`

**Step 1: Create the component**

```tsx
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QueryErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  size?: 'inline' | 'card' | 'full';
  message?: string;
  className?: string;
}

export function QueryErrorDisplay({
  error,
  onRetry,
  size = 'inline',
  message,
  className,
}: QueryErrorDisplayProps) {
  const { t } = useTranslation();

  if (!error) return null;

  const errorMessage = message || error.message || t('common.loadFailed');

  const sizeStyles = {
    inline: 'flex items-center justify-between gap-2 px-3 py-2 text-sm',
    card: 'flex flex-col items-center justify-center gap-3 py-8 text-center',
    full: 'flex flex-col items-center justify-center gap-4 py-16 text-center',
  };

  const iconSizes = {
    inline: 'h-4 w-4',
    card: 'h-8 w-8',
    full: 'h-12 w-12',
  };

  if (size === 'inline') {
    return (
      <div
        className={cn(
          'bg-destructive/10 border border-destructive/20 rounded-md text-destructive',
          sizeStyles[size],
          className
        )}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={iconSizes[size]} />
          <span>{errorMessage}</span>
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-muted/50 rounded-lg text-muted-foreground',
        sizeStyles[size],
        className
      )}
    >
      <AlertTriangle className={cn('opacity-50', iconSizes[size])} />
      <p>{errorMessage}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app-web/src/components/common/QueryErrorDisplay.tsx
git commit -m "feat: add QueryErrorDisplay component for unified error handling"
```

---

## Task 2: Add i18n Translations

**Files:**
- Modify: `app-web/src/i18n/locales/zh-CN.json`
- Modify: `app-web/src/i18n/locales/en-US.json`

**Step 1: Add Chinese translations**

Find the `common` section and add:
```json
"loadFailed": "加载失败",
"retry": "重试"
```

**Step 2: Add English translations**

Find the `common` section and add:
```json
"loadFailed": "Failed to load",
"retry": "Retry"
```

**Step 3: Commit**

```bash
git add app-web/src/i18n/locales/zh-CN.json app-web/src/i18n/locales/en-US.json
git commit -m "feat: add loadFailed and retry i18n keys"
```

---

## Task 3: Update DataTable Component

**Files:**
- Modify: `app-web/src/components/tables/DataTable.tsx`

**Step 1: Import QueryErrorDisplay and use refetch**

Add imports at top:
```tsx
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
```

**Step 2: Get refetch from useQuery**

Change line 45 from:
```tsx
const { data, isLoading, error } = useQuery({
```

To:
```tsx
const { data, isLoading, error, refetch } = useQuery({
```

**Step 3: Replace error handling**

Replace lines 72-74:
```tsx
  if (error) {
    return <div className="text-red-500 p-4">{t('table.loadError')}</div>;
  }
```

With:
```tsx
```

**Step 4: Add error display inside the component**

Add after the opening `<div className="flex flex-col h-full gap-4">` (line 77):
```tsx
      <QueryErrorDisplay error={error} onRetry={() => refetch()} size="inline" />
```

**Step 5: Commit**

```bash
git add app-web/src/components/tables/DataTable.tsx
git commit -m "feat: update DataTable to use QueryErrorDisplay"
```

---

## Task 4: Update Sidebar Component

**Files:**
- Modify: `app-web/src/components/layout/Sidebar.tsx`

**Step 1: Import QueryErrorDisplay**

Add import:
```tsx
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
```

**Step 2: Replace error display in render**

Replace lines 304-305:
```tsx
        ) : error ? (
          <div className="p-2 text-sm text-red-500">{error}</div>
```

With:
```tsx
        ) : error ? (
          <QueryErrorDisplay error={new Error(error)} onRetry={refreshMenus} size="inline" className="m-2" />
```

**Step 3: Commit**

```bash
git add app-web/src/components/layout/Sidebar.tsx
git commit -m "feat: update Sidebar to use QueryErrorDisplay"
```

---

## Task 5: Update DashboardPage

**Files:**
- Modify: `app-web/src/pages/dashboard/DashboardPage.tsx`

**Step 1: Import QueryErrorDisplay**

Add import:
```tsx
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
```

**Step 2: Replace error display**

Replace lines 143-144:
```tsx
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">{t('dashboard.loadFailed')}</div>
```

With:
```tsx
          ) : error ? (
            <QueryErrorDisplay error={error} onRetry={loadAlarms} size="card" />
```

**Step 3: Commit**

```bash
git add app-web/src/pages/dashboard/DashboardPage.tsx
git commit -m "feat: update DashboardPage to use QueryErrorDisplay"
```

---

## Task 6: Update MenuManagementPage

**Files:**
- Modify: `app-web/src/pages/admin/MenuManagementPage.tsx`

**Step 1: Import QueryErrorDisplay**

Add import at top with other imports:
```tsx
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
```

**Step 2: Find and replace error display**

Find the pattern around line 336:
```tsx
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">{t('menu.loadFailed')}</div>
```

Replace with:
```tsx
          ) : error ? (
            <QueryErrorDisplay error={error} onRetry={() => refetch()} size="card" />
```

**Step 3: Add refetch to useQuery if not present**

Check if `refetch` is destructured from useQuery. If not, add it.

**Step 4: Commit**

```bash
git add app-web/src/pages/admin/MenuManagementPage.tsx
git commit -m "feat: update MenuManagementPage to use QueryErrorDisplay"
```

---

## Task 7: Update DictManagementPage

**Files:**
- Modify: `app-web/src/pages/admin/DictManagementPage.tsx`

**Step 1: Import QueryErrorDisplay**

Add import:
```tsx
import { QueryErrorDisplay } from '@/components/common/QueryErrorDisplay';
```

**Step 2: Find and replace error display**

Find the pattern around line 197:
```tsx
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">{t('dict.loadFailed')}</div>
```

Replace with:
```tsx
          ) : error ? (
            <QueryErrorDisplay error={error} onRetry={() => refetch()} size="card" />
```

**Step 3: Commit**

```bash
git add app-web/src/pages/admin/DictManagementPage.tsx
git commit -m "feat: update DictManagementPage to use QueryErrorDisplay"
```

---

## Task 8: Verify Changes

**Step 1: Build frontend**

```bash
cd app-web && pnpm build
```

Expected: Build succeeds without errors

**Step 2: Run lint**

```bash
cd app-web && pnpm lint
```

Expected: No lint errors

**Step 3: Manual testing**

1. Start dev server: `cd app-web && pnpm dev`
2. Navigate to user management page
3. Stop backend server to simulate API failure
4. Verify error message shows with retry button
5. Verify table structure is preserved

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | QueryErrorDisplay.tsx | Create reusable error component |
| 2 | i18n files | Add translation keys |
| 3 | DataTable.tsx | Use inline error display |
| 4 | Sidebar.tsx | Use inline error display |
| 5 | DashboardPage.tsx | Use card error display |
| 6 | MenuManagementPage.tsx | Use card error display |
| 7 | DictManagementPage.tsx | Use card error display |
| 8 | - | Verify changes |

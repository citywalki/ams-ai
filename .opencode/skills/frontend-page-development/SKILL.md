---
name: frontend-page-development
description: Use when creating or adjusting AMS-AI React CRUD pages, especially when following the RoleManagementPage structure, pagination flow, and dialog-based role definition interactions.
---

# Frontend Page Development

## Overview

Use `app-web/src/pages/admin/RoleManagementPage.tsx` as the primary reference.

Current standard is not only CRUD layout, but also:
- search input state separated from query state
- server-driven pagination (`page`, `size`, `x-total-count`)
- dialog-based create/edit with permission selection

## Reference Files

- `app-web/src/pages/admin/RoleManagementPage.tsx`
- `app-web/src/utils/api.ts`
- `app-web/src/Router.tsx`

## Workflow

```dot
digraph frontend_dev {
    rankdir=TB;
    "Define types" [shape=box];
    "Add API methods" [shape=box];
    "Build page" [shape=box];
    "Wire route" [shape=box];
    "Verify in browser" [shape=box];

    "Define types" -> "Add API methods";
    "Add API methods" -> "Build page";
    "Build page" -> "Wire route";
    "Wire route" -> "Verify in browser";
}
```

## Step 1: Define TypeScript Types

In `app-web/src/utils/api.ts` add:

```typescript
export interface XQueryParams {
  page?: number; // zero-based for backend
  size?: number;
  keyword?: string;
}

type Id = number | string;

export interface XItem {
  id: Id;
  code: string;
  name: string;
  description?: string;
}

export interface XPayload {
  code: string;
  name: string;
  description?: string;
  relatedIds?: Id[];
}

export interface PageResponse<T> {
  content?: T[];
  items?: T[];
  totalElements?: number;
  totalCount?: number;
}
```

## Step 2: Add API Methods

In `app-web/src/utils/api.ts`:

```typescript
export const xApi = {
  getList: (params?: XQueryParams) =>
    apiClient.get<PageResponse<XItem>>('/system/x', { params }),
  create: (payload: XPayload) =>
    apiClient.post<XItem>('/system/x', payload),
  update: (id: Id, payload: XPayload) =>
    apiClient.put<XItem>(`/system/x/${id}`, payload),
  delete: (id: Id) =>
    apiClient.delete(`/system/x/${id}`),
};
```

## Step 3: Build Page Component

Create `app-web/src/pages/{module}/XManagementPage.tsx` and follow this pattern.

### 1) State Pattern

```typescript
const [items, setItems] = useState<XItem[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [searchKeyword, setSearchKeyword] = useState('');
const [queryKeyword, setQueryKeyword] = useState('');

const [currentPage, setCurrentPage] = useState(1); // UI is 1-based
const [pageSize, setPageSize] = useState(20);
const [total, setTotal] = useState(0);

const [dialogOpen, setDialogOpen] = useState(false);
const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
const [editingItem, setEditingItem] = useState<XItem | null>(null);

const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteItem, setDeleteItem] = useState<XItem | null>(null);
```

### 2) Loading Pattern (with pagination)

```typescript
const loadItems = useCallback(async (
  targetPage = currentPage,
  targetPageSize = pageSize,
  targetKeyword = queryKeyword,
) => {
  setLoading(true);
  setError(null);
  try {
    const params: { page: number; size: number; keyword?: string } = {
      page: Math.max(targetPage - 1, 0),
      size: targetPageSize,
    };
    if (targetKeyword) params.keyword = targetKeyword;

    const res = await xApi.getList(params);
    const list = Array.isArray(res.data) ? res.data : (res.data.content ?? res.data.items ?? []);

    const totalHeader =
      (res.headers?.['x-total-count'] as string | number | undefined)
      ?? (res.headers?.['X-Total-Count'] as string | number | undefined);

    let totalCount = Number(totalHeader);
    if (Number.isNaN(totalCount)) {
      totalCount = Number(
        !Array.isArray(res.data)
          ? (res.data.totalElements ?? res.data.totalCount ?? list.length)
          : list.length,
      );
    }

    setItems(list);
    setTotal(totalCount);
    return list;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Load failed');
    return [] as XItem[];
  } finally {
    setLoading(false);
  }
}, [currentPage, pageSize, queryKeyword]);
```

### 3) Search and Reset Pattern

```typescript
const handleSearch = () => {
  const keyword = searchKeyword.trim();
  setQueryKeyword(keyword);
  setCurrentPage(1);
};

const handleReset = () => {
  setSearchKeyword('');
  setQueryKeyword('');
  setCurrentPage(1);
};
```

### 4) Role-Definition Style Dialog

For role-like pages with relation selection (permissions, tags, scopes):
- keep selection state as an ID list in form state
- use button chips with selected/unselected variants
- toggle by ID

```typescript
const toggleRelated = (id: Id) => {
  setFormState((prev) => ({
    ...prev,
    relatedIds: (prev.relatedIds ?? []).includes(id)
      ? (prev.relatedIds ?? []).filter((x) => x !== id)
      : [...(prev.relatedIds ?? []), id],
  }));
};
```

## Step 4: Wire Route

In `app-web/src/Router.tsx`:

```typescript
import XManagementPage from '@/pages/module/XManagementPage';

<Route path="module/x" element={<XManagementPage />} />
```

## UI Structure Standard

1. Search card
2. List card (title + add button + table)
3. Create/Edit dialog
4. Delete confirm dialog
5. Pagination area in list footer

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `searchKeyword` directly in loading request | Keep `queryKeyword` separate from input state |
| Sending 1-based `page` to backend | Convert to zero-based with `Math.max(currentPage - 1, 0)` |
| Ignoring `x-total-count` | Read response headers first, then fallback to body |
| Long IDs precision issues in JS | Use `string` or `number | string` for ID fields |
| Reload after delete does not handle empty page | If current page becomes empty, move back one page |

## Verification

```bash
cd app-web && pnpm lint
cd app-web && pnpm build
```

Then run browser checks with `frontend-ui-verification` skill.

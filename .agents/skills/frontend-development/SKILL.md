---
name: frontend-development
description: Frontend development conventions - Use when creating or modifying AMS-AI React pages/components, including form development, page structure, i18n, and API integration
---

# AMS-AI Frontend Development Conventions

## Overview

**UI Framework**: Ant Design v6 + React 18 + TypeScript

Reference implementation: `app-web/src/pages/admin/RoleManagementPage.tsx`

Standard CRUD page features:
- Separate search input state from query state
- Server-side pagination (`page`, `size`, `x-total-count`)
- Dialog-based create/edit with relationship selection

## Development Workflow

1. Define Types → `lib/types.ts` or `features/*/types.ts`
2. Add i18n → `i18n/locales/zh-CN.json` and `en-US.json`
3. Add API → `features/*/queries.ts` (GraphQL) or `mutations.ts` (REST)
4. Build Page → `pages/*/XManagementPage.tsx`
5. Configure Routes → `Router.tsx`
6. Browser Verification → Use `frontend-ui-verification` skill

## Internationalization (i18n)

**All user-visible text must use i18n**

### Language Files

- `app-web/src/i18n/locales/zh-CN.json`
- `app-web/src/i18n/locales/en-US.json`

### Naming Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| `pages.{pageName}.title` | `pages.roleManagement.title` | Page title |
| `pages.{pageName}.columns.{field}` | `pages.roleManagement.columns.name` | Table columns |
| `pages.{pageName}.form.{field}` | `pages.roleManagement.form.name` | Form labels |
| `pages.{pageName}.dialog.{action}` | `pages.roleManagement.dialog.createTitle` | Dialog titles |
| `pages.{pageName}.messages.{type}` | `pages.roleManagement.messages.createSuccess` | Toast messages |

### Usage

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Page title
<CardTitle>{t('pages.xManagement.title')}</CardTitle>

// Input placeholder
<Input placeholder={t('pages.xManagement.searchPlaceholder')} />

// Toast message
message.success(t('pages.xManagement.messages.createSuccess'));
```

### Predefined Common Keys

- `common.loading`, `common.submit`, `common.cancel`, `common.confirm`
- `common.save`, `common.delete`, `common.edit`, `common.add`, `common.search`
- `common.loadFailed`, `common.retry`

## API Architecture

### Directory Structure

```
lib/
├── apiClient.ts      # Axios REST client
├── graphqlClient.ts  # Graffle GraphQL client
├── queryClient.ts    # React Query config
├── queryKeys.ts      # Query key definitions
├── types.ts          # Shared types (UserItem, RoleItem, etc.)
└── utils.ts

features/admin/*/
├── mutations.ts      # REST commands + useMutation
├── queries.ts        # GraphQL queries
├── types.ts          # Feature-specific types
└── components/       # Dialog components
```

### Query (GraphQL)

```typescript
// features/admin/roles/queries.ts
import { graphqlClient } from '@/lib/graphqlClient';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

export const ROLES_QUERY = `
  query Roles($page: Int, $size: Int, $keyword: String) {
    roles(page: $page, size: $size, keyword: $keyword) {
      content { id name code description }
      totalElements
    }
  }
`;

export function useRoles(page: number, size: number, keyword?: string) {
  return useQuery({
    queryKey: queryKeys.roles.list(page, size, keyword),
    queryFn: () => graphqlClient.request(ROLES_QUERY, { page, size, keyword }),
  });
}
```

### Mutation (REST)

```typescript
// features/admin/roles/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RolePayload) => apiClient.post('/api/system/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}
```

### Type Definitions

```typescript
// lib/types.ts
export type Id = number | string;

export interface PageResponse<T> {
  content?: T[];
  items?: T[];
  totalElements?: number;
  totalCount?: number;
}

// features/admin/roles/types.ts
export interface RoleItem {
  id: Id;
  name: string;
  code: string;
  description?: string;
}

export interface RolePayload {
  name: string;
  code: string;
  description?: string;
}
```

## Ant Design Form Development

### Form Layout

**All forms must use horizontal layout** (labels left, inputs right):

```tsx
<Form form={form} layout="horizontal" onFinish={handleSubmit}>
  <Form.Item label={t('pages.xxx.form.name')} name="name" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</Form>
```

### Dialog with Form

```tsx
import { Form, Modal, Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: RoleItem;
  onClose: () => void;
  onSubmit: (values: RolePayload) => Promise<void>;
}

export function RoleFormDialog({ open, mode, initialValues, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === 'create' ? t('pages.roleManagement.dialog.createTitle') : t('pages.roleManagement.dialog.editTitle')}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label={t('pages.roleManagement.form.name')} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('pages.roleManagement.form.code')} name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

### Required Field Markers

Ant Design automatically shows red asterisk `*` when `rules={[{ required: true }]}` is set.

```tsx
// ✅ Correct - Use rules for required
<Form.Item name="name" rules={[{ required: true, message: t('common.required') }]}>
  <Input />
</Form.Item>

// ❌ Wrong - Don't add asterisk manually
<Form.Item label="Name*">
  <Input />
</Form.Item>
```

## Page Component Construction

### State Patterns

```typescript
const [items, setItems] = useState<XItem[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

// Search: Separate input state from query state
const [searchKeyword, setSearchKeyword] = useState('');
const [queryKeyword, setQueryKeyword] = useState('');

// Pagination: UI uses 1-based
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [total, setTotal] = useState(0);

// Dialog
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
const [editingItem, setEditingItem] = useState<XItem | null>(null);
```

### Loading Pattern

```typescript
const loadItems = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const params = {
      page: Math.max(currentPage - 1, 0),  // Convert to zero-based
      size: pageSize,
      keyword: queryKeyword || undefined,
    };
    const res = await xApi.getList(params);
    const list = res.data.content ?? res.data.items ?? [];
    const totalHeader = res.headers?.['x-total-count'];
    const totalCount = Number(totalHeader) || res.data.totalElements || list.length;
    
    setItems(list);
    setTotal(totalCount);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Load failed'));
  } finally {
    setLoading(false);
  }
}, [currentPage, pageSize, queryKeyword]);
```

### Table with Actions

```tsx
const columns: ColumnsType<XItem> = [
  { title: t('pages.xxx.columns.code'), dataIndex: 'code', key: 'code' },
  { title: t('pages.xxx.columns.name'), dataIndex: 'name', key: 'name' },
  {
    title: t('pages.xxx.columns.actions'),
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
        <Popconfirm title={t('common.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger>{t('common.delete')}</Button>
        </Popconfirm>
      </Space>
    ),
  },
];

<Table
  columns={columns}
  dataSource={items}
  rowKey="id"
  loading={loading}
  pagination={{
    current: currentPage,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (total) => t('common.totalItems', { total }),
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    },
  }}
/>
```

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Hardcoded text in components | Use `t('pages.xxx.key')` for all user text |
| Adding i18n key to only one language file | Must add to both `zh-CN.json` and `en-US.json` |
| Using `searchKeyword` directly when loading | Keep `queryKeyword` separate from input state |
| Sending 1-based `page` to backend | Use `Math.max(currentPage - 1, 0)` to convert |
| Ignoring `x-total-count` header | Prefer response header, then fallback to body |
| JS long integer precision issues | Use `string` or `number \| string` for ID fields |
| Not handling empty page after delete | Go back one page when current page becomes empty |

## Verification

```bash
cd app-web && pnpm lint
cd app-web && pnpm build
```

After completion, use the `frontend-ui-verification` skill for browser verification.

## Ant Design Reference

### Documentation URLs

| URL | Purpose |
|-----|---------|
| https://ant.design/llms.txt | **Index** - Navigation to all docs |
| https://ant.design/llms-full.txt | **Full API** - All 73 components (EN) |
| https://ant.design/llms-full-cn.txt | **Full API** - All 73 components (CN) |
| https://ant.design/llms-semantic.md | **Semantic DOM** - Styling guide (EN) |

### Key Design Docs

- [Form Design](https://ant.design/docs/spec/research-form.md) - Form UX patterns
- [Data Display](https://ant.design/docs/spec/data-display.md) - Table/List patterns
- [Navigation](https://ant.design/docs/spec/navigation.md) - Menu/breadcrumb patterns
- [Feedback](https://ant.design/docs/spec/feedback.md) - Message/notification patterns

### Key Components

| Component | Use Case | Key Props |
|-----------|----------|-----------|
| `Form` | Data entry forms | `layout="horizontal"`, `Form.Item`, `name`, `rules` |
| `Table` | Data display with pagination | `columns`, `dataSource`, `pagination`, `rowKey` |
| `Modal` | Dialogs | `open`, `onCancel`, `onOk`, `title`, `confirmLoading` |
| `Select` | Dropdown selection | `options`, `value`, `onChange`, `mode="multiple"` |
| `Input` | Text input | `placeholder`, `value`, `onChange` |
| `Button` | Actions | `type`, `loading`, `disabled`, `icon` |
| `Card` | Content container | `title`, `extra` |
| `Space` | Layout spacing | `direction`, `size` |
| `message` | Toast notifications | `success()`, `error()`, `warning()` |
| `Popconfirm` | Delete confirmation | `title`, `onConfirm`, `okText` |

### Type Utilities (v5+)

```tsx
import type { GetProps, GetRef, GetProp } from 'antd';

type SelectProps = GetProps<typeof Select>;
type SelectRef = GetRef<typeof Select>;
type OptionType = GetProp<typeof Select, 'options'>[number];
```

# TanStack Form 表单重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 app-web 前端表单从 useState 迁移到 TanStack Form + Zod

**Architecture:** 为每个表单模块创建 Zod Schema，使用 TanStack Form 的 useForm hook 替代 useState 管理表单状态，保持现有组件 API 兼容性。

**Tech Stack:** React 18, TanStack Form, Zod, TypeScript 5

---

## Task 1: 安装依赖

**Files:**
- Modify: `app-web/package.json`

**Step 1: 安装 TanStack Form 和 Zod**

```bash
cd app-web && pnpm add @tanstack/react-form zod
```

**Step 2: 验证安装成功**

```bash
cd app-web && pnpm list @tanstack/react-form zod
```

Expected: 显示已安装的版本号

**Step 3: 提交**

```bash
git add app-web/package.json app-web/pnpm-lock.yaml
git commit -m "chore(web): add @tanstack/react-form and zod dependencies"
```

---

## Task 2: 创建用户表单 Schema

**Files:**
- Create: `app-web/src/features/admin/users/schemas/user-schema.ts`
- Create: `app-web/src/features/admin/users/schemas/reset-password-schema.ts`

**Step 1: 创建用户表单 Schema**

```typescript
// app-web/src/features/admin/users/schemas/user-schema.ts
import { z } from 'zod';

export const userFormSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  password: z.string().min(6, '密码至少6个字符').max(100),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  roleIds: z.array(z.string()),
});

export const editUserFormSchema = userFormSchema.omit({ password: true });

export type UserFormData = z.infer<typeof userFormSchema>;
export type EditUserFormData = z.infer<typeof editUserFormSchema>;

export const initialUserFormState: UserFormData = {
  username: '',
  email: '',
  password: '',
  status: 'ACTIVE',
  roleIds: [],
};
```

**Step 2: 创建重置密码 Schema**

```typescript
// app-web/src/features/admin/users/schemas/reset-password-schema.ts
import { z } from 'zod';

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const initialResetPasswordState: ResetPasswordFormData = {
  newPassword: '',
};
```

**Step 3: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 4: 提交**

```bash
git add app-web/src/features/admin/users/schemas/
git commit -m "feat(web): add user form zod schemas"
```

---

## Task 3: 重构 useUserForm Hook

**Files:**
- Modify: `app-web/src/features/admin/users/hooks/useUserForm.ts`

**Step 1: 重写 useUserForm Hook**

```typescript
// app-web/src/features/admin/users/hooks/useUserForm.ts
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { systemApi, type UserItem, type UserCreatePayload, type UserUpdatePayload } from '@/utils/api';
import { invalidateUserList } from '../queries';
import { userFormSchema, editUserFormSchema, type UserFormData, type EditUserFormData } from '../schemas/user-schema';

export function useUserForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UserFormData | EditUserFormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      status: 'ACTIVE',
      roleIds: [],
    },
    validators: {
      onChange: ({ value }) => {
        if (dialogMode === 'create') {
          return userFormSchema.safeParse(value).success ? undefined : '验证失败';
        }
        return editUserFormSchema.safeParse(value).success ? undefined : '验证失败';
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (dialogMode === 'create') {
          const payload: UserCreatePayload = {
            username: value.username,
            email: value.email || undefined,
            password: (value as UserFormData).password,
            status: value.status,
            roleIds: value.roleIds,
          };
          await systemApi.createUser(payload);
        } else if (editingUser) {
          const payload: UserUpdatePayload = {
            username: value.username,
            email: value.email || undefined,
            status: value.status,
            roleIds: value.roleIds,
          };
          await systemApi.updateUser(editingUser.id, payload);
        }
        closeDialog();
        void invalidateUserList(queryClient);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : t('pages.userManagement.messages.operationFailed')
        );
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingUser(null);
    form.reset();
    form.setFieldValue('username', '');
    form.setFieldValue('email', '');
    form.setFieldValue('password', '');
    form.setFieldValue('status', 'ACTIVE');
    form.setFieldValue('roleIds', []);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    form.reset();
    form.setFieldValue('username', user.username);
    form.setFieldValue('email', user.email ?? '');
    form.setFieldValue('status', user.status);
    form.setFieldValue('roleIds', user.roles?.map((r) => r.id) ?? []);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
    form.reset();
    setFormError(null);
  }, [form]);

  const toggleRole = useCallback((roleId: string) => {
    const currentRoles = form.getFieldValue('roleIds') as string[];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter((id) => id !== roleId)
      : [...currentRoles, roleId];
    form.setFieldValue('roleIds', newRoles);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingUser,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    toggleRole,
    setDialogOpen,
  };
}
```

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/users/hooks/useUserForm.ts
git commit -m "refactor(web): migrate useUserForm to TanStack Form"
```

---

## Task 4: 重构 UserFormDialog 组件

**Files:**
- Modify: `app-web/src/features/admin/users/components/UserFormDialog.tsx`

**Step 1: 重写 UserFormDialog 组件**

```tsx
// app-web/src/features/admin/users/components/UserFormDialog.tsx
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type RoleOption } from '@/utils/api';
import { type FormApi } from '@tanstack/react-form';
import { type UserFormData, type EditUserFormData } from '../schemas/user-schema';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: FormApi<UserFormData | EditUserFormData, undefined>;
  error: string | null;
  roles: RoleOption[];
  onClose: () => void;
  onToggleRole: (roleId: string) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  roles,
  onClose,
  onToggleRole,
}: UserFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.userManagement.dialog.createTitle')
                : t('pages.userManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.userManagement.dialog.createDescription')
                : t('pages.userManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="username">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="username">{t('pages.userManagement.form.username')}</Label>
                  <Input
                    id="username"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('pages.userManagement.form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
            {mode === 'create' && (
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('pages.userManagement.form.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                    />
                  </div>
                )}
              </form.Field>
            )}
            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="status">{t('pages.userManagement.form.status')}</Label>
                  <Select
                    value={field.state.value as string}
                    onValueChange={(value) => field.handleChange(value as 'ACTIVE' | 'INACTIVE')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{t('pages.userManagement.status.active')}</SelectItem>
                      <SelectItem value="INACTIVE">{t('pages.userManagement.status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
            <form.Field name="roleIds">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.userManagement.form.roles')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        type="button"
                        variant={(field.state.value as string[]).includes(role.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onToggleRole(role.id)}
                      >
                        {role.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.userManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/users/components/UserFormDialog.tsx
git commit -m "refactor(web): migrate UserFormDialog to TanStack Form"
```

---

## Task 5: 重构 useResetPassword Hook

**Files:**
- Modify: `app-web/src/features/admin/users/hooks/useResetPassword.ts`

**Step 1: 重写 useResetPassword Hook**

```typescript
// app-web/src/features/admin/users/hooks/useResetPassword.ts
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { systemApi, type UserItem } from '@/utils/api';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/reset-password-schema';

export function useResetPassword() {
  const { t } = useTranslation();

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: '',
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!resetPasswordUser) return;
      setResetPasswordError(null);
      try {
        await systemApi.resetUserPassword(resetPasswordUser.id, value.newPassword);
        closeResetPasswordDialog();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('pages.userManagement.messages.operationFailed');
        setResetPasswordError(message);
        throw err;
      }
    },
  });

  const openResetPasswordDialog = useCallback((user: UserItem) => {
    setResetPasswordUser(user);
    form.reset();
    setResetPasswordError(null);
    setResetPasswordOpen(true);
  }, [form]);

  const closeResetPasswordDialog = useCallback(() => {
    setResetPasswordOpen(false);
    setResetPasswordUser(null);
    form.reset();
    setResetPasswordError(null);
  }, [form]);

  return {
    resetPasswordOpen,
    resetPasswordUser,
    form,
    resetPasswordError,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    setResetPasswordOpen,
  };
}
```

**Step 2: 重写 ResetPasswordDialog 组件**

```tsx
// app-web/src/features/admin/users/components/ResetPasswordDialog.tsx
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type UserItem } from '@/utils/api';
import { type FormApi } from '@tanstack/react-form';
import { type ResetPasswordFormData } from '../schemas/reset-password-schema';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  form: FormApi<ResetPasswordFormData, undefined>;
  error: string | null;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  form,
  error,
}: ResetPasswordDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pages.userManagement.dialog.resetPasswordTitle')}</DialogTitle>
          <DialogDescription>
            {t('pages.userManagement.dialog.resetPasswordDescription', {
              username: user?.username ?? '-',
            })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="newPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('pages.userManagement.form.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.userManagement.messages.processing')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 4: 提交**

```bash
git add app-web/src/features/admin/users/hooks/useResetPassword.ts \
        app-web/src/features/admin/users/components/ResetPasswordDialog.tsx
git commit -m "refactor(web): migrate reset password to TanStack Form"
```

---

## Task 6: 更新用户管理页面

**Files:**
- Modify: `app-web/src/pages/admin/UserManagementPage.tsx` (或相应页面)

**Step 1: 更新页面以使用新的 Hook API**

根据实际页面文件位置更新组件调用方式。主要变更：
- `formState` → `form`
- `loading` → `form.state.isSubmitting`
- `onSubmit` → 移除（表单内部处理）
- `onUpdateField` → 移除（使用 form.Field）
- `onToggleRole` → 保持

**Step 2: 验证页面运行正常**

```bash
cd app-web && pnpm dev
```

Expected: 开发服务器启动成功

**Step 3: 提交**

```bash
git add app-web/src/pages/admin/UserManagementPage.tsx
git commit -m "refactor(web): update UserManagementPage for TanStack Form"
```

---

## Task 7: 创建角色表单 Schema

**Files:**
- Create: `app-web/src/features/admin/roles/schemas/role-schema.ts`

**Step 1: 创建角色表单 Schema**

```typescript
// app-web/src/features/admin/roles/schemas/role-schema.ts
import { z } from 'zod';

export const roleFormSchema = z.object({
  code: z.string().min(1, '角色编码不能为空').max(50, '角色编码最多50个字符'),
  name: z.string().min(1, '角色名称不能为空').max(100, '角色名称最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').optional().or(z.literal('')),
  permissionIds: z.array(z.string()),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;

export const initialRoleFormState: RoleFormData = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};
```

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/roles/schemas/
git commit -m "feat(web): add role form zod schema"
```

---

## Task 8: 重构 useRoleForm Hook

**Files:**
- Modify: `app-web/src/features/admin/roles/hooks/useRoleForm.ts`

**Step 1: 重写 useRoleForm Hook**

```typescript
// app-web/src/features/admin/roles/hooks/useRoleForm.ts
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { systemApi, type RoleItem, type RolePayload } from '@/utils/api';
import { invalidateRoleList } from '../queries';
import { roleFormSchema, type RoleFormData } from '../schemas/role-schema';

export function useRoleForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RoleFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      permissionIds: [],
    },
    validators: {
      onChange: roleFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: RolePayload = {
          code: value.code.trim(),
          name: value.name.trim(),
          description: value.description?.trim() || undefined,
          permissionIds: value.permissionIds,
        };
        if (dialogMode === 'create') {
          await systemApi.createRole(payload);
        } else if (editingRole) {
          await systemApi.updateRole(editingRole.id, payload);
        }
        closeDialog();
        void invalidateRoleList(queryClient);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : t('pages.roleManagement.messages.operationFailed')
        );
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingRole(null);
    form.reset();
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((role: RoleItem) => {
    setDialogMode('edit');
    setEditingRole(role);
    form.reset();
    form.setFieldValue('code', role.code);
    form.setFieldValue('name', role.name);
    form.setFieldValue('description', role.description ?? '');
    form.setFieldValue('permissionIds', role.permissionIds ?? role.permissions?.map((p) => p.id) ?? []);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingRole(null);
    form.reset();
    setFormError(null);
  }, [form]);

  const togglePermission = useCallback((permId: string) => {
    const currentPerms = form.getFieldValue('permissionIds');
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter((id) => id !== permId)
      : [...currentPerms, permId];
    form.setFieldValue('permissionIds', newPerms);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingRole,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    togglePermission,
    setDialogOpen,
  };
}
```

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/roles/hooks/useRoleForm.ts
git commit -m "refactor(web): migrate useRoleForm to TanStack Form"
```

---

## Task 9: 重构 RoleFormDialog 组件

**Files:**
- Modify: `app-web/src/features/admin/roles/components/RoleFormDialog.tsx`

**Step 1: 重写 RoleFormDialog 组件**

```tsx
// app-web/src/features/admin/roles/components/RoleFormDialog.tsx
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type PermissionItem } from '@/utils/api';
import { type FormApi } from '@tanstack/react-form';
import { type RoleFormData } from '../schemas/role-schema';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: FormApi<RoleFormData, undefined>;
  error: string | null;
  permissions: PermissionItem[];
  onClose: () => void;
  onTogglePermission: (permId: string) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  permissions,
  onClose,
  onTogglePermission,
}: RoleFormDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.roleManagement.dialog.createTitle')
                : t('pages.roleManagement.dialog.editTitle')}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? t('pages.roleManagement.dialog.createDescription')
                : t('pages.roleManagement.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="code">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="code">{t('pages.roleManagement.form.code')}</Label>
                    <Input
                      id="code"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={t('pages.roleManagement.form.codePlaceholder')}
                      required
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('pages.roleManagement.form.name')}</Label>
                    <Input
                      id="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder={t('pages.roleManagement.form.namePlaceholder')}
                      required
                    />
                  </div>
                )}
              </form.Field>
            </div>
            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="description">{t('pages.roleManagement.form.description')}</Label>
                  <Input
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('pages.roleManagement.form.descriptionPlaceholder')}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="permissionIds">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.roleManagement.form.permissions')}</Label>
                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {permissions.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        {t('pages.roleManagement.messages.noPermissions')}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <Button
                            key={perm.id}
                            type="button"
                            variant={field.state.value.includes(perm.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onTogglePermission(perm.id)}
                          >
                            {perm.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form.Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.roleManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/roles/components/RoleFormDialog.tsx
git commit -m "refactor(web): migrate RoleFormDialog to TanStack Form"
```

---

## Task 10: 更新角色管理页面

**Files:**
- Modify: `app-web/src/pages/admin/RoleManagementPage.tsx` (或相应页面)

**Step 1: 更新页面以使用新的 Hook API**

同 Task 6 的模式，更新角色管理页面的组件调用。

**Step 2: 验证页面运行正常**

```bash
cd app-web && pnpm dev
```

Expected: 开发服务器启动成功

**Step 3: 提交**

```bash
git add app-web/src/pages/admin/RoleManagementPage.tsx
git commit -m "refactor(web): update RoleManagementPage for TanStack Form"
```

---

## Task 11: 抽取字典管理表单

**Files:**
- Create: `app-web/src/features/admin/dict/schemas/dict-schema.ts`
- Create: `app-web/src/features/admin/dict/hooks/useDictCategoryForm.ts`
- Create: `app-web/src/features/admin/dict/hooks/useDictItemForm.ts`
- Create: `app-web/src/features/admin/dict/components/DictCategoryDialog.tsx`
- Create: `app-web/src/features/admin/dict/components/DictItemDialog.tsx`
- Modify: `app-web/src/pages/admin/DictManagementPage.tsx`

**Step 1: 创建字典 Schema**

```typescript
// app-web/src/features/admin/dict/schemas/dict-schema.ts
import { z } from 'zod';

export const dictCategorySchema = z.object({
  code: z.string().min(1, '编码不能为空').max(50),
  name: z.string().min(1, '名称不能为空').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  sort: z.number().int().min(0),
  status: z.number().int().min(0).max(1),
});

export const dictItemSchema = z.object({
  categoryId: z.string().min(1, '请选择分类'),
  parentId: z.string().optional().nullable(),
  code: z.string().min(1, '编码不能为空').max(50),
  name: z.string().min(1, '名称不能为空').max(100),
  value: z.string().max(200).optional().or(z.literal('')),
  sort: z.number().int().min(0),
  status: z.number().int().min(0).max(1),
  remark: z.string().max(500).optional().or(z.literal('')),
});

export type DictCategoryFormData = z.infer<typeof dictCategorySchema>;
export type DictItemFormData = z.infer<typeof dictItemSchema>;
```

**Step 2: 创建 useDictCategoryForm Hook**

```typescript
// app-web/src/features/admin/dict/hooks/useDictCategoryForm.ts
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { dictApi, type DictCategory, type DictCategoryPayload } from '@/utils/api';
import { invalidateDictQueries, fetchCategories } from '../queries';
import { dictCategorySchema, type DictCategoryFormData } from '../schemas/dict-schema';

export function useDictCategoryForm(onSuccess: (categories: DictCategory[]) => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<DictCategoryFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      sort: 0,
      status: 1,
    },
    validators: {
      onChange: dictCategorySchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: DictCategoryPayload = {
          code: value.code,
          name: value.name,
          description: value.description || undefined,
          sort: value.sort,
          status: value.status,
        };
        if (dialogMode === 'create') {
          await dictApi.createCategory(payload);
        } else if (editingCategory) {
          await dictApi.updateCategory(editingCategory.id, payload);
        }
        await invalidateDictQueries(queryClient);
        const categories = await fetchCategories(queryClient);
        closeDialog();
        onSuccess(categories);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : t('pages.dictManagement.messages.operationFailed'));
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingCategory(null);
    form.reset();
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((category: DictCategory) => {
    setDialogMode('edit');
    setEditingCategory(category);
    form.reset();
    form.setFieldValue('code', category.code);
    form.setFieldValue('name', category.name);
    form.setFieldValue('description', category.description || '');
    form.setFieldValue('sort', category.sort);
    form.setFieldValue('status', category.status);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingCategory(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
  };
}
```

**Step 3: 创建 useDictItemForm Hook**

```typescript
// app-web/src/features/admin/dict/hooks/useDictItemForm.ts
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { dictApi, type DictItem, type DictItemPayload } from '@/utils/api';
import { invalidateDictQueries, fetchDictItems } from '../queries';
import { dictItemSchema, type DictItemFormData } from '../schemas/dict-schema';

export function useDictItemForm(onSuccess: (items: DictItem[]) => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<DictItemFormData>({
    defaultValues: {
      categoryId: '',
      parentId: null,
      code: '',
      name: '',
      value: '',
      sort: 0,
      status: 1,
      remark: '',
    },
    validators: {
      onChange: dictItemSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: DictItemPayload = {
          categoryId: value.categoryId,
          parentId: value.parentId || undefined,
          code: value.code,
          name: value.name,
          value: value.value || undefined,
          sort: value.sort,
          status: value.status,
          remark: value.remark || undefined,
        };
        if (dialogMode === 'create') {
          await dictApi.createItem(value.categoryId, payload);
        } else if (editingItem) {
          await dictApi.updateItem(editingItem.id, payload);
        }
        await invalidateDictQueries(queryClient);
        const items = await fetchDictItems(queryClient, value.categoryId);
        closeDialog();
        onSuccess(items);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : t('pages.dictManagement.messages.operationFailed'));
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback((categoryId: string) => {
    setDialogMode('create');
    setEditingItem(null);
    form.reset();
    form.setFieldValue('categoryId', categoryId);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((item: DictItem) => {
    setDialogMode('edit');
    setEditingItem(item);
    form.reset();
    form.setFieldValue('categoryId', item.categoryId);
    form.setFieldValue('parentId', item.parentId || null);
    form.setFieldValue('code', item.code);
    form.setFieldValue('name', item.name);
    form.setFieldValue('value', item.value || '');
    form.setFieldValue('sort', item.sort);
    form.setFieldValue('status', item.status);
    form.setFieldValue('remark', item.remark || '');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingItem(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
  };
}
```

**Step 4: 创建 DictCategoryDialog 组件**

```tsx
// app-web/src/features/admin/dict/components/DictCategoryDialog.tsx
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type FormApi } from '@tanstack/react-form';
import { type DictCategoryFormData } from '../schemas/dict-schema';

interface DictCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: FormApi<DictCategoryFormData, undefined>;
  error: string | null;
  onClose: () => void;
}

export function DictCategoryDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: DictCategoryDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.dictManagement.dialog.createCategoryTitle')
                : t('pages.dictManagement.dialog.editCategoryTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="code">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.code')}</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.name')}</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.description')}</Label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sort">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.sortOrder')}</Label>
                    <Input
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.status')}</Label>
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(v) => field.handleChange(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t('pages.dictManagement.status.active')}</SelectItem>
                        <SelectItem value="0">{t('pages.dictManagement.status.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.dictManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 5: 创建 DictItemDialog 组件**

```tsx
// app-web/src/features/admin/dict/components/DictItemDialog.tsx
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type FormApi } from '@tanstack/react-form';
import { type DictItemFormData } from '../schemas/dict-schema';

interface DictItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: FormApi<DictItemFormData, undefined>;
  error: string | null;
  onClose: () => void;
}

export function DictItemDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onClose,
}: DictItemDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? t('pages.dictManagement.dialog.createItemTitle')
                : t('pages.dictManagement.dialog.editItemTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Field name="code">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.code')}</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.name')}</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="value">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.value')}</Label>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="remark">
              {(field) => (
                <div className="space-y-2">
                  <Label>{t('pages.dictManagement.columns.remark')}</Label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="sort">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.sortOrder')}</Label>
                    <Input
                      type="number"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{t('pages.dictManagement.columns.status')}</Label>
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(v) => field.handleChange(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t('pages.dictManagement.status.active')}</SelectItem>
                        <SelectItem value="0">{t('pages.dictManagement.status.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting
                ? t('pages.dictManagement.messages.submitting')
                : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 6: 重构 DictManagementPage**

将页面中的表单状态和对话框逻辑替换为使用新的 hooks 和组件。

**Step 7: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 8: 提交**

```bash
git add app-web/src/features/admin/dict/schemas/ \
        app-web/src/features/admin/dict/hooks/ \
        app-web/src/features/admin/dict/components/ \
        app-web/src/pages/admin/DictManagementPage.tsx
git commit -m "refactor(web): extract dict management forms to TanStack Form"
```

---

## Task 12: 抽取菜单管理表单

**Files:**
- Create: `app-web/src/features/admin/menus/schemas/menu-schema.ts`
- Create: `app-web/src/features/admin/menus/hooks/useMenuForm.ts`
- Create: `app-web/src/features/admin/menus/hooks/usePermissionForm.ts`
- Create: `app-web/src/features/admin/menus/components/MenuDialog.tsx`
- Create: `app-web/src/features/admin/menus/components/PermissionDialog.tsx`
- Modify: `app-web/src/pages/admin/MenuManagementPage.tsx`

**Step 1: 创建菜单 Schema**

```typescript
// app-web/src/features/admin/menus/schemas/menu-schema.ts
import { z } from 'zod';

export const menuFormSchema = z.object({
  key: z.string().min(1, 'Key不能为空').max(100),
  label: z.string().min(1, '名称不能为空').max(100),
  route: z.string().max(200).optional().or(z.literal('')),
  icon: z.string().max(100).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  isVisible: z.boolean(),
  menuType: z.enum(['FOLDER', 'MENU']),
  rolesAllowed: z.string().optional().or(z.literal('')),
});

export const permissionFormSchema = z.object({
  code: z.string().min(1, '编码不能为空').max(100),
  name: z.string().min(1, '名称不能为空').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  buttonType: z.string().max(50).optional().or(z.literal('')),
});

export type MenuFormData = z.infer<typeof menuFormSchema>;
export type PermissionFormData = z.infer<typeof permissionFormSchema>;
```

**Step 2-8: 按照 Task 11 的模式创建 hooks 和组件**

（具体代码实现类似于 Task 11 的模式）

**Step 9: 提交**

```bash
git add app-web/src/features/admin/menus/schemas/ \
        app-web/src/features/admin/menus/hooks/ \
        app-web/src/features/admin/menus/components/ \
        app-web/src/pages/admin/MenuManagementPage.tsx
git commit -m "refactor(web): extract menu management forms to TanStack Form"
```

---

## Task 13: 清理旧的类型定义

**Files:**
- Modify: `app-web/src/features/admin/users/types.ts`
- Modify: `app-web/src/features/admin/roles/types.ts`

**Step 1: 移除已迁移的表单状态类型**

从 types.ts 中移除 `UserFormState`、`initialFormState`、`RoleFormState` 等已迁移到 Zod Schema 的定义。

**Step 2: 验证 TypeScript 编译通过**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 3: 提交**

```bash
git add app-web/src/features/admin/users/types.ts \
        app-web/src/features/admin/roles/types.ts
git commit -m "refactor(web): remove migrated form state types"
```

---

## Task 14: 最终验证

**Step 1: 运行 TypeScript 编译**

```bash
cd app-web && pnpm exec tsc --noEmit
```

Expected: 无错误

**Step 2: 运行 ESLint**

```bash
cd app-web && pnpm lint
```

Expected: 无错误

**Step 3: 运行开发服务器并手动测试**

```bash
cd app-web && pnpm dev
```

手动测试以下功能：
- 用户管理：创建、编辑用户
- 用户管理：重置密码
- 角色管理：创建、编辑角色
- 字典管理：创建、编辑分类和字典项
- 菜单管理：创建、编辑菜单和权限

**Step 4: 运行 E2E 测试（如有）**

```bash
cd app-web && pnpm test:e2e
```

Expected: 所有测试通过

---

## 完成标准

- [ ] 所有 6 个表单模块完成重构
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过
- [ ] 手动测试所有表单功能正常
- [ ] E2E 测试通过（如有）

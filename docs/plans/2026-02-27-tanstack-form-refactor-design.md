# TanStack Form 表单重构设计

## 概述

将 app-web 前端项目的表单代码从 React 原生 `useState` 状态管理迁移到 TanStack Form + Zod 验证方案。

## 目标

- 统一表单实现模式
- 提升类型安全性（Zod Schema 自动推导类型）
- 简化验证逻辑（声明式验证规则）
- 改善用户体验（字段级实时验证）
- 减少样板代码

## 技术选型

| 项目 | 选择 | 理由 |
|------|------|------|
| 表单库 | TanStack Form | 头部无关设计，与 React 18 + TypeScript 配合良好 |
| 验证库 | Zod | TypeScript 优先，与 TanStack Form 集成良好，社区广泛使用 |
| 迁移策略 | 一次性迁移 | 表单数量适中（6个），保持代码一致性 |

## 新增依赖

```json
{
  "@tanstack/react-form": "^1.0.0",
  "zod": "^3.23.0"
}
```

## 文件结构

```
app-web/src/
├── features/admin/
│   ├── users/
│   │   ├── schemas/
│   │   │   └── user-schema.ts      # 用户表单 Zod Schema
│   │   ├── hooks/
│   │   │   └── useUserForm.ts      # 重构为 TanStack Form
│   │   └── components/
│   │       └── UserFormDialog.tsx  # 使用新 hook
│   ├── roles/
│   │   ├── schemas/
│   │   │   └── role-schema.ts
│   │   ├── hooks/
│   │   │   └── useRoleForm.ts
│   │   └── components/
│   │       └── RoleFormDialog.tsx
│   ├── dict/
│   │   └── schemas/
│   │       └── dict-schema.ts
│   └── menu/
│       └── schemas/
│           └── menu-schema.ts
```

## 代码模式

### Schema 定义

```typescript
// src/features/admin/users/schemas/user-schema.ts
import { z } from 'zod'

export const userFormSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().optional(),
  roleId: z.string().min(1, '请选择角色'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

export type UserFormData = z.infer<typeof userFormSchema>
```

### Hook 模式

```typescript
// src/features/admin/users/hooks/useUserForm.ts
import { useForm } from '@tanstack/react-form'
import { userFormSchema, type UserFormData } from '../schemas/user-schema'

export function useUserForm(options: {
  defaultValues?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => Promise<void>
}) {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      roleId: '',
      status: 'ACTIVE' as const,
      ...options.defaultValues,
    },
    validators: {
      onChange: userFormSchema,
    },
    onSubmit: async ({ value }) => {
      await options.onSubmit(value)
    },
  })

  return form
}
```

### 组件模式

```tsx
// src/features/admin/users/components/UserFormDialog.tsx
export function UserFormDialog({ open, onOpenChange, user, onSuccess }) {
  const form = useUserForm({
    defaultValues: user ? { ...user } : undefined,
    onSubmit: async (data) => {
      // 提交逻辑
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
        <form.Field name="username">
          {(field) => (
            <div className="space-y-1">
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </form>
    </Dialog>
  )
}
```

## 验证策略

| 时机 | 配置 | 说明 |
|-----|------|------|
| `onChange` | 表单级默认验证 | 用户输入时即时反馈 |
| `onBlur` | 字段级可选配置 | 适合需要完整值的字段 |
| `onSubmit` | 表单提交验证 | 最终校验，阻止无效提交 |

## 错误处理

1. **字段级错误**：通过 `field.state.meta.errors` 获取并显示
2. **API 错误**：在 `onSubmit` 中捕获异常，通过 `form.setFieldMeta` 设置字段错误
3. **全局错误**：可选择显示在对话框顶部或 Toast 通知

## 重构清单

| 顺序 | 模块 | 文件 | 复杂度 |
|-----|------|------|--------|
| 1 | 用户表单 | `useUserForm.ts` + `UserFormDialog.tsx` | 中 |
| 2 | 角色表单 | `useRoleForm.ts` + `RoleFormDialog.tsx` | 中 |
| 3 | 重置密码 | `useResetPassword.ts` + `ResetPasswordDialog.tsx` | 低 |
| 4 | 字典管理 | `DictManagementPage.tsx` | 中 |
| 5 | 菜单管理 | `MenuManagementPage.tsx` | 高 |
| 6 | 角色菜单 | `useRoleMenuDialog.ts` + `RoleMenuDialog.tsx` | 中 |

### 每个表单的改动内容

```
对于每个表单模块：
├── 新建 schemas/xxx-schema.ts      # Zod Schema 定义
├── 修改 hooks/useXxxForm.ts        # 重构为 TanStack Form
├── 修改 components/XxxDialog.tsx   # 使用新的 form.Field 模式
└── 删除 types.ts 中的表单状态类型  # 改用 z.infer 推导（如适用）
```

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 单次改动较大 | 按模块顺序重构，每个模块完成后验证功能正常 |
| 现有功能回归 | 依赖 E2E 测试和手动验证 |

## 完成标准

- [ ] 所有 6 个表单模块完成重构
- [ ] 现有功能保持正常（创建、编辑、验证）
- [ ] 无 TypeScript 类型错误
- [ ] ESLint 检查通过

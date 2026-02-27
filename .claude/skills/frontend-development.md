---
name: frontend-development
description: 前端开发规范 - 使用此skill确保前端代码遵循项目约定
---

# 前端开发规范

## 表单开发

### FormField 组件

所有表单字段必须使用 `FormField` 组件，确保一致的布局和必填项标记。

```tsx
import { FormField, FormFieldInline } from '@/components/ui/form-field';

// 标准表单字段
<FormField label={t('label.text')} required htmlFor="fieldName">
  <Input id="fieldName" required />
</FormField>

// 内联表单字段（用于 Checkbox、Switch 等）
<FormFieldInline label={t('label.text')} htmlFor="fieldName">
  <Switch id="fieldName" />
</FormFieldInline>
```

### 必填项标记规则

- **必填项**：必须同时设置 `required` 属性和 `<FormField required>`
- 必填项会自动在 label 后显示红色星号 `*`
- 不要手动添加星号，让 FormField 组件自动处理

```tsx
// ✅ 正确
<FormField label="用户名" required htmlFor="username">
  <Input id="username" required />
</FormField>

// ❌ 错误 - 不要手动添加星号
<FormField label="用户名*" htmlFor="username">
  <Input id="username" required />
</FormField>

// ❌ 错误 - 非必填项不要设置 required
<FormField label="备注" required htmlFor="remark">
  <Input id="remark" />
</FormField>
```

### TanStack Form 集成

```tsx
<form.Field name="fieldName">
  {(field) => (
    <FormField label={t('label.text')} required htmlFor="fieldName">
      <Input
        id="fieldName"
        value={field.state.value as string}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        required
      />
    </FormField>
  )}
</form.Field>
```

### 支持的输入控件

FormField 支持所有标准输入控件：
- `Input` - 文本输入
- `Textarea` - 多行文本
- `Select` - 下拉选择
- `Switch` - 开关
- `Checkbox` - 复选框（使用 FormFieldInline）
- 自定义组件

## 样式规范

- 使用 Tailwind CSS 4
- 间距使用 `space-y-4` 作为表单容器
- 两列布局使用 `grid grid-cols-2 gap-4`
- 必填星号颜色使用 `text-destructive`

## 国际化

- 所有用户可见文本必须使用 i18n
- 使用 `useTranslation` hook
- 翻译文件位于 `src/i18n/locales/`
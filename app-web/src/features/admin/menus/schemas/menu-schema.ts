import { z } from 'zod';

export const menuFormSchema = z.object({
  key: z.string().min(1, 'Key 不能为空').max(100, 'Key 最多100个字符'),
  label: z.string().min(1, '名称不能为空').max(100, '名称最多100个字符'),
  route: z.string().max(200, '路由最多200个字符').optional().or(z.literal('')),
  icon: z.string().max(100, '图标最多100个字符').optional().or(z.literal('')),
  sortOrder: z.number().int('排序必须为整数').default(0),
  isVisible: z.boolean().default(true),
  menuType: z.enum(['FOLDER', 'MENU']).default('MENU'),
  rolesAllowed: z.string().optional(),
});

export type MenuFormData = z.infer<typeof menuFormSchema>;

export const initialMenuFormState: MenuFormData = {
  key: '',
  label: '',
  route: '',
  icon: '',
  sortOrder: 0,
  isVisible: true,
  menuType: 'MENU',
  rolesAllowed: '',
};

export const permissionFormSchema = z.object({
  code: z.string().min(1, 'Code 不能为空').max(100, 'Code 最多100个字符'),
  name: z.string().min(1, '名称不能为空').max(100, '名称最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').optional().or(z.literal('')),
  sortOrder: z.number().int('排序必须为整数').default(0),
  buttonType: z.string().max(50, '按钮类型最多50个字符').optional().or(z.literal('')),
});

export type PermissionFormData = z.infer<typeof permissionFormSchema>;

export const initialPermissionFormState: PermissionFormData = {
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  buttonType: '',
};

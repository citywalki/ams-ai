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

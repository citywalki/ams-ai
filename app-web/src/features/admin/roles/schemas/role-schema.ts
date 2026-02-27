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

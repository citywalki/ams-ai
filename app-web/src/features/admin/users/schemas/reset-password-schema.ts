import { z } from 'zod';

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const initialResetPasswordState: ResetPasswordFormData = {
  newPassword: '',
};

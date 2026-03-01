import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type UserItem } from '@/lib/types';
import { useResetUserPassword } from '../mutations';
import { resetPasswordSchema } from '../schemas/reset-password-schema';

export function useResetPassword() {
  const { t } = useTranslation();

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const resetPasswordMutation = useResetUserPassword();

  const openResetPasswordDialog = useCallback((user: UserItem) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setResetPasswordError(null);
    setResetPasswordOpen(true);
  }, []);

  const closeResetPasswordDialog = useCallback(() => {
    setResetPasswordOpen(false);
    setResetPasswordUser(null);
    setNewPassword('');
    setResetPasswordError(null);
  }, []);

  const submitResetPassword = useCallback(async () => {
    if (!resetPasswordUser) return;

    setResetPasswordError(null);
    const validation = resetPasswordSchema.safeParse({ newPassword });
    if (!validation.success) {
      const message = validation.error.issues.map((issue) => issue.message).join(', ');
      setResetPasswordError(message);
      throw new Error(message);
    }

    try {
      await resetPasswordMutation.mutateAsync({
        id: resetPasswordUser.id,
        password: newPassword,
      });
      closeResetPasswordDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('pages.userManagement.messages.operationFailed');
      setResetPasswordError(message);
      throw err;
    }
  }, [closeResetPasswordDialog, newPassword, resetPasswordMutation, resetPasswordUser, t]);

  return {
    resetPasswordOpen,
    resetPasswordUser,
    newPassword,
    setNewPassword,
    resetPasswordError,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    submitResetPassword,
    setResetPasswordOpen,
    isSubmitting: resetPasswordMutation.isPending,
  };
}

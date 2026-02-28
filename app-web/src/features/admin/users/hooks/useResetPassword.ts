import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { type UserItem } from '@/lib/types';
import { useResetUserPassword } from '../mutations';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/reset-password-schema';

export function useResetPassword() {
  const { t } = useTranslation();

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const resetPasswordMutation = useResetUserPassword();

  const form = useForm({
    defaultValues: {
      newPassword: '',
    } as ResetPasswordFormData,
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!resetPasswordUser) return;
      setResetPasswordError(null);
      try {
        await resetPasswordMutation.mutateAsync({
          id: resetPasswordUser.id,
          password: value.newPassword,
        });
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
    isSubmitting: resetPasswordMutation.isPending,
  };
}

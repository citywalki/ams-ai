import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { systemApi, type UserItem } from '@/utils/api';

export function useResetPassword() {
  const { t } = useTranslation();

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

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

  const handleResetPassword = useCallback(async () => {
    if (!resetPasswordUser || !newPassword) return;
    setResetLoading(true);
    setResetPasswordError(null);
    try {
      await systemApi.resetUserPassword(resetPasswordUser.id, newPassword);
      closeResetPasswordDialog();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('pages.userManagement.messages.operationFailed');
      setResetPasswordError(message);
    } finally {
      setResetLoading(false);
    }
  }, [resetPasswordUser, newPassword, closeResetPasswordDialog, t]);

  return {
    resetPasswordOpen,
    resetPasswordUser,
    newPassword,
    resetLoading,
    resetPasswordError,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    setNewPassword,
    handleResetPassword,
    setResetPasswordOpen,
  };
}

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { systemApi, type UserItem } from '@/utils/api';
import { invalidateUserList } from '../queries';

export function useDeleteUser() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteDialog = useCallback((user: UserItem) => {
    setDeleteUser(user);
    setDeleteError(null);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteOpen(false);
    setDeleteUser(null);
    setDeleteError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await systemApi.deleteUser(deleteUser.id);
      closeDeleteDialog();
      void invalidateUserList(queryClient);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('pages.userManagement.messages.operationFailed');
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteUser, closeDeleteDialog, queryClient, t]);

  return {
    deleteOpen,
    deleteUser,
    deleteLoading,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    setDeleteOpen,
  };
}

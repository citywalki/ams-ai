import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { UserItem } from '@/lib/types';
import { useDeleteUser as useDeleteUserMutation } from '../mutations';
import { invalidateUserList } from '../queries';

export function useDeleteUser() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeleteUserMutation();

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
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deleteUser.id);
      closeDeleteDialog();
      void invalidateUserList(queryClient);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('pages.userManagement.messages.operationFailed');
      setDeleteError(message);
    }
  }, [deleteUser, deleteMutation, closeDeleteDialog, queryClient, t]);

  return {
    deleteOpen,
    deleteUser,
    deleteLoading: deleteMutation.isPending,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    handleDelete,
    setDeleteOpen,
  };
}

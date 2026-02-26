import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { systemApi, type RoleItem } from '@/utils/api';
import { invalidateRoleList } from '../queries';

export function useRoleDelete() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = useCallback((role: RoleItem) => {
    setDeleteRole(role);
    setError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setDeleteRole(null);
    setError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteRole) return;
    setLoading(true);
    setError(null);
    try {
      await systemApi.deleteRole(deleteRole.id);
      closeDialog();
      void invalidateRoleList(queryClient);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.deleteFailed')
      );
    } finally {
      setLoading(false);
    }
  }, [deleteRole, closeDialog, queryClient, t]);

  return {
    dialogOpen,
    deleteRole,
    loading,
    error,
    openDialog,
    closeDialog,
    handleDelete,
    setDialogOpen,
  };
}

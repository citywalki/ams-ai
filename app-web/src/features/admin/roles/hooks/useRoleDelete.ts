import { useState, useCallback } from 'react';
import { type RoleItem } from '@/utils/api';
import { useDeleteRole } from '../mutations';

export function useRoleDelete() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);

  const deleteMutation = useDeleteRole();

  const openDialog = useCallback((role: RoleItem) => {
    setDeleteRole(role);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setDeleteRole(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteRole) return;
    try {
      await deleteMutation.mutateAsync(deleteRole.id);
      closeDialog();
    } catch {
      // Error is handled by mutation
    }
  }, [deleteRole, closeDialog, deleteMutation]);

  return {
    dialogOpen,
    deleteRole,
    loading: deleteMutation.isPending,
    error: deleteMutation.error?.message ?? null,
    openDialog,
    closeDialog,
    handleDelete,
    setDialogOpen,
  };
}

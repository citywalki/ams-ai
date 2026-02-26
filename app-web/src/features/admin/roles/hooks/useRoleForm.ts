import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { systemApi, type RoleItem, type RolePayload } from '@/utils/api';
import { invalidateRoleList } from '../queries';
import { type RoleFormState, initialFormState } from '../types';

export function useRoleForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingRole(null);
    setFormState(initialFormState);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((role: RoleItem) => {
    setDialogMode('edit');
    setEditingRole(role);
    setFormState({
      code: role.code,
      name: role.name,
      description: role.description ?? '',
      permissionIds: role.permissionIds ?? role.permissions?.map((p) => p.id) ?? [],
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingRole(null);
    setFormState(initialFormState);
    setFormError(null);
  }, []);

  const togglePermission = useCallback((permId: string) => {
    setFormState((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  }, []);

  const updateFormField = useCallback(<K extends keyof RoleFormState>(
    field: K,
    value: RoleFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.code.trim()) {
      setFormError(t('pages.roleManagement.messages.codeRequired'));
      return;
    }
    if (!formState.name.trim()) {
      setFormError(t('pages.roleManagement.messages.nameRequired'));
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: RolePayload = {
        code: formState.code.trim(),
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
        permissionIds: formState.permissionIds,
      };
      if (dialogMode === 'create') {
        await systemApi.createRole(payload);
      } else if (editingRole) {
        await systemApi.updateRole(editingRole.id, payload);
      }
      closeDialog();
      void invalidateRoleList(queryClient);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.operationFailed')
      );
    } finally {
      setFormLoading(false);
    }
  }, [dialogMode, editingRole, formState, closeDialog, queryClient, t]);

  return {
    dialogOpen,
    dialogMode,
    editingRole,
    formState,
    formLoading,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    togglePermission,
    updateFormField,
    handleFormSubmit,
    setDialogOpen,
  };
}

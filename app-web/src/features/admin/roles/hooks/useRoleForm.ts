import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type RoleItem, type RolePayload } from '@/lib/types';
import { useCreateRole, useUpdateRole } from '../mutations';
import { roleFormSchema, type RoleFormData } from '../schemas/role-schema';

const defaultFormValues: RoleFormData = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};

export function useRoleForm() {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(defaultFormValues);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingRole(null);
    setFormData(defaultFormValues);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((role: RoleItem) => {
    setDialogMode('edit');
    setEditingRole(role);
    setFormData({
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
    setFormData(defaultFormValues);
    setFormError(null);
  }, []);

  const submitForm = useCallback(
    async (values: RoleFormData) => {
      setFormError(null);

      const validation = roleFormSchema.safeParse(values);
      if (!validation.success) {
        const message = validation.error.issues.map((issue) => issue.message).join(', ');
        setFormError(message);
        throw new Error(message);
      }

      const payload: RolePayload = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        permissionIds: values.permissionIds,
      };

      try {
        if (dialogMode === 'create') {
          await createMutation.mutateAsync(payload);
        } else if (editingRole) {
          await updateMutation.mutateAsync({ id: editingRole.id, payload });
        }
        closeDialog();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : t('pages.roleManagement.messages.operationFailed');
        setFormError(message);
        throw err;
      }
    },
    [closeDialog, createMutation, dialogMode, editingRole, t, updateMutation]
  );

  return {
    dialogOpen,
    dialogMode,
    editingRole,
    formData,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    submitForm,
    setDialogOpen,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}

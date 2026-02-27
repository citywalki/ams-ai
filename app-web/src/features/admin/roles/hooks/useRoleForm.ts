import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { systemApi, type RoleItem, type RolePayload } from '@/utils/api';
import { invalidateRoleList } from '../queries';
import {
  roleFormSchema,
  type RoleFormData,
} from '../schemas/role-schema';

const defaultFormValues: RoleFormData = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};

export function useRoleForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = roleFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: RolePayload = {
          code: value.code.trim(),
          name: value.name.trim(),
          description: value.description?.trim() || undefined,
          permissionIds: value.permissionIds,
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
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingRole(null);
    form.reset();
    form.setFieldValue('code', '');
    form.setFieldValue('name', '');
    form.setFieldValue('description', '');
    form.setFieldValue('permissionIds', []);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((role: RoleItem) => {
    setDialogMode('edit');
    setEditingRole(role);
    form.reset();
    form.setFieldValue('code', role.code);
    form.setFieldValue('name', role.name);
    form.setFieldValue('description', role.description ?? '');
    form.setFieldValue('permissionIds', role.permissionIds ?? role.permissions?.map((p) => p.id) ?? []);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingRole(null);
    form.reset();
    setFormError(null);
  }, [form]);

  const togglePermission = useCallback((permId: string) => {
    const currentPermissions = form.getFieldValue('permissionIds');
    const newPermissions = currentPermissions.includes(permId)
      ? currentPermissions.filter((id) => id !== permId)
      : [...currentPermissions, permId];
    form.setFieldValue('permissionIds', newPermissions);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingRole,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    togglePermission,
    setDialogOpen,
  };
}

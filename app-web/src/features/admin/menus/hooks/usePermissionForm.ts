import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { menuApi, type PermissionItem, type PermissionPayload, type MenuItem } from '@/utils/api';
import { invalidateMenuQueries, fetchMenuPermissions } from '../queries';
import {
  permissionFormSchema,
  type PermissionFormData,
} from '../schemas/menu-schema';

const defaultFormValues: PermissionFormData = {
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  buttonType: '',
};

interface UsePermissionFormOptions {
  selectedMenu: MenuItem | null;
  onSuccess?: (permissions: PermissionItem[]) => void;
}

export function usePermissionForm(options: UsePermissionFormOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = permissionFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      if (!options.selectedMenu) return;
      setFormError(null);
      try {
        const payload: PermissionPayload = {
          code: value.code,
          name: value.name,
          description: value.description || undefined,
          menuId: options.selectedMenu.id,
          sortOrder: value.sortOrder,
          buttonType: value.buttonType || undefined,
        };
        if (dialogMode === 'create') {
          await menuApi.createPermission(payload);
        } else if (editingPermission) {
          await menuApi.updatePermission(editingPermission.id, payload);
        }
        closeDialog();
        void invalidateMenuQueries(queryClient);
        const permissions = await fetchMenuPermissions(queryClient, options.selectedMenu.id);
        options.onSuccess?.(permissions);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : t('pages.menuManagement.messages.operationFailed')
        );
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingPermission(null);
    form.reset();
    form.setFieldValue('code', '');
    form.setFieldValue('name', '');
    form.setFieldValue('description', '');
    form.setFieldValue('sortOrder', 0);
    form.setFieldValue('buttonType', '');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((permission: PermissionItem) => {
    setDialogMode('edit');
    setEditingPermission(permission);
    form.reset();
    form.setFieldValue('code', permission.code);
    form.setFieldValue('name', permission.name);
    form.setFieldValue('description', permission.description || '');
    form.setFieldValue('sortOrder', permission.sortOrder || 0);
    form.setFieldValue('buttonType', permission.buttonType || '');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingPermission(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingPermission,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
  };
}

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { type MenuItem, type MenuPayload } from '@/utils/api';
import { useCreateMenu, useUpdateMenu } from '../mutations';
import {
  menuFormSchema,
  type MenuFormData,
} from '../schemas/menu-schema';

const defaultFormValues: MenuFormData = {
  key: '',
  label: '',
  route: '',
  icon: '',
  sortOrder: 0,
  isVisible: true,
  menuType: 'MENU',
  rolesAllowed: '',
};

interface UseMenuFormOptions {
  selectedFolder: 'root' | MenuItem;
  onSuccess?: () => void;
}

export function useMenuForm(options: UseMenuFormOptions) {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = menuFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload: MenuPayload = {
          key: value.key,
          label: value.label,
          route: value.route || undefined,
          parentId: dialogMode === 'edit' && editingMenu
            ? editingMenu.parentId
            : (options.selectedFolder === 'root' ? undefined : options.selectedFolder?.id),
          icon: value.icon || undefined,
          sortOrder: value.sortOrder,
          isVisible: value.isVisible,
          menuType: value.menuType,
          rolesAllowed: value.rolesAllowed
            ? value.rolesAllowed.split(',').map((r) => r.trim()).filter(Boolean)
            : undefined,
        };
        if (dialogMode === 'create') {
          await createMutation.mutateAsync(payload);
        } else if (editingMenu) {
          await updateMutation.mutateAsync({ id: editingMenu.id, payload });
        }
        closeDialog();
        options.onSuccess?.();
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
    setEditingMenu(null);
    form.reset();
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((menu: MenuItem) => {
    setDialogMode('edit');
    setEditingMenu(menu);
    form.reset();
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingMenu(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingMenu,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}

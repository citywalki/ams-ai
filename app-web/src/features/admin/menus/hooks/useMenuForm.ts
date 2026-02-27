import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { menuApi, type MenuItem, type MenuPayload } from '@/utils/api';
import { invalidateMenuQueries } from '../queries';
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
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
          parentId: options.selectedFolder === 'root' ? undefined : options.selectedFolder?.id,
          icon: value.icon || undefined,
          sortOrder: value.sortOrder,
          isVisible: value.isVisible,
          menuType: value.menuType,
          rolesAllowed: value.rolesAllowed
            ? value.rolesAllowed.split(',').map((r) => r.trim()).filter(Boolean)
            : undefined,
        };
        if (dialogMode === 'create') {
          await menuApi.createMenu(payload);
        } else if (editingMenu) {
          await menuApi.updateMenu(editingMenu.id, payload);
        }
        closeDialog();
        void invalidateMenuQueries(queryClient);
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
  };
}

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { systemApi, type UserItem, type UserCreatePayload, type UserUpdatePayload } from '@/utils/api';
import { invalidateUserList } from '../queries';
import {
  userFormSchema,
  editUserFormSchema,
  type UserFormData,
} from '../schemas/user-schema';

const defaultFormValues: UserFormData = {
  username: '',
  email: '',
  password: '',
  status: 'ACTIVE',
};

export function useUserForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onChange: ({ value }) => {
        if (dialogMode === 'create') {
          const result = userFormSchema.safeParse(value);
          if (result.success) {
            return undefined;
          }
          return result.error.issues.map((issue) => issue.message).join(', ');
        }
        const result = editUserFormSchema.safeParse(value);
        if (result.success) {
          return undefined;
        }
        return result.error.issues.map((issue) => issue.message).join(', ');
      },
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (dialogMode === 'create') {
          const payload: UserCreatePayload = {
            username: value.username,
            email: value.email || undefined,
            password: value.password,
            status: value.status,
          };
          await systemApi.createUser(payload);
        } else if (editingUser) {
          const payload: UserUpdatePayload = {
            username: value.username,
            email: value.email || undefined,
            status: value.status,
          };
          await systemApi.updateUser(editingUser.id, payload);
        }
        closeDialog();
        void invalidateUserList(queryClient);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : t('pages.userManagement.messages.operationFailed')
        );
        throw err;
      }
    },
  });

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingUser(null);
    form.reset();
    form.setFieldValue('username', '');
    form.setFieldValue('email', '');
    form.setFieldValue('password', '');
    form.setFieldValue('status', 'ACTIVE' as const);
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const openEditDialog = useCallback((user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    form.reset();
    form.setFieldValue('username', user.username);
    form.setFieldValue('email', user.email ?? '');
    form.setFieldValue('status', (user.status === 'ACTIVE' || user.status === 'INACTIVE' ? user.status : 'ACTIVE') as 'ACTIVE' | 'INACTIVE');
    setFormError(null);
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    dialogOpen,
    dialogMode,
    editingUser,
    form,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    setDialogOpen,
  };
}

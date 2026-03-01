import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type UserItem, type UserCreatePayload, type UserUpdatePayload } from '@/lib/types';
import { useCreateUser, useUpdateUser } from '../mutations';
import { editUserFormSchema, userFormSchema, type UserFormData } from '../schemas/user-schema';

const defaultFormValues: UserFormData = {
  username: '',
  email: '',
  password: '',
  status: 'ACTIVE',
};

export function useUserForm() {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultFormValues);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingUser(null);
    setFormData(defaultFormValues);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email ?? '',
      password: '',
      status: user.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData(defaultFormValues);
    setFormError(null);
  }, []);

  const submitForm = useCallback(
    async (values: UserFormData) => {
      setFormError(null);

      const validation =
        dialogMode === 'create'
          ? userFormSchema.safeParse(values)
          : editUserFormSchema.safeParse(values);

      if (!validation.success) {
        const message = validation.error.issues.map((issue) => issue.message).join(', ');
        setFormError(message);
        throw new Error(message);
      }

      try {
        if (dialogMode === 'create') {
          const payload: UserCreatePayload = {
            username: values.username,
            email: values.email || undefined,
            password: values.password,
            status: values.status,
          };
          await createMutation.mutateAsync(payload);
        } else if (editingUser) {
          const payload: UserUpdatePayload = {
            username: values.username,
            email: values.email || undefined,
            status: values.status,
          };
          await updateMutation.mutateAsync({ id: editingUser.id, payload });
        }
        closeDialog();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t('pages.userManagement.messages.operationFailed');
        setFormError(message);
        throw err;
      }
    },
    [closeDialog, createMutation, dialogMode, editingUser, t, updateMutation]
  );

  return {
    dialogOpen,
    dialogMode,
    editingUser,
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

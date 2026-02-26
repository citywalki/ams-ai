import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { systemApi, type UserItem, type UserCreatePayload, type UserUpdatePayload } from '@/utils/api';
import { invalidateUserList } from '../queries';
import { type UserFormState, initialFormState } from '../types';

export function useUserForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingUser(null);
    setFormState(initialFormState);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: UserItem) => {
    setDialogMode('edit');
    setEditingUser(user);
    setFormState({
      username: user.username,
      email: user.email ?? '',
      password: '',
      status: user.status,
      roleIds: user.roles?.map((r) => r.id) ?? [],
    });
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormState(initialFormState);
    setFormError(null);
  }, []);

  const toggleRole = useCallback((roleId: string) => {
    setFormState((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  }, []);

  const updateFormField = useCallback(<K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (dialogMode === 'create') {
        const payload: UserCreatePayload = {
          username: formState.username,
          email: formState.email || undefined,
          password: formState.password,
          status: formState.status,
          roleIds: formState.roleIds,
        };
        await systemApi.createUser(payload);
      } else if (editingUser) {
        const payload: UserUpdatePayload = {
          username: formState.username,
          email: formState.email || undefined,
          status: formState.status,
          roleIds: formState.roleIds,
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
    } finally {
      setFormLoading(false);
    }
  }, [dialogMode, editingUser, formState, closeDialog, queryClient, t]);

  return {
    dialogOpen,
    dialogMode,
    editingUser,
    formState,
    formLoading,
    formError,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    toggleRole,
    updateFormField,
    handleFormSubmit,
    setDialogOpen,
  };
}

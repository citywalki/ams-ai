import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { RoleItem, UserItem } from '@/lib/types';
import { fetchAllUsers } from '@/features/admin/users/queries';
import { useAssignUserToRole, useRemoveUserFromRole } from '../mutations';

export function useRoleUserAssignment() {
  const { t } = useTranslation();

  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: fetchAllUsers,
    staleTime: 30000,
  });

  const { data: roleUsers = [], isLoading: roleUsersLoading, refetch: refetchRoleUsers } = useQuery({
    queryKey: ['role', editingRole?.id, 'users'],
    queryFn: async (): Promise<UserItem[]> => {
      if (!editingRole) return [];
      const response = await apiClient.get<UserItem[]>(`/system/roles/${editingRole.id}/users`);
      return response.data;
    },
    enabled: !!editingRole,
    staleTime: 10000,
  });

  const assignMutation = useAssignUserToRole();
  const removeMutation = useRemoveUserFromRole();

  const loading = usersLoading || roleUsersLoading;

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const handleAssignUser = useCallback(async (userId: string) => {
    if (!editingRole) return;
    setError(null);
    try {
      await assignMutation.mutateAsync({ roleId: editingRole.id, userId });
      await refetchRoleUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.assignUserFailed')
      );
      throw err;
    }
  }, [editingRole, assignMutation, refetchRoleUsers, t]);

  const handleRemoveUser = useCallback(async (userId: string) => {
    if (!editingRole) return;
    setError(null);
    try {
      await removeMutation.mutateAsync({ roleId: editingRole.id, userId });
      await refetchRoleUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.removeUserFailed')
      );
      throw err;
    }
  }, [editingRole, removeMutation, refetchRoleUsers, t]);

  const openAssignment = useCallback((role: RoleItem) => {
    setEditingRole(role);
    setSearchKeyword('');
    setError(null);
  }, []);

  const closeAssignment = useCallback(() => {
    setEditingRole(null);
    setSearchKeyword('');
    setError(null);
  }, []);

  const dialogOpen = editingRole !== null;

  return {
    dialogOpen,
    editingRole,
    allUsers,
    roleUsers,
    loading,
    assigning: assignMutation.isPending,
    removing: removeMutation.isPending,
    error,
    searchKeyword,
    handleSearchChange,
    handleAssignUser,
    handleRemoveUser,
    openAssignment,
    closeAssignment,
  };
}

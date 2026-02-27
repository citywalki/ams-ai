import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { systemApi, type RoleItem, type UserItem } from '@/utils/api';
import { invalidateRoleList } from '../queries';

export function useRoleUserAssignment() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const response = await systemApi.getUsers();
      return Array.isArray(response) ? response : response.items || [];
    },
    staleTime: 30000,
  });

  const { data: roleUsers = [], isLoading: roleUsersLoading, refetch: refetchRoleUsers } = useQuery({
    queryKey: ['role', editingRole?.id, 'users'],
    queryFn: async () => {
      if (!editingRole) return [];
      const response = await systemApi.getRoleUsers(editingRole.id);
      return response || [];
    },
    enabled: !!editingRole,
    staleTime: 10000,
  });

  const loading = usersLoading || roleUsersLoading;

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const handleAssignUser = useCallback(async (userId: string) => {
    if (!editingRole) return;
    setAssigning(true);
    setError(null);
    try {
      await systemApi.assignUserToRole(editingRole.id, userId);
      await refetchRoleUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.assignUserFailed')
      );
      throw err;
    } finally {
      setAssigning(false);
    }
  }, [editingRole, refetchRoleUsers, t]);

  const handleRemoveUser = useCallback(async (userId: string) => {
    if (!editingRole) return;
    setRemoving(true);
    setError(null);
    try {
      await systemApi.removeUserFromRole(editingRole.id, userId);
      await refetchRoleUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('pages.roleManagement.messages.removeUserFailed')
      );
      throw err;
    } finally {
      setRemoving(false);
    }
  }, [editingRole, refetchRoleUsers, t]);

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

  return {
    editingRole,
    allUsers,
    roleUsers,
    loading,
    assigning,
    removing,
    error,
    searchKeyword,
    handleSearchChange,
    handleAssignUser,
    handleRemoveUser,
    openAssignment,
    closeAssignment,
  };
}

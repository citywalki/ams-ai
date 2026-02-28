import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { systemApi, type RoleItem } from '@/utils/api';
import { fetchAllUsers } from '@/features/admin/users/queries';

export function useRoleUserAssignment() {
  const { t } = useTranslation();

  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: fetchAllUsers,
    staleTime: 30000,
  });

  const { data: roleUsers = [], isLoading: roleUsersLoading, refetch: refetchRoleUsers } = useQuery({
    queryKey: ['role', editingRole?.id, 'users'],
    queryFn: async () => {
      if (!editingRole) return [];
      const response = await systemApi.getRoleUsers(editingRole.id);
      return Array.isArray(response) ? response : (response as any).data || [];
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

  const dialogOpen = editingRole !== null;

  return {
    dialogOpen,
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

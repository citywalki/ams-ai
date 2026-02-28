import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { RolePayload, RoleItem } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateRole(
  options?: UseMutationOptions<RoleItem, Error, RolePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RolePayload) => {
      const res = await apiClient.post<RoleItem>('/system/roles', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.listRoot() });
    },
    ...options,
  });
}

export function useUpdateRole(
  options?: UseMutationOptions<RoleItem, Error, { id: string; payload: RolePayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RolePayload }) => {
      const res = await apiClient.put<RoleItem>(`/system/roles/${id}`, payload);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.listRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(id) });
    },
    ...options,
  });
}

export function useDeleteRole(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/system/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.listRoot() });
    },
    ...options,
  });
}

export function useUpdateRoleMenus(
  options?: UseMutationOptions<void, Error, { roleId: string; menuIds: string[] }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, menuIds }: { roleId: string; menuIds: string[] }) => {
      await apiClient.put(`/system/roles/${roleId}/menus`, { menuIds });
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.menus(roleId) });
    },
    ...options,
  });
}

export function useAssignUserToRole(
  options?: UseMutationOptions<void, Error, { roleId: string; userId: string }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, userId }: { roleId: string; userId: string }) => {
      await apiClient.post(`/system/roles/${roleId}/users`, { userId });
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    ...options,
  });
}

export function useRemoveUserFromRole(
  options?: UseMutationOptions<void, Error, { roleId: string; userId: string }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, userId }: { roleId: string; userId: string }) => {
      await apiClient.delete(`/system/roles/${roleId}/users/${userId}`);
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    ...options,
  });
}

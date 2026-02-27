import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { systemApi, type RolePayload, type RoleItem, type UserItem } from '@/utils/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateRole(
  options?: UseMutationOptions<RoleItem, Error, RolePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RolePayload) => {
      const res = await systemApi.createRole(payload);
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
      const res = await systemApi.updateRole(id, payload);
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
      await systemApi.deleteRole(id);
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
      await systemApi.updateRoleMenus(roleId, menuIds);
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
      await systemApi.assignUserToRole(roleId, userId);
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
      await systemApi.removeUserFromRole(roleId, userId);
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    ...options,
  });
}

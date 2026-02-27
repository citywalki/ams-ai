import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { menuApi, type MenuPayload, type MenuItem, type PermissionPayload, type PermissionItem } from '@/utils/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateMenu(
  options?: UseMutationOptions<MenuItem, Error, MenuPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MenuPayload) => {
      const res = await menuApi.createMenu(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.root() });
    },
    ...options,
  });
}

export function useUpdateMenu(
  options?: UseMutationOptions<MenuItem, Error, { id: string; payload: MenuPayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: MenuPayload }) => {
      const res = await menuApi.updateMenu(id, payload);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.root() });
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.detail(id) });
    },
    ...options,
  });
}

export function useDeleteMenu(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await menuApi.deleteMenu(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.root() });
    },
    ...options,
  });
}

export function useCreatePermission(
  options?: UseMutationOptions<PermissionItem, Error, PermissionPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PermissionPayload) => {
      const res = await menuApi.createPermission(payload);
      return res.data;
    },
    onSuccess: (_, payload) => {
      if (payload.menuId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.menus.permissions(payload.menuId) });
      }
    },
    ...options,
  });
}

export function useUpdatePermission(
  options?: UseMutationOptions<PermissionItem, Error, { id: string; payload: PermissionPayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PermissionPayload }) => {
      const res = await menuApi.updatePermission(id, payload);
      return res.data;
    },
    onSuccess: (_, { payload }) => {
      if (payload.menuId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.menus.permissions(payload.menuId) });
      }
    },
    ...options,
  });
}

export function useDeletePermission(
  options?: UseMutationOptions<void, Error, { id: string; menuId?: string }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; menuId?: string }) => {
      await menuApi.deletePermission(id);
    },
    onSuccess: (_, { menuId }) => {
      if (menuId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.menus.permissions(menuId) });
      }
    },
    ...options,
  });
}

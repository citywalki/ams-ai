import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { MenuPayload, MenuItem, PermissionPayload, PermissionItem } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateMenu(
  options?: UseMutationOptions<MenuItem, Error, MenuPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MenuPayload) => {
      const res = await apiClient.post<MenuItem>('/system/menus', payload);
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
      const res = await apiClient.put<MenuItem>(`/system/menus/${id}`, payload);
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
      await apiClient.delete(`/system/menus/${id}`);
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
      const res = await apiClient.post<PermissionItem>('/system/permissions', payload);
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
      const res = await apiClient.put<PermissionItem>(`/system/permissions/${id}`, payload);
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
      await apiClient.delete(`/system/permissions/${id}`);
    },
    onSuccess: (_, { menuId }) => {
      if (menuId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.menus.permissions(menuId) });
      }
    },
    ...options,
  });
}

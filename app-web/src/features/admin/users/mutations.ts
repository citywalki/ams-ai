import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { UserCreatePayload, UserUpdatePayload, UserItem } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateUser(
  options?: UseMutationOptions<UserItem, Error, UserCreatePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserCreatePayload) => {
      const res = await apiClient.post<UserItem>('/system/users', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.listRoot() });
    },
    ...options,
  });
}

export function useUpdateUser(
  options?: UseMutationOptions<UserItem, Error, { id: string; payload: UserUpdatePayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UserUpdatePayload }) => {
      const res = await apiClient.put<UserItem>(`/system/users/${id}`, payload);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.listRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
    ...options,
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/system/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.listRoot() });
    },
    ...options,
  });
}

export function useUpdateUserStatus(
  options?: UseMutationOptions<void, Error, { id: string; status: string }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.put(`/system/users/${id}/status`, { status });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.listRoot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
    ...options,
  });
}

export function useResetUserPassword(
  options?: UseMutationOptions<void, Error, { id: string; password: string }>,
) {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      await apiClient.put(`/system/users/${id}/reset-password`, { password });
    },
    ...options,
  });
}

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { systemApi, type UserCreatePayload, type UserUpdatePayload, type UserItem } from '@/utils/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateUser(
  options?: UseMutationOptions<UserItem, Error, UserCreatePayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserCreatePayload) => {
      const res = await systemApi.createUser(payload);
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
      const res = await systemApi.updateUser(id, payload);
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
      await systemApi.deleteUser(id);
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
      await systemApi.updateUserStatus(id, status);
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
      await systemApi.resetUserPassword(id, password);
    },
    ...options,
  });
}

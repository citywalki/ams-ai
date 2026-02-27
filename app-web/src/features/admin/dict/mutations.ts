import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { dictApi, type DictCategoryPayload, type DictItemPayload, type DictCategory, type DictItem } from '@/utils/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateCategory(
  options?: UseMutationOptions<DictCategory, Error, DictCategoryPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DictCategoryPayload) => {
      const res = await dictApi.createCategory(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.categories() });
    },
    ...options,
  });
}

export function useUpdateCategory(
  options?: UseMutationOptions<DictCategory, Error, { id: string; payload: DictCategoryPayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: DictCategoryPayload }) => {
      const res = await dictApi.updateCategory(id, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.categories() });
    },
    ...options,
  });
}

export function useDeleteCategory(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await dictApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.categories() });
    },
    ...options,
  });
}

export function useCreateItem(
  options?: UseMutationOptions<DictItem, Error, { categoryId: string; payload: DictItemPayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, payload }: { categoryId: string; payload: DictItemPayload }) => {
      const res = await dictApi.createItem(categoryId, payload);
      return res.data;
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.items(categoryId) });
    },
    ...options,
  });
}

export function useUpdateItem(
  options?: UseMutationOptions<DictItem, Error, { id: string; categoryId: string; payload: DictItemPayload }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; categoryId: string; payload: DictItemPayload }) => {
      const res = await dictApi.updateItem(id, payload);
      return res.data;
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.items(categoryId) });
    },
    ...options,
  });
}

export function useDeleteItem(
  options?: UseMutationOptions<void, Error, { id: string; categoryId: string }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; categoryId: string }) => {
      await dictApi.deleteItem(id);
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.items(categoryId) });
    },
    ...options,
  });
}

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { DictCategoryPayload, DictItemPayload, DictCategory, DictItem } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateCategory(
  options?: UseMutationOptions<DictCategory, Error, DictCategoryPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DictCategoryPayload) => {
      const res = await apiClient.post<DictCategory>('/system/dict/categories', payload);
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
      const res = await apiClient.put<DictCategory>(`/system/dict/categories/${id}`, payload);
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
      await apiClient.delete(`/system/dict/categories/${id}`);
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
      const res = await apiClient.post<DictItem>(`/system/dict/categories/${categoryId}/items`, payload);
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
      const res = await apiClient.put<DictItem>(`/system/dict/items/${id}`, payload);
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
      await apiClient.delete(`/system/dict/items/${id}`);
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict.items(categoryId) });
    },
    ...options,
  });
}

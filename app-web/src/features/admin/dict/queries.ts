import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { dictApi, type DictCategory, type DictItem } from '@/utils/api';

export function fetchCategories(queryClient: QueryClient) {
  return queryClient.fetchQuery<DictCategory[]>({
    queryKey: queryKeys.dict.categories(),
    queryFn: async () => {
      const res = await dictApi.getCategories();
      return res.data;
    },
  });
}

export function fetchDictItems(queryClient: QueryClient, categoryId: string) {
  return queryClient.fetchQuery<DictItem[]>({
    queryKey: queryKeys.dict.items(categoryId),
    queryFn: async () => {
      const res = await dictApi.getItems(categoryId);
      return res.data;
    },
  });
}

export function invalidateDictQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dict.root() });
}

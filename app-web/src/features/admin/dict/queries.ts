import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { type DictCategory, type DictItem } from '@/utils/api';
import { graffle } from '@/lib/graffleClient';

export function fetchCategories(queryClient: QueryClient) {
  return queryClient.fetchQuery<DictCategory[]>({
    queryKey: queryKeys.dict.categories(),
    queryFn: async () => {
      const result = await graffle.query.dictCategories({
        $: { orderBy: [{ field: 'sort', direction: 'ASC' }], size: 100 },
        content: {
          id: true,
          code: true,
          name: true,
          description: true,
          sort: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result.content as DictCategory[];
    },
  });
}

export function fetchDictItems(queryClient: QueryClient, categoryId: string) {
  return queryClient.fetchQuery<DictItem[]>({
    queryKey: queryKeys.dict.items(categoryId),
    queryFn: async () => {
      const result = await graffle.query.dictItems({
        $: {
          where: { categoryId: { _eq: categoryId } },
          orderBy: [{ field: 'sort', direction: 'ASC' }],
          size: 500,
        },
        content: {
          id: true,
          categoryId: true,
          parentId: true,
          code: true,
          name: true,
          value: true,
          sort: true,
          status: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result.content as DictItem[];
    },
  });
}

export function invalidateDictQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dict.root() });
}

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { type DictCategory, type DictItem } from '@/utils/api';
import { graphqlClient } from '@/lib/graphqlClient';

export function fetchCategories(queryClient: QueryClient) {
  return queryClient.fetchQuery<DictCategory[]>({
    queryKey: queryKeys.dict.categories(),
    queryFn: async () => {
      const query = `
        query DictCategories {
          dictCategories(orderBy: [{ field: "sort", direction: "ASC" }], size: 100) {
            content {
              id
              code
              name
              description
              sort
              status
              createdAt
              updatedAt
            }
          }
        }
      `;
      const result = await graphqlClient.request<{
        dictCategories: { content: DictCategory[] };
      }>(query);
      return result.dictCategories.content;
    },
  });
}

export function fetchDictItems(queryClient: QueryClient, categoryId: string) {
  return queryClient.fetchQuery<DictItem[]>({
    queryKey: queryKeys.dict.items(categoryId),
    queryFn: async () => {
      const query = `
        query DictItems($where: DictItemFilter) {
          dictItems(where: $where, orderBy: [{ field: "sort", direction: "ASC" }], size: 500) {
            content {
              id
              categoryId
              parentId
              code
              name
              value
              sort
              status
              remark
              createdAt
              updatedAt
            }
          }
        }
      `;
      const where = { categoryId: { _eq: categoryId } };
      const result = await graphqlClient.request<{
        dictItems: { content: DictItem[] };
      }>(query, { where });
      return result.dictItems.content;
    },
  });
}

export function invalidateDictQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dict.root() });
}

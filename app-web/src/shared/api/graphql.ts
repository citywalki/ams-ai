import { createClient, fetchExchange, type OperationResult } from '@urql/core';
import { useAuthStore } from '@/store/auth-store';

/**
 * urql GraphQL 客户端
 * 
 * 注意：此客户端仅作为底层 HTTP 层，查询缓存由 TanStack Query 管理
 */
const client = createClient({
  url: '/graphql',
  exchanges: [fetchExchange],
  fetchOptions: () => {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { headers };
  },
});

/**
 * GraphQL 查询 fetcher，供 TanStack Query 使用
 * 
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns Query result data
 * @throws Error when GraphQL returns errors
 */
export async function graphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const result: OperationResult<T> = await client
    .query(query, variables)
    .toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error('GraphQL response contains no data');
  }

  return result.data;
}

export default client;

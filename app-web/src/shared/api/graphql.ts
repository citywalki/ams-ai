import { createClient, fetchExchange, type OperationResult } from '@urql/core';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

/**
 * urql GraphQL 客户端
 * 
 * 注意：此客户端仅作为底层 HTTP 层，查询缓存由 TanStack Query 管理
 */
const client = createClient({
  url: '/graphql',
  preferGetMethod: false,
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
    const isUnauthorized = result.error.response?.status === 401 ||
      result.error.message?.includes('Unauthorized');

    if (isUnauthorized) {
      // 401 错误：清除登录状态并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      useAuthStore.getState().logout();
      toast.error('登录已过期，请重新登录');
      window.location.href = '/login';
    } else {
      toast.error(`请求失败: ${result.error.message}`);
    }
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error('GraphQL response contains no data');
  }

  return result.data;
}

export default client;

import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useUsers, USERS_QUERY_KEY } from './use-users';
import { server } from '@/shared/test/msw/server';
import { http, HttpResponse } from 'msw';

describe('useUsers', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  it('应该使用默认参数获取用户列表', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content).toHaveLength(1);
    expect(result.current.data?.totalElements).toBe(1);
  });

  it('应该支持分页参数', async () => {
    server.use(
      http.post('/graphql', async ({ request }) => {
        const body = await request.json() as { variables: { page?: number; size?: number } };
        const { page = 0, size = 20 } = body.variables;

        return HttpResponse.json({
          data: {
            users: {
              content: [
                { id: page * size + 1, username: `user-${page}`, email: '' },
              ],
              totalElements: 100,
              totalPages: Math.ceil(100 / size),
              page,
              size,
            },
          },
        });
      })
    );

    const { result } = renderHook(() => useUsers({ page: 2, size: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.page).toBe(2);
    expect(result.current.data?.size).toBe(10);
    expect(result.current.data?.totalPages).toBe(10);
  });

  it('应该支持筛选参数', async () => {
    server.use(
      http.post('/graphql', async ({ request }) => {
        const body = await request.json() as { variables: { where?: { status?: string } } };

        if (body.variables?.where?.status === 'ACTIVE') {
          return HttpResponse.json({
            data: {
              users: {
                content: [
                  { id: 1, username: 'admin', status: 'ACTIVE' },
                ],
                totalElements: 1,
              },
            },
          });
        }

        return HttpResponse.json({
          data: { users: { content: [], totalElements: 0 } },
        });
      })
    );

    const { result } = renderHook(
      () => useUsers({ filters: { status: 'ACTIVE' } }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.content[0].status).toBe('ACTIVE');
  });

  it('isLoading 应该包含 isFetching', async () => {
    // Set up a delayed handler to ensure we can catch the isFetching state
    server.use(
      http.post('/graphql', async () => {
        // Add delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          data: {
            users: {
              content: [
                { id: 1, username: 'admin', email: 'admin@example.com', status: 'ACTIVE' },
              ],
              totalElements: 1,
            },
          },
        });
      })
    );

    const queryClient = new QueryClient();

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUsers(), {
      wrapper: Wrapper,
    });

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Trigger a refetch
    void result.current.refetch();

    // During refetch, isFetching should be true, and isLoading should also be true
    // because the hook returns isLoading: query.isLoading || query.isFetching
    await waitFor(() => {
      expect(result.current.isFetching).toBe(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('应该使用正确的 query key', () => {
    expect(USERS_QUERY_KEY).toEqual(['users']);
  });

  it('不同参数应该生成不同的 query key', async () => {
    const queryClient = new QueryClient();

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // First hook with page: 0
    const { result: result1 } = renderHook(() => useUsers({ page: 0 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // Second hook with page: 1
    const { result: result2 } = renderHook(() => useUsers({ page: 1 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Get both query keys
    const queries = queryClient.getQueryCache().findAll();
    expect(queries).toHaveLength(2);

    const key1 = queries[0]?.queryKey;
    const key2 = queries[1]?.queryKey;

    // Verify they have different page values
    expect(key1).not.toEqual(key2);
    expect((key1[1] as { page: number }).page).toBe(0);
    expect((key2[1] as { page: number }).page).toBe(1);
  });
});

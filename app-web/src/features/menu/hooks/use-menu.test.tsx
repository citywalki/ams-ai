import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUserMenus, MENU_QUERY_KEY } from './use-menu';
import { server } from '@/shared/test/msw/server';
import { HttpResponse, graphql } from 'msw';

describe('useUserMenus', () => {
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

  it('应该成功获取用户菜单', async () => {
    server.use(
      graphql.query('GetUserMenus', () => {
        return HttpResponse.json({
          data: {
            userMenus: [
              { id: 1, key: 'dashboard', label: '仪表盘', route: '/', sortOrder: 1, isVisible: true, menuType: 'MENU', rolesAllowed: [], tenant: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', children: [] },
              { id: 2, key: 'users', label: '用户管理', route: '/users', sortOrder: 2, isVisible: true, menuType: 'FOLDER', rolesAllowed: [], tenant: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', children: [] },
            ],
          },
        });
      })
    );

    const { result } = renderHook(() => useUserMenus(), {
      wrapper: createWrapper(),
    });

    // 初始状态应该是 loading
    expect(result.current.isLoading).toBe(true);

    // 等待数据加载完成
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 验证返回的数据
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      id: 1,
      key: 'dashboard',
      label: '仪表盘',
    });
  });

  it('GraphQL 返回错误时应该抛出错误', async () => {
    server.use(
      graphql.query('GetUserMenus', () => {
        return HttpResponse.json({
          errors: [{ message: '获取菜单失败' }],
        });
      })
    );

    const { result } = renderHook(() => useUserMenus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('获取菜单失败');
  });

  it('应该使用正确的 query key', () => {
    expect(MENU_QUERY_KEY).toEqual(['menus', 'user']);
  });

  it('应该缓存查询结果', async () => {
    server.use(
      graphql.query('GetUserMenus', () => {
        return HttpResponse.json({
          data: {
            userMenus: [
              { id: 1, key: 'dashboard', label: '仪表盘', route: '/', sortOrder: 1, isVisible: true, menuType: 'MENU', rolesAllowed: [], tenant: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', children: [] },
              { id: 2, key: 'users', label: '用户管理', route: '/users', sortOrder: 2, isVisible: true, menuType: 'FOLDER', rolesAllowed: [], tenant: 1, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', children: [] },
            ],
          },
        });
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // 第一次渲染
    const { result: result1 } = renderHook(() => useUserMenus(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // 验证数据已缓存
    const cachedData = queryClient.getQueryData(MENU_QUERY_KEY);
    expect(cachedData).toBeDefined();
    expect(cachedData).toHaveLength(2);
  });
});

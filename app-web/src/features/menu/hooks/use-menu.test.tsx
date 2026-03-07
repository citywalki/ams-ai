import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUserMenus, MENU_QUERY_KEY } from './use-menu';
import { server } from '@/shared/test/msw/server';
import { http, HttpResponse } from 'msw';

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

  it('API 返回包装格式时应该正确处理', async () => {
    server.use(
      http.get('/api/system/menus/user', () => {
        return HttpResponse.json({
          success: true,
          data: [
            { id: 3, key: 'settings', label: '设置', route: '/settings' },
          ],
        });
      })
    );

    const { result } = renderHook(() => useUserMenus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].key).toBe('settings');
  });

  it('API 返回错误格式时应该抛出错误', async () => {
    server.use(
      http.get('/api/system/menus/user', () => {
        return HttpResponse.json({
          success: false,
          message: '获取菜单失败',
        });
      })
    );

    const { result } = renderHook(() => useUserMenus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('获取菜单失败');
  });

  it('应该使用正确的 query key', () => {
    expect(MENU_QUERY_KEY).toEqual(['menus', 'user']);
  });

  it('应该缓存查询结果', async () => {
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

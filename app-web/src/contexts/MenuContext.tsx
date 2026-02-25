import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { menuApi, type MenuItem } from '@/services';
import { useAuthStore } from '@/stores/authStore';

type MenuContextValue = {
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function normalizeRoute(route: string): string {
  if (!route) {
    return '/';
  }
  return route.startsWith('/') ? route : `/${route}`;
}

function normalizeMenuTree(items: MenuItem[]): MenuItem[] {
  return items
    .map((item) => ({
      ...item,
      route: normalizeRoute(item.route),
      children: item.children ? normalizeMenuTree(item.children) : undefined
    }))
    .filter((item) => item.route);
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMenus = useCallback(async () => {
    if (!isAuthenticated) {
      setMenus([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userMenus = await menuApi.getUserMenus();
      setMenus(normalizeMenuTree(userMenus));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取菜单失败';
      setError(message);
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshMenus();
  }, [refreshMenus]);

  const value = useMemo(
    () => ({ menus, isLoading, error, refreshMenus }),
    [menus, isLoading, error, refreshMenus]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenus() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenus must be used within MenuProvider');
  }
  return context;
}

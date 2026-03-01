import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import type { MenuItem } from '@/lib/types';

interface MenuContextValue {
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMenus = async () => {
    if (!isAuthenticated) {
      setMenus([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<MenuItem[]>('/system/menus/user');
      setMenus(normalizeMenuTree(response.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载菜单失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMenus();
  }, [isAuthenticated]);

  return (
    <MenuContext.Provider value={{ menus, isLoading, error, refreshMenus }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenus() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenus must be used within MenuProvider');
  }
  return context;
}

// 规范化菜单数据
function normalizeMenuTree(menus: MenuItem[]): MenuItem[] {
  return menus.map((menu) => ({
    ...menu,
    key: menu.route || menu.key,
    children: menu.children ? normalizeMenuTree(menu.children) : undefined,
  }));
}

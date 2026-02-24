import { create } from 'zustand';
import { authApi, type User } from '@/services';
import { usePermissionStore } from '@/stores/permissionStore';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  bootstrap: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const current = await authApi.getCurrentUser();
      set({ user: current, isAuthenticated: true, isLoading: false });
      await usePermissionStore.getState().fetchPermissions();
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      usePermissionStore.getState().reset();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    set({ error: null, isLoading: true });
    try {
      const token = await authApi.login({ username, password });
      localStorage.setItem('access_token', token.accessToken);
      localStorage.setItem('refresh_token', token.refreshToken);
      const current = await authApi.getCurrentUser();
      set({ user: current, isAuthenticated: true, isLoading: false });
      await usePermissionStore.getState().fetchPermissions();
      return true;
    } catch {
      set({
        error: '登录失败，请检查账号密码或后端服务状态',
        isLoading: false,
        user: null,
        isAuthenticated: false
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network/logout endpoint failures
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      usePermissionStore.getState().reset();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null })
}));

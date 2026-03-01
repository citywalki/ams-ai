import { create } from 'zustand';
import { apiClient, tokenService } from '@/lib/apiClient';
import type { CurrentUser, LoginRequest, LoginResponse } from '@/lib/types';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  bootstrap: () => Promise<void>;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  bootstrap: async () => {
    const token = tokenService.getAccessToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await apiClient.get<CurrentUser>('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      tokenService.clearTokens();
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  login: async (username: string, password: string, rememberMe = false) => {
    set({ isLoading: true, error: null });

    try {
      const request: LoginRequest = { username, password, rememberMe };
      const response = await apiClient.post<LoginResponse>('/auth/login', request);
      const { accessToken, refreshToken } = response.data;

      tokenService.setTokens(accessToken, refreshToken);

      // 获取用户信息
      const userResponse = await apiClient.get<CurrentUser>('/auth/me');
      set({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // 忽略登出错误
    } finally {
      tokenService.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

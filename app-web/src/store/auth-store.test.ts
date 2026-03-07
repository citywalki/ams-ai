import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';
import { server } from '@/shared/test/msw/server';
import { http, HttpResponse } from 'msw';

describe('auth-store', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    });
    // 清除 localStorage
    localStorage.clear();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useAuthStore.getState();
      
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    it('应该成功登录并更新状态', async () => {
      const { login } = useAuthStore.getState();
      
      await login({ username: 'test-admin', password: 'Test@123456' });
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual({
        id: 1,
        username: 'test-admin',
        email: '',
        status: 'ACTIVE',
        roles: [],
      });
      expect(state.token).toBe('mock-access-token');
      expect(state.error).toBeNull();
    });

    it('登录失败时应该设置错误状态', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      const { login } = useAuthStore.getState();
      
      await expect(login({ username: 'wrong', password: 'wrong' }))
        .rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeTruthy();
    });

    it('登录时应该设置 loading 状态', async () => {
      const { login } = useAuthStore.getState();
      
      const promise = login({ username: 'test-admin', password: 'Test@123456' });
      
      const loadingState = useAuthStore.getState();
      expect(loadingState.isLoading).toBe(true);
      
      await promise;
      
      const finalState = useAuthStore.getState();
      expect(finalState.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('应该成功登出并清除状态', async () => {
      // 先登录
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: 1, username: 'test', email: '', status: 'ACTIVE', roles: [] },
        token: 'token',
        refreshToken: 'refresh',
      });

      const { logout } = useAuthStore.getState();
      await logout();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });

  describe('setToken', () => {
    it('应该更新 token', () => {
      const { setToken } = useAuthStore.getState();
      
      setToken('new-token');
      
      expect(useAuthStore.getState().token).toBe('new-token');
    });
  });

  describe('clearError', () => {
    it('应该清除错误状态', () => {
      useAuthStore.setState({ error: 'Some error' });
      
      const { clearError } = useAuthStore.getState();
      clearError();
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});

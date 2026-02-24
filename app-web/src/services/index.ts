import apiClient from '@/utils/api';

// 认证相关接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  tenantId: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
}

export const authApi = {
  // 登录
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // 刷新Token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // 登出
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 检查Token是否有效
  validateToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
};

// 菜单相关接口
export interface MenuItem {
  id: string;
  name: string;
  route: string;
  icon: string;
  permission: string;
  parentId?: string;
  children?: MenuItem[];
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export const menuApi = {
  // 获取用户菜单
  getUserMenus: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get('/system/menus/user');
    return response.data;
  },

  // 获取所有菜单
  getAllMenus: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get('/system/menus');
    return response.data;
  }
};

// 权限相关接口
export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

export const permissionApi = {
  // 获取用户权限
  getUserPermissions: async (): Promise<string[]> => {
    const response = await apiClient.get('/system/permissions/user');
    return response.data;
  },

  // 检查用户是否有某个权限
  hasPermission: async (permissionCode: string): Promise<boolean> => {
    const response = await apiClient.post('/system/permissions/check', {
      permission: permissionCode
    });
    return response.data.hasPermission;
  }
};

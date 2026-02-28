import apiClient from '@/lib/apiClient';

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
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
};

export interface MenuItem {
  id: string;
  key: string;
  label: string;
  route?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  isVisible?: boolean;
  menuType?: 'FOLDER' | 'MENU';
  rolesAllowed?: string[];
  children?: MenuItem[];
  tenant?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const menuApi = {
  getUserMenus: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get('/system/menus/user');
    return response.data;
  },

  getAllMenus: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get('/system/menus');
    return response.data;
  }
};

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
  getUserPermissions: async (): Promise<string[]> => {
    const response = await apiClient.get('/system/permissions/user');
    return response.data;
  },

  hasPermission: async (permissionCode: string): Promise<boolean> => {
    const response = await apiClient.post('/system/permissions/check', {
      permission: permissionCode
    });
    return response.data.hasPermission;
  }
};

import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';

// API基础配置
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理错误和Token刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Token过期，尝试刷新
    if (error.response?.status === 401 && originalRequest && !(originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry) {
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data as { accessToken: string };
          
          localStorage.setItem('access_token', accessToken);
          originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

export interface RoleOption {
    id: number;
    code: string;
    name: string;
}

export interface PermissionItem {
    id: string;
    code: string;
    name: string;
    description?: string;
    menuId?: string;
    sortOrder?: number;
    buttonType?: string;
}

export interface RoleItem extends RoleOption {
    description?: string;
    permissionIds?: string[];
    permissions?: PermissionItem[];
}

export interface RoleQueryParams {
    page?: number;
    size?: number;
    keyword?: string;
}

export interface RolePayload {
    code: string;
    name: string;
    description?: string;
    permissionIds?: string[];
}

export interface UserItem {
    id: number;
    username: string;
    email?: string;
    status: string;
    roles: RoleOption[];
    createdAt?: string;
    updatedAt?: string;
}

export interface UserQueryParams {
    page?: number;
    size?: number;
    username?: string;
    email?: string;
    status?: string;
}

export interface UserCreatePayload {
    username: string;
    email?: string;
    password: string;
    roleIds?: number[];
    status: string;
}

export interface UserUpdatePayload {
    username?: string;
    email?: string;
    roleIds?: number[];
    status?: string;
}

export interface PageResponse<T> {
    content?: T[];
    items?: T[];
    totalElements?: number;
    totalCount?: number;
}

export interface DictCategory {
    id: string;
    code: string;
    name: string;
    description?: string;
    sort: number;
    status: number;
    tenant?: string;
    createdAt?: string;
    updatedAt?: string;
    itemCount: number;
}

export interface DictItem {
    id: string;
    categoryId: string;
    parentId?: string;
    code: string;
    name: string;
    value?: string;
    sort: number;
    status: number;
    remark?: string;
    tenant?: string;
    createdAt?: string;
    updatedAt?: string;
    children?: DictItem[];
}

export interface DictCategoryPayload {
    code: string;
    name: string;
    description?: string;
    sort?: number;
    status?: number;
}

export interface DictItemPayload {
    categoryId: string;
    parentId?: string;
    code: string;
    name: string;
    value?: string;
    sort?: number;
    status?: number;
    remark?: string;
}

export interface MenuItem {
    id: string;
    key: string;
    label: string;
    route?: string;
    parentId?: string;
    icon?: string;
    sortOrder: number;
    isVisible: boolean;
    menuType: 'FOLDER' | 'MENU';
    rolesAllowed: string[];
    tenant?: string;
    createdAt?: string;
    updatedAt?: string;
    children?: MenuItem[];
}

export interface MenuPayload {
    key: string;
    label: string;
    route?: string;
    parentId?: string;
    icon?: string;
    sortOrder?: number;
    isVisible?: boolean;
    menuType?: 'FOLDER' | 'MENU';
    rolesAllowed?: string[];
}

export interface PermissionPayload {
    code: string;
    name: string;
    description?: string;
    menuId?: string;
    sortOrder?: number;
    buttonType?: string;
}

export const systemApi = {
    getUsers: (params?: UserQueryParams) => apiClient.get<PageResponse<UserItem> | UserItem[]>('/system/users', {params}),
    getUserById: (id: number) => apiClient.get<UserItem>(`/system/users/${id}`),
    createUser: (payload: UserCreatePayload) => apiClient.post<UserItem>('/system/users', payload),
    updateUser: (id: number, payload: UserUpdatePayload) => apiClient.put<UserItem>(`/system/users/${id}`, payload),
    deleteUser: (id: number) => apiClient.delete(`/system/users/${id}`),
    updateUserStatus: (id: number, status: string) => apiClient.put(`/system/users/${id}/status`, {status}),
    resetUserPassword: (id: number, password: string) => apiClient.put(`/system/users/${id}/reset-password`, {password}),
    getRoles: (params?: RoleQueryParams) => apiClient.get<PageResponse<RoleItem> | RoleItem[]>('/system/roles', {params}),
    createRole: (payload: RolePayload) => apiClient.post<RoleItem>('/system/roles', payload),
    updateRole: (id: number, payload: RolePayload) => apiClient.put<RoleItem>(`/system/roles/${id}`, payload),
    deleteRole: (id: number) => apiClient.delete(`/system/roles/${id}`),
    getRoleMenus: (roleId: number) =>
        apiClient.get<{ menuIds: string[] }>(`/system/roles/${roleId}/menus`),
    updateRoleMenus: (roleId: number, menuIds: string[]) =>
        apiClient.put(`/system/roles/${roleId}/menus`, { menuIds }),
    getPermissions: (params?: { page?: number; size?: number }) =>
        apiClient.get<PageResponse<PermissionItem> | PermissionItem[]>('/system/permissions', {params})
};

export const dictApi = {
    getCategories: () => apiClient.get<DictCategory[]>('/system/dict/categories'),
    getCategoryById: (id: string) => apiClient.get<DictCategory>(`/system/dict/categories/${id}`),
    createCategory: (payload: DictCategoryPayload) => apiClient.post<DictCategory>('/system/dict/categories', payload),
    updateCategory: (id: string, payload: DictCategoryPayload) => apiClient.put<DictCategory>(`/system/dict/categories/${id}`, payload),
    deleteCategory: (id: string) => apiClient.delete(`/system/dict/categories/${id}`),

    getItems: (categoryId: string) => apiClient.get<DictItem[]>(`/system/dict/categories/${categoryId}/items`),
    getItemsTree: (categoryId: string) => apiClient.get<DictItem[]>(`/system/dict/categories/${categoryId}/items/tree`),
    getItemById: (id: string) => apiClient.get<DictItem>(`/system/dict/items/${id}`),
    createItem: (categoryId: string, payload: DictItemPayload) => apiClient.post<DictItem>(`/system/dict/categories/${categoryId}/items`, payload),
    updateItem: (id: string, payload: DictItemPayload) => apiClient.put<DictItem>(`/system/dict/items/${id}`, payload),
    deleteItem: (id: string) => apiClient.delete(`/system/dict/items/${id}`),
};

export const menuApi = {
    getMenuTree: () => apiClient.get<MenuItem[]>('/system/menus/tree'),
    getUserMenus: () => apiClient.get<MenuItem[]>('/system/menus/user'),
    getFolders: () => apiClient.get<MenuItem[]>('/system/menus/folders'),
    getRootMenus: () => apiClient.get<MenuItem[]>('/system/menus', { params: { root: true } }),
    getMenusByParent: (parentId: string) => apiClient.get<MenuItem[]>('/system/menus', { params: { parentId } }),
    getMenuById: (id: string) => apiClient.get<MenuItem>(`/system/menus/${id}`),
    createMenu: (payload: MenuPayload) => apiClient.post<MenuItem>('/system/menus', payload),
    updateMenu: (id: string, payload: MenuPayload) => apiClient.put<MenuItem>(`/system/menus/${id}`, payload),
    deleteMenu: (id: string) => apiClient.delete(`/system/menus/${id}`),

    getMenuPermissions: (menuId: string) => apiClient.get<PermissionItem[]>(`/system/permissions/menu/${menuId}`),
    createPermission: (payload: PermissionPayload) => apiClient.post<PermissionItem>('/system/permissions', payload),
    updatePermission: (id: string, payload: PermissionPayload) => apiClient.put<PermissionItem>(`/system/permissions/${id}`, payload),
    deletePermission: (id: string) => apiClient.delete(`/system/permissions/${id}`),
};

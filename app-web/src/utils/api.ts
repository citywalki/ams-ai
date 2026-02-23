import apiClient from './apiClient'

export interface Alert {
  id: string
  message: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'new' | 'acknowledged' | 'resolved'
  source: string
  timestamp: string
}

export interface DashboardStats {
  activeAlerts: number
  processedAlerts: number
  pendingAlerts: number
  totalDevices: number
}

export const alertsApi = {
  getAlerts: (params?: any) =>
    apiClient.get<{ data: Alert[]; total: number }>('/alerts', { params }),

  getAlertById: (id: string) => apiClient.get<Alert>(`/alerts/${id}`),

  acknowledgeAlert: (id: string) =>
    apiClient.post(`/alerts/${id}/acknowledge`),

  resolveAlert: (id: string) => apiClient.post(`/alerts/${id}/resolve`),
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),

  getRecentAlerts: (limit: number = 10) =>
    apiClient.get<Alert[]>('/dashboard/recent-alerts', { params: { limit } }),
}

export const settingsApi = {
  getSettings: () => apiClient.get('/settings'),

  updateSettings: (settings: any) => apiClient.put('/settings', settings),
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId: number
  username: string
  accessToken: string
  refreshToken: string
  tenantId: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AccessTokenResponse {
  accessToken: string
}

export const authApi = {
  login: (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', request),

  refreshToken: (request: RefreshTokenRequest) =>
    apiClient.post<AccessTokenResponse>('/auth/refresh', request),
}

export interface UserPermission {
    code: string
    name: string
    description?: string
}

export const permissionApi = {
    getUserPermissions: () =>
        apiClient.get<string[]>('/system/permissions/user'),
}

export interface Menu {
    id: number
    key: string
    label: string
    parentId?: number | null
    route?: string
    icon?: string
    sortOrder?: number
    isVisible?: boolean
    menuType?: 'FOLDER' | 'MENU'
    rolesAllowed: string[]
    metadata?: Record<string, any>
    tenant?: number
    createdAt?: string
    updatedAt?: string
    children?: Menu[]
}

export interface Role {
    id: number
    code: string
    name: string
    description?: string
    status?: string
    createdAt?: string
    updatedAt?: string
}

export interface Permission {
    id: number
    code: string
    name: string
    description?: string
    menuId?: number | null
    menuName?: string
    sortOrder?: number
    buttonType?: string
    createdAt?: string
    updatedAt?: string
}

export interface User {
    id: number
    username: string
    email?: string
    status: string
    roles: Array<{
        id: number
        code: string
        name: string
    }>
    createdAt?: string
    updatedAt?: string
}

export interface UserCreateRequest {
    username: string
    email?: string
    password: string
    roleIds?: number[]
    status: string
}

export interface UserUpdateRequest {
    username?: string
    email?: string
    roleIds?: number[]
    status?: string
}

export interface UserQueryParams {
    page?: number
    size?: number
    username?: string
    email?: string
    status?: string
}

export const systemApi = {
    getMenus: (params?: any) =>
        apiClient.get<Menu[]>('/system/menus', {params}),

    getMenuFolders: () =>
        apiClient.get<Menu[]>('/system/menus/folders'),

    getMenuById: (id: number) => apiClient.get<Menu>(`/system/menus/${id}`),

    createMenu: (data: Partial<Menu>) => apiClient.post<Menu>('/system/menus', data),

    updateMenu: (id: number, data: Partial<Menu>) =>
        apiClient.put<Menu>(`/system/menus/${id}`, data),

    deleteMenu: (id: number) => apiClient.delete(`/system/menus/${id}`),

    getRoles: (params?: any) =>
        apiClient.get<Role[]>('/system/roles', {params}),

    getRoleById: (id: number) => apiClient.get<Role>(`/system/roles/${id}`),

    createRole: (data: Partial<Role>) => apiClient.post<Role>('/system/roles', data),

    updateRole: (id: number, data: Partial<Role>) =>
        apiClient.put<Role>(`/system/roles/${id}`, data),

    deleteRole: (id: number) => apiClient.delete(`/system/roles/${id}`),

    getPermissions: (params?: any) =>
        apiClient.get<Permission[]>('/system/permissions', {params}),

    getPermissionById: (id: number) =>
        apiClient.get<Permission>(`/system/permissions/${id}`),

    createPermission: (data: Partial<Permission>) =>
        apiClient.post<Permission>('/system/permissions', data),

    updatePermission: (id: number, data: Partial<Permission>) =>
        apiClient.put<Permission>(`/system/permissions/${id}`, data),

    deletePermission: (id: number) =>
        apiClient.delete(`/system/permissions/${id}`),

    getMenuPermissions: (menuId: number) =>
        apiClient.get<Permission[]>(`/system/permissions/menu/${menuId}`),

    getUserMenuPermissions: (menuCode: string) =>
        apiClient.get<string[]>(`/system/permissions/user/menu/${menuCode}`),

    getUserRoles: () =>
        apiClient.get<string[]>('/system/roles/user'),

    getUserMenus: () =>
        apiClient.get<Menu[]>('/system/menus/user'),

    getUsers: (params?: UserQueryParams) =>
        apiClient.get<User[]>('/system/users', {params}),

    getUserById: (id: number) =>
        apiClient.get<User>(`/system/users/${id}`),

    createUser: (data: UserCreateRequest) =>
        apiClient.post<User>('/system/users', data),

    updateUser: (id: number, data: UserUpdateRequest) =>
        apiClient.put<User>(`/system/users/${id}`, data),

    deleteUser: (id: number) =>
        apiClient.delete(`/system/users/${id}`),

    updateUserStatus: (id: number, status: string) =>
        apiClient.put(`/system/users/${id}/status`, {status}),

    resetUserPassword: (id: number, password: string) =>
        apiClient.put(`/system/users/${id}/reset-password`, {password}),
}

export interface DictCategory {
    id: number
    code: string
    name: string
    description?: string
    sort: number
    status: number
    tenant?: number
    createdAt?: string
    updatedAt?: string
    itemCount?: number
}

export interface DictItem {
    id: number
    categoryId: number
    parentId?: number | null
    code: string
    name: string
    value?: string
    sort: number
    status: number
    remark?: string
    tenant?: number
    createdAt?: string
    updatedAt?: string
    children?: DictItem[]
}

export interface DictCategoryDto {
    code: string
    name: string
    description?: string
    sort?: number
    status?: number
}

export interface DictItemDto {
    categoryId: number
    parentId?: number | null
    code: string
    name: string
    value?: string
    sort?: number
    status?: number
    remark?: string
}

export const dictApi = {
    getCategories: () =>
        apiClient.get<DictCategory[]>('/system/dict/categories'),

    getCategoryById: (id: number) =>
        apiClient.get<DictCategory>(`/system/dict/categories/${id}`),

    createCategory: (data: DictCategoryDto) =>
        apiClient.post<DictCategory>('/system/dict/categories', data),

    updateCategory: (id: number, data: DictCategoryDto) =>
        apiClient.put<DictCategory>(`/system/dict/categories/${id}`, data),

    deleteCategory: (id: number) =>
        apiClient.delete(`/system/dict/categories/${id}`),

    getCategoryItems: (categoryId: number) =>
        apiClient.get<DictItem[]>(`/system/dict/categories/${categoryId}/items`),

    getCategoryItemsTree: (categoryId: number) =>
        apiClient.get<DictItem[]>(`/system/dict/categories/${categoryId}/items/tree`),

    getItemById: (id: number) =>
        apiClient.get<DictItem>(`/system/dict/items/${id}`),

    createItem: (categoryId: number, data: DictItemDto) =>
        apiClient.post<DictItem>(`/system/dict/categories/${categoryId}/items`, data),

    updateItem: (id: number, data: DictItemDto) =>
        apiClient.put<DictItem>(`/system/dict/items/${id}`, data),

    deleteItem: (id: number) =>
        apiClient.delete(`/system/dict/items/${id}`),

    getByCode: (categoryCode: string) =>
        apiClient.get<DictItem[]>(`/dict/${categoryCode}`),

    getTreeByCode: (categoryCode: string) =>
        apiClient.get<DictItem[]>(`/dict/${categoryCode}/tree`),

    getItemValue: (categoryCode: string, itemCode: string) =>
        apiClient.get<string>(`/dict/${categoryCode}/${itemCode}`),
}

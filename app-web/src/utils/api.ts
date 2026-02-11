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

export const systemApi = {
    getMenus: (params?: any) =>
        apiClient.get<Menu[]>('/system/menus', {params}),

    getMenuById: (id: number) => apiClient.get<Menu>(`/system/menus/${id}`),

    createMenu: (data: Partial<Menu>) => apiClient.post<Menu>('/system/menus', data),

    updateMenu: (id: number, data: Partial<Menu>) =>
        apiClient.put<Menu>(`/system/menus/${id}`, data),

    deleteMenu: (id: number) => apiClient.delete(`/system/menus/${id}`),

    getRoles: (params?: any) =>
        apiClient.get<{ data: Role[]; total: number }>('/system/roles', {params}),

    getRoleById: (id: number) => apiClient.get<Role>(`/system/roles/${id}`),

    createRole: (data: Partial<Role>) => apiClient.post<Role>('/system/roles', data),

    updateRole: (id: number, data: Partial<Role>) =>
        apiClient.put<Role>(`/system/roles/${id}`, data),

    deleteRole: (id: number) => apiClient.delete(`/system/roles/${id}`),

    getPermissions: (params?: any) =>
        apiClient.get<{ data: Permission[]; total: number }>('/system/permissions', {params}),

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
}

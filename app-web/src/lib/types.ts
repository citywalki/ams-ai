/**
 * 分页响应类型
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * 查询参数
 */
export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 用户类型
 */
export interface UserItem {
  id: string;
  username: string;
  email?: string;
  enabled: boolean;
  roles?: RoleItem[];
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 角色类型
 */
export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions?: PermissionItem[];
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 权限类型
 */
export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  type: 'MENU' | 'BUTTON' | 'API';
  menuId?: string;
}

/**
 * 菜单类型
 */
export interface MenuItem {
  id: string;
  key: string;
  label: string;
  route?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  menuType?: 'FOLDER' | 'MENU' | 'BUTTON';
  children?: MenuItem[];
}

/**
 * 告警类型
 */
export interface AlarmItem {
  id: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  sourceId?: string;
  sourceName?: string;
  fingerprint?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  tenantId?: string;
}

/**
 * 当前用户信息
 */
export interface CurrentUser {
  id: string;
  username: string;
  email?: string;
  roles: RoleItem[];
  permissions: PermissionItem[];
  tenantId?: string;
}

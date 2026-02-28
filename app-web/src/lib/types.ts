export interface RoleOption {
  id: string;
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RolePayload {
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UserItem {
  id: string;
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserCreatePayload {
  username: string;
  email?: string;
  password: string;
  roleIds?: string[];
  status: string;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  roleIds?: string[];
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
  metadata?: Record<string, unknown>;
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

export interface PermissionQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PermissionPayload {
  code: string;
  name: string;
  description?: string;
  menuId?: string;
  sortOrder?: number;
  buttonType?: string;
}

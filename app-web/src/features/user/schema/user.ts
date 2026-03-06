export interface User {
  id: number;
  username: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
  roles: RoleInfo[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleInfo {
  id: number;
  code: string;
  name: string;
}

export interface UserConnection {
  content: User[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface UserFilterInput {
  username?: StringFilterInput;
  email?: StringFilterInput;
  status?: EnumFilterInput;
}

export interface StringFilterInput {
  _eq?: string;
  _neq?: string;
  _like?: string;
  _ilike?: string;
  _startsWith?: string;
  _endsWith?: string;
  _in?: string[];
  _nin?: string[];
  _isNull?: boolean;
}

export interface EnumFilterInput {
  _eq?: string;
  _neq?: string;
  _in?: string[];
  _nin?: string[];
  _isNull?: boolean;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  status: "ACTIVE" | "INACTIVE";
  roleIds?: number[];
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  status?: "ACTIVE" | "INACTIVE";
  roleIds?: number[];
}

export interface ResetPasswordInput {
  newPassword: string;
}

export const USER_STATUSES = [
  { value: "ACTIVE", label: "启用", color: "green" },
  { value: "INACTIVE", label: "禁用", color: "gray" },
  { value: "LOCKED", label: "锁定", color: "red" },
] as const;

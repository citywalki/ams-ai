import type { UserItem, RoleOption } from '@/utils/api';

export type { UserItem, RoleOption };

export type UserFormState = {
  username: string;
  email: string;
  password: string;
  status: string;
  roleIds: string[];
};

export const initialFormState: UserFormState = {
  username: '',
  email: '',
  password: '',
  status: 'ACTIVE',
  roleIds: [],
};

export type UserSearchParams = Record<string, string>;

export type RoleFormState = {
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
};

export const initialFormState: RoleFormState = {
  code: '',
  name: '',
  description: '',
  permissionIds: [],
};

export type RoleSearchState = {
  keyword: string;
  queryKeyword: string;
};

export const initialSearchState: RoleSearchState = {
  keyword: '',
  queryKeyword: '',
};

export type MenuTreeState = {
  menuTree: import('@/utils/api').MenuItem[];
  selectedMenuIds: Set<string>;
  expandedFolders: Set<string>;
};

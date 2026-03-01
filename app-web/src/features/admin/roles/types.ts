import { type MenuItem } from '@/lib/types';

export type RoleSearchState = {
  keyword: string;
  queryKeyword: string;
};

export const initialSearchState: RoleSearchState = {
  keyword: '',
  queryKeyword: '',
};

export type MenuTreeState = {
  menuTree: MenuItem[];
  selectedMenuIds: Set<string>;
  expandedFolders: Set<string>;
};

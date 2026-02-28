import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { type MenuItem, type PermissionItem } from '@/utils/api';
import { graphqlClient } from '@/lib/graphqlClient';

// Convert big int IDs to strings to avoid JavaScript precision loss
function convertIdsToString<T extends { id: number | string; parentId?: number | string | null }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    id: String(item.id),
    parentId: item.parentId != null ? String(item.parentId) : null,
  }));
}

const MENUS_FRAGMENT = `
  id
  key
  label
  route
  parentId
  icon
  sortOrder
  isVisible
  menuType
  rolesAllowed
  createdAt
  updatedAt
`;

const MENUS_BRIEF_FRAGMENT = `
  id
  key
  label
  route
  parentId
  icon
  sortOrder
  isVisible
  menuType
  rolesAllowed
`;

export async function fetchMenusPage(
  params: { page?: number; size?: number },
  searchParams: Record<string, string>,
) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildMenuFilter(searchParams);

  const query = `
    query Menus($where: MenuFilter, $page: Int, $size: Int) {
      menus(where: $where, page: $page, size: $size) {
        content { ${MENUS_FRAGMENT} }
        totalElements
        totalPages
        page
        size
      }
    }
  `;

  const result = await graphqlClient.request<{
    menus: {
      content: MenuItem[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
    };
  }>(query, { where, page, size });

  return {
    content: result.menus.content,
    totalElements: result.menus.totalElements,
    totalPages: result.menus.totalPages,
    size: result.menus.size,
    number: result.menus.page,
  };
}

function buildMenuFilter(searchParams: Record<string, string>) {
  const filter: Record<string, unknown> = {};
  
  if (searchParams.label) {
    filter.label = { _ilike: searchParams.label };
  }
  if (searchParams.parentId) {
    filter.parentId = { _eq: searchParams.parentId };
  }
  if (searchParams.menuType) {
    filter.menuType = { _eq: searchParams.menuType };
  }
  if (searchParams.isVisible !== undefined) {
    filter.isVisible = { _eq: searchParams.isVisible === 'true' };
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function fetchFolders(queryClient: QueryClient) {
  return queryClient.fetchQuery<MenuItem[]>({
    queryKey: queryKeys.menus.folders(),
    queryFn: async () => {
      const query = `
        query Folders {
          menus(where: { menuType: { _eq: "FOLDER" } }, size: 100) {
            content { ${MENUS_BRIEF_FRAGMENT} }
          }
        }
      `;
      const result = await graphqlClient.request<{ menus: { content: MenuItem[] } }>(query);
      return convertIdsToString(result.menus.content);
    },
  });
}

export function fetchMenusByFolder(queryClient: QueryClient, folder: 'root' | MenuItem) {
  const parentId = folder === 'root' ? null : folder.id;
  
  return queryClient.fetchQuery<MenuItem[]>({
    queryKey: folder === 'root' ? queryKeys.menus.rootMenus() : queryKeys.menus.byParent(folder.id),
    queryFn: async () => {
      const where = parentId ? { parentId: { _eq: parentId } } : { parentId: { _isNull: true } };
      const query = `
        query MenusByFolder($where: MenuFilter) {
          menus(where: $where, orderBy: [{ field: "sortOrder", direction: "ASC" }], size: 100) {
            content { ${MENUS_BRIEF_FRAGMENT} }
          }
        }
      `;
      const result = await graphqlClient.request<{ menus: { content: MenuItem[] } }>(query, { where });
      return convertIdsToString(result.menus.content);
    },
  });
}

export function fetchMenuPermissions(queryClient: QueryClient, menuId: string) {
  return queryClient.fetchQuery<PermissionItem[]>({
    queryKey: queryKeys.menus.permissions(menuId),
    queryFn: async () => {
      const { menuApi } = await import('@/utils/api');
      const res = await menuApi.getMenuPermissions(menuId);
      return res.data;
    },
  });
}

export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.menus.root() });
}

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { type MenuItem, type PermissionItem } from '@/utils/api';
import { graffle } from '@/lib/graffleClient';

export async function fetchMenusPage(
  params: { page?: number; size?: number },
  searchParams: Record<string, string>,
) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const where = buildMenuFilter(searchParams);

  const result = await graffle.query.menus({
    $: { where, page, size },
    content: {
      id: true,
      key: true,
      label: true,
      route: true,
      parentId: true,
      icon: true,
      sortOrder: true,
      isVisible: true,
      menuType: true,
      rolesAllowed: true,
      createdAt: true,
      updatedAt: true,
    },
    totalElements: true,
    totalPages: true,
    page: true,
    size: true,
  });

  return {
    content: result.content as MenuItem[],
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    size: result.size,
    number: result.page,
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
      const result = await graffle.query.menus({
        $: { where: { menuType: { _eq: 'FOLDER' } }, size: 100 },
        content: {
          id: true,
          key: true,
          label: true,
          route: true,
          parentId: true,
          icon: true,
          sortOrder: true,
          isVisible: true,
          menuType: true,
          rolesAllowed: true,
        },
      });
      return result.content as MenuItem[];
    },
  });
}

export function fetchMenusByFolder(queryClient: QueryClient, folder: 'root' | MenuItem) {
  const parentId = folder === 'root' ? null : folder.id;
  
  return queryClient.fetchQuery<MenuItem[]>({
    queryKey: folder === 'root' ? queryKeys.menus.rootMenus() : queryKeys.menus.byParent(folder.id),
    queryFn: async () => {
      const where = parentId ? { parentId: { _eq: parentId } } : { parentId: { _isNull: true } };
      const result = await graffle.query.menus({
        $: { where, orderBy: [{ field: 'sortOrder', direction: 'ASC' }], size: 100 },
        content: {
          id: true,
          key: true,
          label: true,
          route: true,
          parentId: true,
          icon: true,
          sortOrder: true,
          isVisible: true,
          menuType: true,
          rolesAllowed: true,
        },
      });
      return result.content as MenuItem[];
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

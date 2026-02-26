import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { menuApi, type MenuItem, type PermissionItem } from '@/utils/api';

export function fetchFolders(queryClient: QueryClient) {
  return queryClient.fetchQuery<MenuItem[]>({
    queryKey: queryKeys.menus.folders(),
    queryFn: async () => {
      const res = await menuApi.getFolders();
      return res.data;
    },
  });
}

export function fetchMenusByFolder(queryClient: QueryClient, folder: 'root' | MenuItem) {
  if (folder === 'root') {
    return queryClient.fetchQuery<MenuItem[]>({
      queryKey: queryKeys.menus.rootMenus(),
      queryFn: async () => {
        const res = await menuApi.getRootMenus();
        return res.data;
      },
    });
  }

  return queryClient.fetchQuery<MenuItem[]>({
    queryKey: queryKeys.menus.byParent(folder.id),
    queryFn: async () => {
      const res = await menuApi.getMenusByParent(folder.id);
      return res.data;
    },
  });
}

export function fetchMenuPermissions(queryClient: QueryClient, menuId: string) {
  return queryClient.fetchQuery<PermissionItem[]>({
    queryKey: queryKeys.menus.permissions(menuId),
    queryFn: async () => {
      const res = await menuApi.getMenuPermissions(menuId);
      return res.data;
    },
  });
}

export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.menus.root() });
}

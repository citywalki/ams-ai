export const queryKeys = {
  users: {
    root: () => ['users'],
    listRoot: () => ['users', 'list'],
    list: (params: unknown) => ['users', 'list', params],
    detail: (id: string) => ['users', 'detail', String(id)],
  },
  roles: {
    root: () => ['roles'],
    listRoot: () => ['roles', 'list'],
    list: (params: unknown) => ['roles', 'list', params],
    detail: (id: string) => ['roles', 'detail', String(id)],
    menus: (roleId: string) => ['roles', 'menus', String(roleId)],
  },
  menus: {
    root: () => ['menus'],
    tree: () => ['menus', 'tree'],
    user: () => ['menus', 'user'],
    folders: () => ['menus', 'folders'],
    rootMenus: () => ['menus', 'root'],
    byParent: (parentId: string) => ['menus', 'byParent', String(parentId)],
    permissions: (menuId: string) => ['menus', 'permissions', String(menuId)],
    detail: (id: string) => ['menus', 'detail', String(id)],
  },
  dict: {
    root: () => ['dict'],
    categories: () => ['dict', 'categories'],
    items: (categoryId: string) => ['dict', 'items', String(categoryId)],
    itemDetail: (id: string) => ['dict', 'itemDetail', String(id)],
  },
};

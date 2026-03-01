export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    list: () => ['users'] as const,
    listRoot: () => ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    list: () => ['roles'] as const,
    listRoot: () => ['roles', 'list'] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    menus: (id: string) => ['roles', 'menus', id] as const,
  },
  menus: {
    user: () => ['menus', 'user'] as const,
    all: () => ['menus', 'all'] as const,
    tree: () => ['menus', 'tree'] as const,
  },
  permissions: {
    user: () => ['permissions', 'user'] as const,
  },
  alarms: {
    list: () => ['alarms'] as const,
    listRoot: () => ['alarms', 'list'] as const,
    detail: (id: string) => ['alarms', 'detail', id] as const,
    stats: () => ['alarms', 'stats'] as const,
  },
};

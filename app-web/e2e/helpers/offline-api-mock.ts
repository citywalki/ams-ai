import type { Page, Route } from '@playwright/test';

type Role = {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissionIds: string[];
  permissions: Array<{ id: string; code: string; name: string }>;
};

type User = {
  id: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  roles: Array<{ id: string; code: string; name: string }>;
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function getRequestJson(route: Route): Record<string, unknown> {
  const raw = route.request().postData() ?? '{}';
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function installOfflineApiMocks(page: Page) {
  const now = new Date().toISOString();
  const roles: Role[] = [
    {
      id: '1',
      code: 'ADMIN',
      name: '管理员',
      description: '系统管理员',
      permissionIds: ['p1', 'p2'],
      permissions: [
        { id: 'p1', code: 'USER_READ', name: '用户查看' },
        { id: 'p2', code: 'ROLE_READ', name: '角色查看' },
      ],
    },
    {
      id: '2',
      code: 'OPERATOR',
      name: '运维',
      description: '值班运维角色',
      permissionIds: ['p1'],
      permissions: [{ id: 'p1', code: 'USER_READ', name: '用户查看' }],
    },
  ];

  const users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      roles: [{ id: '1', code: 'ADMIN', name: '管理员' }],
    },
    {
      id: '2',
      username: 'operator',
      email: 'operator@example.com',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      roles: [{ id: '2', code: 'OPERATOR', name: '运维' }],
    },
  ];

  const roleUsers: Record<string, string[]> = { '1': ['1'], '2': ['2'] };
  const roleMenus: Record<string, string[]> = { '1': ['m1', 'm2'], '2': ['m1'] };

  const permissions = [
    { id: 'p1', code: 'USER_READ', name: '用户查看', description: '查看用户', menuId: 'm1', menuCode: 'USERS' },
    { id: 'p2', code: 'ROLE_READ', name: '角色查看', description: '查看角色', menuId: 'm2', menuCode: 'ROLES' },
  ];

  const menuTree = [
    {
      id: 'm-root',
      key: 'system',
      label: '系统管理',
      menuType: 'FOLDER',
      children: [
        { id: 'm1', key: 'users', label: '用户管理', menuType: 'MENU', children: [] },
        { id: 'm2', key: 'roles', label: '角色管理', menuType: 'MENU', children: [] },
      ],
    },
  ];

  await page.route('**/api/auth/me', async (route) => {
    await json(route, {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['ADMIN'],
      permissions: [],
      tenantId: '1',
    });
  });

  await page.route('**/api/system/permissions/user', async (route) => {
    await json(route, ['ROLE_READ', 'USER_READ']);
  });

  await page.route('**/api/system/menus/user', async (route) => {
    await json(route, []);
  });

  await page.route('**/api/system/menus/tree', async (route) => {
    await json(route, menuTree);
  });

  await page.route(/.*\/api\/system\/roles\/([^/]+)\/menus$/, async (route) => {
    const request = route.request();
    const roleId = request.url().match(/roles\/([^/]+)\/menus/)?.[1] ?? '';
    if (request.method() === 'GET') {
      await json(route, { menuIds: roleMenus[roleId] ?? [] });
      return;
    }
    if (request.method() === 'PUT') {
      const payload = getRequestJson(route);
      roleMenus[roleId] = Array.isArray(payload.menuIds) ? (payload.menuIds as string[]) : [];
      await json(route, {});
      return;
    }
    await route.continue();
  });

  await page.route(/.*\/api\/system\/roles\/([^/]+)\/users(?:\/([^/]+))?$/, async (route) => {
    const request = route.request();
    const match = request.url().match(/roles\/([^/]+)\/users(?:\/([^/]+))?/);
    const roleId = match?.[1] ?? '';
    const userIdFromPath = match?.[2];

    if (request.method() === 'GET') {
      const ids = roleUsers[roleId] ?? [];
      const data = users.filter((item) => ids.includes(item.id));
      await json(route, data);
      return;
    }
    if (request.method() === 'POST') {
      const payload = getRequestJson(route);
      const userId = String(payload.userId ?? '');
      const current = new Set(roleUsers[roleId] ?? []);
      current.add(userId);
      roleUsers[roleId] = Array.from(current);
      await json(route, {});
      return;
    }
    if (request.method() === 'DELETE' && userIdFromPath) {
      roleUsers[roleId] = (roleUsers[roleId] ?? []).filter((item) => item !== userIdFromPath);
      await json(route, {});
      return;
    }
    await route.continue();
  });

  await page.route('**/api/system/roles', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const payload = getRequestJson(route);
      const code = String(payload.code ?? '').toUpperCase();
      if (roles.some((item) => item.code === code)) {
        await json(route, { message: '角色编码已存在' }, 409);
        return;
      }
      const role: Role = {
        id: String(roles.length + 1),
        code,
        name: String(payload.name ?? ''),
        description: String(payload.description ?? ''),
        permissionIds: Array.isArray(payload.permissionIds) ? (payload.permissionIds as string[]) : [],
        permissions,
      };
      roles.unshift(role);
      await json(route, role);
      return;
    }
    if (request.method() === 'GET') {
      const keyword = new URL(request.url()).searchParams.get('keyword') ?? '';
      const data = keyword
        ? roles.filter((item) => item.code.includes(keyword.toUpperCase()) || item.name.includes(keyword))
        : roles;
      await json(route, { content: data, totalElements: data.length, totalPages: 1, page: 0, size: 20 });
      return;
    }
    await route.continue();
  });

  await page.route(/.*\/api\/system\/roles\/([^/]+)$/, async (route) => {
    const request = route.request();
    const roleId = request.url().match(/roles\/([^/]+)$/)?.[1] ?? '';
    const role = roles.find((item) => item.id === roleId);

    if (request.method() === 'PUT' && role) {
      const payload = getRequestJson(route);
      role.name = String(payload.name ?? role.name);
      role.description = String(payload.description ?? role.description ?? '');
      await json(route, role);
      return;
    }
    if (request.method() === 'DELETE') {
      if (role?.code === 'ADMIN') {
        await json(route, { message: '该角色已分配用户，不能删除' }, 409);
        return;
      }
      const index = roles.findIndex((item) => item.id === roleId);
      if (index >= 0) {
        roles.splice(index, 1);
      }
      await json(route, {});
      return;
    }
    await route.continue();
  });

  await page.route('**/api/system/users', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const payload = getRequestJson(route);
      const created: User = {
        id: String(users.length + 1),
        username: String(payload.username ?? `user_${users.length + 1}`),
        email: String(payload.email ?? ''),
        status: (payload.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        roles: [],
      };
      users.unshift(created);
      await json(route, created);
      return;
    }
    if (request.method() === 'GET') {
      const username = new URL(request.url()).searchParams.get('username') ?? '';
      const data = username ? users.filter((item) => item.username.includes(username)) : users;
      await json(route, { content: data, totalElements: data.length, totalPages: 1, page: 0, size: 20 });
      return;
    }
    await route.continue();
  });

  await page.route(/.*\/api\/system\/users\/([^/]+)(?:\/status|\/reset-password)?$/, async (route) => {
    const request = route.request();
    if (request.method() === 'PUT' || request.method() === 'DELETE') {
      await json(route, {});
      return;
    }
    await route.continue();
  });

  await page.route('**/graphql', async (route) => {
    const payload = getRequestJson(route);
    const query = String(payload.query ?? '');
    const variables = (payload.variables as Record<string, unknown>) ?? {};

    if (query.includes('query Roles')) {
      const where = (variables.where as Record<string, unknown>) ?? {};
      const orArray = (where._or as Array<Record<string, unknown>> | undefined) ?? [];
      const codeFilter = (orArray[0]?.code as Record<string, unknown> | undefined) ?? {};
      const nameFilter = (orArray[1]?.name as Record<string, unknown> | undefined) ?? {};
      const keyword = String(codeFilter._ilike ?? nameFilter._ilike ?? '');
      const normalizedKeyword = keyword.toUpperCase();
      const data = normalizedKeyword
        ? roles.filter((item) => item.code.includes(normalizedKeyword) || item.name.toUpperCase().includes(normalizedKeyword))
        : roles;
      await json(route, {
        data: {
          roles: {
            content: data,
            totalElements: data.length,
            totalPages: 1,
            page: 0,
            size: 20,
          },
        },
      });
      return;
    }

    if (query.includes('query Users') || query.includes('query AllUsers')) {
      const where = (variables.where as Record<string, unknown>) ?? {};
      const username = String((where.username as Record<string, unknown> | undefined)?._ilike ?? '');
      const filtered = username ? users.filter((item) => item.username.includes(username)) : users;
      await json(route, {
        data: {
          users: {
            content: filtered,
            totalElements: filtered.length,
            totalPages: 1,
            page: 0,
            size: 20,
          },
        },
      });
      return;
    }

    if (query.includes('query Permissions')) {
      await json(route, {
        data: {
          permissions: {
            content: permissions,
          },
        },
      });
      return;
    }

    if (query.includes('menus(')) {
      await json(route, {
        data: {
          menus: {
            content: menuTree,
          },
        },
      });
      return;
    }

    await json(route, { data: {} });
  });
}

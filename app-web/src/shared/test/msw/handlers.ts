import { http, HttpResponse } from 'msw';

// Auth handlers
export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    if (body.username === 'test-admin' && body.password === 'Test@123456') {
      return HttpResponse.json({
        userId: 1,
        username: 'test-admin',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),
  
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),
];

// Menu handlers
export const menuHandlers = [
  http.get('/api/system/menus/user', () => {
    return HttpResponse.json([
      { id: 1, key: 'dashboard', label: '仪表盘', route: '/dashboard', icon: 'Chart' },
      { id: 2, key: 'users', label: '用户管理', route: '/users', icon: 'Users' },
    ]);
  }),
];

// User handlers
export const userHandlers = [
  http.get('/api/system/users', () => {
    return HttpResponse.json({
      content: [
        { id: 1, username: 'admin', email: 'admin@example.com', status: 'ACTIVE' },
      ],
      totalElements: 1,
      totalPages: 1,
    });
  }),
  
  http.post('/api/system/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 2, ...body }, { status: 201 });
  }),
];

// GraphQL handlers
export const graphqlHandlers = [
  http.post('/graphql', async ({ request }) => {
    const body = await request.json() as { query: string };
    
    if (body.query.includes('GetUsers')) {
      return HttpResponse.json({
        data: {
          users: {
            content: [
              { id: 1, username: 'admin', email: 'admin@example.com', status: 'ACTIVE' },
            ],
            totalElements: 1,
          },
        },
      });
    }
    
    return HttpResponse.json({ errors: [{ message: 'Unknown query' }] }, { status: 400 });
  }),
];

export const handlers = [
  ...authHandlers,
  ...menuHandlers,
  ...userHandlers,
  ...graphqlHandlers,
];

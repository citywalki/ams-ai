export const testUsers = {
  admin: {
    username: 'admin',
    password: 'Admin123!',
    email: 'admin@example.com',
  },
  user: {
    username: 'test-user',
    password: 'Test@123456',
    email: 'test-user@example.com',
  },
  newUser: {
    username: 'new-test-user',
    password: 'NewTest@123',
    email: 'new-test-user@example.com',
    role: 'user',
  },
};

export const invalidUsers = {
  nonExistent: {
    username: 'non-existent-user-12345',
    password: 'wrong-password',
  },
  wrongPassword: {
    username: 'admin',
    password: 'wrong-password-123',
  },
};

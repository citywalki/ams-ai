export const testUsers = {
  admin: {
    username: 'test-admin',
    password: 'Test@123456',
    email: 'test-admin@example.com',
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
    username: 'test-admin',
    password: 'wrong-password-123',
  },
};

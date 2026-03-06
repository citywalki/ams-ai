export interface User {
  id: number;
  username: string;
  email: string;
  realName?: string;
  avatar?: string;
  status: "ACTIVE" | "DISABLED";
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

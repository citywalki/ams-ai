import { create } from "zustand";
import { persist } from "zustand/middleware";
import { restClient } from "@/shared/api/rest-client";
import type { User, LoginCredentials, AuthResponse } from "@/features/auth/schema/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await restClient.post<AuthResponse>("/auth/login", credentials);
          const { userId, username, accessToken, refreshToken } = response.data;
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          set({
            isAuthenticated: true,
            user: {
              id: userId,
              username,
              email: "",
              status: "ACTIVE",
              roles: [],
            },
            token: accessToken,
            refreshToken: refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "登录失败",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await restClient.post("/auth/logout");
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
        }
      },

      setToken: (token: string) => set({ token }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

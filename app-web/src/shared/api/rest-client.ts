import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// Token 刷新队列管理
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export const restClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

/**
 * 刷新 accessToken
 * 使用新的 axios 实例避免拦截器循环
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // 创建临时 axios 实例，避免触发拦截器
  const tempClient = axios.create({
    baseURL: restClient.defaults.baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await tempClient.post<{ accessToken: string }>(
    "/auth/refresh",
    { refreshToken }
  );

  return response.data.accessToken;
}

restClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 处理 token 过期
restClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 非 401 错误或已重试过，直接返回错误
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 避免循环重试
    originalRequest._retry = true;

    if (isRefreshing) {
      // 如果正在刷新，加入队列等待
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(restClient(originalRequest));
        });
      });
    }

    // 开始刷新
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      // 更新本地存储
      localStorage.setItem("token", newToken);

      // 更新 Zustand store（如果使用了 auth-store）
      const { setToken } = useAuthStore.getState();
      setToken(newToken);

      // 通知所有等待的请求
      onRefreshed(newToken);

      // 重试原请求
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return restClient(originalRequest);
    } catch (refreshError) {
      // 刷新失败，执行登出
      isRefreshing = false;
      refreshSubscribers = [];

      // 清除 token
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      // 更新 Zustand store
      const { logout } = useAuthStore.getState();
      logout();

      // 显示错误提示
      toast.error("登录已过期，请重新登录");

      // 跳转到登录页
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

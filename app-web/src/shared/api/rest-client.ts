import axios from "axios";
import { toast } from "sonner";

export const restClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

restClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

restClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 只清除 token，不跳转，让路由守卫处理跳转
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      toast.error("登录已过期，请重新登录");
      // 不在这里跳转，避免与路由守卫冲突
    }
    return Promise.reject(error);
  }
);

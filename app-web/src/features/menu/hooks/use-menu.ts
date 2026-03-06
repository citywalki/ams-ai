import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { restClient } from "@/shared/api/rest-client";
import type { Menu } from "../schema/menu";

export const MENU_QUERY_KEY = ["menus", "user"] as const;

export function useUserMenus() {
  return useQuery<Menu[], Error>({
    queryKey: MENU_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await restClient.get<Menu[]>("/system/menus/user");
        
        // 后端直接返回菜单数组
        if (Array.isArray(response.data)) {
          return response.data;
        }
        
        // 如果后端改成包装格式，支持兼容
        const wrappedData = response.data as unknown as { data?: Menu[]; success?: boolean; message?: string };
        if (wrappedData.success === false) {
          throw new Error(wrappedData.message || "获取菜单失败");
        }
        if (Array.isArray(wrappedData.data)) {
          return wrappedData.data;
        }
        
        throw new Error("返回数据格式不正确");
      } catch (error) {
        console.error("[Menu API] Error:", error);
        if (axios.isAxiosError(error)) {
          console.error("[Menu API] Axios error:", {
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        throw error;
      }
    },
  });
}

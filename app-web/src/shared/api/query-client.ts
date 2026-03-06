import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
      // 错误不抛出，组件继续渲染
      throwOnError: false,
    },
    mutations: {
      // 错误通过 toast 提示，不抛出
      onError: (error) => {
        const message = error instanceof Error ? error.message : "操作失败";
        toast.error(message);
      },
    },
  },
});

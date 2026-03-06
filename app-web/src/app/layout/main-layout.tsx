import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function MainLayout() {
  const { isAuthenticated } = useAuthStore();

  // 未登录用户访问受保护路由，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5] overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

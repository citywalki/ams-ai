import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { MainLayout } from "@/app/layout/main-layout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";

// 根路由重定向组件
function RootRedirect() {
  const { isAuthenticated } = useAuthStore();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

// 登录页路由守卫 - 已登录用户自动跳转到 dashboard
function LoginGuard() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginGuard />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
    ],
  },
]);

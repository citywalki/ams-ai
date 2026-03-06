import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "@/app/layout/main-layout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import UserManagementPage from "@/pages/UserManagement";

// 检查是否已登录（同时检查 store 和 localStorage）
function isLoggedIn(): boolean {
  const token = localStorage.getItem("token");
  return !!token;
}

// 保护路由包装器
function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}

// 公开路由包装器（已登录用户不能访问）
function PublicRoute() {
  return !isLoggedIn() ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/",
    element: <PublicRoute />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "admin/users",
            element: <UserManagementPage />,
          },
        ],
      },
    ],
  },
]);

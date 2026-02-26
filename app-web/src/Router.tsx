import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import FeatureHostPage from '@/pages/FeatureHostPage';
import LoginPage from '@/pages/login/LoginPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import RoleManagementPage from '@/pages/admin/RoleManagementPage';
import DictManagementPage from '@/pages/admin/DictManagementPage';
import MainLayout from '@/components/layout/MainLayout';
import { MenuProvider } from '@/contexts/MenuContext';
import { Skeleton } from '@/components/ui/skeleton';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout />;
}

export default function AppRouter() {
  return (
    <MenuProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin/users" element={<UserManagementPage />} />
          <Route path="admin/roles" element={<RoleManagementPage />} />
          <Route path="admin/dict" element={<DictManagementPage />} />
          <Route path="*" element={<FeatureHostPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MenuProvider>
  );
}

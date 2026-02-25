import { Navigate, Route, Routes } from 'react-router-dom';
import { BusyIndicator } from '@ui5/webcomponents-react';
import { useAuthStore } from '@/stores/authStore';
import DashboardPage from '@/pages/DashboardPage';
import FeatureHostPage from '@/pages/FeatureHostPage';
import LoginPage from '@/pages/LoginPage';
import MainLayout from '@/layouts/MainLayout';
import { MenuProvider } from '@/contexts/MenuContext';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  if (isLoading) {
    return (
      <div className='fiori-status-container'>
        <BusyIndicator active />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return <MainLayout />;
}

export default function AppRouter() {
  return (
    <MenuProvider>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<ProtectedRoute />}>
          <Route index element={<Navigate to='dashboard' replace />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='*' element={<FeatureHostPage />} />
        </Route>
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </MenuProvider>
  );
}

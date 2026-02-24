import { Navigate, Route, Routes } from 'react-router-dom';
import { BusyIndicator } from '@ui5/webcomponents-react';
import { useAuthStore } from '@/stores/authStore';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';

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
  return <DashboardPage />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/' element={<ProtectedRoute />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

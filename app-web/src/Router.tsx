import {useEffect} from 'react'
import {BrowserRouter, Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom'
import {useAuthStore} from './stores/authStore'
import {PermissionProvider} from './contexts/PermissionContext'
import {RoleProvider} from './contexts/RoleContext'
import {MenuProvider} from './contexts/MenuContext'
import AppLayout from './App'
import Dashboard from './pages/Dashboard'
import AlertsList from './pages/AlertsList'
import Settings from './pages/Settings'
import Login from './pages/Login'
import MenuManagement from './pages/admin/menu-management'
import RoleManagement from './pages/admin/role-management'
import PermissionManagement from './pages/admin/permission-management'

function ProtectedRouteWrapper() {
  const { isAuthenticated, loading } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    useAuthStore.getState().checkAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default function Router() {
  return (
    <BrowserRouter>
        <RoleProvider>
            <PermissionProvider>
                <MenuProvider>
                    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRouteWrapper />}>
          <Route path="/dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/alerts" element={
            <AppLayout>
              <AlertsList />
            </AppLayout>
          } />
          <Route path="/settings" element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }/>
            <Route path="/admin/menus" element={
                <AppLayout>
                    <MenuManagement/>
                </AppLayout>
            }/>
            <Route path="/admin/roles" element={
                <AppLayout>
                    <RoleManagement/>
                </AppLayout>
            }/>
            <Route path="/admin/permissions" element={
                <AppLayout>
                    <PermissionManagement/>
                </AppLayout>
          } />
        </Route>
            </Routes>
                </MenuProvider>
            </PermissionProvider>
        </RoleProvider>
    </BrowserRouter>
  )
}


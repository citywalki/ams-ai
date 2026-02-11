import { usePermissions } from '@/contexts/PermissionContext'

interface PermissionCheckResult {
  hasPermission: (permission: string) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

/**
 * 返回权限检查函数集合的 Hook
 * @returns 包含多种权限检查方法的对象
 */
export const useHasPermissions = (): PermissionCheckResult => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()
  
  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  }
}
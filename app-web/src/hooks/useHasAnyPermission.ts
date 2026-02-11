import { usePermissions } from '@/contexts/PermissionContext'

/**
 * 检查是否拥有任意一个权限的 Hook
 * @param permissions 权限标识符数组
 * @returns 是否拥有任一权限
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}
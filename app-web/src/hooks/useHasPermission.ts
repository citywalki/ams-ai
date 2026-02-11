import { usePermissions } from '@/contexts/PermissionContext'

/**
 * 检查是否拥有单个权限的 Hook
 * @param permission 权限标识符
 * @returns 是否拥有该权限
 */
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}
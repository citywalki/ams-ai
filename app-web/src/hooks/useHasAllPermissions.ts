import { usePermissions } from '@/contexts/PermissionContext'

/**
 * 检查是否拥有所有指定权限的 Hook
 * @param permissions 权限标识符数组
 * @returns 是否拥有所有权限
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissions)
}
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { permissionApi } from '@/utils/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * 权限上下文类型定义
 */
interface PermissionContextValue {
  permissions: string[]
  loading: boolean
  error: string | null
  hasPermission: (permission: string) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  reloadPermissions: () => Promise<void>
}

/**
 * 权限上下文 Provider 属性
 */
interface PermissionProviderProps {
  children: ReactNode
}

/**
 * 创建权限上下文
 */
const PermissionContext = createContext<PermissionContextValue | undefined>(undefined)

/**
 * 权限提供者组件
 * 从后端 API 获取用户权限列表，并提供全局权限上下文
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  /**
   * 从后端获取用户权限列表
   */
  const fetchPermissions = async () => {
    if (!isAuthenticated) {
      setPermissions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await permissionApi.getUserPermissions()
      setPermissions(response.data)
    } catch (err: any) {
      console.error('Failed to fetch user permissions:', err)
      setError('获取用户权限失败')
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * 检查是否拥有单个权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  /**
   * 检查是否拥有所有权限
   */
  const hasAllPermissions = (permissionsToCheck: string[]): boolean => {
    if (!permissionsToCheck || permissionsToCheck.length === 0) {
      return true
    }
    return permissionsToCheck.every(perm => permissions.includes(perm))
  }

  /**
   * 检查是否拥有任一权限
   */
  const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
    if (!permissionsToCheck || permissionsToCheck.length === 0) {
      return false
    }
    return permissionsToCheck.some(perm => permissions.includes(perm))
  }

  /**
   * 重新加载权限列表
   */
  const reloadPermissions = async () => {
    await fetchPermissions()
  }

  /**
   * 在组件挂载或认证状态变化时获取权限
   */
  useEffect(() => {
    fetchPermissions()
  }, [isAuthenticated])

  const contextValue: PermissionContextValue = {
    permissions,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    reloadPermissions,
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  )
}

/**
 * 使用权限上下文的自定义 Hook
 * 抛出错误如果在 Provider 外部使用
 */
export const usePermissions = (): PermissionContextValue => {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

/**
 * 检查是否拥有单个权限的 Hook
 */
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}

/**
 * 检查是否拥有所有权限的 Hook
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissions)
}

/**
 * 检查是否拥有任一权限的 Hook
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissions)
}

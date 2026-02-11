import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react'
import {apiClient} from '@/utils/apiClient'
import {useAuthStore} from '@/stores/authStore'

interface RoleContextValue {
    roles: string[]
    loading: boolean
    error: string | null
    hasRole: (role: string) => boolean
    hasAnyRole: (roles: string[]) => boolean
    hasAllRoles: (roles: string[]) => boolean
    reloadRoles: () => Promise<void>
}

interface RoleProviderProps {
    children: ReactNode
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

export const RoleProvider: React.FC<RoleProviderProps> = ({children}) => {
    const [roles, setRoles] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const {isAuthenticated} = useAuthStore()

    const fetchRoles = async () => {
        if (!isAuthenticated) {
            setRoles([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await apiClient.get<string[]>('/system/roles/user')
            setRoles(response.data)
        } catch (err: any) {
            console.error('Failed to fetch user roles:', err)
            setError('获取用户角色失败')
            setRoles([])
        } finally {
            setLoading(false)
        }
    }

    const hasRole = (role: string): boolean => {
        return roles.includes(role)
    }

    const hasAnyRole = (requiredRoles: string[]): boolean => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return false
        }
        return requiredRoles.some(role => roles.includes(role))
    }

    const hasAllRoles = (requiredRoles: string[]): boolean => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return true
        }
        return requiredRoles.every(role => roles.includes(role))
    }

    const reloadRoles = async () => {
        await fetchRoles()
    }

    useEffect(() => {
        fetchRoles()
    }, [isAuthenticated])

    const contextValue: RoleContextValue = {
        roles,
        loading,
        error,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        reloadRoles,
    }

    return (
        <RoleContext.Provider value={contextValue}>
            {children}
        </RoleContext.Provider>
    )
}

export const useRoles = (): RoleContextValue => {
    const context = useContext(RoleContext)
    if (!context) {
        throw new Error('useRoles must be used within a RoleProvider')
    }
    return context
}

export const useHasRole = (role: string): boolean => {
    const {hasRole} = useRoles()
    return hasRole(role)
}

export const useHasAnyRole = (roles: string[]): boolean => {
    const {hasAnyRole} = useRoles()
    return hasAnyRole(roles)
}

export const useHasAllRoles = (roles: string[]): boolean => {
    const {hasAllRoles} = useRoles()
    return hasAllRoles(roles)
}

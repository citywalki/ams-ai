import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react'
import {Menu, systemApi} from '@/utils/api'
import {useAuthStore} from '@/stores/authStore'
import {tokenManager} from '@/utils/apiClient'

interface MenuContextValue {
    menus: Menu[]
    loading: boolean
    error: string | null
    reloadMenus: () => Promise<void>
    findMenuByRoute: (route: string) => Menu | undefined
    findMenuByKey: (key: string) => Menu | undefined
    flattenMenus: (menus: Menu[]) => Menu[]
}

interface MenuProviderProps {
    children: ReactNode
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined)

export const MenuProvider: React.FC<MenuProviderProps> = ({children}) => {
    const [menus, setMenus] = useState<Menu[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const {isAuthenticated} = useAuthStore()

    const fetchMenus = async () => {
        const token = tokenManager.getAccessToken()
        if (!token) {
            setMenus([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await systemApi.getUserMenus()
            setMenus(response.data || [])
        } catch (err: any) {
            console.error('Failed to fetch user menus:', err)
            setError('获取用户菜单失败')
            setMenus([])
        } finally {
            setLoading(false)
        }
    }

    const flattenMenus = (menuList: Menu[]): Menu[] => {
        const result: Menu[] = []
        const flatten = (items: Menu[]) => {
            items.forEach(item => {
                result.push(item)
                if (item.children && item.children.length > 0) {
                    flatten(item.children)
                }
            })
        }
        flatten(menuList)
        return result
    }

    const findMenuByRoute = (route: string): Menu | undefined => {
        const flatMenus = flattenMenus(menus)
        return flatMenus.find(menu => menu.route === route)
    }

    const findMenuByKey = (key: string): Menu | undefined => {
        const flatMenus = flattenMenus(menus)
        return flatMenus.find(menu => menu.key === key)
    }

    const reloadMenus = async () => {
        await fetchMenus()
    }

    useEffect(() => {
        fetchMenus()
    }, [isAuthenticated])

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = tokenManager.getAccessToken()
            if (token && menus.length === 0) {
                fetchMenus()
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    const contextValue: MenuContextValue = {
        menus,
        loading,
        error,
        reloadMenus,
        findMenuByRoute,
        findMenuByKey,
        flattenMenus,
    }

    return (
        <MenuContext.Provider value={contextValue}>
            {children}
        </MenuContext.Provider>
    )
}

export const useMenus = (): MenuContextValue => {
    const context = useContext(MenuContext)
    if (!context) {
        throw new Error('useMenus must be used within a MenuProvider')
    }
    return context
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/utils/api'
import { tokenManager } from '@/utils/apiClient'
import { message } from 'antd'

interface User {
  id: number
  username: string
  tenantId: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      login: async (username: string, password: string) => {
        set({ loading: true })
        try {
          const response = await authApi.login({ username, password })
          const { userId, username: returnedUsername, accessToken, refreshToken, tenantId } = response.data

          tokenManager.setTokens(accessToken, refreshToken, tenantId.toString())
          
          // 保存用户信息到localStorage确保向后兼容性
          localStorage.setItem('user_id', userId.toString())
          localStorage.setItem('username', returnedUsername)

          set({
            user: {
              id: userId,
              username: returnedUsername,
              tenantId,
            },
            isAuthenticated: true,
            loading: false,
          })

          message.success('登录成功')
        } catch (error: any) {
          console.error('Login error:', error)
          set({ loading: false })

          // 优先使用标准化的错误响应，兼容旧格式
          const errorMessage = error.errorResponse?.message ||
                              error.response?.data?.message ||
                              error.response?.data?.error ||
                              error.message ||
                              '登录失败，请检查用户名和密码'
          message.error(errorMessage)
          throw error
        }
      },

      logout: () => {
        tokenManager.clearTokens()
        // 清除localStorage中的用户信息
        localStorage.removeItem('user_id')
        localStorage.removeItem('username')
        set({
          user: null,
          isAuthenticated: false,
        })
        message.info('已退出登录')
        window.location.href = '/login'
      },

      checkAuth: () => {
        const token = tokenManager.getAccessToken()
        const tenantId = tokenManager.getTenantId()

        if (token && tenantId) {
          // Token存在，用户已认证
          // 检查Zustand是否已经恢复了用户状态
          const state = useAuthStore.getState()
          if (!state.user) {
            // 尝试从localStorage恢复用户信息（向后兼容）
            const userId = localStorage.getItem('user_id')
            const username = localStorage.getItem('username')
            if (userId && username) {
              set({
                user: {
                  id: parseInt(userId),
                  username,
                  tenantId: parseInt(tenantId),
                },
                isAuthenticated: true,
              })
            } else {
              // 只有token，没有用户信息，仍然视为已认证
              set({
                isAuthenticated: true,
              })
            }
          }
          // 如果state.user已经存在，Zustand persist已经处理了状态恢复
        } else {
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

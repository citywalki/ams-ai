import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE_URL = '/api'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TENANT_ID_KEY = 'tenant_id'

// 错误响应接口，与后端 ErrorResponse 对应
export interface ErrorResponse {
  code: string
  message: string
  timestamp?: string
  fieldErrors?: Array<{
    field: string
    message: string
    rejectedValue?: any
  }>
  requestId?: string
}

// 扩展 AxiosError 类型以包含我们的 ErrorResponse
declare module 'axios' {
  export interface AxiosError {
    errorResponse?: ErrorResponse
  }
}

class TokenManager {
  private static instance: TokenManager
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  getTenantId(): string | null {
    return localStorage.getItem(TENANT_ID_KEY)
  }

  setTokens(accessToken: string, refreshToken: string, tenantId: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(TENANT_ID_KEY, tenantId)
  }

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TENANT_ID_KEY)
  }

  subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  unsubscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers = this.refreshSubscribers.filter(cb => cb !== callback)
  }

  notifySubscribers(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        const callback = (token: string) => {
          resolve(token)
        }
        this.subscribeTokenRefresh(callback)
        setTimeout(() => {
          this.unsubscribeTokenRefresh(callback)
          reject(new Error('Token refresh timeout'))
        }, 5000)
      })
    }

    this.isRefreshing = true
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      this.isRefreshing = false
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      })

      const newAccessToken = response.data.accessToken

      localStorage.setItem(TOKEN_KEY, newAccessToken)
      this.notifySubscribers(newAccessToken)

      return newAccessToken
    } catch (error) {
      this.clearTokens()
      window.location.href = '/login'
      throw error
    } finally {
      this.isRefreshing = false
    }
  }
}

const tokenManager = TokenManager.getInstance()

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken()
        const tenantId = tokenManager.getTenantId()

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (tenantId) {
          config.headers['X-Tenant-Id'] = tenantId
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config

        // 如果是 401 错误且不是刷新 token 的请求，并且不是认证端点
        const isAuthEndpoint = originalRequest.url?.includes('/auth/')
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true

          try {
            const newAccessToken = await tokenManager.refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }

        // 提取并附加错误响应信息
        const errorResponse = extractErrorResponse(error)
        error.errorResponse = errorResponse

        // 处理错误显示
        handleErrorDisplay(error, errorResponse)

        return Promise.reject(error)
      },
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }
}

/**
 * 从Axios错误对象中提取标准化的错误响应
 */
function extractErrorResponse(error: any): ErrorResponse | undefined {
  if (!error.response) {
    // 网络错误或请求超时
    return {
      code: 'NETWORK_ERROR',
      message: error.message || '网络连接错误，请检查网络设置',
    }
  }

  const { status, data } = error.response
  
  // 如果响应数据符合 ErrorResponse 格式
  if (data && typeof data === 'object' && data.code && data.message) {
    return {
      code: data.code,
      message: data.message,
      timestamp: data.timestamp,
      fieldErrors: data.fieldErrors,
      requestId: data.requestId,
    }
  }

  // 其他格式的错误响应
  return {
    code: `HTTP_${status}`,
    message: data?.error || data?.message || getDefaultErrorMessage(status),
  }
}

/**
 * 根据HTTP状态码获取默认错误消息
 */
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '拒绝访问',
    404: '请求的资源不存在',
    405: '请求方法不被允许',
    408: '请求超时',
    409: '资源冲突',
    413: '请求实体过大',
    415: '不支持的媒体类型',
    422: '请求参数验证失败',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '网关超时',
  }

  return messages[status] || `请求失败 (状态码: ${status})`
}

/**
 * 处理错误显示逻辑
 */
function handleErrorDisplay(error: any, errorResponse?: ErrorResponse) {
  // 如果错误已经被标记为不显示（例如，调用方希望自己处理）
  if (error.config?._suppressErrorDisplay) {
    return
  }

  const { status } = error.response || {}
  
  // 只显示服务器错误（5xx）和网络错误，客户端错误（4xx）由调用方处理
  if (status && status >= 500) {
    // 服务器错误
    const messageText = errorResponse?.message || getDefaultErrorMessage(status)
    message.error(`服务器错误: ${messageText}`)
  } else if (!status) {
    // 网络错误
    message.error(errorResponse?.message || '网络连接错误')
  }
  // 客户端错误（4xx）不在这里显示，由调用方根据业务逻辑处理
}

export const apiClient = new ApiClient()
export default apiClient
export { tokenManager }

import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !(originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry) {
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data as { accessToken: string };
          
          localStorage.setItem('access_token', accessToken);
          originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const errorData = error.response?.data as { message?: string; error?: string } | undefined;
    const errorMessage = errorData?.message || errorData?.error || error.message;
    const enhancedError = new Error(errorMessage);
    (enhancedError as Error & { status?: number; data?: unknown }).status = error.response?.status;
    (enhancedError as Error & { status?: number; data?: unknown }).data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export default apiClient;

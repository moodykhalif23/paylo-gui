import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { config } from '../../config/environment'
import { ApiResponse, ApiError } from '../../types'

// Token storage keys
const ACCESS_TOKEN_KEY = 'paylo_access_token'
const REFRESH_TOKEN_KEY = 'paylo_refresh_token'

// Token storage utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add auth token
  client.interceptors.request.use(
    config => {
      const token = tokenStorage.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling and token refresh
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean
      }

      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = tokenStorage.getRefreshToken()
          if (refreshToken) {
            const response = await axios.post(
              `${config.api.baseUrl}/auth/refresh`,
              {
                refreshToken,
              }
            )

            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data
            tokenStorage.setAccessToken(accessToken)
            tokenStorage.setRefreshToken(newRefreshToken)

            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return client(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          tokenStorage.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      // Transform error to our ApiError format
      const responseData = error.response?.data as {
        message?: string
        code?: string
      }
      const apiError: ApiError = {
        message:
          responseData?.message ||
          error.message ||
          'An unexpected error occurred',
        status: error.response?.status || 500,
        code: responseData?.code || 'UNKNOWN_ERROR',
      }

      return Promise.reject(apiError)
    }
  )

  return client
}

// Create the main API client instance
export const apiClient = createApiClient()

// Generic API request wrapper
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config)
    return response.data
  } catch (error) {
    throw error as ApiError
  }
}

// HTTP method helpers
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
}

export default apiClient

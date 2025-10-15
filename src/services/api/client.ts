import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { config } from '../../config/environment'
import { ApiResponse, ApiError } from '../../types'
import { SecurityUtils } from '../../utils/security'

// Token storage keys
const ACCESS_TOKEN_KEY = 'paylo_access_token'
const REFRESH_TOKEN_KEY = 'paylo_refresh_token'

// Encryption key for token storage (in production, this should be derived from user session)
const ENCRYPTION_KEY = 'paylo_secure_key_2024'

// Rate limiter for API requests
const rateLimiter = SecurityUtils.createRateLimiter(100, 60000) // 100 requests per minute

// Token storage utilities with encryption
export const tokenStorage = {
  getAccessToken: (): string | null => {
    const encryptedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!encryptedToken) return null

    try {
      return SecurityUtils.decryptData(encryptedToken, ENCRYPTION_KEY)
    } catch (error) {
      console.error('Failed to decrypt access token:', error)
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      return null
    }
  },

  setAccessToken: (token: string): void => {
    try {
      const encryptedToken = SecurityUtils.encryptData(token, ENCRYPTION_KEY)
      localStorage.setItem(ACCESS_TOKEN_KEY, encryptedToken)
    } catch (error) {
      console.error('Failed to encrypt access token:', error)
    }
  },

  getRefreshToken: (): string | null => {
    const encryptedToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!encryptedToken) return null

    try {
      return SecurityUtils.decryptData(encryptedToken, ENCRYPTION_KEY)
    } catch (error) {
      console.error('Failed to decrypt refresh token:', error)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      return null
    }
  },

  setRefreshToken: (token: string): void => {
    try {
      const encryptedToken = SecurityUtils.encryptData(token, ENCRYPTION_KEY)
      localStorage.setItem(REFRESH_TOKEN_KEY, encryptedToken)
    } catch (error) {
      console.error('Failed to encrypt refresh token:', error)
    }
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

  // Request interceptor to add auth token and security headers
  client.interceptors.request.use(
    config => {
      // Rate limiting check
      const clientId = 'api_client' // In production, use user ID or session ID
      if (!rateLimiter(clientId)) {
        return Promise.reject(
          new Error('Rate limit exceeded. Please try again later.')
        )
      }

      // Add authentication token
      const token = tokenStorage.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add CSRF token for state-changing requests
      if (
        ['post', 'put', 'patch', 'delete'].includes(
          config.method?.toLowerCase() || ''
        )
      ) {
        const csrfToken = sessionStorage.getItem('csrf_token')
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken
        }
      }

      // Add security headers
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
      config.headers['Cache-Control'] = 'no-cache'

      // Sanitize request data if it's a string
      if (typeof config.data === 'string') {
        config.data = SecurityUtils.sanitizeInput(config.data)
      } else if (config.data && typeof config.data === 'object') {
        // Sanitize object properties that are strings
        const sanitizedData = { ...config.data }
        Object.keys(sanitizedData).forEach(key => {
          if (typeof sanitizedData[key] === 'string') {
            sanitizedData[key] = SecurityUtils.sanitizeInput(sanitizedData[key])
          }
        })
        config.data = sanitizedData
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

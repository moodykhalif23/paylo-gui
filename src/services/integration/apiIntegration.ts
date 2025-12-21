import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { store } from '../../store'
import { logoutUser } from '../../store/slices/authSlice'
import {
  User,
  Wallet,
  WalletAddress as WalletBalance,
  Transaction,
  Invoice,
  MerchantAnalytics,
  SystemHealth,
  PaginatedResponse,
  MerchantProfile as MerchantDashboard,
} from '../../types'

// Additional types for API integration
interface SystemConfig {
  id: string
  name: string
  value: string
  description?: string
  updatedAt: string
}

/**
 * Enhanced API client with comprehensive error handling and integration
 */
class ApiIntegrationService {
  private client: AxiosInstance
  private baseURL: string
  private retryAttempts = 3
  private retryDelay = 1000

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add authentication token
        const state = store.getState()
        const token = state.auth.token

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`,
            config
          )
        }

        return config
      },
      error => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `API Response: ${response.status} ${response.config.url}`,
            response.data
          )
        }

        return response
      },
      async error => {
        const originalRequest = error.config

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh token
            await this.refreshToken()
            return this.client(originalRequest)
          } catch (refreshError) {
            // Refresh failed, logout user
            store.dispatch(logoutUser())
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
          }
        }

        // Handle rate limiting with retry
        if (
          error.response?.status === 429 &&
          originalRequest._retryCount < this.retryAttempts
        ) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

          const delay =
            this.retryDelay * Math.pow(2, originalRequest._retryCount - 1)
          await this.sleep(delay)

          return this.client(originalRequest)
        }

        // Handle network errors with retry
        if (
          !error.response &&
          originalRequest._retryCount < this.retryAttempts
        ) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

          const delay = this.retryDelay * originalRequest._retryCount
          await this.sleep(delay)

          return this.client(originalRequest)
        }

        // Log error
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        })

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  private async refreshToken(): Promise<void> {
    const state = store.getState()
    const token = state.auth.token

    if (!token) {
      throw new Error('No refresh token available')
    }

    await axios.post(`${this.baseURL}/auth/refresh`, {
      token,
    })

    // Update token in store
    // This would be handled by the auth slice
    // store.dispatch(updateToken(response.data.token));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private normalizeError(error: unknown): ApiError {
    const err = error as {
      response?: {
        data?: {
          message?: string
          code?: string
          details?: Record<string, unknown>
        }
        status?: number
      }
      request?: unknown
      message?: string
    }
    if (err.response) {
      // Server responded with error status
      return {
        type: 'API_ERROR',
        message:
          err.response.data?.message || err.message || 'API error occurred',
        status: err.response.status || 0,
        code: err.response.data?.code,
        details: err.response.data?.details,
      }
    } else if (err.request) {
      // Network error
      return {
        type: 'NETWORK_ERROR',
        message: 'Network error occurred. Please check your connection.',
        status: 0,
      }
    } else {
      // Other error
      return {
        type: 'UNKNOWN_ERROR',
        message: err.message || 'An unknown error occurred',
        status: 0,
      }
    }
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post('/api/auth/login', credentials)
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.post('/api/auth/register', userData)
  }

  async logout(): Promise<void> {
    return this.post('/api/auth/logout')
  }

  // P2P endpoints
  async getWallets(): Promise<Wallet[]> {
    return this.get('/api/v1/wallets')
  }

  async createWallet(blockchain: string): Promise<Wallet> {
    return this.post('/api/v1/wallets', { blockchain })
  }

  async getWalletBalance(address: string): Promise<WalletBalance> {
    return this.get(`/api/v1/wallets/balance/${address}`)
  }

  async createP2PTransfer(
    transferData: P2PTransferRequest
  ): Promise<Transaction> {
    return this.post('/api/v1/payments/p2p', transferData)
  }

  async getTransactions(
    params?: TransactionQueryParams
  ): Promise<PaginatedResponse<Transaction>> {
    return this.get('/api/v1/transactions', { params })
  }

  async getTransactionStatus(txId: string): Promise<Transaction> {
    return this.get(`/api/v1/payments/status/${txId}`)
  }

  // Merchant endpoints
  async getMerchantDashboard(): Promise<MerchantDashboard> {
    return this.get('/api/v1/merchant/dashboard')
  }

  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    return this.post('/api/v1/merchant/invoices', invoiceData)
  }

  async getInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return this.get('/api/v1/merchant/invoices', { params })
  }

  async getMerchantAnalytics(
    params?: AnalyticsParams
  ): Promise<MerchantAnalytics> {
    return this.get('/api/v1/merchant/analytics', { params })
  }

  // Admin endpoints
  async getSystemHealth(): Promise<SystemHealth> {
    return this.get('/api/v1/admin/system/health')
  }

  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.get('/api/v1/admin/users', { params })
  }

  async createUser(userData: ApiCreateUserRequest): Promise<User> {
    return this.post('/api/v1/admin/users', userData)
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    return this.put(`/api/v1/admin/users/${userId}`, userData)
  }

  async deleteUser(userId: string): Promise<void> {
    return this.delete(`/api/v1/admin/users/${userId}`)
  }

  async getAllTransactions(
    params?: AdminTransactionQueryParams
  ): Promise<PaginatedResponse<Transaction>> {
    return this.get('/api/v1/admin/transactions', { params })
  }

  async getSystemConfig(): Promise<SystemConfig> {
    return this.get('/api/v1/admin/config')
  }

  async updateSystemConfig(
    config: Partial<SystemConfig>
  ): Promise<SystemConfig> {
    return this.put('/api/v1/admin/config', config)
  }

  // File upload/download
  async uploadFile(
    file: File,
    endpoint: string
  ): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Export data
  async exportTransactions(params: ExportParams): Promise<void> {
    const response = await this.client.get('/api/v1/export/transactions', {
      params,
      responseType: 'blob',
    })

    const filename = `transactions_${new Date().toISOString().split('T')[0]}.${params.format}`
    await this.downloadFile(URL.createObjectURL(response.data), filename)
  }

  async exportInvoices(params: ExportParams): Promise<void> {
    const response = await this.client.get('/api/v1/export/invoices', {
      params,
      responseType: 'blob',
    })

    const filename = `invoices_${new Date().toISOString().split('T')[0]}.${params.format}`
    await this.downloadFile(URL.createObjectURL(response.data), filename)
  }
}

// Types
interface ApiError {
  type: 'API_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'
  message: string
  status: number
  code?: string
  details?: Record<string, unknown>
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  role: 'user' | 'merchant'
  profile: {
    firstName: string
    lastName: string
  }
}

interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

interface P2PTransferRequest {
  fromAddress: string
  toAddress: string
  amount: string
  blockchain: 'bitcoin' | 'ethereum' | 'solana'
  fee?: string
}

interface TransactionQueryParams {
  page?: number
  limit?: number
  blockchain?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface CreateInvoiceRequest {
  amount: string
  currency: string
  description?: string
  expirationTime?: string
  webhookUrl?: string
  metadata?: Record<string, unknown>
}

interface InvoiceQueryParams {
  page?: number
  limit?: number
  status?: string
  startDate?: string
  endDate?: string
}

interface AnalyticsParams {
  startDate: string
  endDate: string
  granularity?: 'day' | 'week' | 'month'
}

interface UserQueryParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

interface ApiCreateUserRequest {
  email: string
  password: string
  role: 'user' | 'merchant' | 'admin'
  profile: {
    firstName: string
    lastName: string
  }
}

interface UpdateUserRequest {
  email?: string
  role?: 'user' | 'merchant' | 'admin'
  profile?: {
    firstName?: string
    lastName?: string
  }
  isActive?: boolean
}

interface AdminTransactionQueryParams extends TransactionQueryParams {
  userId?: string
  merchantId?: string
  flagged?: boolean
}

interface ExportParams {
  format: 'csv' | 'json' | 'xlsx'
  startDate?: string
  endDate?: string
  filters?: Record<string, unknown>
}

// Create singleton instance
export const apiIntegration = new ApiIntegrationService()
export default apiIntegration

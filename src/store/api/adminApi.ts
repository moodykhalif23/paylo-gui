import { baseApi } from './baseApi'
import {
  SystemHealth,
  SystemAlert,
  AdminUser,
  MerchantProfile,
  Transaction,
  ApiResponse,
  PaginatedResponse,
} from '../../types'

// Admin API request/response types
export interface UserFilters {
  role?: 'user' | 'merchant' | 'admin'
  isActive?: boolean
  isEmailVerified?: boolean
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  fromDate?: string
  toDate?: string
  search?: string
}

export interface MerchantFilters {
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  isVerified?: boolean
  businessType?: string
  fromDate?: string
  toDate?: string
  search?: string
}

export interface SystemAlertFilters {
  type?: 'info' | 'warning' | 'error' | 'critical'
  isResolved?: boolean
  source?: string
  fromDate?: string
  toDate?: string
}

export interface UpdateUserRequest {
  isActive?: boolean
  role?: 'user' | 'merchant' | 'admin'
  isEmailVerified?: boolean
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
}

export interface CreateSystemAlertRequest {
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  metadata?: Record<string, unknown>
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalMerchants: number
  verifiedMerchants: number
  totalTransactions: number
  totalVolume: string
  totalVolumeUSD: number
  systemUptime: number
  averageResponseTime: number
  errorRate: number
  userGrowthRate: number
  transactionGrowthRate: number
}

// Admin API endpoints
export const adminApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // System health and monitoring
    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => '/admin/system/health',
      transformResponse: (response: ApiResponse<SystemHealth>) =>
        response.data!,
      providesTags: ['SystemHealth'],
    }),

    // Get system statistics
    getSystemStats: builder.query<
      SystemStats,
      {
        fromDate?: string
        toDate?: string
      }
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          )
        )
        return `/admin/system/stats?${params.toString()}`
      },
      transformResponse: (response: ApiResponse<SystemStats>) => response.data!,
      providesTags: ['SystemHealth'],
    }),

    // User management
    getUsers: builder.query<
      PaginatedResponse<AdminUser>,
      {
        page?: number
        limit?: number
        filters?: UserFilters
      }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          ),
        })
        return `/admin/users?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<AdminUser>) => response,
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<AdminUser, string>({
      query: userId => `/admin/users/${userId}`,
      transformResponse: (response: ApiResponse<AdminUser>) => response.data!,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),

    // Update user
    updateUser: builder.mutation<
      AdminUser,
      { userId: string; data: UpdateUserRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data!,
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Suspend user
    suspendUser: builder.mutation<void, { userId: string; reason: string }>({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/suspend`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Unsuspend user
    unsuspendUser: builder.mutation<void, string>({
      query: userId => ({
        url: `/admin/users/${userId}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Merchant management
    getMerchants: builder.query<
      PaginatedResponse<MerchantProfile>,
      {
        page?: number
        limit?: number
        filters?: MerchantFilters
      }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          ),
        })
        return `/admin/merchants?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<MerchantProfile>) =>
        response,
      providesTags: ['User'],
    }),

    // Approve merchant verification
    approveMerchantVerification: builder.mutation<void, string>({
      query: merchantId => ({
        url: `/admin/merchants/${merchantId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Reject merchant verification
    rejectMerchantVerification: builder.mutation<
      void,
      {
        merchantId: string
        reason: string
      }
    >({
      query: ({ merchantId, reason }) => ({
        url: `/admin/merchants/${merchantId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['User'],
    }),

    // Transaction monitoring
    getAllTransactions: builder.query<
      PaginatedResponse<Transaction>,
      {
        page?: number
        limit?: number
        filters?: {
          status?: 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'expired'
          blockchain?: 'bitcoin' | 'ethereum' | 'solana'
          type?: 'p2p' | 'merchant' | 'withdraw' | 'deposit'
          fromDate?: string
          toDate?: string
          minAmount?: string
          maxAmount?: string
          userId?: string
        }
      }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          ),
        })
        return `/admin/transactions?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<Transaction>) => response,
      providesTags: ['Transaction'],
    }),

    // System alerts
    getSystemAlerts: builder.query<
      PaginatedResponse<SystemAlert>,
      {
        page?: number
        limit?: number
        filters?: SystemAlertFilters
      }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          ),
        })
        return `/admin/alerts?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<SystemAlert>) => response,
      providesTags: ['SystemHealth'],
    }),

    // Create system alert
    createSystemAlert: builder.mutation<SystemAlert, CreateSystemAlertRequest>({
      query: data => ({
        url: '/admin/alerts',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<SystemAlert>) => response.data!,
      invalidatesTags: ['SystemHealth'],
    }),

    // Resolve system alert
    resolveSystemAlert: builder.mutation<
      void,
      { alertId: string; resolution?: string }
    >({
      query: ({ alertId, resolution }) => ({
        url: `/admin/alerts/${alertId}/resolve`,
        method: 'POST',
        body: { resolution },
      }),
      invalidatesTags: ['SystemHealth'],
    }),

    // System configuration
    getSystemConfig: builder.query<Record<string, unknown>, void>({
      query: () => '/admin/system/config',
      transformResponse: (response: ApiResponse<Record<string, unknown>>) =>
        response.data!,
      providesTags: ['SystemHealth'],
    }),

    // Update system configuration
    updateSystemConfig: builder.mutation<void, Record<string, unknown>>({
      query: config => ({
        url: '/admin/system/config',
        method: 'PUT',
        body: config,
      }),
      invalidatesTags: ['SystemHealth'],
    }),

    // Export admin data
    exportAdminData: builder.mutation<
      { downloadUrl: string },
      {
        type: 'users' | 'merchants' | 'transactions' | 'alerts' | 'system_logs'
        format: 'csv' | 'json' | 'excel'
        filters?: Record<string, unknown>
        fromDate?: string
        toDate?: string
      }
    >({
      query: data => ({
        url: '/admin/export',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ downloadUrl: string }>) =>
        response.data!,
    }),

    // System maintenance
    performSystemMaintenance: builder.mutation<
      void,
      {
        type:
          | 'restart_services'
          | 'clear_cache'
          | 'optimize_database'
          | 'backup_data'
        options?: Record<string, unknown>
      }
    >({
      query: data => ({
        url: '/admin/system/maintenance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemHealth'],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetSystemHealthQuery,
  useGetSystemStatsQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetMerchantsQuery,
  useApproveMerchantVerificationMutation,
  useRejectMerchantVerificationMutation,
  useGetAllTransactionsQuery,
  useGetSystemAlertsQuery,
  useCreateSystemAlertMutation,
  useResolveSystemAlertMutation,
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
  useExportAdminDataMutation,
  usePerformSystemMaintenanceMutation,
} = adminApi

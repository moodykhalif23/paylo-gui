import { baseApi } from './baseApi'
import {
  SystemHealth,
  SystemAlert,
  AdminUser,
  MerchantProfile,
  Transaction,
  SuspiciousActivity,
  TransactionInvestigation,
  InvestigationNote,
  InvestigationAction,
  TransactionAnalytics,
  ApiResponse,
  PaginatedResponse,
  SystemConfiguration,
  ConfigurationValidationResult,
  ConfigurationTestResult,
  BlockchainType,
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

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'user' | 'merchant' | 'admin'
  isActive: boolean
  isEmailVerified: boolean
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

    // Create user
    createUser: builder.mutation<AdminUser, CreateUserRequest>({
      query: data => ({
        url: '/admin/users',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AdminUser>) => response.data!,
      invalidatesTags: ['User'],
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
          blockchain?: BlockchainType
          type?: 'p2p' | 'merchant' | 'withdraw' | 'deposit'
          fromDate?: string
          toDate?: string
          minAmount?: string
          maxAmount?: string
          userId?: string
          isSuspicious?: boolean
          riskLevel?: 'low' | 'medium' | 'high' | 'critical'
          hasInvestigation?: boolean
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

    // Get transaction by ID with investigation details
    getTransactionById: builder.query<Transaction, string>({
      query: transactionId => `/admin/transactions/${transactionId}`,
      transformResponse: (response: ApiResponse<Transaction>) => response.data!,
      providesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
      ],
    }),

    // Suspicious activity monitoring
    getSuspiciousActivities: builder.query<
      PaginatedResponse<SuspiciousActivity>,
      {
        page?: number
        limit?: number
        filters?: {
          type?:
            | 'high_frequency'
            | 'large_amount'
            | 'unusual_pattern'
            | 'blacklisted_address'
            | 'velocity_check'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'investigating' | 'resolved' | 'false_positive'
          fromDate?: string
          toDate?: string
          minRiskScore?: number
          maxRiskScore?: number
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
        return `/admin/suspicious-activities?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<SuspiciousActivity>) =>
        response,
      providesTags: ['SuspiciousActivity'],
    }),

    // Update suspicious activity status
    updateSuspiciousActivityStatus: builder.mutation<
      SuspiciousActivity,
      {
        activityId: string
        status: 'pending' | 'investigating' | 'resolved' | 'false_positive'
        resolution?: string
      }
    >({
      query: ({ activityId, status, resolution }) => ({
        url: `/admin/suspicious-activities/${activityId}/status`,
        method: 'PUT',
        body: { status, resolution },
      }),
      transformResponse: (response: ApiResponse<SuspiciousActivity>) =>
        response.data!,
      invalidatesTags: ['SuspiciousActivity', 'Transaction'],
    }),

    // Transaction investigations
    getTransactionInvestigations: builder.query<
      PaginatedResponse<TransactionInvestigation>,
      {
        page?: number
        limit?: number
        filters?: {
          status?: 'open' | 'in_progress' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          investigatorId?: string
          fromDate?: string
          toDate?: string
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
        return `/admin/investigations?${params.toString()}`
      },
      transformResponse: (
        response: PaginatedResponse<TransactionInvestigation>
      ) => response,
      providesTags: ['Investigation'],
    }),

    // Get investigation by ID
    getInvestigationById: builder.query<TransactionInvestigation, string>({
      query: investigationId => `/admin/investigations/${investigationId}`,
      transformResponse: (response: ApiResponse<TransactionInvestigation>) =>
        response.data!,
      providesTags: (_result, _error, investigationId) => [
        { type: 'Investigation', id: investigationId },
      ],
    }),

    // Create investigation
    createInvestigation: builder.mutation<
      TransactionInvestigation,
      {
        transactionId: string
        priority: 'low' | 'medium' | 'high' | 'critical'
        initialNote?: string
      }
    >({
      query: data => ({
        url: '/admin/investigations',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<TransactionInvestigation>) =>
        response.data!,
      invalidatesTags: ['Investigation', 'Transaction'],
    }),

    // Update investigation
    updateInvestigation: builder.mutation<
      TransactionInvestigation,
      {
        investigationId: string
        data: {
          status?: 'open' | 'in_progress' | 'closed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
        }
      }
    >({
      query: ({ investigationId, data }) => ({
        url: `/admin/investigations/${investigationId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<TransactionInvestigation>) =>
        response.data!,
      invalidatesTags: (_result, _error, { investigationId }) => [
        { type: 'Investigation', id: investigationId },
        'Investigation',
      ],
    }),

    // Add investigation note
    addInvestigationNote: builder.mutation<
      InvestigationNote,
      {
        investigationId: string
        content: string
      }
    >({
      query: ({ investigationId, content }) => ({
        url: `/admin/investigations/${investigationId}/notes`,
        method: 'POST',
        body: { content },
      }),
      transformResponse: (response: ApiResponse<InvestigationNote>) =>
        response.data!,
      invalidatesTags: (_result, _error, { investigationId }) => [
        { type: 'Investigation', id: investigationId },
      ],
    }),

    // Add investigation action
    addInvestigationAction: builder.mutation<
      InvestigationAction,
      {
        investigationId: string
        type:
          | 'freeze_account'
          | 'flag_transaction'
          | 'request_documents'
          | 'escalate'
          | 'close_case'
        description: string
        metadata?: Record<string, unknown>
      }
    >({
      query: ({ investigationId, type, description, metadata }) => ({
        url: `/admin/investigations/${investigationId}/actions`,
        method: 'POST',
        body: { type, description, metadata },
      }),
      transformResponse: (response: ApiResponse<InvestigationAction>) =>
        response.data!,
      invalidatesTags: (_result, _error, { investigationId }) => [
        { type: 'Investigation', id: investigationId },
      ],
    }),

    // Get transaction analytics
    getTransactionAnalytics: builder.query<
      TransactionAnalytics,
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
        return `/admin/transactions/analytics?${params.toString()}`
      },
      transformResponse: (response: ApiResponse<TransactionAnalytics>) =>
        response.data!,
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
    getSystemConfig: builder.query<SystemConfiguration, void>({
      query: () => '/admin/system/config',
      transformResponse: (response: ApiResponse<SystemConfiguration>) =>
        response.data!,
      providesTags: ['SystemConfig'],
    }),

    // Update system configuration
    updateSystemConfig: builder.mutation<
      SystemConfiguration,
      Partial<SystemConfiguration>
    >({
      query: config => ({
        url: '/admin/system/config',
        method: 'PUT',
        body: config,
      }),
      transformResponse: (response: ApiResponse<SystemConfiguration>) =>
        response.data!,
      invalidatesTags: ['SystemConfig', 'SystemHealth'],
    }),

    // Validate system configuration
    validateSystemConfig: builder.mutation<
      ConfigurationValidationResult,
      Partial<SystemConfiguration>
    >({
      query: config => ({
        url: '/admin/system/config/validate',
        method: 'POST',
        body: config,
      }),
      transformResponse: (
        response: ApiResponse<ConfigurationValidationResult>
      ) => response.data!,
    }),

    // Test blockchain RPC connection
    testBlockchainConnection: builder.mutation<
      ConfigurationTestResult,
      {
        blockchain: 'bitcoin' | 'ethereum' | 'solana'
        rpcEndpoint: string
        timeout?: number
      }
    >({
      query: ({ blockchain, rpcEndpoint, timeout = 5000 }) => ({
        url: '/admin/system/config/test-connection',
        method: 'POST',
        body: { blockchain, rpcEndpoint, timeout },
      }),
      transformResponse: (response: ApiResponse<ConfigurationTestResult>) =>
        response.data!,
    }),

    // Reset configuration to defaults
    resetSystemConfig: builder.mutation<
      SystemConfiguration,
      {
        section?: 'blockchain' | 'security' | 'rateLimit' | 'system'
      }
    >({
      query: ({ section }) => ({
        url: '/admin/system/config/reset',
        method: 'POST',
        body: { section },
      }),
      transformResponse: (response: ApiResponse<SystemConfiguration>) =>
        response.data!,
      invalidatesTags: ['SystemConfig', 'SystemHealth'],
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
  useCreateUserMutation,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetMerchantsQuery,
  useApproveMerchantVerificationMutation,
  useRejectMerchantVerificationMutation,
  useGetAllTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetSuspiciousActivitiesQuery,
  useUpdateSuspiciousActivityStatusMutation,
  useGetTransactionInvestigationsQuery,
  useGetInvestigationByIdQuery,
  useCreateInvestigationMutation,
  useUpdateInvestigationMutation,
  useAddInvestigationNoteMutation,
  useAddInvestigationActionMutation,
  useGetTransactionAnalyticsQuery,
  useGetSystemAlertsQuery,
  useCreateSystemAlertMutation,
  useResolveSystemAlertMutation,
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
  useValidateSystemConfigMutation,
  useTestBlockchainConnectionMutation,
  useResetSystemConfigMutation,
  useExportAdminDataMutation,
  usePerformSystemMaintenanceMutation,
} = adminApi

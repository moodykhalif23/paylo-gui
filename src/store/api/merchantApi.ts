import { baseApi } from './baseApi'
import {
  MerchantProfile,
  MerchantApiKey,
  Invoice,
  MerchantAnalytics,
  ApiResponse,
  PaginatedResponse,
} from '../../types'

// Merchant API request/response types
export interface CreateMerchantProfileRequest {
  businessName: string
  businessType: string
  website?: string
  description?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  taxId?: string
}

export interface UpdateMerchantProfileRequest
  extends Partial<CreateMerchantProfileRequest> {
  logo?: string
  webhookUrl?: string
}

export interface CreateApiKeyRequest {
  name: string
  permissions: string[]
  expiresAt?: string
}

export interface CreateInvoiceRequest {
  amount: string
  currency: string
  description?: string
  blockchain: 'bitcoin' | 'ethereum' | 'solana'
  expirationMinutes?: number
  webhookUrl?: string
  metadata?: Record<string, unknown>
}

export interface InvoiceFilters {
  status?:
    | 'pending'
    | 'paid'
    | 'expired'
    | 'cancelled'
    | 'overpaid'
    | 'underpaid'
  fromDate?: string
  toDate?: string
  minAmount?: string
  maxAmount?: string
  blockchain?: 'bitcoin' | 'ethereum' | 'solana'
}

export interface AnalyticsFilters {
  fromDate?: string
  toDate?: string
  blockchain?: 'bitcoin' | 'ethereum' | 'solana'
  groupBy?: 'day' | 'week' | 'month'
}

// Merchant API endpoints
export const merchantApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get merchant profile
    getMerchantProfile: builder.query<MerchantProfile, void>({
      query: () => '/merchant/profile',
      transformResponse: (response: ApiResponse<MerchantProfile>) =>
        response.data!,
      providesTags: ['User'],
    }),

    // Create merchant profile
    createMerchantProfile: builder.mutation<
      MerchantProfile,
      CreateMerchantProfileRequest
    >({
      query: data => ({
        url: '/merchant/profile',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<MerchantProfile>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Update merchant profile
    updateMerchantProfile: builder.mutation<
      MerchantProfile,
      UpdateMerchantProfileRequest
    >({
      query: data => ({
        url: '/merchant/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<MerchantProfile>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Upload merchant logo
    uploadMerchantLogo: builder.mutation<{ logoUrl: string }, FormData>({
      query: formData => ({
        url: '/merchant/logo',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ logoUrl: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Get API keys
    getApiKeys: builder.query<MerchantApiKey[], void>({
      query: () => '/merchant/api-keys',
      transformResponse: (response: ApiResponse<MerchantApiKey[]>) =>
        response.data!,
      providesTags: ['User'],
    }),

    // Create API key
    createApiKey: builder.mutation<MerchantApiKey, CreateApiKeyRequest>({
      query: data => ({
        url: '/merchant/api-keys',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<MerchantApiKey>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Revoke API key
    revokeApiKey: builder.mutation<void, string>({
      query: keyId => ({
        url: `/merchant/api-keys/${keyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Get invoices with pagination and filters
    getInvoices: builder.query<
      PaginatedResponse<Invoice>,
      {
        page?: number
        limit?: number
        filters?: InvoiceFilters
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
        return `/merchant/invoices?${params.toString()}`
      },
      transformResponse: (response: PaginatedResponse<Invoice>) => response,
      providesTags: ['Invoice'],
    }),

    // Get invoice by ID
    getInvoiceById: builder.query<Invoice, string>({
      query: invoiceId => `/merchant/invoices/${invoiceId}`,
      transformResponse: (response: ApiResponse<Invoice>) => response.data!,
      providesTags: (result, error, invoiceId) => [
        { type: 'Invoice', id: invoiceId },
      ],
    }),

    // Create invoice
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: data => ({
        url: '/merchant/invoices',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Invoice>) => response.data!,
      invalidatesTags: ['Invoice'],
    }),

    // Cancel invoice
    cancelInvoice: builder.mutation<void, string>({
      query: invoiceId => ({
        url: `/merchant/invoices/${invoiceId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, invoiceId) => [
        { type: 'Invoice', id: invoiceId },
        'Invoice',
      ],
    }),

    // Get merchant analytics
    getMerchantAnalytics: builder.query<MerchantAnalytics, AnalyticsFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          )
        )
        return `/merchant/analytics?${params.toString()}`
      },
      transformResponse: (response: ApiResponse<MerchantAnalytics>) =>
        response.data!,
      providesTags: ['Analytics'],
    }),

    // Export merchant data
    exportMerchantData: builder.mutation<
      { downloadUrl: string },
      {
        type: 'invoices' | 'transactions' | 'analytics'
        format: 'csv' | 'json' | 'excel'
        filters?: Record<string, unknown>
      }
    >({
      query: data => ({
        url: '/merchant/export',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ downloadUrl: string }>) =>
        response.data!,
    }),

    // Get recent invoices (for dashboard)
    getRecentInvoices: builder.query<Invoice[], { limit?: number }>({
      query: ({ limit = 5 }) => `/merchant/invoices/recent?limit=${limit}`,
      transformResponse: (response: ApiResponse<Invoice[]>) => response.data!,
      providesTags: ['Invoice'],
    }),

    // Get pending invoices
    getPendingInvoices: builder.query<Invoice[], void>({
      query: () => '/merchant/invoices/pending',
      transformResponse: (response: ApiResponse<Invoice[]>) => response.data!,
      providesTags: ['Invoice'],
    }),

    // Verify merchant business
    submitVerificationDocuments: builder.mutation<void, FormData>({
      query: formData => ({
        url: '/merchant/verification',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get verification status
    getVerificationStatus: builder.query<
      {
        status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
        submittedAt?: string
        reviewedAt?: string
        rejectionReason?: string
      },
      void
    >({
      query: () => '/merchant/verification/status',
      transformResponse: (
        response: ApiResponse<{
          status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
          submittedAt?: string
          reviewedAt?: string
          rejectionReason?: string
        }>
      ) => response.data!,
      providesTags: ['User'],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetMerchantProfileQuery,
  useCreateMerchantProfileMutation,
  useUpdateMerchantProfileMutation,
  useUploadMerchantLogoMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useCancelInvoiceMutation,
  useGetMerchantAnalyticsQuery,
  useExportMerchantDataMutation,
  useGetRecentInvoicesQuery,
  useGetPendingInvoicesQuery,
  useSubmitVerificationDocumentsMutation,
  useGetVerificationStatusQuery,
} = merchantApi

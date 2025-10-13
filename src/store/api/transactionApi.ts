import { baseApi } from './baseApi'
import {
  Transaction,
  BlockchainType,
  TransactionStatus,
  ApiResponse,
} from '../../types'

// Transaction API request/response types
export interface CreateP2PTransactionRequest {
  fromAddress: string
  toAddress: string
  amount: string
  blockchain: BlockchainType
  fee?: string
  memo?: string
}

export interface TransactionFilters {
  blockchain?: BlockchainType
  status?: TransactionStatus
  type?: 'p2p' | 'merchant' | 'withdraw'
  fromDate?: string
  toDate?: string
  minAmount?: string
  maxAmount?: string
  address?: string
}

export interface PaginatedTransactions {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export interface TransactionEstimate {
  estimatedFee: string
  estimatedConfirmationTime: number
  networkFeeRate: string
}

export interface TransactionDetails extends Transaction {
  confirmations: number
  requiredConfirmations: number
  blockHeight?: number
  blockHash?: string
  gasUsed?: string
  gasPrice?: string
  nonce?: number
  inputs?: TransactionInput[]
  outputs?: TransactionOutput[]
}

export interface TransactionInput {
  address: string
  amount: string
  txHash: string
  outputIndex: number
}

export interface TransactionOutput {
  address: string
  amount: string
  scriptType?: string
}

export interface TransactionStats {
  totalTransactions: number
  totalVolume: string
  totalVolumeUSD: number
  successRate: number
  averageFee: string
  averageConfirmationTime: number
  transactionsByStatus: {
    status: TransactionStatus
    count: number
    percentage: number
  }[]
  transactionsByBlockchain: {
    blockchain: BlockchainType
    count: number
    volume: string
    volumeUSD: number
  }[]
}

// Transaction API endpoints
export const transactionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get user transactions with filters and pagination
    getUserTransactions: builder.query<
      PaginatedTransactions,
      {
        page?: number
        limit?: number
        filters?: TransactionFilters
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
        return `/transactions?${params.toString()}`
      },
      transformResponse: (response: ApiResponse<PaginatedTransactions>) =>
        response.data!,
      providesTags: ['Transaction'],
    }),

    // Get transaction by ID
    getTransactionById: builder.query<TransactionDetails, string>({
      query: transactionId => `/transactions/${transactionId}`,
      transformResponse: (response: ApiResponse<TransactionDetails>) =>
        response.data!,
      providesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
      ],
    }),

    // Create P2P transaction
    createP2PTransaction: builder.mutation<
      Transaction,
      CreateP2PTransactionRequest
    >({
      query: data => ({
        url: '/transactions/p2p',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transaction>) => response.data!,
      invalidatesTags: ['Transaction', 'Wallet'],
    }),

    // Estimate transaction fee
    estimateTransactionFee: builder.query<
      TransactionEstimate,
      {
        fromAddress: string
        toAddress: string
        amount: string
        blockchain: BlockchainType
      }
    >({
      query: data => ({
        url: '/transactions/estimate-fee',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<TransactionEstimate>) =>
        response.data!,
    }),

    // Cancel pending transaction
    cancelTransaction: builder.mutation<void, string>({
      query: transactionId => ({
        url: `/transactions/${transactionId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
        'Transaction',
      ],
    }),

    // Retry failed transaction
    retryTransaction: builder.mutation<Transaction, string>({
      query: transactionId => ({
        url: `/transactions/${transactionId}/retry`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Transaction>) => response.data!,
      invalidatesTags: (_result, _error, transactionId) => [
        { type: 'Transaction', id: transactionId },
        'Transaction',
      ],
    }),

    // Get transaction statistics
    getTransactionStats: builder.query<
      TransactionStats,
      {
        fromDate?: string
        toDate?: string
        blockchain?: BlockchainType
      }
    >({
      query: (filters = {}) => {
        const params = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined)
          )
        )
        return `/transactions/stats?${params.toString()}`
      },
      transformResponse: (response: ApiResponse<TransactionStats>) =>
        response.data!,
      providesTags: ['Transaction'],
    }),

    // Export transactions
    exportTransactions: builder.mutation<
      { downloadUrl: string },
      {
        format: 'csv' | 'json' | 'excel'
        filters?: TransactionFilters
        fromDate?: string
        toDate?: string
      }
    >({
      query: data => ({
        url: '/transactions/export',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ downloadUrl: string }>) =>
        response.data!,
    }),

    // Get recent transactions (for dashboard)
    getRecentTransactions: builder.query<Transaction[], { limit?: number }>({
      query: ({ limit = 5 }) => `/transactions/recent?limit=${limit}`,
      transformResponse: (response: ApiResponse<Transaction[]>) =>
        response.data!,
      providesTags: ['Transaction'],
    }),

    // Get pending transactions
    getPendingTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions/pending',
      transformResponse: (response: ApiResponse<Transaction[]>) =>
        response.data!,
      providesTags: ['Transaction'],
    }),

    // Get transaction by hash
    getTransactionByHash: builder.query<
      TransactionDetails,
      {
        txHash: string
        blockchain: BlockchainType
      }
    >({
      query: ({ txHash, blockchain }) =>
        `/transactions/by-hash/${txHash}?blockchain=${blockchain}`,
      transformResponse: (response: ApiResponse<TransactionDetails>) =>
        response.data!,
      providesTags: (_result, _error, { txHash }) => [
        { type: 'Transaction', id: txHash },
      ],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetUserTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateP2PTransactionMutation,
  useLazyEstimateTransactionFeeQuery,
  useCancelTransactionMutation,
  useRetryTransactionMutation,
  useGetTransactionStatsQuery,
  useExportTransactionsMutation,
  useGetRecentTransactionsQuery,
  useGetPendingTransactionsQuery,
  useGetTransactionByHashQuery,
} = transactionApi

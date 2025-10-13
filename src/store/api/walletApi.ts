import { baseApi } from './baseApi'
import {
  Wallet,
  BlockchainType,
  ApiResponse,
  TransactionFee,
} from '../../types'

// Wallet API request/response types
export interface CreateWalletRequest {
  blockchain: BlockchainType
  label?: string
}

export interface WalletBalance {
  address: string
  blockchain: BlockchainType
  balance: string
  usdValue: number
  lastUpdated: string
}

export interface GenerateAddressRequest {
  walletId: string
  blockchain: BlockchainType
}

export interface AddressInfo {
  address: string
  blockchain: BlockchainType
  qrCode: string
  isActive: boolean
  createdAt: string
}

export interface WalletSummary {
  totalBalanceUSD: number
  walletCount: number
  activeAddresses: number
  balancesByBlockchain: {
    blockchain: BlockchainType
    balance: string
    usdValue: number
  }[]
}

// Wallet API endpoints
export const walletApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get all user wallets
    getUserWallets: builder.query<Wallet[], void>({
      query: () => '/wallets',
      transformResponse: (response: ApiResponse<Wallet[]>) => response.data!,
      providesTags: ['Wallet'],
    }),

    // Get wallet by ID
    getWalletById: builder.query<Wallet, string>({
      query: walletId => `/wallets/${walletId}`,
      transformResponse: (response: ApiResponse<Wallet>) => response.data!,
      providesTags: (_result, _error, walletId) => [
        { type: 'Wallet', id: walletId },
      ],
    }),

    // Create new wallet
    createWallet: builder.mutation<Wallet, CreateWalletRequest>({
      query: data => ({
        url: '/wallets',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Wallet>) => response.data!,
      invalidatesTags: ['Wallet'],
    }),

    // Get wallet balance
    getWalletBalance: builder.query<
      WalletBalance,
      { address: string; blockchain: BlockchainType }
    >({
      query: ({ address, blockchain }) =>
        `/wallets/balance?address=${address}&blockchain=${blockchain}`,
      transformResponse: (response: ApiResponse<WalletBalance>) =>
        response.data!,
      providesTags: (_result, _error, { address }) => [
        { type: 'Wallet', id: address },
      ],
    }),

    // Get wallet balances for multiple addresses
    getMultipleWalletBalances: builder.query<WalletBalance[], string[]>({
      query: addresses => ({
        url: '/wallets/balances',
        method: 'POST',
        body: { addresses },
      }),
      transformResponse: (response: ApiResponse<WalletBalance[]>) =>
        response.data!,
      providesTags: ['Wallet'],
    }),

    // Generate new address for wallet
    generateAddress: builder.mutation<AddressInfo, GenerateAddressRequest>({
      query: data => ({
        url: '/wallets/generate-address',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AddressInfo>) => response.data!,
      invalidatesTags: ['Wallet'],
    }),

    // Get wallet addresses
    getWalletAddresses: builder.query<AddressInfo[], string>({
      query: walletId => `/wallets/${walletId}/addresses`,
      transformResponse: (response: ApiResponse<AddressInfo[]>) =>
        response.data!,
      providesTags: (_result, _error, walletId) => [
        { type: 'Wallet', id: walletId },
      ],
    }),

    // Get wallet summary
    getWalletSummary: builder.query<WalletSummary, void>({
      query: () => '/wallets/summary',
      transformResponse: (response: ApiResponse<WalletSummary>) =>
        response.data!,
      providesTags: ['Wallet'],
    }),

    // Update wallet label
    updateWalletLabel: builder.mutation<
      Wallet,
      { walletId: string; label: string }
    >({
      query: ({ walletId, label }) => ({
        url: `/wallets/${walletId}`,
        method: 'PATCH',
        body: { label },
      }),
      transformResponse: (response: ApiResponse<Wallet>) => response.data!,
      invalidatesTags: (_result, _error, { walletId }) => [
        { type: 'Wallet', id: walletId },
      ],
    }),

    // Deactivate wallet
    deactivateWallet: builder.mutation<void, string>({
      query: walletId => ({
        url: `/wallets/${walletId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, walletId) => [
        { type: 'Wallet', id: walletId },
      ],
    }),

    // Activate wallet
    activateWallet: builder.mutation<void, string>({
      query: walletId => ({
        url: `/wallets/${walletId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, walletId) => [
        { type: 'Wallet', id: walletId },
      ],
    }),

    // Validate address
    validateAddress: builder.query<
      { valid: boolean; blockchain?: BlockchainType },
      { address: string; blockchain: BlockchainType }
    >({
      query: ({ address, blockchain }) =>
        `/wallets/validate-address?address=${encodeURIComponent(address)}&blockchain=${blockchain}`,
      transformResponse: (
        response: ApiResponse<{ valid: boolean; blockchain?: BlockchainType }>
      ) => response.data!,
    }),

    // Get transaction fees for blockchain
    getTransactionFees: builder.query<TransactionFee, BlockchainType>({
      query: blockchain => `/wallets/transaction-fees/${blockchain}`,
      transformResponse: (response: ApiResponse<TransactionFee>) =>
        response.data!,
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetUserWalletsQuery,
  useGetWalletByIdQuery,
  useCreateWalletMutation,
  useGetWalletBalanceQuery,
  useGetMultipleWalletBalancesQuery,
  useGenerateAddressMutation,
  useGetWalletAddressesQuery,
  useGetWalletSummaryQuery,
  useUpdateWalletLabelMutation,
  useDeactivateWalletMutation,
  useActivateWalletMutation,
  useLazyValidateAddressQuery,
  useGetTransactionFeesQuery,
} = walletApi

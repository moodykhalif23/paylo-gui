import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Wallet, BlockchainType } from '../../types'
import { BalanceUpdateMessage } from '../../types/websocket'

// ============================================================================
// Initial State
// ============================================================================

interface WalletState {
  wallets: Record<string, Wallet>
  userWallets: string[] // Wallet IDs for current user
  balanceHistory: Array<{
    walletId: string
    address: string
    blockchain: BlockchainType
    previousBalance: string
    newBalance: string
    previousUsdValue: number
    newUsdValue: number
    timestamp: string
    transactionId?: string
  }>
  totalUsdValue: number
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: WalletState = {
  wallets: {},
  userWallets: [],
  balanceHistory: [],
  totalUsdValue: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// ============================================================================
// Wallet Slice
// ============================================================================

const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },

    // Wallet management
    setWallets: (state, action: PayloadAction<Wallet[]>) => {
      const wallets = action.payload
      state.wallets = {}
      state.userWallets = []
      state.totalUsdValue = 0

      wallets.forEach(wallet => {
        state.wallets[wallet.id] = wallet
        state.userWallets.push(wallet.id)
        state.totalUsdValue += wallet.usdValue
      })

      state.lastUpdated = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },

    addWallet: (state, action: PayloadAction<Wallet>) => {
      const wallet = action.payload
      state.wallets[wallet.id] = wallet

      if (!state.userWallets.includes(wallet.id)) {
        state.userWallets.push(wallet.id)
      }

      state.totalUsdValue += wallet.usdValue
      state.lastUpdated = new Date().toISOString()
    },

    updateWallet: (
      state,
      action: PayloadAction<Partial<Wallet> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload

      if (state.wallets[id]) {
        const oldUsdValue = state.wallets[id].usdValue

        state.wallets[id] = {
          ...state.wallets[id],
          ...updates,
        }

        // Update total USD value
        const newUsdValue = state.wallets[id].usdValue
        state.totalUsdValue = state.totalUsdValue - oldUsdValue + newUsdValue

        state.lastUpdated = new Date().toISOString()
      }
    },

    // Real-time balance updates
    handleBalanceUpdate: (
      state,
      action: PayloadAction<BalanceUpdateMessage>
    ) => {
      const update = action.payload
      const existingWallet = state.wallets[update.walletId]

      if (existingWallet) {
        // Store balance history
        state.balanceHistory.unshift({
          walletId: update.walletId,
          address: update.address,
          blockchain: update.blockchain,
          previousBalance: update.previousBalance,
          newBalance: update.balance,
          previousUsdValue: update.previousUsdValue,
          newUsdValue: update.usdValue,
          timestamp: update.lastUpdated,
          transactionId: update.transactionId,
        })

        // Keep only last 100 balance updates
        if (state.balanceHistory.length > 100) {
          state.balanceHistory = state.balanceHistory.slice(0, 100)
        }

        // Update wallet balance
        const oldUsdValue = existingWallet.usdValue

        state.wallets[update.walletId] = {
          ...existingWallet,
          balance: update.balance,
          usdValue: update.usdValue,
        }

        // Update total USD value
        state.totalUsdValue =
          state.totalUsdValue - oldUsdValue + update.usdValue
      } else {
        // Create new wallet if it doesn't exist
        const newWallet: Wallet = {
          id: update.walletId,
          userId: update.userId,
          blockchain: update.blockchain,
          address: update.address,
          balance: update.balance,
          usdValue: update.usdValue,
          isActive: true,
          isWatchOnly: false,
          createdAt: update.lastUpdated,
          updatedAt: update.lastUpdated,
        }

        state.wallets[update.walletId] = newWallet
        state.userWallets.push(update.walletId)
        state.totalUsdValue += update.usdValue
      }

      state.lastUpdated = new Date().toISOString()
    },

    // Wallet operations
    activateWallet: (state, action: PayloadAction<string>) => {
      const walletId = action.payload
      if (state.wallets[walletId]) {
        state.wallets[walletId].isActive = true
      }
    },

    deactivateWallet: (state, action: PayloadAction<string>) => {
      const walletId = action.payload
      if (state.wallets[walletId]) {
        state.wallets[walletId].isActive = false
      }
    },

    // Clear data
    clearWallets: state => {
      state.wallets = {}
      state.userWallets = []
      state.balanceHistory = []
      state.totalUsdValue = 0
      state.lastUpdated = null
    },

    clearBalanceHistory: state => {
      state.balanceHistory = []
    },
  },
})

// ============================================================================
// Actions
// ============================================================================

export const {
  setLoading,
  setError,
  setWallets,
  addWallet,
  updateWallet,
  handleBalanceUpdate,
  activateWallet,
  deactivateWallet,
  clearWallets,
  clearBalanceHistory,
} = walletSlice.actions

// ============================================================================
// Selectors
// ============================================================================

export const selectWalletState = (state: { wallets: WalletState }) =>
  state.wallets

export const selectAllWallets = (state: { wallets: WalletState }) =>
  state.wallets.userWallets.map(id => state.wallets.wallets[id])

export const selectActiveWallets = (state: { wallets: WalletState }) =>
  state.wallets.userWallets
    .map(id => state.wallets.wallets[id])
    .filter(wallet => wallet.isActive)

export const selectWalletById =
  (walletId: string) => (state: { wallets: WalletState }) =>
    state.wallets.wallets[walletId]

export const selectWalletsByBlockchain =
  (blockchain: BlockchainType) => (state: { wallets: WalletState }) =>
    state.wallets.userWallets
      .map(id => state.wallets.wallets[id])
      .filter(wallet => wallet.blockchain === blockchain)

export const selectWalletByAddress =
  (address: string) => (state: { wallets: WalletState }) =>
    state.wallets.userWallets
      .map(id => state.wallets.wallets[id])
      .find(wallet => wallet.address === address)

export const selectTotalUsdValue = (state: { wallets: WalletState }) =>
  state.wallets.totalUsdValue

export const selectBalanceHistory = (state: { wallets: WalletState }) =>
  state.wallets.balanceHistory

export const selectRecentBalanceUpdates =
  (limit: number = 10) =>
  (state: { wallets: WalletState }) =>
    state.wallets.balanceHistory.slice(0, limit)

export const selectWalletBalanceHistory =
  (walletId: string) => (state: { wallets: WalletState }) =>
    state.wallets.balanceHistory.filter(update => update.walletId === walletId)

export const selectBlockchainBalances = (state: { wallets: WalletState }) => {
  const wallets = state.wallets.userWallets.map(id => state.wallets.wallets[id])
  const balances: Record<
    BlockchainType,
    { balance: string; usdValue: number; count: number }
  > = {
    bitcoin: { balance: '0', usdValue: 0, count: 0 },
    ethereum: { balance: '0', usdValue: 0, count: 0 },
    solana: { balance: '0', usdValue: 0, count: 0 },
  }

  wallets.forEach(wallet => {
    if (wallet.isActive) {
      balances[wallet.blockchain].usdValue += wallet.usdValue
      balances[wallet.blockchain].count += 1
      // Note: We can't sum balances directly as they're in different units
      // This would need to be handled differently for each blockchain
    }
  })

  return balances
}

export const selectWalletStats = (state: { wallets: WalletState }) => {
  const wallets = state.wallets.userWallets.map(id => state.wallets.wallets[id])

  return {
    total: wallets.length,
    active: wallets.filter(w => w.isActive).length,
    inactive: wallets.filter(w => !w.isActive).length,
    totalUsdValue: state.wallets.totalUsdValue,
    blockchainCount: {
      bitcoin: wallets.filter(w => w.blockchain === 'bitcoin').length,
      ethereum: wallets.filter(w => w.blockchain === 'ethereum').length,
      solana: wallets.filter(w => w.blockchain === 'solana').length,
    },
  }
}

export const selectIsWalletLoading = (state: { wallets: WalletState }) =>
  state.wallets.isLoading

export const selectWalletError = (state: { wallets: WalletState }) =>
  state.wallets.error

export const selectLastWalletUpdate = (state: { wallets: WalletState }) =>
  state.wallets.lastUpdated

// ============================================================================
// Export
// ============================================================================

export default walletSlice.reducer

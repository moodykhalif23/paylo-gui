import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Transaction, TransactionStatus, BlockchainType } from '../../types'
import { TransactionUpdateMessage } from '../../types/websocket'

// ============================================================================
// Initial State
// ============================================================================

interface TransactionState {
  transactions: Record<string, Transaction>
  userTransactions: string[] // Transaction IDs for current user
  recentUpdates: Array<{
    transactionId: string
    timestamp: string
    previousStatus: TransactionStatus
    newStatus: TransactionStatus
  }>
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: TransactionState = {
  transactions: {},
  userTransactions: [],
  recentUpdates: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// ============================================================================
// Transaction Slice
// ============================================================================

const transactionSlice = createSlice({
  name: 'transactions',
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

    // Transaction management
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      const transactions = action.payload
      state.transactions = {}
      state.userTransactions = []

      transactions.forEach(transaction => {
        state.transactions[transaction.id] = transaction
        state.userTransactions.push(transaction.id)
      })

      state.lastUpdated = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },

    addTransaction: (state, action: PayloadAction<Transaction>) => {
      const transaction = action.payload
      state.transactions[transaction.id] = transaction

      if (!state.userTransactions.includes(transaction.id)) {
        state.userTransactions.unshift(transaction.id)
      }

      state.lastUpdated = new Date().toISOString()
    },

    updateTransaction: (
      state,
      action: PayloadAction<Partial<Transaction> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload

      if (state.transactions[id]) {
        state.transactions[id] = {
          ...state.transactions[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        state.lastUpdated = new Date().toISOString()
      }
    },

    // Real-time transaction updates
    handleTransactionUpdate: (
      state,
      action: PayloadAction<TransactionUpdateMessage>
    ) => {
      const update = action.payload
      const existingTransaction = state.transactions[update.transactionId]

      if (existingTransaction) {
        // Update existing transaction
        const previousStatus = existingTransaction.status

        state.transactions[update.transactionId] = {
          ...existingTransaction,
          status: update.status,
          confirmations: update.confirmations,
          txHash: update.txHash || existingTransaction.txHash,
          updatedAt: update.updatedAt,
          metadata: {
            ...existingTransaction.metadata,
            blockHeight: update.blockHeight,
            failureReason: update.failureReason,
            estimatedConfirmationTime: update.estimatedConfirmationTime,
          },
        }

        // Add to recent updates
        state.recentUpdates.unshift({
          transactionId: update.transactionId,
          timestamp: update.updatedAt,
          previousStatus,
          newStatus: update.status,
        })

        // Keep only last 50 updates
        if (state.recentUpdates.length > 50) {
          state.recentUpdates = state.recentUpdates.slice(0, 50)
        }
      }

      state.lastUpdated = new Date().toISOString()
    },

    // Filter and search
    filterTransactionsByStatus: (
      _state,
      _action: PayloadAction<TransactionStatus[]>
    ) => {
      // This would be handled by selectors, but we can store filter state if needed
    },

    filterTransactionsByBlockchain: (
      _state,
      _action: PayloadAction<BlockchainType[]>
    ) => {
      // This would be handled by selectors, but we can store filter state if needed
    },

    // Clear data
    clearTransactions: state => {
      state.transactions = {}
      state.userTransactions = []
      state.recentUpdates = []
      state.lastUpdated = null
    },

    clearRecentUpdates: state => {
      state.recentUpdates = []
    },
  },
})

// ============================================================================
// Actions
// ============================================================================

export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  updateTransaction,
  handleTransactionUpdate,
  filterTransactionsByStatus,
  filterTransactionsByBlockchain,
  clearTransactions,
  clearRecentUpdates,
} = transactionSlice.actions

// ============================================================================
// Selectors
// ============================================================================

export const selectTransactionState = (state: {
  transactions: TransactionState
}) => state.transactions

export const selectAllTransactions = (state: {
  transactions: TransactionState
}) =>
  state.transactions.userTransactions.map(
    id => state.transactions.transactions[id]
  )

export const selectTransactionById =
  (transactionId: string) => (state: { transactions: TransactionState }) =>
    state.transactions.transactions[transactionId]

export const selectTransactionsByStatus =
  (status: TransactionStatus) => (state: { transactions: TransactionState }) =>
    state.transactions.userTransactions
      .map(id => state.transactions.transactions[id])
      .filter(transaction => transaction.status === status)

export const selectTransactionsByBlockchain =
  (blockchain: BlockchainType) => (state: { transactions: TransactionState }) =>
    state.transactions.userTransactions
      .map(id => state.transactions.transactions[id])
      .filter(transaction => transaction.blockchain === blockchain)

export const selectPendingTransactions = (state: {
  transactions: TransactionState
}) =>
  state.transactions.userTransactions
    .map(id => state.transactions.transactions[id])
    .filter(transaction => transaction.status === 'pending')

export const selectRecentTransactionUpdates = (state: {
  transactions: TransactionState
}) => state.transactions.recentUpdates

export const selectTransactionStats = (state: {
  transactions: TransactionState
}) => {
  const transactions = state.transactions.userTransactions.map(
    id => state.transactions.transactions[id]
  )

  return {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    confirmed: transactions.filter(t => t.status === 'confirmed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    cancelled: transactions.filter(t => t.status === 'cancelled').length,
  }
}

export const selectIsTransactionLoading = (state: {
  transactions: TransactionState
}) => state.transactions.isLoading

export const selectTransactionError = (state: {
  transactions: TransactionState
}) => state.transactions.error

export const selectLastTransactionUpdate = (state: {
  transactions: TransactionState
}) => state.transactions.lastUpdated

// ============================================================================
// Export
// ============================================================================

export default transactionSlice.reducer

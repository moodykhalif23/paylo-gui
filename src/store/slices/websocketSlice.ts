import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  WebSocketState,
  WebSocketMetrics,
  WebSocketChannel,
  WebSocketMessage,
} from '../../types/websocket'

// ============================================================================
// Initial State
// ============================================================================

interface WebSocketSliceState extends WebSocketState {
  metrics: WebSocketMetrics
  subscribedChannels: WebSocketChannel[]
  connectionHistory: Array<{
    timestamp: string
    event: 'connected' | 'disconnected' | 'error'
    details?: string
  }>
  lastMessage?: WebSocketMessage
  pendingSubscriptions: WebSocketChannel[]
}

const initialState: WebSocketSliceState = {
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  lastConnectedAt: undefined,
  lastDisconnectedAt: undefined,
  error: undefined,
  metrics: {
    messagesReceived: 0,
    messagesSent: 0,
    reconnectCount: 0,
    averageLatency: 0,
    lastHeartbeat: '',
    connectionUptime: 0,
  },
  subscribedChannels: [],
  connectionHistory: [],
  lastMessage: undefined,
  pendingSubscriptions: [],
}

// ============================================================================
// WebSocket Slice
// ============================================================================

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Connection state actions
    setConnecting: state => {
      state.isConnecting = true
      state.error = undefined
    },

    setConnected: (state, action: PayloadAction<{ timestamp: string }>) => {
      state.isConnected = true
      state.isConnecting = false
      state.lastConnectedAt = action.payload.timestamp
      state.reconnectAttempts = 0
      state.error = undefined

      // Add to connection history
      state.connectionHistory.unshift({
        timestamp: action.payload.timestamp,
        event: 'connected',
      })

      // Keep only last 50 connection events
      if (state.connectionHistory.length > 50) {
        state.connectionHistory = state.connectionHistory.slice(0, 50)
      }
    },

    setDisconnected: (
      state,
      action: PayloadAction<{
        timestamp: string
        reason?: string
      }>
    ) => {
      state.isConnected = false
      state.isConnecting = false
      state.lastDisconnectedAt = action.payload.timestamp

      // Clear subscriptions on disconnect
      state.subscribedChannels = []

      // Add to connection history
      state.connectionHistory.unshift({
        timestamp: action.payload.timestamp,
        event: 'disconnected',
        details: action.payload.reason,
      })

      // Keep only last 50 connection events
      if (state.connectionHistory.length > 50) {
        state.connectionHistory = state.connectionHistory.slice(0, 50)
      }
    },

    setError: (
      state,
      action: PayloadAction<{
        error: string
        timestamp: string
      }>
    ) => {
      state.error = action.payload.error
      state.isConnecting = false

      // Add to connection history
      state.connectionHistory.unshift({
        timestamp: action.payload.timestamp,
        event: 'error',
        details: action.payload.error,
      })

      // Keep only last 50 connection events
      if (state.connectionHistory.length > 50) {
        state.connectionHistory = state.connectionHistory.slice(0, 50)
      }
    },

    incrementReconnectAttempts: state => {
      state.reconnectAttempts++
    },

    resetReconnectAttempts: state => {
      state.reconnectAttempts = 0
    },

    // Metrics actions
    updateMetrics: (
      state,
      action: PayloadAction<Partial<WebSocketMetrics>>
    ) => {
      state.metrics = { ...state.metrics, ...action.payload }
    },

    incrementMessagesReceived: state => {
      state.metrics.messagesReceived++
    },

    incrementMessagesSent: state => {
      state.metrics.messagesSent++
    },

    updateLatency: (state, action: PayloadAction<number>) => {
      const newLatency = action.payload
      if (state.metrics.averageLatency === 0) {
        state.metrics.averageLatency = newLatency
      } else {
        state.metrics.averageLatency =
          (state.metrics.averageLatency + newLatency) / 2
      }
    },

    updateHeartbeat: (state, action: PayloadAction<string>) => {
      state.metrics.lastHeartbeat = action.payload
    },

    // Subscription actions
    addSubscription: (state, action: PayloadAction<WebSocketChannel>) => {
      const channel = action.payload
      if (!state.subscribedChannels.includes(channel)) {
        state.subscribedChannels.push(channel)
      }

      // Remove from pending subscriptions
      state.pendingSubscriptions = state.pendingSubscriptions.filter(
        c => c !== channel
      )
    },

    removeSubscription: (state, action: PayloadAction<WebSocketChannel>) => {
      const channel = action.payload
      state.subscribedChannels = state.subscribedChannels.filter(
        c => c !== channel
      )
    },

    addPendingSubscription: (
      state,
      action: PayloadAction<WebSocketChannel>
    ) => {
      const channel = action.payload
      if (!state.pendingSubscriptions.includes(channel)) {
        state.pendingSubscriptions.push(channel)
      }
    },

    clearSubscriptions: state => {
      state.subscribedChannels = []
      state.pendingSubscriptions = []
    },

    // Message actions
    setLastMessage: (state, action: PayloadAction<WebSocketMessage>) => {
      state.lastMessage = action.payload
    },

    // Reset state
    resetWebSocketState: () => initialState,
  },
})

// ============================================================================
// Actions
// ============================================================================

export const {
  setConnecting,
  setConnected,
  setDisconnected,
  setError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  updateMetrics,
  incrementMessagesReceived,
  incrementMessagesSent,
  updateLatency,
  updateHeartbeat,
  addSubscription,
  removeSubscription,
  addPendingSubscription,
  clearSubscriptions,
  setLastMessage,
  resetWebSocketState,
} = websocketSlice.actions

// ============================================================================
// Selectors
// ============================================================================

export const selectWebSocketState = (state: {
  websocket: WebSocketSliceState
}) => state.websocket

export const selectIsConnected = (state: { websocket: WebSocketSliceState }) =>
  state.websocket.isConnected

export const selectIsConnecting = (state: { websocket: WebSocketSliceState }) =>
  state.websocket.isConnecting

export const selectConnectionStatus = (state: {
  websocket: WebSocketSliceState
}) => {
  const { isConnected, isConnecting, error } = state.websocket

  if (error) return 'error'
  if (isConnecting) return 'connecting'
  if (isConnected) return 'connected'
  return 'disconnected'
}

export const selectWebSocketMetrics = (state: {
  websocket: WebSocketSliceState
}) => state.websocket.metrics

export const selectSubscribedChannels = (state: {
  websocket: WebSocketSliceState
}) => state.websocket.subscribedChannels

export const selectConnectionHistory = (state: {
  websocket: WebSocketSliceState
}) => state.websocket.connectionHistory

export const selectLastMessage = (state: { websocket: WebSocketSliceState }) =>
  state.websocket.lastMessage

export const selectReconnectAttempts = (state: {
  websocket: WebSocketSliceState
}) => state.websocket.reconnectAttempts

export const selectWebSocketError = (state: {
  websocket: WebSocketSliceState
}) => state.websocket.error

// ============================================================================
// Export
// ============================================================================

export default websocketSlice.reducer

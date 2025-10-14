import { EventEmitter } from 'events'
import { store } from '../../store'
import { webSocketService } from '../websocket/WebSocketService'
import {
  WebSocketMessage,
  TransactionUpdateMessage,
  BalanceUpdateMessage,
  SystemAlertMessage,
  WebSocketChannel,
} from '../../types/websocket'

// Redux actions
import { handleTransactionUpdate } from '../../store/slices/transactionSlice'
import { handleBalanceUpdate } from '../../store/slices/walletSlice'
import {
  handleSystemAlert,
  updateSystemMetrics,
  updateServiceStatus,
  setConnectionStatus,
} from '../../store/slices/systemSlice'
import {
  setConnected,
  setDisconnected,
  setError,
  incrementMessagesReceived,
  setLastMessage,
} from '../../store/slices/websocketSlice'

/**
 * Real-time data service that manages WebSocket connections and updates Redux store
 */
export class RealTimeDataService extends EventEmitter {
  private isInitialized = false
  private subscribedChannels: Set<WebSocketChannel> = new Set()
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> =
    new Map()

  constructor() {
    super()
    this.setupMessageHandlers()
  }

  /**
   * Initialize the real-time data service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // Set up WebSocket event listeners
      this.setupWebSocketListeners()

      // Connect to WebSocket server
      await webSocketService.connect()

      this.isInitialized = true
      this.emit('initialized')
    } catch (error) {
      console.error('Failed to initialize real-time data service:', error)
      throw error
    }
  }

  /**
   * Shutdown the real-time data service
   */
  shutdown(): void {
    if (!this.isInitialized) {
      return
    }

    // Disconnect WebSocket
    webSocketService.disconnect()

    // Clear subscriptions
    this.subscribedChannels.clear()

    // Remove event listeners
    webSocketService.removeAllListeners()

    this.isInitialized = false
    this.emit('shutdown')
  }

  /**
   * Subscribe to real-time updates for specific channels
   */
  subscribeToChannels(
    channels: WebSocketChannel[],
    filters?: Record<string, unknown>
  ): void {
    if (!this.isInitialized) {
      console.warn('Real-time service not initialized')
      return
    }

    // Subscribe to WebSocket channels
    webSocketService.subscribe(channels, filters)

    // Track subscribed channels
    channels.forEach(channel => this.subscribedChannels.add(channel))

    this.emit('subscribed', channels)
  }

  /**
   * Unsubscribe from real-time updates for specific channels
   */
  unsubscribeFromChannels(channels: WebSocketChannel[]): void {
    if (!this.isInitialized) {
      return
    }

    // Unsubscribe from WebSocket channels
    webSocketService.unsubscribe(channels)

    // Remove from tracked channels
    channels.forEach(channel => this.subscribedChannels.delete(channel))

    this.emit('unsubscribed', channels)
  }

  /**
   * Subscribe to user-specific real-time updates
   */
  subscribeToUserUpdates(userId: string): void {
    const channels: WebSocketChannel[] = [
      'user_transactions',
      'user_balances',
      'user_notifications',
    ]

    this.subscribeToChannels(channels, { userId })
  }

  /**
   * Subscribe to merchant-specific real-time updates
   */
  subscribeToMerchantUpdates(merchantId: string): void {
    const channels: WebSocketChannel[] = [
      'merchant_invoices',
      'merchant_analytics',
      'user_transactions', // Merchant transactions
      'user_balances', // Merchant wallets
    ]

    this.subscribeToChannels(channels, { merchantId })
  }

  /**
   * Subscribe to admin-specific real-time updates
   */
  subscribeToAdminUpdates(): void {
    const channels: WebSocketChannel[] = [
      'system_alerts',
      'system_health',
      'admin_notifications',
      'global_announcements',
    ]

    this.subscribeToChannels(channels)
  }

  /**
   * Get current subscription status
   */
  getSubscriptions(): WebSocketChannel[] {
    return Array.from(this.subscribedChannels)
  }

  /**
   * Check if service is initialized and connected
   */
  isConnected(): boolean {
    return this.isInitialized && webSocketService.getState().isConnected
  }

  /**
   * Get WebSocket connection metrics
   */
  getMetrics() {
    return webSocketService.getMetrics()
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupWebSocketListeners(): void {
    // Connection events
    webSocketService.on('connect', () => {
      store.dispatch(setConnected({ timestamp: new Date().toISOString() }))
      store.dispatch(setConnectionStatus('connected'))
      this.emit('connected')
    })

    webSocketService.on('disconnect', (reason: string) => {
      store.dispatch(
        setDisconnected({
          timestamp: new Date().toISOString(),
          reason,
        })
      )
      store.dispatch(setConnectionStatus('disconnected'))
      this.emit('disconnected', reason)
    })

    webSocketService.on('error', (error: Error) => {
      store.dispatch(
        setError({
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      )
      this.emit('error', error)
    })

    webSocketService.on('reconnect', (attempt: number) => {
      store.dispatch(setConnectionStatus('reconnecting'))
      this.emit('reconnecting', attempt)
    })

    // Message handling
    webSocketService.on('message', (message: WebSocketMessage) => {
      store.dispatch(incrementMessagesReceived())
      store.dispatch(setLastMessage(message))

      this.handleMessage(message)
    })

    // Authentication events
    webSocketService.on('authenticated', (userId: string) => {
      this.emit('authenticated', userId)
    })
  }

  /**
   * Setup message handlers for different message types
   */
  private setupMessageHandlers(): void {
    // Transaction updates
    this.messageHandlers.set(
      'transaction_update',
      (message: WebSocketMessage) => {
        const payload = message.payload as TransactionUpdateMessage
        store.dispatch(handleTransactionUpdate(payload))
        this.emit('transaction_update', payload)
      }
    )

    // Balance updates
    this.messageHandlers.set('balance_update', (message: WebSocketMessage) => {
      const payload = message.payload as BalanceUpdateMessage
      store.dispatch(handleBalanceUpdate(payload))
      this.emit('balance_update', payload)
    })

    // System alerts
    this.messageHandlers.set('system_alert', (message: WebSocketMessage) => {
      const payload = message.payload as SystemAlertMessage
      store.dispatch(handleSystemAlert(payload))
      this.emit('system_alert', payload)
    })

    // System health updates
    this.messageHandlers.set('system_health', (message: WebSocketMessage) => {
      const payload = message.payload as Record<string, unknown> // System health payload

      if (payload.type === 'metrics') {
        store.dispatch(updateSystemMetrics(payload.data))
      } else if (payload.type === 'service_status') {
        store.dispatch(updateServiceStatus(payload.data))
      }

      this.emit('system_health', payload)
    })

    // Invoice updates
    this.messageHandlers.set('invoice_update', (message: WebSocketMessage) => {
      // Handle invoice updates (could be added to a future invoice slice)
      this.emit('invoice_update', message.payload)
    })

    this.messageHandlers.set('invoice_paid', (message: WebSocketMessage) => {
      // Handle invoice paid events
      this.emit('invoice_paid', message.payload)
    })

    // Notification messages
    this.messageHandlers.set(
      'user_notification',
      (message: WebSocketMessage) => {
        // Handle user notifications (already handled by notification slice)
        this.emit('user_notification', message.payload)
      }
    )

    this.messageHandlers.set(
      'merchant_notification',
      (message: WebSocketMessage) => {
        // Handle merchant notifications
        this.emit('merchant_notification', message.payload)
      }
    )

    this.messageHandlers.set(
      'admin_notification',
      (message: WebSocketMessage) => {
        // Handle admin notifications
        this.emit('admin_notification', message.payload)
      }
    )
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type)

    if (handler) {
      try {
        handler(message)
      } catch (error) {
        console.error(`Error handling message type ${message.type}:`, error)
        this.emit('message_error', { message, error })
      }
    } else {
      console.warn(`No handler for message type: ${message.type}`)
      this.emit('unhandled_message', message)
    }
  }

  /**
   * Authenticate with WebSocket server
   */
  authenticate(token: string, userId: string): void {
    if (!this.isInitialized) {
      console.warn('Cannot authenticate: service not initialized')
      return
    }

    webSocketService.authenticate(token, userId)
  }

  /**
   * Send a message through WebSocket
   */
  sendMessage<T>(type: string, payload: T): void {
    if (!this.isInitialized) {
      console.warn('Cannot send message: service not initialized')
      return
    }

    webSocketService.send(type as string, payload)
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService()
export default realTimeDataService

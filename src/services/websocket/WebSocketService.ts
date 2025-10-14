import { EventEmitter } from 'events'
import {
  WebSocketConfig,
  WebSocketState,
  WebSocketMessage,
  WebSocketMessageType,
  WebSocketChannel,
  WebSocketService as IWebSocketService,
  WebSocketMetrics,
  WebSocketQueueItem,
  AuthenticationMessage,
  HeartbeatMessage,
  AuthenticationResponseMessage,
  ConnectionStatusMessage,
} from '../../types/websocket'
import { config } from '../../config/environment'

/**
 * WebSocket service implementation with auto-reconnection and message handling
 */
export class WebSocketService
  extends EventEmitter
  implements IWebSocketService
{
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private state: WebSocketState
  private metrics: WebSocketMetrics
  private messageQueue: WebSocketQueueItem[] = []
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isAuthenticated = false
  private subscribedChannels: Set<WebSocketChannel> = new Set()

  constructor() {
    super()
    this.config = {
      url: config.api.wsUrl,
      protocols: [],
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      timeout: 10000,
    }

    this.state = {
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
    }

    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      reconnectCount: 0,
      averageLatency: 0,
      lastHeartbeat: '',
      connectionUptime: 0,
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(customConfig?: Partial<WebSocketConfig>): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return
    }

    if (customConfig) {
      this.config = { ...this.config, ...customConfig }
    }

    this.state.isConnecting = true
    this.emit('connecting')

    try {
      await this.createConnection()
    } catch (error) {
      this.state.isConnecting = false
      this.handleConnectionError(error as Error)
      throw error
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers()
    this.state.isConnecting = false
    this.isAuthenticated = false
    this.subscribedChannels.clear()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.updateConnectionState(false)
  }

  /**
   * Send message to WebSocket server
   */
  send<T>(type: WebSocketMessageType, payload: T): void {
    const message: WebSocketMessage<T> = {
      id: this.generateMessageId(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    if (this.state.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage(message)
    } else {
      this.queueMessage(message)
    }
  }

  /**
   * Subscribe to WebSocket channels
   */
  subscribe(
    channels: WebSocketChannel[],
    filters?: Record<string, unknown>
  ): void {
    if (!this.isAuthenticated) {
      console.warn('Cannot subscribe to channels: not authenticated')
      return
    }

    this.send('subscription', {
      action: 'subscribe',
      channels,
      filters,
    })

    channels.forEach(channel => this.subscribedChannels.add(channel))
  }

  /**
   * Unsubscribe from WebSocket channels
   */
  unsubscribe(channels: WebSocketChannel[]): void {
    this.send('subscription', {
      action: 'unsubscribe',
      channels,
    })

    channels.forEach(channel => this.subscribedChannels.delete(channel))
  }

  /**
   * Get current WebSocket state
   */
  getState(): WebSocketState {
    return { ...this.state }
  }

  /**
   * Get WebSocket metrics
   */
  getMetrics(): WebSocketMetrics {
    return { ...this.metrics }
  }

  /**
   * Authenticate with the WebSocket server
   */
  authenticate(token: string, userId: string): void {
    if (!this.state.isConnected) {
      console.warn('Cannot authenticate: not connected')
      return
    }

    const authMessage: AuthenticationMessage = {
      token,
      userId,
      sessionId: this.generateSessionId(),
    }

    this.send('authentication', authMessage)
  }

  /**
   * Create WebSocket connection
   */
  private async createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols)

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'))
        }, this.config.timeout)

        this.ws.onopen = () => {
          clearTimeout(timeout)
          this.handleConnectionOpen()
          resolve()
        }

        this.ws.onclose = event => {
          clearTimeout(timeout)
          this.handleConnectionClose(event)
        }

        this.ws.onerror = error => {
          clearTimeout(timeout)
          this.handleConnectionError(error as ErrorEvent)
          reject(error)
        }

        this.ws.onmessage = event => {
          this.handleMessage(event)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Handle WebSocket connection open
   */
  private handleConnectionOpen(): void {
    this.updateConnectionState(true)
    this.state.reconnectAttempts = 0
    this.startHeartbeat()
    this.processMessageQueue()
    this.emit('connect')
  }

  /**
   * Handle WebSocket connection close
   */
  private handleConnectionClose(event: CloseEvent): void {
    this.updateConnectionState(false)
    this.clearTimers()
    this.isAuthenticated = false

    const reason = event.reason || 'Connection closed'
    this.emit('disconnect', reason)

    // Auto-reconnect if not a clean close
    if (
      event.code !== 1000 &&
      this.state.reconnectAttempts < this.config.maxReconnectAttempts
    ) {
      this.scheduleReconnect()
    }
  }

  /**
   * Handle WebSocket connection error
   */
  private handleConnectionError(error: Error | ErrorEvent): void {
    this.state.error = error.message || 'WebSocket error'
    this.emit(
      'error',
      error instanceof Error ? error : new Error(error.message)
    )
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.metrics.messagesReceived++

      // Handle specific message types
      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(message)
          break
        case 'authentication':
          this.handleAuthenticationResponse(message)
          break
        case 'connection_status':
          this.handleConnectionStatus(message)
          break
        default:
          // Emit the message for external handlers
          this.emit('message', message)
          break
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Handle heartbeat message
   */
  private handleHeartbeat(message: WebSocketMessage): void {
    this.metrics.lastHeartbeat = new Date().toISOString()

    // Calculate latency if timestamp is available
    const payload = message.payload as HeartbeatMessage
    if (payload?.timestamp) {
      const latency = Date.now() - new Date(payload.timestamp).getTime()
      this.updateAverageLatency(latency)
    }

    // Send heartbeat response
    this.send('heartbeat', {
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Handle authentication response
   */
  private handleAuthenticationResponse(message: WebSocketMessage): void {
    const response = message.payload as AuthenticationResponseMessage

    if (response.success) {
      this.isAuthenticated = true
      this.emit('authenticated', response.userId)
    } else {
      console.error('WebSocket authentication failed:', response.error)
      this.emit('error', new Error(response.error || 'Authentication failed'))
    }
  }

  /**
   * Handle connection status message
   */
  private handleConnectionStatus(message: WebSocketMessage): void {
    const status = message.payload as ConnectionStatusMessage
    console.log('WebSocket connection status:', status)
  }

  /**
   * Send message to WebSocket server
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      this.metrics.messagesSent++
    }
  }

  /**
   * Queue message for later sending
   */
  private queueMessage(message: WebSocketMessage): void {
    const queueItem: WebSocketQueueItem = {
      message,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    }

    this.messageQueue.push(queueItem)
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift()
      if (item) {
        this.sendMessage(item.message)
      }
    }
  }

  /**
   * Start heartbeat interval
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.state.isConnected) {
        this.send('heartbeat', {
          timestamp: new Date().toISOString(),
        })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.state.reconnectAttempts++
    this.metrics.reconnectCount++

    const delay = Math.min(
      this.config.reconnectInterval *
        Math.pow(2, this.state.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    this.reconnectTimeout = setTimeout(() => {
      this.emit('reconnect', this.state.reconnectAttempts)
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Update connection state
   */
  private updateConnectionState(isConnected: boolean): void {
    const now = new Date().toISOString()

    this.state.isConnected = isConnected
    this.state.isConnecting = false

    if (isConnected) {
      this.state.lastConnectedAt = now
      this.state.error = undefined
    } else {
      this.state.lastDisconnectedAt = now
    }
  }

  /**
   * Update average latency
   */
  private updateAverageLatency(latency: number): void {
    if (this.metrics.averageLatency === 0) {
      this.metrics.averageLatency = latency
    } else {
      this.metrics.averageLatency = (this.metrics.averageLatency + latency) / 2
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService()
export default webSocketService

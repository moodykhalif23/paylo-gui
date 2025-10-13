// WebSocket-specific type definitions

import {
  TransactionStatus,
  BlockchainType,
  Notification,
  SystemAlert,
  InvoiceStatus,
} from './index'

// ============================================================================
// WebSocket Connection Types
// ============================================================================

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
  timeout: number
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  reconnectAttempts: number
  lastConnectedAt?: string
  lastDisconnectedAt?: string
  error?: string
}

// ============================================================================
// Base WebSocket Message Types
// ============================================================================

export interface WebSocketMessage<T = unknown> {
  id: string
  type: WebSocketMessageType
  payload: T
  timestamp: string
  version?: string
  correlationId?: string
}

export type WebSocketMessageType =
  | 'connection_status'
  | 'heartbeat'
  | 'authentication'
  | 'subscription'
  | 'unsubscription'
  | 'transaction_update'
  | 'balance_update'
  | 'invoice_update'
  | 'invoice_paid'
  | 'system_alert'
  | 'user_notification'
  | 'merchant_notification'
  | 'admin_notification'
  | 'system_maintenance'
  | 'rate_limit_warning'
  | 'error'

// ============================================================================
// Connection and Authentication Messages
// ============================================================================

export interface ConnectionStatusMessage {
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error'
  clientId: string
  serverTime: string
  message?: string
}

export interface HeartbeatMessage {
  timestamp: string
  serverTime: string
  latency?: number
}

export interface AuthenticationMessage {
  token: string
  userId: string
  sessionId: string
}

export interface AuthenticationResponseMessage {
  success: boolean
  userId?: string
  sessionId?: string
  permissions?: string[]
  error?: string
}

// ============================================================================
// Subscription Messages
// ============================================================================

export interface SubscriptionMessage {
  action: 'subscribe' | 'unsubscribe'
  channels: WebSocketChannel[]
  filters?: Record<string, unknown>
}

export interface SubscriptionResponseMessage {
  success: boolean
  subscribedChannels: WebSocketChannel[]
  failedChannels?: {
    channel: WebSocketChannel
    error: string
  }[]
}

export type WebSocketChannel =
  | 'user_transactions'
  | 'user_balances'
  | 'user_notifications'
  | 'merchant_invoices'
  | 'merchant_analytics'
  | 'system_alerts'
  | 'system_health'
  | 'admin_notifications'
  | 'global_announcements'

// ============================================================================
// Transaction-Related Messages
// ============================================================================

export interface TransactionUpdateMessage {
  transactionId: string
  userId: string
  status: TransactionStatus
  previousStatus: TransactionStatus
  confirmations: number
  requiredConfirmations: number
  txHash?: string
  blockHeight?: number
  failureReason?: string
  estimatedConfirmationTime?: number
  updatedAt: string
}

export interface BalanceUpdateMessage {
  userId: string
  walletId: string
  address: string
  blockchain: BlockchainType
  balance: string
  previousBalance: string
  usdValue: number
  previousUsdValue: number
  lastUpdated: string
  transactionId?: string
}

// ============================================================================
// Invoice-Related Messages
// ============================================================================

export interface InvoiceUpdateMessage {
  invoiceId: string
  merchantId: string
  status: InvoiceStatus
  previousStatus: InvoiceStatus
  updatedAt: string
  expiresAt?: string
}

export interface InvoicePaidMessage {
  invoiceId: string
  merchantId: string
  transactionId: string
  amount: string
  paidAmount: string
  blockchain: BlockchainType
  paidAt: string
  overpaid: boolean
  underpaid: boolean
}

// ============================================================================
// Notification Messages
// ============================================================================

export interface UserNotificationMessage {
  userId: string
  notification: Notification
}

export interface MerchantNotificationMessage {
  merchantId: string
  notification: Notification & {
    invoiceId?: string
    transactionId?: string
  }
}

export interface AdminNotificationMessage {
  adminId: string
  notification: Notification & {
    severity: 'low' | 'medium' | 'high' | 'critical'
    requiresAction: boolean
    actionUrl?: string
  }
}

// ============================================================================
// System Messages
// ============================================================================

export interface SystemAlertMessage {
  alert: SystemAlert
  affectedUsers?: string[]
  affectedServices?: string[]
  estimatedResolutionTime?: string
}

export interface SystemMaintenanceMessage {
  type: 'scheduled' | 'emergency'
  title: string
  description: string
  startTime: string
  estimatedDuration: number
  affectedServices: string[]
  maintenanceId: string
}

export interface RateLimitWarningMessage {
  userId: string
  endpoint: string
  currentUsage: number
  limit: number
  resetTime: string
  severity: 'warning' | 'critical'
}

// ============================================================================
// Error Messages
// ============================================================================

export interface WebSocketErrorMessage {
  code: string
  message: string
  details?: Record<string, unknown>
  retryable: boolean
  retryAfter?: number
}

// ============================================================================
// Message Handlers
// ============================================================================

export type WebSocketMessageHandler<T = unknown> = (
  message: WebSocketMessage<T>
) => void

export interface WebSocketMessageHandlers {
  connection_status: WebSocketMessageHandler<ConnectionStatusMessage>
  heartbeat: WebSocketMessageHandler<HeartbeatMessage>
  authentication: WebSocketMessageHandler<AuthenticationResponseMessage>
  subscription: WebSocketMessageHandler<SubscriptionResponseMessage>
  transaction_update: WebSocketMessageHandler<TransactionUpdateMessage>
  balance_update: WebSocketMessageHandler<BalanceUpdateMessage>
  invoice_update: WebSocketMessageHandler<InvoiceUpdateMessage>
  invoice_paid: WebSocketMessageHandler<InvoicePaidMessage>
  user_notification: WebSocketMessageHandler<UserNotificationMessage>
  merchant_notification: WebSocketMessageHandler<MerchantNotificationMessage>
  admin_notification: WebSocketMessageHandler<AdminNotificationMessage>
  system_alert: WebSocketMessageHandler<SystemAlertMessage>
  system_maintenance: WebSocketMessageHandler<SystemMaintenanceMessage>
  rate_limit_warning: WebSocketMessageHandler<RateLimitWarningMessage>
  error: WebSocketMessageHandler<WebSocketErrorMessage>
}

// ============================================================================
// WebSocket Events
// ============================================================================

export interface WebSocketEvents {
  connect: () => void
  disconnect: (reason: string) => void
  reconnect: (attempt: number) => void
  error: (error: Error) => void
  message: (message: WebSocketMessage) => void
  authenticated: (userId: string) => void
  subscribed: (channels: WebSocketChannel[]) => void
  unsubscribed: (channels: WebSocketChannel[]) => void
}

// ============================================================================
// Utility Types
// ============================================================================

export interface WebSocketMetrics {
  messagesReceived: number
  messagesSent: number
  reconnectCount: number
  averageLatency: number
  lastHeartbeat: string
  connectionUptime: number
}

export interface WebSocketQueueItem {
  message: WebSocketMessage
  timestamp: string
  retryCount: number
  maxRetries: number
}

// ============================================================================
// WebSocket Service Interface
// ============================================================================

export interface WebSocketService {
  connect(config: WebSocketConfig): Promise<void>
  disconnect(): void
  send<T>(type: WebSocketMessageType, payload: T): void
  subscribe(
    channels: WebSocketChannel[],
    filters?: Record<string, unknown>
  ): void
  unsubscribe(channels: WebSocketChannel[]): void
  on<T extends keyof WebSocketEvents>(
    event: T,
    handler: WebSocketEvents[T]
  ): void
  off<T extends keyof WebSocketEvents>(
    event: T,
    handler: WebSocketEvents[T]
  ): void
  getState(): WebSocketState
  getMetrics(): WebSocketMetrics
}

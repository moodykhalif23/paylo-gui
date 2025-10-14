import {
  WebSocketMessage,
  Notification,
  TransactionUpdateMessage,
  BalanceUpdateMessage,
  InvoicePaidMessage,
  SystemAlertMessage,
  UserNotificationMessage,
} from '../../types'
import { notificationManager } from './NotificationManager'

// ============================================================================
// WebSocket Notification Service
// ============================================================================

export class WebSocketNotificationService {
  private static instance: WebSocketNotificationService

  private constructor() {}

  static getInstance(): WebSocketNotificationService {
    if (!WebSocketNotificationService.instance) {
      WebSocketNotificationService.instance = new WebSocketNotificationService()
    }
    return WebSocketNotificationService.instance
  }

  /**
   * Handle incoming WebSocket messages and convert them to notifications
   */
  handleWebSocketMessage(message: WebSocketMessage): void {
    try {
      switch (message.type) {
        case 'transaction_update':
          this.handleTransactionUpdate(
            message.payload as TransactionUpdateMessage
          )
          break
        case 'balance_update':
          this.handleBalanceUpdate(message.payload as BalanceUpdateMessage)
          break
        case 'invoice_paid':
          this.handleInvoicePaid(message.payload as InvoicePaidMessage)
          break
        case 'system_alert':
          this.handleSystemAlert(message.payload as SystemAlertMessage)
          break
        case 'user_notification':
          this.handleUserNotification(
            message.payload as UserNotificationMessage
          )
          break
        default:
          console.log('Unhandled WebSocket message type:', message.type)
      }
    } catch (error) {
      console.error('Error handling WebSocket notification:', error)
    }
  }

  /**
   * Handle transaction status updates
   */
  private handleTransactionUpdate(payload: TransactionUpdateMessage): void {
    const { transactionId, status, confirmations, txHash, failureReason } =
      payload

    let notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> | null =
      null

    switch (status) {
      case 'confirmed':
        notification = {
          type: 'success',
          title: 'Transaction Confirmed',
          message: `Your transaction has been confirmed with ${confirmations} confirmations.`,
          priority: 'medium',
          category: 'transaction',
          userId: 'current-user',
          actionUrl: `/transactions/${transactionId}`,
          actionLabel: 'View Transaction',
          metadata: { transactionId, txHash, confirmations },
        }
        break

      case 'failed':
        notification = {
          type: 'error',
          title: 'Transaction Failed',
          message:
            failureReason || 'Your transaction has failed. Please try again.',
          priority: 'high',
          category: 'transaction',
          userId: 'current-user',
          actionUrl: `/transactions/${transactionId}`,
          actionLabel: 'View Details',
          actionRequired: true,
          metadata: { transactionId, failureReason },
        }
        break

      case 'pending':
        // Only notify for pending if it's been a while
        notification = {
          type: 'info',
          title: 'Transaction Pending',
          message: `Your transaction is pending confirmation (${confirmations} confirmations).`,
          priority: 'low',
          category: 'transaction',
          userId: 'current-user',
          actionUrl: `/transactions/${transactionId}`,
          metadata: { transactionId, confirmations },
        }
        break
    }

    if (notification) {
      this.showNotification(notification)
    }
  }

  /**
   * Handle balance updates
   */
  private handleBalanceUpdate(payload: BalanceUpdateMessage): void {
    const { address, blockchain, balance, usdValue } = payload

    const notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      type: 'info',
      title: 'Balance Updated',
      message: `Your ${blockchain} wallet balance has been updated: ${balance} ($${usdValue.toFixed(2)})`,
      priority: 'low',
      category: 'account',
      userId: 'current-user',
      actionUrl: `/wallets`,
      metadata: { address, blockchain, balance, usdValue },
    }

    this.showNotification(notification)
  }

  /**
   * Handle invoice payments
   */
  private handleInvoicePaid(payload: InvoicePaidMessage): void {
    const { invoiceId, transactionId, amount, paidAt } = payload

    const notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      type: 'success',
      title: 'Payment Received',
      message: `Invoice payment of ${amount} has been received.`,
      priority: 'high',
      category: 'payment',
      userId: 'current-user',
      actionUrl: `/merchant/invoices/${invoiceId}`,
      actionLabel: 'View Invoice',
      metadata: { invoiceId, transactionId, amount, paidAt },
    }

    this.showNotification(notification)
  }

  /**
   * Handle system alerts
   */
  private handleSystemAlert(payload: SystemAlertMessage): void {
    const { alert } = payload

    let type: 'info' | 'success' | 'warning' | 'error' = 'info'
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    switch (alert.type) {
      case 'error':
      case 'critical':
        type = 'error'
        priority = 'critical'
        break
      case 'warning':
        type = 'warning'
        priority = 'high'
        break
      case 'info':
        type = 'info'
        priority = 'medium'
        break
    }

    const notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      type,
      title: alert.title,
      message: alert.message,
      priority,
      category: 'system',
      userId: 'current-user',
      actionRequired: alert.type === 'critical',
      persistent: alert.type === 'critical',
      metadata: { alertId: alert.id, source: alert.source },
    }

    this.showNotification(notification)
  }

  /**
   * Handle direct user notifications
   */
  private handleUserNotification(payload: UserNotificationMessage): void {
    const { notification } = payload
    this.showNotification(notification)
  }

  /**
   * Show notification using the notification manager
   */
  private showNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ): void {
    const notification: Notification = {
      ...notificationData,
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    notificationManager.show(notification)
  }

  /**
   * Create notification for connection status changes
   */
  handleConnectionStatusChange(connected: boolean, reason?: string): void {
    const notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      type: connected ? 'success' : 'warning',
      title: connected ? 'Connected' : 'Connection Lost',
      message: connected
        ? 'Real-time updates are now active.'
        : `Connection to server lost${reason ? `: ${reason}` : ''}. Attempting to reconnect...`,
      priority: connected ? 'low' : 'medium',
      category: 'system',
      userId: 'current-user',
      persistent: !connected,
    }

    this.showNotification(notification)
  }

  /**
   * Create notification for authentication events
   */
  handleAuthenticationEvent(
    event: 'login' | 'logout' | 'session_expired' | 'token_refreshed'
  ): void {
    let notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> | null =
      null

    switch (event) {
      case 'login':
        notification = {
          type: 'success',
          title: 'Welcome Back',
          message: 'You have successfully logged in.',
          priority: 'low',
          category: 'security',
          userId: 'current-user',
        }
        break

      case 'logout':
        notification = {
          type: 'info',
          title: 'Logged Out',
          message: 'You have been logged out successfully.',
          priority: 'low',
          category: 'security',
          userId: 'current-user',
        }
        break

      case 'session_expired':
        notification = {
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
          priority: 'high',
          category: 'security',
          userId: 'current-user',
          actionRequired: true,
          actionUrl: '/login',
          actionLabel: 'Log In',
        }
        break

      case 'token_refreshed':
        // Usually don't notify for token refresh as it's automatic
        break
    }

    if (notification) {
      this.showNotification(notification)
    }
  }

  /**
   * Create notification for security events
   */
  handleSecurityEvent(
    event:
      | 'suspicious_login'
      | 'password_changed'
      | 'two_factor_enabled'
      | 'api_key_created'
  ): void {
    let notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> | null =
      null

    switch (event) {
      case 'suspicious_login':
        notification = {
          type: 'warning',
          title: 'Suspicious Login Detected',
          message:
            'A login attempt from an unrecognized device or location was detected.',
          priority: 'high',
          category: 'security',
          userId: 'current-user',
          actionRequired: true,
          actionUrl: '/security',
          actionLabel: 'Review Activity',
        }
        break

      case 'password_changed':
        notification = {
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been successfully updated.',
          priority: 'medium',
          category: 'security',
          userId: 'current-user',
        }
        break

      case 'two_factor_enabled':
        notification = {
          type: 'success',
          title: 'Two-Factor Authentication Enabled',
          message: 'Your account is now more secure with 2FA enabled.',
          priority: 'medium',
          category: 'security',
          userId: 'current-user',
        }
        break

      case 'api_key_created':
        notification = {
          type: 'info',
          title: 'API Key Created',
          message: 'A new API key has been created for your account.',
          priority: 'medium',
          category: 'security',
          userId: 'current-user',
          actionUrl: '/api-keys',
          actionLabel: 'Manage Keys',
        }
        break
    }

    if (notification) {
      this.showNotification(notification)
    }
  }
}

// Export singleton instance
export const webSocketNotificationService =
  WebSocketNotificationService.getInstance()
export default webSocketNotificationService

import { store } from '../../store'
import { workflowIntegration } from './workflowIntegration'
import { apiIntegration } from './apiIntegration'
import {
  User,
  Transaction,
  Invoice,
  UserRole,
  TransactionStatus,
  SystemHealth,
  NotificationType,
  NotificationPriority,
} from '../../types'
import { showNotification } from '../../store/slices/notificationSlice'
import { updateConnectionStatus } from '../../store/slices/websocketSlice'
class WorkflowOrchestrator {
  private dispatch = store.dispatch
  private getState = store.getState

  // ============================================================================
  // Complete User Onboarding Workflow
  // ============================================================================

  async completeUserOnboarding(registrationData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    businessName?: string // For merchants
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Step 1: Register user
      const registerResult = await workflowIntegration.registerUser({
        email: registrationData.email,
        password: registrationData.password,
        role: registrationData.role,
        profile: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
        },
      })

      if (!registerResult.success) {
        return { success: false, error: registerResult.error }
      }

      // Step 2: Send welcome notification
      this.dispatch(
        showNotification({
          type: 'success' as NotificationType,
          title: 'Welcome to Paylo!',
          message: `Your ${registrationData.role} account has been created successfully.`,
          priority: 'medium' as NotificationPriority,
          category: 'account',
          persistent: true,
        })
      )

      // Step 3: Role-specific onboarding
      if (registerResult.user) {
        await this.performRoleSpecificOnboarding(
          registerResult.user,
          registrationData
        )

        // Step 4: Initialize user dashboard
        await this.initializeUserDashboard(registerResult.user)
      }

      return { success: true, user: registerResult.user }
    } catch (error) {
      console.error('User onboarding workflow error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Onboarding failed',
      }
    }
  }

  /**
   * Perform role-specific onboarding steps
   */
  private async performRoleSpecificOnboarding(
    user: User,
    registrationData: {
      email: string
      password: string
      firstName: string
      lastName: string
      role: UserRole
      businessName?: string
    }
  ): Promise<void> {
    switch (user.role) {
      case 'user':
        await this.onboardP2PUser(user)
        break
      case 'merchant':
        await this.onboardMerchant(user, registrationData.businessName)
        break
      case 'admin':
        await this.onboardAdmin(user)
        break
    }
  }

  /**
   * P2P user onboarding
   */
  private async onboardP2PUser(_user: User): Promise<void> {
    try {
      // Create default wallets for all supported blockchains
      const blockchains = ['bitcoin', 'ethereum', 'solana']

      for (const blockchain of blockchains) {
        await apiIntegration.createWallet(blockchain)
      }

      this.dispatch(
        showNotification({
          type: 'info' as NotificationType,
          title: 'Wallets Created',
          message: 'Your cryptocurrency wallets have been set up successfully.',
          priority: 'medium' as NotificationPriority,
          category: 'account',
          actionUrl: '/p2p/wallets',
          actionLabel: 'View Wallets',
        })
      )
    } catch (error) {
      console.error('P2P user onboarding error:', error)
    }
  }

  /**
   * Merchant onboarding
   */
  private async onboardMerchant(
    _user: User,
    businessName?: string
  ): Promise<void> {
    try {
      // Set up merchant profile
      if (businessName) {
        // Update merchant profile with business information
        // This would call a merchant profile API
      }

      // Generate API keys
      // This would call an API key generation endpoint

      this.dispatch(
        showNotification({
          type: 'info' as NotificationType,
          title: 'Merchant Setup Complete',
          message: 'Your merchant account is ready to accept payments.',
          priority: 'high' as NotificationPriority,
          category: 'account',
          actionUrl: '/merchant/dashboard',
          actionLabel: 'View Dashboard',
        })
      )
    } catch (error) {
      console.error('Merchant onboarding error:', error)
    }
  }

  /**
   * Admin onboarding
   */
  private async onboardAdmin(_user: User): Promise<void> {
    try {
      // Set up admin permissions and access
      this.dispatch(
        showNotification({
          type: 'info' as NotificationType,
          title: 'Admin Access Granted',
          message: 'Your administrator account has been configured.',
          priority: 'high' as NotificationPriority,
          category: 'account',
          actionUrl: '/admin/dashboard',
          actionLabel: 'Admin Dashboard',
        })
      )
    } catch (error) {
      console.error('Admin onboarding error:', error)
    }
  }

  /**
   * Initialize user dashboard based on role
   */
  private async initializeUserDashboard(user: User): Promise<void> {
    try {
      switch (user.role) {
        case 'user':
          // Load P2P dashboard data
          await Promise.all([
            apiIntegration.getWallets(),
            apiIntegration.getTransactions({ page: 1, limit: 5 }),
          ])
          break
        case 'merchant':
          // Load merchant dashboard data
          await Promise.all([
            apiIntegration.getMerchantDashboard(),
            apiIntegration.getInvoices({ page: 1, limit: 5 }),
          ])
          break
        case 'admin':
          // Load admin dashboard data
          await Promise.all([
            apiIntegration.getSystemHealth(),
            apiIntegration.getUsers({ page: 1, limit: 10 }),
            apiIntegration.getAllTransactions({ page: 1, limit: 10 }),
          ])
          break
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error)
    }
  }

  // ============================================================================
  // Complete Payment Processing Workflow
  // ============================================================================

  /**
   * Complete payment processing workflow (P2P or merchant)
   */
  async processPaymentWorkflow(paymentData: {
    type: 'p2p' | 'merchant'
    amount: string
    blockchain: string
    fromAddress?: string // For P2P
    toAddress?: string // For P2P
    invoiceId?: string // For merchant payments
    metadata?: Record<string, unknown>
  }): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    try {
      let transaction: Transaction

      if (paymentData.type === 'p2p') {
        // P2P transfer workflow
        if (!paymentData.fromAddress || !paymentData.toAddress) {
          return {
            success: false,
            error: 'From and to addresses are required for P2P transfers',
          }
        }

        const result = await workflowIntegration.p2pTransferWorkflow({
          fromAddress: paymentData.fromAddress,
          toAddress: paymentData.toAddress,
          amount: paymentData.amount,
          blockchain: paymentData.blockchain as
            | 'bitcoin'
            | 'ethereum'
            | 'solana',
        })

        if (!result) {
          return { success: false, error: 'P2P transfer failed' }
        }

        transaction = result
      } else {
        // Merchant payment workflow
        if (!paymentData.invoiceId) {
          return {
            success: false,
            error: 'Invoice ID is required for merchant payments',
          }
        }

        // Process merchant payment
        transaction = await this.processMerchantPayment(
          paymentData.invoiceId,
          paymentData.amount,
          paymentData.blockchain
        )

        if (!transaction) {
          return { success: false, error: 'Merchant payment failed' }
        }
      }

      // Start transaction monitoring
      await this.startTransactionMonitoring(transaction.id)

      return { success: true, transaction }
    } catch (error) {
      console.error('Payment processing workflow error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Payment processing failed',
      }
    }
  }

  /**
   * Process merchant payment
   */
  private async processMerchantPayment(
    _invoiceId: string,
    amount: string,
    blockchain: string
  ): Promise<Transaction> {
    // This would implement the merchant payment processing logic
    // For now, return a mock transaction
    return {
      id: `tx_${Date.now()}`,
      type: 'merchant',
      fromAddress: 'sender_address',
      toAddress: 'merchant_address',
      amount,
      blockchain: blockchain as 'bitcoin' | 'ethereum' | 'solana',
      status: 'pending' as TransactionStatus,
      fee: '0.001',
      feeUSD: 1.5,
      confirmations: 0,
      requiredConfirmations: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Start monitoring transaction status
   */
  private async startTransactionMonitoring(
    transactionId: string
  ): Promise<void> {
    // Set up WebSocket monitoring for transaction updates
    // This would integrate with the WebSocket service
    console.log(`Starting monitoring for transaction: ${transactionId}`)
  }

  // ============================================================================
  // Complete Invoice Management Workflow
  // ============================================================================

  /**
   * Complete invoice lifecycle workflow
   */
  async manageInvoiceLifecycle(invoiceData: {
    amount: string
    currency: string
    description?: string
    expirationHours?: number
    webhookUrl?: string
    metadata?: Record<string, unknown>
  }): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
    try {
      // Step 1: Create invoice
      const invoice = await workflowIntegration.createInvoiceWorkflow({
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        description: invoiceData.description,
        expirationTime: invoiceData.expirationHours
          ? new Date(
              Date.now() + invoiceData.expirationHours * 60 * 60 * 1000
            ).toISOString()
          : undefined,
        webhookUrl: invoiceData.webhookUrl,
        metadata: invoiceData.metadata,
      })

      if (!invoice) {
        return { success: false, error: 'Invoice creation failed' }
      }

      // Step 2: Set up payment monitoring
      await this.setupInvoiceMonitoring(invoice)

      // Step 3: Schedule expiration handling
      if (invoice.expirationTime) {
        await this.scheduleInvoiceExpiration(invoice)
      }

      return { success: true, invoice }
    } catch (error) {
      console.error('Invoice lifecycle workflow error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Invoice management failed',
      }
    }
  }

  /**
   * Set up invoice payment monitoring
   */
  private async setupInvoiceMonitoring(invoice: Invoice): Promise<void> {
    // Monitor the payment address for incoming transactions
    console.log(`Setting up monitoring for invoice: ${invoice.id}`)

    // This would integrate with blockchain monitoring services
    // and WebSocket notifications for real-time updates
  }

  /**
   * Schedule invoice expiration handling
   */
  private async scheduleInvoiceExpiration(invoice: Invoice): Promise<void> {
    const expirationTime = new Date(invoice.expirationTime).getTime()
    const currentTime = Date.now()
    const timeUntilExpiration = expirationTime - currentTime

    if (timeUntilExpiration > 0) {
      setTimeout(async () => {
        await this.handleInvoiceExpiration(invoice.id)
      }, timeUntilExpiration)
    }
  }

  /**
   * Handle invoice expiration
   */
  private async handleInvoiceExpiration(invoiceId: string): Promise<void> {
    try {
      // Update invoice status to expired
      // This would call an API to update the invoice status

      this.dispatch(
        showNotification({
          type: 'warning' as NotificationType,
          title: 'Invoice Expired',
          message: `Invoice ${invoiceId} has expired`,
          priority: 'medium' as NotificationPriority,
          category: 'payment',
        })
      )
    } catch (error) {
      console.error('Invoice expiration handling error:', error)
    }
  }

  // ============================================================================
  // System Health and Monitoring Workflow
  // ============================================================================

  /**
   * Complete system health monitoring workflow
   */
  async monitorSystemHealth(): Promise<void> {
    try {
      // Get current system health
      const systemHealth = await apiIntegration.getSystemHealth()

      // Check for critical issues
      const criticalIssues = this.identifyCriticalIssues(systemHealth)

      if (criticalIssues.length > 0) {
        // Alert administrators
        await this.alertAdministrators(criticalIssues)
      }

      // Update system status in store
      // This would dispatch to system slice

      // Schedule next health check
      setTimeout(() => {
        this.monitorSystemHealth()
      }, 60000) // Check every minute
    } catch (error) {
      console.error('System health monitoring error:', error)

      // Alert about monitoring failure
      this.dispatch(
        showNotification({
          type: 'error' as NotificationType,
          title: 'System Monitoring Error',
          message: 'Unable to check system health',
          priority: 'critical' as NotificationPriority,
          category: 'system',
        })
      )
    }
  }

  /**
   * Identify critical system issues
   */
  private identifyCriticalIssues(systemHealth: SystemHealth): string[] {
    const issues: string[] = []

    // Check overall system status
    if (systemHealth.status === 'down') {
      issues.push('System is down')
    }

    // Check individual services
    systemHealth.services.forEach(service => {
      if (service.status === 'down') {
        issues.push(`${service.name} service is down`)
      } else if (service.status === 'degraded') {
        issues.push(`${service.name} service is degraded`)
      }
    })

    // Check system metrics
    if (systemHealth.metrics.systemLoad > 0.9) {
      issues.push('High system load detected')
    }

    if (systemHealth.metrics.memoryUsage > 0.9) {
      issues.push('High memory usage detected')
    }

    if (systemHealth.metrics.diskUsage > 0.9) {
      issues.push('High disk usage detected')
    }

    return issues
  }

  /**
   * Alert administrators about critical issues
   */
  private async alertAdministrators(issues: string[]): Promise<void> {
    // Send notifications to all admin users
    this.dispatch(
      showNotification({
        type: 'error' as NotificationType,
        title: 'Critical System Issues Detected',
        message: `${issues.length} critical issues found: ${issues.join(', ')}`,
        priority: 'critical' as NotificationPriority,
        category: 'system',
        persistent: true,
        actionRequired: true,
      })
    )

    // In a real implementation, this would also:
    // - Send emails to administrators
    // - Send SMS alerts for critical issues
    // - Create incident tickets
    // - Trigger automated recovery procedures
  }

  // ============================================================================
  // Data Export and Compliance Workflow
  // ============================================================================

  /**
   * Complete data export workflow with compliance checks
   */
  async exportDataWithCompliance(exportRequest: {
    type: 'transactions' | 'invoices' | 'users' | 'audit_logs'
    format: 'csv' | 'json' | 'excel' | 'pdf'
    dateRange?: { from: string; to: string }
    filters?: Record<string, unknown>
    includePersonalData?: boolean
    requestedBy: string
    purpose: string
  }): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      // Step 1: Validate export permissions
      const hasPermission = await this.validateExportPermissions(
        exportRequest.type,
        exportRequest.requestedBy
      )

      if (!hasPermission) {
        return {
          success: false,
          error: 'Insufficient permissions for data export',
        }
      }

      // Step 2: Check compliance requirements
      const complianceCheck =
        await this.checkComplianceRequirements(exportRequest)

      if (!complianceCheck.approved) {
        return { success: false, error: complianceCheck.reason }
      }

      // Step 3: Log export request for audit
      await this.logExportRequest(exportRequest)

      // Step 4: Execute export
      const exportResult = await workflowIntegration.exportDataWorkflow({
        format: exportRequest.format,
        type:
          exportRequest.type === 'audit_logs'
            ? 'analytics'
            : (exportRequest.type as
                | 'transactions'
                | 'invoices'
                | 'analytics'
                | 'users'),
        dateRange: exportRequest.dateRange,
        filters: exportRequest.filters,
      })

      if (!exportResult) {
        return { success: false, error: 'Export execution failed' }
      }

      // Step 5: Apply data masking if required
      if (exportRequest.includePersonalData === false) {
        // Apply data masking/anonymization
        // This would be implemented based on compliance requirements
      }

      return { success: true, downloadUrl: 'mock_download_url' }
    } catch (error) {
      console.error('Data export workflow error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Data export failed',
      }
    }
  }

  /**
   * Validate export permissions
   */
  private async validateExportPermissions(
    _exportType: string,
    _userId: string
  ): Promise<boolean> {
    // Check user permissions for the specific export type
    // This would integrate with the permission system
    return true // Mock implementation
  }

  /**
   * Check compliance requirements for export
   */
  private async checkComplianceRequirements(
    _exportRequest: Record<string, unknown>
  ): Promise<{
    approved: boolean
    reason?: string
  }> {
    // Check GDPR, PCI DSS, and other compliance requirements
    // This would implement actual compliance checks
    return { approved: true } // Mock implementation
  }

  /**
   * Log export request for audit trail
   */
  private async logExportRequest(
    exportRequest: Record<string, unknown>
  ): Promise<void> {
    // Log the export request for compliance and audit purposes
    console.log('Export request logged:', exportRequest)
  }

  // ============================================================================
  // Connection and Offline Handling Workflow
  // ============================================================================

  /**
   * Handle connection status changes and offline scenarios
   */
  async handleConnectionStatusChange(isOnline: boolean): Promise<void> {
    this.dispatch(
      updateConnectionStatus({
        isConnected: isOnline,
        timestamp: new Date().toISOString(),
      })
    )

    if (isOnline) {
      await this.handleOnlineRecovery()
    } else {
      await this.handleOfflineMode()
    }
  }

  /**
   * Handle recovery when coming back online
   */
  private async handleOnlineRecovery(): Promise<void> {
    try {
      // Sync any queued actions
      await this.syncQueuedActions()

      // Refresh critical data
      await this.refreshCriticalData()

      // Notify user of successful reconnection
      this.dispatch(
        showNotification({
          type: 'success' as NotificationType,
          title: 'Connection Restored',
          message: 'You are back online. Data has been synchronized.',
          priority: 'medium' as NotificationPriority,
          category: 'system',
        })
      )
    } catch (error) {
      console.error('Online recovery error:', error)
    }
  }

  /**
   * Handle offline mode
   */
  private async handleOfflineMode(): Promise<void> {
    // Enable offline functionality
    this.dispatch(
      showNotification({
        type: 'warning' as NotificationType,
        title: 'Connection Lost',
        message: 'You are now offline. Some features may be limited.',
        priority: 'high' as NotificationPriority,
        category: 'system',
        persistent: true,
      })
    )
  }

  /**
   * Sync queued actions when coming back online
   */
  private async syncQueuedActions(): Promise<void> {
    // Implement queued action synchronization
    // This would handle actions that were queued while offline
  }

  /**
   * Refresh critical data after reconnection
   */
  private async refreshCriticalData(): Promise<void> {
    const state = this.getState()
    const user = state.auth.user

    if (!user) return

    try {
      // Refresh user-specific data based on role
      switch (user.role) {
        case 'user':
          await Promise.all([
            apiIntegration.getWallets(),
            apiIntegration.getTransactions({ page: 1, limit: 10 }),
          ])
          break
        case 'merchant':
          await Promise.all([
            apiIntegration.getMerchantDashboard(),
            apiIntegration.getInvoices({ page: 1, limit: 10 }),
          ])
          break
        case 'admin':
          await apiIntegration.getSystemHealth()
          break
      }
    } catch (error) {
      console.error('Critical data refresh error:', error)
    }
  }
}

// Create singleton instance
export const workflowOrchestrator = new WorkflowOrchestrator()
export default workflowOrchestrator

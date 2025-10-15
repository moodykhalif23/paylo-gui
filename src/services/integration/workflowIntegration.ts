import { store } from '../../store'
import { apiIntegration } from './apiIntegration'
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../../store/slices/authSlice'
import {
  User,
  Transaction,
  Invoice,
  ExportRequest,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../../types'
import {
  addNotification,
  showNotification,
} from '../../store/slices/notificationSlice'

// Additional types for workflow integration
interface P2PTransferRequest {
  fromAddress: string
  toAddress: string
  amount: string
  blockchain: 'bitcoin' | 'ethereum' | 'solana'
  fee?: string
}

interface CreateInvoiceRequest {
  amount: string
  currency: string
  description?: string
  expirationTime?: string
  webhookUrl?: string
  metadata?: Record<string, unknown>
}

// Removed unused interface definitions

/**
 * Workflow Integration Service
 * Orchestrates end-to-end user workflows by connecting UI components with backend APIs
 */
class WorkflowIntegrationService {
  private dispatch = store.dispatch
  private getState = store.getState

  /**
   * Helper method to create and dispatch notifications
   */
  private createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: {
      category?: NotificationCategory
      priority?: NotificationPriority
      actionUrl?: string
      actionLabel?: string
      persistent?: boolean
      actionRequired?: boolean
    } = {}
  ) {
    const state = this.getState()
    const userId = state.auth.user?.id || 'unknown'

    this.dispatch(
      addNotification({
        id: `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        title,
        message,
        category: options.category || ('system' as NotificationCategory),
        priority: options.priority || 'medium',
        isRead: false,
        userId,
        createdAt: new Date().toISOString(),
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel,
        persistent: options.persistent,
        actionRequired: options.actionRequired,
      })
    )
  }

  // ============================================================================
  // Authentication Workflows
  // ============================================================================

  /**
   * Complete registration workflow
   */
  async registerUser(userData: {
    email: string
    password: string
    role: 'user' | 'merchant' | 'admin'
    profile: {
      firstName: string
      lastName: string
    }
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const registerData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        role: userData.role === 'admin' ? 'user' : userData.role, // Admin users created differently
      }
      const result = await this.dispatch(registerUser(registerData))

      if (registerUser.fulfilled.match(result)) {
        return { success: true, user: result.payload.user }
      } else {
        return { success: false, error: result.payload as string }
      }
    } catch (error) {
      console.error('Registration workflow error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Complete login workflow with error handling and state management
   */
  async loginWorkflow(credentials: {
    email: string
    password: string
  }): Promise<boolean> {
    try {
      const result = await this.dispatch(loginUser(credentials))

      if (loginUser.fulfilled.match(result)) {
        // Login successful
        this.createNotification(
          'success',
          'Login Successful',
          `Welcome back, ${result.payload.user.firstName}!`,
          { category: 'account', priority: 'medium' }
        )

        // Initialize user data
        await this.initializeUserData()
        return true
      } else {
        // Login failed
        this.createNotification(
          'error',
          'Login Failed',
          (result.payload as string) || 'Invalid credentials',
          { category: 'security', priority: 'high' }
        )
        return false
      }
    } catch (error) {
      console.error('Login workflow error:', error)
      this.createNotification(
        'error',
        'Login Error',
        'An unexpected error occurred during login',
        { category: 'system', priority: 'high' }
      )
      return false
    }
  }

  /**
   * Complete logout workflow with cleanup
   */
  async logoutWorkflow(): Promise<void> {
    try {
      await this.dispatch(logoutUser())

      // Clear any cached data
      this.clearUserData()

      this.createNotification(
        'info',
        'Logged Out',
        'You have been successfully logged out',
        { category: 'account', priority: 'low' }
      )
    } catch (error) {
      console.error('Logout workflow error:', error)
      // Force logout even if API call fails
      this.clearUserData()
    }
  }

  /**
   * Initialize user data after successful authentication
   */
  private async initializeUserData(): Promise<void> {
    const state = this.getState()
    const user = state.auth.user

    if (!user) return

    try {
      // Load role-specific data
      switch (user.role) {
        case 'user':
          await this.initializeP2PUserData()
          break
        case 'merchant':
          await this.initializeMerchantData()
          break
        case 'admin':
          await this.initializeAdminData()
          break
      }
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  /**
   * Clear user data on logout
   */
  private clearUserData(): void {
    // Clear any cached data, close WebSocket connections, etc.
    // This would be implemented based on your specific needs
  }

  // ============================================================================
  // P2P User Workflows
  // ============================================================================

  /**
   * Initialize P2P user dashboard data
   */
  private async initializeP2PUserData(): Promise<void> {
    try {
      // Load wallets
      const wallets = await apiIntegration.getWallets()

      // Load recent transactions
      await apiIntegration.getTransactions({
        page: 1,
        limit: 10,
      })

      // Update balances for all wallets
      await Promise.all(
        wallets.map(wallet => this.updateWalletBalance(wallet.address))
      )
    } catch (error) {
      console.error('Error initializing P2P user data:', error)
    }
  }

  /**
   * Complete P2P transfer workflow
   */
  async p2pTransferWorkflow(
    transferData: P2PTransferRequest
  ): Promise<Transaction | null> {
    try {
      // Validate transfer data
      const validation = await this.validateP2PTransfer(transferData)
      if (!validation.isValid) {
        this.createNotification(
          'error',
          'Transfer Validation Failed',
          validation.errors.join(', '),
          { category: 'transaction', priority: 'high' }
        )
        return null
      }

      // Show confirmation notification
      this.createNotification(
        'info',
        'Transfer Initiated',
        'Your transfer is being processed...',
        { category: 'transaction', priority: 'medium' }
      )

      // Execute transfer
      const transaction = await apiIntegration.createP2PTransfer(transferData)

      // Success notification
      this.createNotification(
        'success',
        'Transfer Submitted',
        `Transfer of ${transferData.amount} ${transferData.blockchain.toUpperCase()} initiated successfully`,
        {
          category: 'transaction',
          priority: 'medium',
          actionUrl: `/transactions/${transaction.id}`,
          actionLabel: 'View Transaction',
        }
      )

      // Update wallet balance
      await this.updateWalletBalance(transferData.fromAddress)

      return transaction
    } catch (error) {
      console.error('P2P transfer workflow error:', error)
      this.createNotification(
        'error',
        'Transfer Failed',
        error instanceof Error
          ? error.message
          : 'Transfer could not be completed',
        { category: 'transaction', priority: 'high' }
      )
      return null
    }
  }

  /**
   * Validate P2P transfer data
   */
  private async validateP2PTransfer(transferData: P2PTransferRequest): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // Check wallet balance
    try {
      const balance = await apiIntegration.getWalletBalance(
        transferData.fromAddress
      )
      const transferAmount = parseFloat(transferData.amount)
      const availableBalance = parseFloat(balance.balance)

      if (transferAmount > availableBalance) {
        errors.push('Insufficient balance for this transfer')
      }
    } catch {
      errors.push('Could not verify wallet balance')
    }

    // Validate addresses
    if (!this.isValidAddress(transferData.toAddress, transferData.blockchain)) {
      errors.push('Invalid recipient address')
    }

    if (
      !this.isValidAddress(transferData.fromAddress, transferData.blockchain)
    ) {
      errors.push('Invalid sender address')
    }

    // Validate amount
    if (parseFloat(transferData.amount) <= 0) {
      errors.push('Transfer amount must be greater than zero')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Update wallet balance
   */
  private async updateWalletBalance(address: string): Promise<void> {
    try {
      await apiIntegration.getWalletBalance(address)
      // Update balance in store
      // This would dispatch to wallet slice
    } catch (error) {
      console.error('Error updating wallet balance:', error)
    }
  }

  // ============================================================================
  // Merchant Workflows
  // ============================================================================

  /**
   * Initialize merchant dashboard data
   */
  private async initializeMerchantData(): Promise<void> {
    try {
      // Load dashboard data
      await apiIntegration.getMerchantDashboard()

      // Load recent invoices
      await apiIntegration.getInvoices({
        page: 1,
        limit: 10,
      })

      // Load analytics
      await apiIntegration.getMerchantAnalytics({
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        endDate: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error initializing merchant data:', error)
    }
  }

  /**
   * Complete invoice creation workflow
   */
  async createInvoiceWorkflow(
    invoiceData: CreateInvoiceRequest
  ): Promise<Invoice | null> {
    try {
      // Validate invoice data
      const validation = this.validateInvoiceData(invoiceData)
      if (!validation.isValid) {
        this.dispatch(
          showNotification({
            type: 'error',
            title: 'Invoice Validation Failed',
            message: validation.errors.join(', '),
            category: 'payment',
          })
        )
        return null
      }

      // Create invoice
      const invoice = await apiIntegration.createInvoice(invoiceData)

      // Success notification
      this.dispatch(
        showNotification({
          type: 'success',
          title: 'Invoice Created',
          message: `Invoice for ${invoiceData.amount} ${invoiceData.currency} created successfully`,
          category: 'payment',
          actionUrl: `/merchant/invoices/${invoice.id}`,
          actionLabel: 'View Invoice',
        })
      )

      return invoice
    } catch (error) {
      console.error('Invoice creation workflow error:', error)
      this.dispatch(
        showNotification({
          type: 'error',
          title: 'Invoice Creation Failed',
          message:
            error instanceof Error ? error.message : 'Could not create invoice',
          category: 'payment',
        })
      )
      return null
    }
  }

  /**
   * Validate invoice data
   */
  private validateInvoiceData(invoiceData: CreateInvoiceRequest): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate amount
    if (parseFloat(invoiceData.amount) <= 0) {
      errors.push('Invoice amount must be greater than zero')
    }

    // Validate currency
    const validCurrencies = ['bitcoin', 'ethereum', 'solana']
    if (!validCurrencies.includes(invoiceData.currency.toLowerCase())) {
      errors.push('Invalid currency specified')
    }

    // Validate expiration time if provided
    if (invoiceData.expirationTime) {
      const expirationDate = new Date(invoiceData.expirationTime)
      if (expirationDate <= new Date()) {
        errors.push('Expiration time must be in the future')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // ============================================================================
  // Admin Workflows
  // ============================================================================

  /**
   * Initialize admin dashboard data
   */
  private async initializeAdminData(): Promise<void> {
    try {
      // Load system health
      await apiIntegration.getSystemHealth()

      // Load recent users
      await apiIntegration.getUsers({
        page: 1,
        limit: 10,
      })

      // Load recent transactions
      await apiIntegration.getAllTransactions({
        page: 1,
        limit: 20,
      })
    } catch (error) {
      console.error('Error initializing admin data:', error)
    }
  }

  /**
   * Complete user management workflow
   */
  async createUserWorkflow(userData: {
    email: string
    password: string
    role: 'user' | 'merchant' | 'admin'
    profile: {
      firstName: string
      lastName: string
    }
  }): Promise<User | null> {
    try {
      // Validate user data
      const validation = this.validateUserData(userData)
      if (!validation.isValid) {
        this.createNotification(
          'error',
          'User Validation Failed',
          validation.errors.join(', '),
          { category: 'account', priority: 'high' }
        )
        return null
      }

      // Create user
      const user = await apiIntegration.createUser(userData)

      // Success notification
      this.createNotification(
        'success',
        'User Created',
        `User ${userData.email} created successfully`,
        {
          category: 'account',
          priority: 'medium',
          actionUrl: `/admin/users/${user.id}`,
          actionLabel: 'View User',
        }
      )

      return user
    } catch (error) {
      console.error('User creation workflow error:', error)
      this.createNotification(
        'error',
        'User Creation Failed',
        error instanceof Error ? error.message : 'Could not create user',
        { category: 'account', priority: 'high' }
      )
      return null
    }
  }

  /**
   * Validate user data
   */
  private validateUserData(userData: Record<string, unknown>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email as string)) {
      errors.push('Invalid email address')
    }

    // Validate password
    if ((userData.password as string).length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    // Validate role
    const validRoles = ['user', 'merchant', 'admin']
    if (!validRoles.includes(userData.role as string)) {
      errors.push('Invalid user role')
    }

    // Validate profile
    const profile = userData.profile as {
      firstName?: string
      lastName?: string
    }
    if (!profile?.firstName || profile.firstName.trim().length === 0) {
      errors.push('First name is required')
    }

    if (!profile?.lastName || profile.lastName.trim().length === 0) {
      errors.push('Last name is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // ============================================================================
  // Data Export Workflows
  // ============================================================================

  /**
   * Complete data export workflow
   */
  async exportDataWorkflow(exportRequest: ExportRequest): Promise<boolean> {
    try {
      this.dispatch(
        showNotification({
          type: 'info',
          title: 'Export Started',
          message: 'Your data export is being prepared...',
          category: 'system',
        })
      )

      // Execute export based on type
      switch (exportRequest.type) {
        case 'transactions':
          await apiIntegration.exportTransactions({
            format:
              exportRequest.format === 'excel'
                ? 'xlsx'
                : (exportRequest.format as 'csv' | 'json' | 'xlsx'),
            startDate: exportRequest.dateRange?.from,
            endDate: exportRequest.dateRange?.to,
            filters: exportRequest.filters,
          })
          break
        case 'invoices':
          await apiIntegration.exportInvoices({
            format:
              exportRequest.format === 'excel'
                ? 'xlsx'
                : (exportRequest.format as 'csv' | 'json' | 'xlsx'),
            startDate: exportRequest.dateRange?.from,
            endDate: exportRequest.dateRange?.to,
            filters: exportRequest.filters,
          })
          break
        default:
          throw new Error(`Unsupported export type: ${exportRequest.type}`)
      }

      this.dispatch(
        showNotification({
          type: 'success',
          title: 'Export Complete',
          message: 'Your data has been exported successfully',
          category: 'system',
        })
      )

      return true
    } catch (error) {
      console.error('Export workflow error:', error)
      this.dispatch(
        showNotification({
          type: 'error',
          title: 'Export Failed',
          message:
            error instanceof Error ? error.message : 'Could not export data',
          category: 'system',
        })
      )
      return false
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Validate blockchain address
   */
  private isValidAddress(address: string, blockchain: string): boolean {
    // Basic validation - in production, use proper address validation libraries
    switch (blockchain.toLowerCase()) {
      case 'bitcoin':
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(
          address
        )
      case 'ethereum':
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      case 'solana':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
      default:
        return false
    }
  }

  /**
   * Handle API errors consistently
   */
  // @ts-expect-error - Unused but kept for future use
  private handleApiError(error: unknown, context: string): void {
    console.error(`${context} error:`, error)

    let message = 'An unexpected error occurred'

    const err = error as {
      response?: { data?: { message?: string }; status?: number }
      request?: unknown
      message?: string
    }
    if (err.response) {
      // API error response
      message =
        err.response.data?.message || `Server error (${err.response.status})`
    } else if (err.request) {
      // Network error
      message = 'Network error. Please check your connection.'
    } else if (err.message) {
      // Other error
      message = err.message
    }

    this.dispatch(
      showNotification({
        type: 'error',
        title: 'Error',
        message,
        category: 'system',
      })
    )
  }

  /**
   * Retry failed operations with exponential backoff
   */
  // @ts-expect-error - Unused but kept for future use
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          throw lastError
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

// Create singleton instance
export const workflowIntegration = new WorkflowIntegrationService()
export default workflowIntegration

// Common type definitions for the application

// ============================================================================
// User and Authentication Types
// ============================================================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  isEmailVerified: boolean
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 'user' | 'merchant' | 'admin'

export interface UserProfile extends User {
  phoneNumber?: string
  dateOfBirth?: string
  address?: UserAddress
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  twoFactorEnabled: boolean
}

export interface UserAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, unknown>
  timestamp?: string
}

// ============================================================================
// Blockchain and Wallet Types
// ============================================================================

export type BlockchainType = 'bitcoin' | 'ethereum' | 'solana'

export interface Wallet {
  id: string
  userId: string
  blockchain: BlockchainType
  address: string
  balance: string
  usdValue: number
  label?: string
  isActive: boolean
  isWatchOnly: boolean
  derivationPath?: string
  createdAt: string
  updatedAt: string
}

export interface WalletAddress {
  id: string
  walletId: string
  address: string
  blockchain: BlockchainType
  balance: string
  usdValue: number
  isActive: boolean
  label?: string
  qrCode: string
  createdAt: string
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface Transaction {
  id: string
  type: TransactionType
  fromAddress: string
  toAddress: string
  amount: string
  blockchain: BlockchainType
  status: TransactionStatus
  txHash?: string
  fee: string
  feeUSD: number
  confirmations: number
  requiredConfirmations: number
  memo?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  failedAt?: string
}

export type TransactionType = 'p2p' | 'merchant' | 'withdraw' | 'deposit'
export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'expired'

export interface TransactionFee {
  blockchain: BlockchainType
  slow: {
    fee: string
    estimatedTime: number
  }
  standard: {
    fee: string
    estimatedTime: number
  }
  fast: {
    fee: string
    estimatedTime: number
  }
}

// ============================================================================
// Merchant Types
// ============================================================================

export interface MerchantProfile {
  id: string
  userId: string
  businessName: string
  businessType: string
  website?: string
  description?: string
  logo?: string
  address?: UserAddress
  taxId?: string
  isVerified: boolean
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  apiKeys: MerchantApiKey[]
  webhookUrl?: string
  createdAt: string
  updatedAt: string
}

export interface MerchantApiKey {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
}

export interface Invoice {
  id: string
  merchantId: string
  amount: string
  currency: string
  description?: string
  status: InvoiceStatus
  paymentAddress: string
  blockchain: BlockchainType
  qrCode: string
  expirationTime: string
  paidAmount?: string
  paidAt?: string
  transactionId?: string
  webhookUrl?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type InvoiceStatus =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'cancelled'
  | 'overpaid'
  | 'underpaid'

export interface MerchantAnalytics {
  totalRevenue: string
  totalRevenueUSD: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  successRate: number
  averageTransactionValue: string
  averageTransactionValueUSD: number
  topCurrency: BlockchainType
  revenueByPeriod: RevenueDataPoint[]
  transactionsByStatus: TransactionStatusCount[]
  revenueByBlockchain: BlockchainRevenue[]
}

export interface RevenueDataPoint {
  date: string
  revenue: string
  revenueUSD: number
  transactionCount: number
}

export interface TransactionStatusCount {
  status: TransactionStatus
  count: number
  percentage: number
}

export interface BlockchainRevenue {
  blockchain: BlockchainType
  revenue: string
  revenueUSD: number
  transactionCount: number
  percentage: number
}

// ============================================================================
// Admin Types
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  version: string
  services: ServiceStatus[]
  metrics: SystemMetrics
  lastUpdated: string
}

export interface SuspiciousActivity {
  id: string
  transactionId: string
  type:
    | 'high_frequency'
    | 'large_amount'
    | 'unusual_pattern'
    | 'blacklisted_address'
    | 'velocity_check'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  riskScore: number
  flags: string[]
  detectedAt: string
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive'
  investigatedBy?: string
  investigatedAt?: string
  resolution?: string
  metadata?: Record<string, unknown>
}

export interface TransactionInvestigation {
  id: string
  transactionId: string
  investigatorId: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  findings: InvestigationFinding[]
  notes: InvestigationNote[]
  actions: InvestigationAction[]
  createdAt: string
  updatedAt: string
  closedAt?: string
}

export interface InvestigationFinding {
  id: string
  type:
    | 'suspicious_pattern'
    | 'compliance_issue'
    | 'fraud_indicator'
    | 'technical_issue'
  description: string
  evidence: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
}

export interface InvestigationNote {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

export interface InvestigationAction {
  id: string
  type:
    | 'freeze_account'
    | 'flag_transaction'
    | 'request_documents'
    | 'escalate'
    | 'close_case'
  description: string
  performedBy: string
  performedAt: string
  metadata?: Record<string, unknown>
}

export interface TransactionAnalytics {
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  flaggedTransactions: number
  investigationsOpen: number
  investigationsClosed: number
  averageInvestigationTime: number
  topRiskFactors: {
    factor: string
    count: number
    percentage: number
  }[]
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastCheck: string
  endpoint: string
  errorMessage?: string
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  totalVolume: string
  totalVolumeUSD: number
  systemLoad: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
}

export interface AdminUser extends User {
  permissions: string[]
  lastActivity: string
  loginCount: number
  failedLoginAttempts: number
  isLocked: boolean
  lockedUntil?: string
  twoFactorEnabled: boolean
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted'
}

export interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  isResolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'transaction' | 'system' | 'security' | 'account' | 'marketing'
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown>
  createdAt: string
  readAt?: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// ============================================================================
// WebSocket Message Types
// ============================================================================

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: unknown
  timestamp: string
  id: string
}

export type WebSocketMessageType =
  | 'transaction_update'
  | 'balance_update'
  | 'invoice_paid'
  | 'system_alert'
  | 'user_notification'
  | 'connection_status'
  | 'heartbeat'

export interface TransactionUpdateMessage {
  transactionId: string
  status: TransactionStatus
  confirmations: number
  txHash?: string
  failureReason?: string
}

export interface BalanceUpdateMessage {
  address: string
  blockchain: BlockchainType
  balance: string
  usdValue: number
  lastUpdated: string
}

export interface InvoicePaidMessage {
  invoiceId: string
  transactionId: string
  amount: string
  paidAt: string
}

export interface SystemAlertMessage {
  alert: SystemAlert
}

export interface UserNotificationMessage {
  notification: Notification
}

// ============================================================================
// Form and Validation Types
// ============================================================================

export interface FormError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormError[]
}

// ============================================================================
// Export and Reporting Types
// ============================================================================

export interface ExportRequest {
  format: 'csv' | 'json' | 'excel' | 'pdf'
  type: 'transactions' | 'invoices' | 'analytics' | 'users'
  filters?: Record<string, unknown>
  dateRange?: {
    from: string
    to: string
  }
  columns?: string[]
}

export interface ExportResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  fileName: string
  fileSize?: number
  expiresAt: string
  createdAt: string
}

// ============================================================================
// Chart and Analytics Types
// ============================================================================

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  color?: string
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
  showGrid?: boolean
  colors?: string[]
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: string
  order: SortOrder
}

export interface FilterConfig {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in'
  value: unknown
}

export interface SearchConfig {
  query: string
  fields: string[]
  caseSensitive?: boolean
}

// ============================================================================
// Theme and UI Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  secondaryColor: string
  fontSize: 'small' | 'medium' | 'large'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}

// ============================================================================
// Re-export specialized type modules
// ============================================================================

export * from './api'
export * from './websocket'
export * from './systemConfig'

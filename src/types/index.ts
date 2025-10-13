// Common type definitions for the application

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'user' | 'merchant' | 'admin'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

// Blockchain types
export type BlockchainType = 'bitcoin' | 'ethereum' | 'solana'

export interface Wallet {
  id: string
  userId: string
  blockchain: BlockchainType
  address: string
  balance: string
  isActive: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  fromAddress: string
  toAddress: string
  amount: string
  blockchain: BlockchainType
  status: TransactionStatus
  txHash?: string
  fee: string
  createdAt: string
  confirmedAt?: string
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled'

// UI types
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
  createdAt: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
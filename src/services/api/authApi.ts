import { api } from './client'
import { User, ApiResponse } from '../../types'

// Authentication API request/response types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'user' | 'merchant'
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface LogoutRequest {
  refreshToken: string
}

/**
 * Authentication API client
 * Provides typed methods for all authentication-related endpoints
 */
export class AuthApi {
  /**
   * Login with email and password
   */
  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/login', credentials)
  }

  /**
   * Register new user account
   */
  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/register', userData)
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me')
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    request: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    return api.post<RefreshTokenResponse>('/auth/refresh', request)
  }

  /**
   * Logout user
   */
  static async logout(request: LogoutRequest): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/logout', request)
  }

  /**
   * Change user password
   */
  static async changePassword(
    request: ChangePasswordRequest
  ): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/change-password', request)
  }

  /**
   * Request password reset
   */
  static async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/forgot-password', request)
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/reset-password', request)
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/verify-email', { token })
  }

  /**
   * Resend email verification
   */
  static async resendVerification(email: string): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/resend-verification', { email })
  }

  /**
   * Check if email is available for registration
   */
  static async checkEmailAvailability(
    email: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    return api.get<{ available: boolean }>(
      `/auth/check-email?email=${encodeURIComponent(email)}`
    )
  }

  /**
   * Validate password reset token
   */
  static async validateResetToken(
    token: string
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return api.get<{ valid: boolean }>(
      `/auth/validate-reset-token?token=${encodeURIComponent(token)}`
    )
  }
}

export default AuthApi

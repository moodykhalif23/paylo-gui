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
  refreshToken?: string // Make refreshToken optional since backend doesn't provide it yet
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
    return api.post<AuthResponse>('/api/auth/login', credentials)
  }

  /**
   * Register new user account
   */
  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/api/auth/register', userData)
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/api/auth/me')
  }

  /**
   * Refresh access token
   * NOTE: Not supported by backend (JWT-only). Calling will reject.
   */
  static async refreshToken(
    _request: RefreshTokenRequest
  ): Promise<ApiResponse<RefreshTokenResponse>> {
    return Promise.reject({
      message: 'Refresh token flow not supported by backend',
      status: 400,
    })
  }

  /**
   * Logout user
   * NOTE: Backend does not expose logout; handled client-side.
   */
  static async logout(_request: LogoutRequest): Promise<ApiResponse<void>> {
    return Promise.resolve({
      success: true,
      data: undefined,
      message: 'Logged out locally',
    })
  }

  /**
   * Change user password
   * NOTE: Not implemented on backend.
   */
  static async changePassword(
    _request: ChangePasswordRequest
  ): Promise<ApiResponse<void>> {
    return Promise.reject({
      message: 'Change password not supported by backend',
      status: 400,
    })
  }

  /**
   * Request password reset
   * NOTE: Not implemented on backend.
   */
  static async forgotPassword(
    _request: ForgotPasswordRequest
  ): Promise<ApiResponse<void>> {
    return Promise.reject({
      message: 'Password reset not supported by backend',
      status: 400,
    })
  }

  /**
   * Reset password with token
   * NOTE: Not implemented on backend.
   */
  static async resetPassword(
    _request: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return Promise.reject({
      message: 'Password reset not supported by backend',
      status: 400,
    })
  }

  /**
   * Verify email address
   * NOTE: Not implemented on backend.
   */
  static async verifyEmail(_token: string): Promise<ApiResponse<void>> {
    return Promise.reject({
      message: 'Email verification not supported by backend',
      status: 400,
    })
  }

  /**
   * Resend email verification
   * NOTE: Not implemented on backend.
   */
  static async resendVerification(_email: string): Promise<ApiResponse<void>> {
    return Promise.reject({
      message: 'Email verification not supported by backend',
      status: 400,
    })
  }

  /**
   * Check if email is available for registration
   * NOTE: Not implemented on backend.
   */
  static async checkEmailAvailability(
    _email: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    return Promise.reject({
      message: 'Email availability check not supported by backend',
      status: 400,
    })
  }

  /**
   * Validate password reset token
   * NOTE: Not implemented on backend.
   */
  static async validateResetToken(
    _token: string
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return Promise.reject({
      message: 'Password reset not supported by backend',
      status: 400,
    })
  }
}

export default AuthApi

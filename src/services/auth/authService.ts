import { tokenStorage } from '../api/client'
import { User } from '../../types'
import AuthApi, {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from '../api/authApi'

// Re-export types for convenience
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
}

// Authentication service class
export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await AuthApi.login(credentials)

    // Handle both wrapped and direct response formats
    const data = (response as any).success ? (response as any).data : response

    if (data && (data as AuthResponse).accessToken) {
      const authData = data as AuthResponse
      const { accessToken, refreshToken } = authData

      // Store tokens securely
      tokenStorage.setAccessToken(accessToken)
      if (refreshToken) {
        tokenStorage.setRefreshToken(refreshToken)
      }

      return authData
    }

    throw new Error((response as any).message || 'Login failed')
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await AuthApi.register(userData)

    // Handle both wrapped and direct response formats
    const data = (response as any).success ? (response as any).data : response

    if (data && (data as AuthResponse).accessToken) {
      const authData = data as AuthResponse
      const { accessToken, refreshToken } = authData

      // Store tokens securely
      tokenStorage.setAccessToken(accessToken)
      if (refreshToken) {
        tokenStorage.setRefreshToken(refreshToken)
      }

      return authData
    }

    throw new Error((response as any).message || 'Registration failed')
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = tokenStorage.getRefreshToken()

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await AuthApi.refreshToken({ refreshToken })

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Update stored tokens
        tokenStorage.setAccessToken(accessToken)
        tokenStorage.setRefreshToken(newRefreshToken)

        return response.data
      }

      throw new Error(response.message || 'Token refresh failed')
    } catch (error) {
      // Clear tokens on refresh failure
      this.logout()
      throw error
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await AuthApi.getCurrentUser()

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to get user profile')
  }

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = tokenStorage.getRefreshToken()

      if (refreshToken) {
        // Notify server about logout
        await AuthApi.logout({ refreshToken })
      }
    } catch (_error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', _error)
    } finally {
      // Always clear local tokens
      tokenStorage.clearTokens()
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = tokenStorage.getAccessToken()
    return !!token
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken()
  }

  /**
   * Validate token expiration (basic check)
   */
  isTokenExpired(): boolean {
    const token = tokenStorage.getAccessToken()

    if (!token) {
      return true
    }

    try {
      // Decode JWT payload (basic validation)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      return payload.exp < currentTime
    } catch {
      // If we can't decode the token, consider it expired
      return true
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await AuthApi.changePassword({
      currentPassword,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.message || 'Password change failed')
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await AuthApi.forgotPassword({ email })

    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed')
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await AuthApi.resetPassword({
      token,
      newPassword,
    })

    if (!response.success) {
      throw new Error(response.message || 'Password reset failed')
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService()
export default authService

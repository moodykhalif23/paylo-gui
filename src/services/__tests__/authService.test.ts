import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../auth/authService'
import { tokenStorage } from '../api/client'
import AuthApi from '../api/authApi'

// Mock the AuthApi
vi.mock('../api/authApi', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('tokenStorage', () => {
    it('should store and retrieve access token', () => {
      const token = 'test-access-token'

      tokenStorage.setAccessToken(token)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'paylo_access_token',
        token
      )

      mockLocalStorage.getItem.mockReturnValue(token)
      const retrievedToken = tokenStorage.getAccessToken()
      expect(retrievedToken).toBe(token)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'paylo_access_token'
      )
    })

    it('should store and retrieve refresh token', () => {
      const token = 'test-refresh-token'

      tokenStorage.setRefreshToken(token)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'paylo_refresh_token',
        token
      )

      mockLocalStorage.getItem.mockReturnValue(token)
      const retrievedToken = tokenStorage.getRefreshToken()
      expect(retrievedToken).toBe(token)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'paylo_refresh_token'
      )
    })

    it('should clear all tokens', () => {
      tokenStorage.clearTokens()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_access_token'
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_refresh_token'
      )
    })
  })

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            role: 'user' as const,
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      }

      vi.mocked(AuthApi.login).mockResolvedValue(mockResponse)

      const result = await authService.login(credentials)

      expect(AuthApi.login).toHaveBeenCalledWith(credentials)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'paylo_access_token',
        'access-token'
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'paylo_refresh_token',
        'refresh-token'
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should throw error on login failure', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      }
      const mockError = new Error('Invalid credentials')

      vi.mocked(AuthApi.login).mockRejectedValue(mockError)

      await expect(authService.login(credentials)).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token')
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when no token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredToken =
        'header.' +
        btoa(JSON.stringify({ exp: Date.now() / 1000 - 3600 })) +
        '.signature'
      mockLocalStorage.getItem.mockReturnValue(expiredToken)

      expect(authService.isTokenExpired()).toBe(true)
    })

    it('should return false for valid token', () => {
      const validToken =
        'header.' +
        btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) +
        '.signature'
      mockLocalStorage.getItem.mockReturnValue(validToken)

      expect(authService.isTokenExpired()).toBe(false)
    })

    it('should return true when no token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(authService.isTokenExpired()).toBe(true)
    })
  })

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      mockLocalStorage.getItem.mockReturnValue('refresh-token')
      vi.mocked(AuthApi.logout).mockResolvedValue({ success: true })

      await authService.logout()

      expect(AuthApi.logout).toHaveBeenCalledWith({
        refreshToken: 'refresh-token',
      })
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_access_token'
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_refresh_token'
      )
    })

    it('should clear tokens even if logout request fails', async () => {
      mockLocalStorage.getItem.mockReturnValue('refresh-token')
      vi.mocked(AuthApi.logout).mockRejectedValue(new Error('Network error'))

      await authService.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_access_token'
      )
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'paylo_refresh_token'
      )
    })
  })
})

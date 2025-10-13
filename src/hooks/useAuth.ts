import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  changePassword,
  clearError,
  initializeAuth,
  resetLoginAttempts,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectLoginAttempts,
} from '../store/slices/authSlice'
import { LoginRequest, RegisterRequest } from '../services/auth/authService'

/**
 * Custom hook for authentication functionality
 */
export const useAuth = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const auth = useAppSelector(selectAuth)
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectAuthError)
  const loginAttempts = useAppSelector(selectLoginAttempts)

  // Actions
  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginUser(credentials))
      return result
    },
    [dispatch]
  )

  const register = useCallback(
    async (userData: RegisterRequest) => {
      const result = await dispatch(registerUser(userData))
      return result
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    const result = await dispatch(logoutUser())
    return result
  }, [dispatch])

  const fetchCurrentUser = useCallback(async () => {
    const result = await dispatch(getCurrentUser())
    return result
  }, [dispatch])

  const refreshAuthToken = useCallback(async () => {
    const result = await dispatch(refreshToken())
    return result
  }, [dispatch])

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await dispatch(
        changePassword({ currentPassword, newPassword })
      )
      return result
    },
    [dispatch]
  )

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const resetAttempts = useCallback(() => {
    dispatch(resetLoginAttempts())
  }, [dispatch])

  const initialize = useCallback(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Initialize auth state on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Auto-fetch user data if authenticated but no user data
  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      fetchCurrentUser()
    }
  }, [isAuthenticated, user, isLoading, fetchCurrentUser])

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!user) return false

      if (Array.isArray(role)) {
        return role.includes(user.role)
      }

      return user.role === role
    },
    [user]
  )

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin')
  }, [hasRole])

  // Check if user is merchant
  const isMerchant = useCallback(() => {
    return hasRole('merchant')
  }, [hasRole])

  // Check if user is regular user
  const isUser = useCallback(() => {
    return hasRole('user')
  }, [hasRole])

  // Check if login attempts should be limited
  const shouldLimitLogin = useCallback(() => {
    const maxAttempts = 5
    const lockoutDuration = 15 * 60 * 1000 // 15 minutes

    if (loginAttempts >= maxAttempts) {
      const lastAttempt = auth.lastLoginAttempt
      if (lastAttempt && Date.now() - lastAttempt < lockoutDuration) {
        return true
      }
    }

    return false
  }, [loginAttempts, auth.lastLoginAttempt])

  // Get remaining lockout time
  const getLockoutTimeRemaining = useCallback(() => {
    const lockoutDuration = 15 * 60 * 1000 // 15 minutes
    const lastAttempt = auth.lastLoginAttempt

    if (lastAttempt) {
      const remaining = lockoutDuration - (Date.now() - lastAttempt)
      return Math.max(0, remaining)
    }

    return 0
  }, [auth.lastLoginAttempt])

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    loginAttempts,

    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshAuthToken,
    updatePassword,
    clearAuthError,
    resetAttempts,
    initialize,

    // Utilities
    hasRole,
    isAdmin,
    isMerchant,
    isUser,
    shouldLimitLogin,
    getLockoutTimeRemaining,
  }
}

export default useAuth

import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../store'
import { initializeAuth, getCurrentUser } from '../../store/slices/authSlice'
import { authService } from '../../services/auth/authService'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAppSelector(state => state.auth)

  useEffect(() => {
    // Initialize auth state from stored tokens
    dispatch(initializeAuth())

    // If we have a token but no user data, fetch current user
    const token = authService.getAccessToken()
    if (token && !authService.isTokenExpired() && !user && !isLoading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user, isLoading])

  return <>{children}</>
}

export default AuthGuard

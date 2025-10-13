import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '../../components/auth'
import { useAuth } from '../../hooks/useAuth'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const from =
        (location.state as { from?: string })?.from ||
        getDefaultRedirect(user.role)
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location.state])

  const getDefaultRedirect = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin'
      case 'merchant':
        return '/merchant'
      case 'user':
      default:
        return '/dashboard'
    }
  }

  // Don't render if already authenticated (prevents flash)
  if (isAuthenticated) {
    return null
  }

  return (
    <AuthLayout
      initialMode="login"
      redirectTo={(location.state as { from?: string })?.from}
    />
  )
}

export default LoginPage

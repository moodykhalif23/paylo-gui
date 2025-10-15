import React, { useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../../components/auth'
import { useAuth } from '../../hooks/useAuth'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
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

  const role = searchParams.get('role') as 'user' | 'merchant' | null

  return (
    <AuthLayout
      initialMode="register"
      redirectTo={(location.state as { from?: string })?.from}
      initialRole={role || undefined}
    />
  )
}

export default RegisterPage

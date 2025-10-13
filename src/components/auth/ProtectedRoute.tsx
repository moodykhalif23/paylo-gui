import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  redirectTo = '/login',
  fallback,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          gap={2}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Checking authentication...
          </Typography>
        </Box>
      )
    )
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    )
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role)

    if (!hasRequiredRole) {
      // Redirect based on user role if they don't have access
      const roleRedirects: Record<UserRole, string> = {
        user: '/dashboard',
        merchant: '/merchant',
        admin: '/admin',
      }

      return <Navigate to={roleRedirects[user.role] || '/dashboard'} replace />
    }
  }

  // Render children if all checks pass
  return <>{children}</>
}

// Convenience components for specific roles
export const AdminRoute: React.FC<
  Omit<ProtectedRouteProps, 'requiredRoles'>
> = props => <ProtectedRoute {...props} requiredRoles={['admin']} />

export const MerchantRoute: React.FC<
  Omit<ProtectedRouteProps, 'requiredRoles'>
> = props => <ProtectedRoute {...props} requiredRoles={['merchant']} />

export const UserRoute: React.FC<
  Omit<ProtectedRouteProps, 'requiredRoles'>
> = props => <ProtectedRoute {...props} requiredRoles={['user']} />

export const MerchantOrAdminRoute: React.FC<
  Omit<ProtectedRouteProps, 'requiredRoles'>
> = props => <ProtectedRoute {...props} requiredRoles={['merchant', 'admin']} />

export default ProtectedRoute

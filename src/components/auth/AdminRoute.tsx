import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Alert, Typography } from '@mui/material'
import { useAppSelector } from '../../store'
import { selectAuth } from '../../store/slices/authSlice'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * AdminRoute component that protects admin-only routes
 * Ensures only authenticated users with admin role can access admin pages
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAppSelector(selectAuth)
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verifying admin access...
        </Typography>
      </Box>
    )
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
          p: 4,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            You do not have administrator privileges to access this page. Please
            contact your system administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Box>
    )
  }

  // User is authenticated and has admin role
  return <>{children}</>
}

export default AdminRoute

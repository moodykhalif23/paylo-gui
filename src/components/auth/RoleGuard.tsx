import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import {
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store'
import { UserRole } from '../../types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  showFallback?: boolean
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  showFallback = true,
}) => {
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.auth)

  // If user doesn't exist or doesn't have required role
  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showFallback) {
      return null
    }

    // Default unauthorized access message
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <LockIcon sx={{ fontSize: 64, color: 'text.secondary' }} />

        <Box>
          <Typography variant="h5" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Required roles: {allowedRoles.join(', ')}
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Your role: {user.role}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    )
  }

  return <>{children}</>
}

export default RoleGuard

import React from 'react'
import {
  Alert,
  AlertTitle,
  Snackbar,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { Notification } from '../../types'

// ============================================================================
// Types
// ============================================================================

interface NotificationToastProps {
  notification: Notification
  open: boolean
  onClose: () => void
  onAcknowledge?: () => void
  autoHideDuration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

// ============================================================================
// Component
// ============================================================================

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  open,
  onClose,
  onAcknowledge,
  autoHideDuration = 6000,
  position = 'top-right',
}) => {
  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    onClose()
  }

  const handleAcknowledge = () => {
    onAcknowledge?.()
    onClose()
  }

  // Get severity and icon based on notification type
  const getSeverityConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          severity: 'success' as const,
          icon: <SuccessIcon />,
        }
      case 'error':
        return {
          severity: 'error' as const,
          icon: <ErrorIcon />,
        }
      case 'warning':
        return {
          severity: 'warning' as const,
          icon: <WarningIcon />,
        }
      case 'info':
      default:
        return {
          severity: 'info' as const,
          icon: <InfoIcon />,
        }
    }
  }

  const { severity, icon } = getSeverityConfig()

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get anchor origin from position
  const getAnchorOrigin = () => {
    switch (position) {
      case 'top-left':
        return { vertical: 'top' as const, horizontal: 'left' as const }
      case 'top-right':
        return { vertical: 'top' as const, horizontal: 'right' as const }
      case 'bottom-left':
        return { vertical: 'bottom' as const, horizontal: 'left' as const }
      case 'bottom-right':
        return { vertical: 'bottom' as const, horizontal: 'right' as const }
      default:
        return { vertical: 'top' as const, horizontal: 'right' as const }
    }
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={notification.persistent ? null : autoHideDuration}
      onClose={handleClose}
      anchorOrigin={getAnchorOrigin()}
      sx={{ mt: position.startsWith('top') ? 8 : 0 }} // Account for header height only for top positions
    >
      <Alert
        severity={severity}
        icon={icon}
        variant="filled"
        sx={{
          minWidth: 300,
          maxWidth: 500,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {notification.actionRequired && onAcknowledge && (
              <Chip
                label="Acknowledge"
                size="small"
                variant="outlined"
                onClick={handleAcknowledge}
                sx={{
                  color: 'inherit',
                  borderColor: 'currentColor',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
            )}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2" component="span">
              {notification.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {formatTimestamp(notification.createdAt)}
            </Typography>
          </Box>
        </AlertTitle>

        <Typography variant="body2" sx={{ mb: 1 }}>
          {notification.message}
        </Typography>

        {/* Additional metadata */}
        {(notification.category || notification.priority) && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {notification.category && (
              <Chip
                label={notification.category}
                size="small"
                variant="outlined"
                sx={{
                  color: 'inherit',
                  borderColor: 'currentColor',
                  fontSize: '0.75rem',
                }}
              />
            )}
            {notification.priority && notification.priority !== 'medium' && (
              <Chip
                label={notification.priority.toUpperCase()}
                size="small"
                variant="outlined"
                sx={{
                  color: 'inherit',
                  borderColor: 'currentColor',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        )}
      </Alert>
    </Snackbar>
  )
}

export default NotificationToast

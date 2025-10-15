import React from 'react'
import {
  Box,
  Typography,
  Button,
  Alert,
  Skeleton,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material'
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  WifiOff as OfflineIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material'

// ============================================================================
// Loading Fallbacks
// ============================================================================

export const DashboardSkeleton: React.FC = () => (
  <Container maxWidth="xl" sx={{ py: 3 }}>
    <Grid container spacing={3}>
      {/* Header skeleton */}
      <Grid item xs={12}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
      </Grid>

      {/* Stats cards skeleton */}
      {[1, 2, 3, 4].map(item => (
        <Grid item xs={12} sm={6} md={3} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mt: 2 }} />
              <Skeleton variant="text" width="60%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Chart skeleton */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Table skeleton */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={24} />
            {[1, 2, 3, 4, 5].map(row => (
              <Box
                key={row}
                sx={{ display: 'flex', alignItems: 'center', mt: 2 }}
              >
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="50%" />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Container>
)

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Box>
    {/* Table header */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      {[1, 2, 3, 4].map(col => (
        <Skeleton key={col} variant="text" width="20%" height={24} />
      ))}
    </Box>

    {/* Table rows */}
    {Array.from({ length: rows }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
        {[1, 2, 3, 4].map(col => (
          <Skeleton key={col} variant="text" width="20%" height={20} />
        ))}
      </Box>
    ))}
  </Box>
)

export const FormSkeleton: React.FC = () => (
  <Box sx={{ maxWidth: 600 }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />

    {[1, 2, 3].map(field => (
      <Box key={field} sx={{ mb: 3 }}>
        <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={56} />
      </Box>
    ))}

    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
      <Skeleton variant="rectangular" width={120} height={36} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </Box>
  </Box>
)

// ============================================================================
// Error Fallbacks
// ============================================================================

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showDetails?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'contained' | 'outlined' | 'text'
    startIcon?: React.ReactNode
  }>
}

export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  showDetails = false,
  actions = [],
}) => {
  const defaultActions = [
    {
      label: 'Try Again',
      onClick: resetError || (() => window.location.reload()),
      variant: 'contained' as const,
      startIcon: <RefreshIcon />,
    },
    {
      label: 'Go Home',
      onClick: () => (window.location.href = '/'),
      variant: 'outlined' as const,
      startIcon: <HomeIcon />,
    },
  ]

  const finalActions = actions.length > 0 ? actions : defaultActions

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 3,
        textAlign: 'center',
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 600 }}
      >
        {message}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {finalActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'contained'}
            startIcon={action.startIcon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Box>

      {showDetails && error && process.env.NODE_ENV === 'development' && (
        <Alert
          severity="error"
          sx={{ mt: 3, textAlign: 'left', maxWidth: 800 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Error Details:
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          >
            {error.message}
          </Typography>
          {error.stack && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                mt: 1,
                whiteSpace: 'pre-wrap',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {error.stack}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  )
}

export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = props => (
  <GenericErrorFallback
    {...props}
    title="Connection Problem"
    message="Unable to connect to the server. Please check your internet connection and try again."
    actions={[
      {
        label: 'Retry',
        onClick: props.resetError || (() => window.location.reload()),
        variant: 'contained',
        startIcon: <RefreshIcon />,
      },
      {
        label: 'Work Offline',
        onClick: () => {
          // Enable offline mode if available
          console.log('Enabling offline mode')
        },
        variant: 'outlined',
        startIcon: <OfflineIcon />,
      },
    ]}
  />
)

export const AuthenticationErrorFallback: React.FC<
  ErrorFallbackProps
> = props => (
  <GenericErrorFallback
    {...props}
    title="Authentication Required"
    message="Your session has expired or you don't have permission to access this resource."
    actions={[
      {
        label: 'Sign In',
        onClick: () => (window.location.href = '/auth/login'),
        variant: 'contained',
        startIcon: <SecurityIcon />,
      },
      {
        label: 'Go Home',
        onClick: () => (window.location.href = '/'),
        variant: 'outlined',
        startIcon: <HomeIcon />,
      },
    ]}
  />
)

export const NotFoundFallback: React.FC<ErrorFallbackProps> = props => (
  <GenericErrorFallback
    {...props}
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    actions={[
      {
        label: 'Go Home',
        onClick: () => (window.location.href = '/'),
        variant: 'contained',
        startIcon: <HomeIcon />,
      },
      {
        label: 'Dashboard',
        onClick: () => (window.location.href = '/dashboard'),
        variant: 'outlined',
        startIcon: <DashboardIcon />,
      },
    ]}
  />
)

export const ServerErrorFallback: React.FC<ErrorFallbackProps> = props => (
  <GenericErrorFallback
    {...props}
    title="Server Error"
    message="The server encountered an error while processing your request. Our team has been notified."
    actions={[
      {
        label: 'Try Again',
        onClick: props.resetError || (() => window.location.reload()),
        variant: 'contained',
        startIcon: <RefreshIcon />,
      },
      {
        label: 'Go Home',
        onClick: () => (window.location.href = '/'),
        variant: 'outlined',
        startIcon: <HomeIcon />,
      },
    ]}
  />
)

// ============================================================================
// Loading States
// ============================================================================

interface LoadingFallbackProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'circular' | 'linear'
  fullScreen?: boolean
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant: _variant = 'circular',
  fullScreen = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  }

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={sizeMap[size]} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    )
  }

  return content
}

// ============================================================================
// Offline Fallback
// ============================================================================

export const OfflineFallback: React.FC = () => (
  <Alert
    severity="warning"
    sx={{ mb: 2 }}
    icon={<OfflineIcon />}
    action={
      <IconButton
        color="inherit"
        size="small"
        onClick={() => window.location.reload()}
      >
        <RefreshIcon />
      </IconButton>
    }
  >
    <Typography variant="body2">
      You're currently offline. Some features may not be available.
    </Typography>
  </Alert>
)

// ============================================================================
// Empty State Fallbacks
// ============================================================================

interface EmptyStateFallbackProps {
  title: string
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyStateFallback: React.FC<EmptyStateFallbackProps> = ({
  title,
  message,
  icon,
  action,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      p: 3,
      textAlign: 'center',
    }}
  >
    {icon && (
      <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>{icon}</Box>
    )}

    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>

    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 3, maxWidth: 400 }}
    >
      {message}
    </Typography>

    {action && (
      <Button variant="contained" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </Box>
)

export default {
  DashboardSkeleton,
  TableSkeleton,
  FormSkeleton,
  GenericErrorFallback,
  NetworkErrorFallback,
  AuthenticationErrorFallback,
  NotFoundFallback,
  ServerErrorFallback,
  LoadingFallback,
  OfflineFallback,
  EmptyStateFallback,
}

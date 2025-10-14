import React from 'react'
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  Sync as ConnectingIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useAppSelector } from '../../store'
import {
  selectConnectionStatus,
  selectWebSocketMetrics,
  selectConnectionHistory,
  selectReconnectAttempts,
  selectWebSocketError,
} from '../../store/slices/websocketSlice'

// ============================================================================
// Types
// ============================================================================

interface ConnectionStatusProps {
  showDetails?: boolean
  variant?: 'chip' | 'icon' | 'full'
  size?: 'small' | 'medium'
}

// ============================================================================
// Component
// ============================================================================

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showDetails = false,
  variant = 'chip',
  size = 'medium',
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const connectionStatus = useAppSelector(selectConnectionStatus)
  const metrics = useAppSelector(selectWebSocketMetrics)
  const connectionHistory = useAppSelector(selectConnectionHistory)
  const reconnectAttempts = useAppSelector(selectReconnectAttempts)
  const error = useAppSelector(selectWebSocketError)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (showDetails) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // Get status configuration
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          label: 'Connected',
          color: 'success' as const,
          icon: <ConnectedIcon />,
          description: 'Real-time connection active',
        }
      case 'connecting':
        return {
          label: 'Connecting',
          color: 'warning' as const,
          icon: <ConnectingIcon className="animate-spin" />,
          description: 'Establishing connection...',
        }
      case 'error':
        return {
          label: 'Error',
          color: 'error' as const,
          icon: <ErrorIcon />,
          description: error || 'Connection error',
        }
      case 'disconnected':
      default:
        return {
          label: 'Disconnected',
          color: 'default' as const,
          icon: <DisconnectedIcon />,
          description: 'No real-time connection',
        }
    }
  }

  const statusConfig = getStatusConfig()

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <Tooltip title={statusConfig.description}>
            <IconButton
              size={size}
              onClick={handleClick}
              color={statusConfig.color}
            >
              {statusConfig.icon}
            </IconButton>
          </Tooltip>
        )

      case 'full':
        return (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            onClick={handleClick}
            sx={{ cursor: showDetails ? 'pointer' : 'default' }}
          >
            {statusConfig.icon}
            <Typography variant="body2" color={`${statusConfig.color}.main`}>
              {statusConfig.label}
            </Typography>
            {reconnectAttempts > 0 && (
              <Typography variant="caption" color="text.secondary">
                (Attempt {reconnectAttempts})
              </Typography>
            )}
          </Box>
        )

      case 'chip':
      default:
        return (
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size={size}
            onClick={handleClick}
            clickable={showDetails}
            variant={connectionStatus === 'connected' ? 'filled' : 'outlined'}
          />
        )
    }
  }

  return (
    <>
      {renderContent()}

      {/* Details Popover */}
      {showDetails && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, minWidth: 300 }}>
            {/* Status Header */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {statusConfig.icon}
              <Typography variant="h6">Connection Status</Typography>
            </Box>

            {/* Current Status */}
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: <strong>{statusConfig.label}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {statusConfig.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Metrics */}
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Metrics
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Messages Received"
                    secondary={metrics.messagesReceived.toLocaleString()}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Messages Sent"
                    secondary={metrics.messagesSent.toLocaleString()}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Average Latency"
                    secondary={`${Math.round(metrics.averageLatency)}ms`}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText
                    primary="Reconnect Count"
                    secondary={metrics.reconnectCount}
                  />
                </ListItem>
                {metrics.lastHeartbeat && (
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Last Heartbeat"
                      secondary={formatTimestamp(metrics.lastHeartbeat)}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Connection History */}
            {connectionHistory.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <HistoryIcon
                      fontSize="small"
                      sx={{ mr: 0.5, verticalAlign: 'middle' }}
                    />
                    Recent Events
                  </Typography>
                  <List dense>
                    {connectionHistory.slice(0, 5).map((event, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {event.event === 'connected' && (
                            <ConnectedIcon fontSize="small" color="success" />
                          )}
                          {event.event === 'disconnected' && (
                            <DisconnectedIcon fontSize="small" color="action" />
                          )}
                          {event.event === 'error' && (
                            <ErrorIcon fontSize="small" color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            event.event.charAt(0).toUpperCase() +
                            event.event.slice(1)
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {formatTimestamp(event.timestamp)}
                              </Typography>
                              {event.details && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {event.details}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {/* Error Details */}
            {error && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Error Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {error}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Popover>
      )}
    </>
  )
}

export default ConnectionStatus

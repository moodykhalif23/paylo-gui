import React, { useState } from 'react'
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  DoneAll as MarkAllReadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../store'
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../../store/slices/notificationSlice'
import { Notification, NotificationType } from '../../types'

// ============================================================================
// Types
// ============================================================================

interface NotificationBellProps {
  onOpenPreferences?: () => void
  onOpenHistory?: () => void
  maxDisplayItems?: number
}

// ============================================================================
// Component
// ============================================================================

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onOpenPreferences,
  onOpenHistory,
  maxDisplayItems = 5,
}) => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  // Get recent notifications for display
  const recentNotifications = notifications.slice(0, maxDisplayItems)

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" fontSize="small" />
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />
      case 'info':
      default:
        return <InfoIcon color="info" fontSize="small" />
    }
  }

  // Format timestamp for display
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

  // Handle bell click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // Handle popover close
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id))
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  return (
    <>
      <Tooltip
        title={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : 'No new notifications'
        }
      >
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="notifications"
          aria-describedby={open ? 'notification-popover' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsOffIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        id="notification-popover"
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
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton size="small" onClick={handleMarkAllAsRead}>
                    <MarkAllReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onOpenPreferences && (
                <Tooltip title="Notification preferences">
                  <IconButton size="small" onClick={onOpenPreferences}>
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Notification List */}
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {recentNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsOffIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.isRead
                        ? 'transparent'
                        : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.isRead
                                ? 'normal'
                                : 'bold',
                              flex: 1,
                            }}
                            noWrap
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.5,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {notification.category && (
                                <Chip
                                  label={notification.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              {notification.priority !== 'medium' && (
                                <Chip
                                  label={notification.priority.toUpperCase()}
                                  size="small"
                                  color={
                                    notification.priority === 'high' ||
                                    notification.priority === 'critical'
                                      ? 'error'
                                      : 'default'
                                  }
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(notification.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>

                  {index < recentNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onOpenHistory && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      onOpenHistory()
                      handleClose()
                    }}
                  >
                    View All
                  </Button>
                )}
                {notifications.length > maxDisplayItems && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ alignSelf: 'center' }}
                  >
                    +{notifications.length - maxDisplayItems} more
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </Popover>
    </>
  )
}

export default NotificationBell

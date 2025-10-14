import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tabs,
  Tab,
  Badge,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  MarkAsUnread as MarkUnreadIcon,
  DoneAll as MarkAllReadIcon,
} from '@mui/icons-material'
// import { useAppDispatch } from '../../store' // TODO: Use when connecting to Redux store
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '../../types'

// ============================================================================
// Types
// ============================================================================

interface NotificationCenterProps {
  maxHeight?: number
  showFilters?: boolean
  showTabs?: boolean
}

interface NotificationFilters {
  type?: NotificationType
  priority?: NotificationPriority
  category?: string
  read?: boolean
}

// ============================================================================
// Component
// ============================================================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxHeight = 400,
  showFilters = true,
  showTabs = true,
}) => {
  // const dispatch = useAppDispatch() // TODO: Use when connecting to Redux store

  // Mock notifications - in real app, these would come from Redux store
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [selectedTab, setSelectedTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedNotification, setSelectedNotification] = useState<
    string | null
  >(null)

  // Mock data - replace with actual Redux selectors
  useEffect(() => {
    // This would be replaced with actual notification data from Redux store
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Transaction Confirmed',
        message:
          'Your Bitcoin transaction has been confirmed with 6 confirmations.',
        type: 'success',
        priority: 'medium',
        category: 'transaction',
        read: false,
        persistent: false,
        actionRequired: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
        userId: 'user1',
      },
      {
        id: '2',
        title: 'Payment Received',
        message:
          'You received 0.001 BTC from address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        type: 'success',
        priority: 'high',
        category: 'payment',
        read: false,
        persistent: false,
        actionRequired: false,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
        userId: 'user1',
      },
      {
        id: '3',
        title: 'System Maintenance',
        message:
          'Scheduled maintenance will begin in 30 minutes. Some features may be unavailable.',
        type: 'warning',
        priority: 'high',
        category: 'system',
        read: true,
        persistent: true,
        actionRequired: true,
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
        userId: 'user1',
      },
      {
        id: '4',
        title: 'Failed Transaction',
        message:
          'Your Ethereum transaction failed due to insufficient gas fees.',
        type: 'error',
        priority: 'high',
        category: 'transaction',
        read: false,
        persistent: false,
        actionRequired: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
        userId: 'user1',
      },
    ]
    setNotifications(mockNotifications)
  }, [])

  // Filter notifications based on current filters and tab
  const filteredNotifications = notifications.filter(notification => {
    // Tab filtering
    if (selectedTab === 1 && notification.read) return false // Unread tab
    if (selectedTab === 2 && !notification.actionRequired) return false // Action required tab

    // Additional filters
    if (filters.type && notification.type !== filters.type) return false
    if (filters.priority && notification.priority !== filters.priority)
      return false
    if (filters.category && notification.category !== filters.category)
      return false
    if (filters.read !== undefined && notification.read !== filters.read)
      return false

    return true
  })

  // Get notification counts for tabs
  const allCount = notifications.length
  const unreadCount = notifications.filter(n => !n.read).length
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />
      case 'error':
        return <ErrorIcon color="error" />
      case 'warning':
        return <WarningIcon color="warning" />
      case 'info':
      default:
        return <InfoIcon color="info" />
    }
  }

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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  // Handle filter change
  const handleFilterChange =
    (field: keyof NotificationFilters) =>
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value
      setFilters(prev => ({
        ...prev,
        [field]: value === '' ? undefined : value,
      }))
    }

  // Handle notification actions
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    notificationId: string
  ) => {
    setAnchorEl(event.currentTarget)
    setSelectedNotification(notificationId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedNotification(null)
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    )
    handleMenuClose()
  }

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: false } : n))
    )
    handleMenuClose()
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    handleMenuClose()
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Button
            size="small"
            startIcon={<MarkAllReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
        </Box>

        {/* Tabs */}
        {showTabs && (
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab
              label={
                <Badge badgeContent={allCount} color="primary" max={99}>
                  All
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  Unread
                </Badge>
              }
            />
            <Tab
              label={
                <Badge
                  badgeContent={actionRequiredCount}
                  color="warning"
                  max={99}
                >
                  Action Required
                </Badge>
              }
            />
          </Tabs>
        )}
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <FilterIcon color="action" />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type || ''}
                label="Type"
                onChange={handleFilterChange('type')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority || ''}
                label="Priority"
                onChange={handleFilterChange('priority')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || ''}
                label="Category"
                onChange={handleFilterChange('category')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="transaction">Transaction</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="security">Security</MenuItem>
              </Select>
            </FormControl>

            {Object.keys(filters).length > 0 && (
              <Button size="small" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Notification List */}
      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications found
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.read
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
                            fontWeight: notification.read ? 'normal' : 'bold',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {notification.persistent && (
                          <Chip
                            label="Persistent"
                            size="small"
                            color="warning"
                          />
                        )}
                        {notification.actionRequired && (
                          <Chip
                            label="Action Required"
                            size="small"
                            color="error"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {notification.category && (
                              <Chip
                                label={notification.category}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {notification.priority !== 'medium' && (
                              <Chip
                                label={notification.priority.toUpperCase()}
                                size="small"
                                color={
                                  notification.priority === 'high'
                                    ? 'error'
                                    : 'default'
                                }
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={e => handleMenuOpen(e, notification.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && (
          <>
            {notifications.find(n => n.id === selectedNotification)?.read ? (
              <MenuItem
                onClick={() => handleMarkAsUnread(selectedNotification)}
              >
                <MarkUnreadIcon sx={{ mr: 1 }} />
                Mark as Unread
              </MenuItem>
            ) : (
              <MenuItem onClick={() => handleMarkAsRead(selectedNotification)}>
                <SuccessIcon sx={{ mr: 1 }} />
                Mark as Read
              </MenuItem>
            )}
            <MenuItem onClick={() => handleDelete(selectedNotification)}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  )
}

export default NotificationCenter

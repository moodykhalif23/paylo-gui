import React, { useState, useMemo } from 'react'
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Badge,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff,
  Search as SearchIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../store'
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
  markAsUnread,
  removeNotification,
  clearReadNotifications,
  markAllAsRead,
} from '../../store/slices/notificationSlice'
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../../types'

// ============================================================================
// Types
// ============================================================================

interface NotificationHistoryProps {
  maxHeight?: number
  itemsPerPage?: number
  showFilters?: boolean
  showSearch?: boolean
  onRefresh?: () => void
}

interface NotificationFilters {
  type?: NotificationType
  priority?: NotificationPriority
  category?: NotificationCategory
  read?: boolean
  dateRange?: {
    from: string
    to: string
  }
}

// ============================================================================
// Component
// ============================================================================

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  maxHeight = 600,
  itemsPerPage = 10,
  showFilters = true,
  showSearch = true,
  onRefresh,
}) => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<NotificationFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        notification =>
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query) ||
          notification.category.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type)
    }
    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority)
    }
    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category)
    }
    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.isRead === filters.read)
    }
    if (filters.dateRange?.from) {
      filtered = filtered.filter(
        n => new Date(n.createdAt) >= new Date(filters.dateRange!.from)
      )
    }
    if (filters.dateRange?.to) {
      filtered = filtered.filter(
        n => new Date(n.createdAt) <= new Date(filters.dateRange!.to)
      )
    }

    return filtered
  }, [notifications, searchQuery, filters])

  // Paginate notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotifications, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)

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

  // Get priority color
  const getPriorityColor = (
    priority: NotificationPriority
  ): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'critical':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
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

  // Handle filter changes
  const handleFilterChange =
    (field: keyof NotificationFilters) =>
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value
      setFilters(prev => ({
        ...prev,
        [field]: value === '' ? undefined : value,
      }))
      setCurrentPage(1) // Reset to first page when filters change
    }

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page)
  }

  // Handle notification actions
  const handleToggleRead = (notification: Notification) => {
    if (notification.isRead) {
      dispatch(markAsUnread(notification.id))
    } else {
      dispatch(markAsRead(notification.id))
    }
  }

  const handleDelete = (notificationId: string) => {
    dispatch(removeNotification(notificationId))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead())
  }

  const handleClearRead = () => {
    dispatch(clearReadNotifications())
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setCurrentPage(1)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            <Typography variant="h6">Notification History</Typography>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Box />
            </Badge>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {showFilters && (
              <Tooltip title="Toggle Filters">
                <IconButton
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  color={showFiltersPanel ? 'primary' : 'default'}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />

      <CardContent
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 0 }}
      >
        {/* Search and Actions */}
        <Box sx={{ mb: 2 }}>
          {showSearch && (
            <TextField
              fullWidth
              size="small"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              size="small"
              onClick={handleClearRead}
              disabled={notifications.filter(n => n.isRead).length === 0}
            >
              Clear Read
            </Button>
            {(Object.keys(filters).length > 0 || searchQuery) && (
              <Button size="small" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters Panel */}
        {showFilters && showFiltersPanel && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  <MenuItem value="critical">Critical</MenuItem>
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
                  <MenuItem value="account">Account</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={
                    filters.read !== undefined
                      ? filters.read
                        ? 'read'
                        : 'unread'
                      : ''
                  }
                  label="Status"
                  onChange={e => {
                    const value = e.target.value
                    setFilters(prev => ({
                      ...prev,
                      read: value === '' ? undefined : value === 'read',
                    }))
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="unread">Unread</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* Notification List */}
        <Box sx={{ flex: 1, overflow: 'auto', maxHeight }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {notifications.length === 0
                  ? 'No notifications yet'
                  : 'No notifications match your filters'}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {paginatedNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
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
                              <Chip
                                label={notification.category}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={notification.priority.toUpperCase()}
                                size="small"
                                color={getPriorityColor(notification.priority)}
                                variant="outlined"
                              />
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

                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip
                          title={
                            notification.isRead
                              ? 'Mark as unread'
                              : 'Mark as read'
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleRead(notification)}
                          >
                            {notification.isRead ? (
                              <VisibilityOff />
                            ) : (
                              <ViewIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {index < paginatedNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}

        {/* Summary */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Showing {paginatedNotifications.length} of{' '}
            {filteredNotifications.length} notifications
            {filteredNotifications.length !== notifications.length &&
              ` (${notifications.length} total)`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default NotificationHistory

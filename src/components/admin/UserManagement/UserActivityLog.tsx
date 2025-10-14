import React, { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'

interface UserActivity {
  id: string
  userId: string
  type:
    | 'login'
    | 'logout'
    | 'password_change'
    | 'profile_update'
    | 'transaction'
    | 'security'
    | 'admin_action'
  action: string
  description: string
  ipAddress: string
  userAgent: string
  location?: string
  metadata?: Record<string, unknown>
  severity: 'info' | 'warning' | 'error' | 'success'
  createdAt: string
}

interface UserActivityLogProps {
  userId: string
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')

  // Mock data for demonstration - in real implementation, this would fetch from API
  React.useEffect(() => {
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId,
        type: 'login',
        action: 'user_login',
        description: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, US',
        severity: 'success',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        userId,
        type: 'transaction',
        action: 'transaction_created',
        description: 'Created P2P transaction for 0.001 BTC',
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, US',
        metadata: { amount: '0.001', currency: 'BTC', transactionId: 'tx_123' },
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: '3',
        userId,
        type: 'security',
        action: 'failed_login_attempt',
        description: 'Failed login attempt with incorrect password',
        ipAddress: '192.168.1.101',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Unknown',
        severity: 'warning',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        id: '4',
        userId,
        type: 'profile_update',
        action: 'profile_updated',
        description: 'Updated profile information',
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, US',
        metadata: { fields: ['firstName', 'lastName'] },
        severity: 'info',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      },
      {
        id: '5',
        userId,
        type: 'admin_action',
        action: 'account_suspended',
        description: 'Account was suspended by administrator',
        ipAddress: '10.0.0.1',
        userAgent: 'Admin Panel',
        location: 'Internal',
        metadata: { adminId: 'admin_123', reason: 'Suspicious activity' },
        severity: 'error',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      },
    ]

    setActivities(mockActivities)
    setTotalPages(1)
  }, [userId])

  const getActivityIcon = (type: string, severity: string) => {
    switch (type) {
      case 'login':
        return <LoginIcon color="success" />
      case 'logout':
        return <LogoutIcon color="action" />
      case 'password_change':
      case 'security':
        return severity === 'error' || severity === 'warning' ? (
          <WarningIcon color="warning" />
        ) : (
          <SecurityIcon color="primary" />
        )
      case 'profile_update':
        return <EditIcon color="primary" />
      case 'transaction':
        return <InfoIcon color="info" />
      case 'admin_action':
        return severity === 'error' ? (
          <ErrorIcon color="error" />
        ) : (
          <SecurityIcon color="primary" />
        )
      default:
        return <InfoIcon />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'info':
      default:
        return 'info'
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (typeFilter && activity.type !== typeFilter) return false
    if (severityFilter && activity.severity !== severityFilter) return false
    return true
  })

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6">Activity Log</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={e => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="profile_update">Profile Update</MenuItem>
              <MenuItem value="transaction">Transaction</MenuItem>
              <MenuItem value="admin_action">Admin Action</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Activity List */}
      <Paper>
        {filteredActivities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No activity found for the selected filters
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ mt: 1 }}>
                    {getActivityIcon(activity.type, activity.severity)}
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
                        <Typography variant="body1" fontWeight="medium">
                          {activity.description}
                        </Typography>
                        <Chip
                          label={activity.type.replace('_', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                          color={
                            getSeverityColor(activity.severity) as
                              | 'error'
                              | 'warning'
                              | 'info'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                          {' • '}
                          IP: {activity.ipAddress}
                          {activity.location && ` • ${activity.location}`}
                        </Typography>
                        {activity.metadata && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {Object.entries(activity.metadata)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' • ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredActivities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default UserActivityLog

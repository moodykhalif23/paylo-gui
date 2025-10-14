import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Avatar,
  Chip,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { AdminUser } from '../../../types'
import { formatDistanceToNow } from 'date-fns'
import UserActivityLog from './UserActivityLog'

interface UserDetailsDialogProps {
  open: boolean
  user: AdminUser | null
  onClose: () => void
  onEdit: (user: AdminUser) => void
  onSuspend: (user: AdminUser) => void
  onUnsuspend: (user: AdminUser) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-details-tabpanel-${index}`}
      aria-labelledby={`user-details-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  user,
  onClose,
  onEdit,
  onSuspend,
  onUnsuspend,
}) => {
  const [tabValue, setTabValue] = useState(0)

  if (!user) return null

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'merchant':
        return 'warning'
      case 'user':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusColor = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return 'error'
    if (isActive) return 'success'
    return 'default'
  }

  const getStatusText = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return 'Locked'
    if (isActive) return 'Active'
    return 'Inactive'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              sx={{ width: 48, height: 48 }}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Edit User">
              <IconButton onClick={() => onEdit(user)} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            {user.isActive && !user.isLocked ? (
              <Tooltip title="Suspend User">
                <IconButton
                  onClick={() => onSuspend(user)}
                  size="small"
                  color="error"
                >
                  <BlockIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Unsuspend User">
                <IconButton
                  onClick={() => onUnsuspend(user)}
                  size="small"
                  color="success"
                >
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Profile" />
          <Tab label="Activity" />
          <Tab label="Security" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${user.firstName} ${user.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={user.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member Since"
                      secondary={new Date(user.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Account Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Account Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Role:</Typography>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={
                        getRoleColor(user.role) as
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip
                      label={getStatusText(user.isActive, user.isLocked)}
                      color={
                        getStatusColor(user.isActive, user.isLocked) as
                          | 'success'
                          | 'warning'
                          | 'error'
                      }
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Email Verified:</Typography>
                    <Chip
                      label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                      color={user.isEmailVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Activity Summary */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Activity Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {user.loginCount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Logins
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {user.failedLoginAttempts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed Attempts
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" color="text.primary">
                        {user.lastLoginAt
                          ? formatDistanceToNow(new Date(user.lastLoginAt), {
                              addSuffix: true,
                            })
                          : 'Never'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserActivityLog userId={user.id} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                />
                <Chip
                  label={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  color={user.twoFactorEnabled ? 'success' : 'warning'}
                  size="small"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Account Locked"
                  secondary={
                    user.isLocked
                      ? `Until ${user.lockedUntil ? new Date(user.lockedUntil).toLocaleString() : 'Indefinitely'}`
                      : 'Not locked'
                  }
                />
                <Chip
                  label={user.isLocked ? 'Locked' : 'Unlocked'}
                  color={user.isLocked ? 'error' : 'success'}
                  size="small"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Failed Login Attempts"
                  secondary={`${user.failedLoginAttempts} recent failed attempts`}
                />
                <Typography
                  variant="h6"
                  color={
                    user.failedLoginAttempts > 5 ? 'error' : 'text.primary'
                  }
                >
                  {user.failedLoginAttempts}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsDialog

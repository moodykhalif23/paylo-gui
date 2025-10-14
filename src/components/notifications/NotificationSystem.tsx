import React, { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../store'
import {
  selectNotifications,
  selectUnreadCount,
  markAsRead,
} from '../../store/slices/notificationSlice'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationBell from './NotificationBell'
import NotificationHistory from './NotificationHistory'
import NotificationPreferences from './NotificationPreferences'
import NotificationToast from './NotificationToast'
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../../types'

// ============================================================================
// Types
// ============================================================================

interface NotificationSystemProps {
  enableToasts?: boolean
  enableBell?: boolean
  enableHistory?: boolean
  enablePreferences?: boolean
  toastPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

// ============================================================================
// Tab Panel Component
// ============================================================================

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  enableToasts = true,
  enableBell = true,
  enableHistory = true,
  enablePreferences = true,
  toastPosition = 'top-right',
}) => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)
  const { showNotification } = useNotifications()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [activeToasts, setActiveToasts] = useState<Map<string, Notification>>(
    new Map()
  )
  const [systemMessage, setSystemMessage] = useState<string | null>(null)

  // Handle toast notifications for high priority items
  useEffect(() => {
    if (!enableToasts) return

    const handleNewNotifications = () => {
      const recentNotifications = notifications.filter(n => {
        const createdTime = new Date(n.createdAt).getTime()
        const now = Date.now()
        return (
          !n.isRead &&
          (n.priority === 'high' ||
            n.priority === 'critical' ||
            n.actionRequired) &&
          now - createdTime < 5000 // Show toast for notifications created in last 5 seconds
        )
      })

      recentNotifications.forEach(notification => {
        if (!activeToasts.has(notification.id)) {
          setActiveToasts(
            prev => new Map(prev.set(notification.id, notification))
          )
        }
      })
    }

    handleNewNotifications()
  }, [notifications, enableToasts, activeToasts])

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  // Handle dialog open/close
  const handleOpenDialog = (tab: number = 0) => {
    setCurrentTab(tab)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  // Handle toast close
  const handleToastClose = (notificationId: string) => {
    setActiveToasts(prev => {
      const newMap = new Map(prev)
      newMap.delete(notificationId)
      return newMap
    })
  }

  // Handle toast acknowledge
  const handleToastAcknowledge = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
    handleToastClose(notificationId)
  }

  // Handle preferences save
  const handlePreferencesSave = (_: unknown[]) => {
    // Save preferences logic would go here
    // For now, just show a success message
    setSystemMessage('Notification preferences saved successfully!')
    setTimeout(() => setSystemMessage(null), 3000)
  }

  // Demo function to create test notifications
  const createTestNotification = (
    type: NotificationType,
    priority: NotificationPriority
  ) => {
    const testNotifications = {
      success: {
        title: 'Transaction Confirmed',
        message:
          'Your Bitcoin transaction has been confirmed with 6 confirmations.',
        category: 'transaction' as NotificationCategory,
      },
      error: {
        title: 'Transaction Failed',
        message:
          'Your Ethereum transaction failed due to insufficient gas fees.',
        category: 'transaction' as NotificationCategory,
      },
      warning: {
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin in 30 minutes.',
        category: 'system' as NotificationCategory,
      },
      info: {
        title: 'New Feature Available',
        message: 'Check out our new analytics dashboard!',
        category: 'system' as NotificationCategory,
      },
    }

    const template = testNotifications[type]
    showNotification({
      type,
      priority,
      title: template.title,
      message: template.message,
      category: template.category,
      userId: 'current-user',
      actionRequired: priority === 'critical',
      persistent: priority === 'critical',
    })
  }

  return (
    <>
      {/* Notification Bell */}
      {enableBell && (
        <NotificationBell
          onOpenPreferences={() => handleOpenDialog(1)}
          onOpenHistory={() => handleOpenDialog(0)}
        />
      )}

      {/* Main Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 800,
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon />
              Notifications
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" max={99} />
              )}
            </Box>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              {enableHistory && (
                <Tab
                  icon={<HistoryIcon />}
                  label="History"
                  iconPosition="start"
                />
              )}
              {enablePreferences && (
                <Tab
                  icon={<SettingsIcon />}
                  label="Preferences"
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {enableHistory && (
            <TabPanel value={currentTab} index={0}>
              <NotificationHistory
                maxHeight={500}
                itemsPerPage={10}
                showFilters={true}
                showSearch={true}
                onRefresh={() => {
                  // Refresh logic would go here
                  setSystemMessage('Notifications refreshed')
                  setTimeout(() => setSystemMessage(null), 2000)
                }}
              />
            </TabPanel>
          )}

          {enablePreferences && (
            <TabPanel value={currentTab} index={enableHistory ? 1 : 0}>
              <NotificationPreferences onSave={handlePreferencesSave} />
            </TabPanel>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Close</Button>

          {/* Demo buttons for testing (remove in production) */}
          {import.meta.env.DEV && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => createTestNotification('success', 'medium')}
              >
                Test Success
              </Button>
              <Button
                size="small"
                onClick={() => createTestNotification('error', 'high')}
              >
                Test Error
              </Button>
              <Button
                size="small"
                onClick={() => createTestNotification('warning', 'critical')}
              >
                Test Critical
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      {enableToasts &&
        Array.from(activeToasts.entries()).map(([id, notification]) => (
          <NotificationToast
            key={id}
            notification={notification}
            open={true}
            onClose={() => handleToastClose(id)}
            onAcknowledge={() => handleToastAcknowledge(id)}
            autoHideDuration={notification.persistent ? undefined : 6000}
            position={toastPosition}
          />
        ))}

      {/* System Messages */}
      <Snackbar
        open={Boolean(systemMessage)}
        autoHideDuration={3000}
        onClose={() => setSystemMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSystemMessage(null)}>
          {systemMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default NotificationSystem

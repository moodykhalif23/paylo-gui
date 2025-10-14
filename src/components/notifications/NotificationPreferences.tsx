import React, { useState } from 'react'
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PushIcon,
  Save as SaveIcon,
} from '@mui/icons-material'

// ============================================================================
// Types
// ============================================================================

interface NotificationPreference {
  category: string
  label: string
  description: string
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }
  priority: 'low' | 'medium' | 'high'
  enabled: boolean
}

interface NotificationPreferencesProps {
  onSave?: (preferences: NotificationPreference[]) => void
}

// ============================================================================
// Component
// ============================================================================

export const NotificationPreferences: React.FC<
  NotificationPreferencesProps
> = ({ onSave }) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      category: 'transactions',
      label: 'Transaction Updates',
      description:
        'Notifications about transaction status changes, confirmations, and failures',
      channels: { inApp: true, email: true, sms: false, push: true },
      priority: 'high',
      enabled: true,
    },
    {
      category: 'payments',
      label: 'Payment Notifications',
      description: 'Alerts when you receive payments or when invoices are paid',
      channels: { inApp: true, email: true, sms: true, push: true },
      priority: 'high',
      enabled: true,
    },
    {
      category: 'security',
      label: 'Security Alerts',
      description:
        'Important security notifications, login attempts, and account changes',
      channels: { inApp: true, email: true, sms: true, push: true },
      priority: 'high',
      enabled: true,
    },
    {
      category: 'system',
      label: 'System Notifications',
      description: 'System maintenance, updates, and service announcements',
      channels: { inApp: true, email: false, sms: false, push: false },
      priority: 'medium',
      enabled: true,
    },
    {
      category: 'marketing',
      label: 'Marketing & Updates',
      description:
        'Product updates, feature announcements, and promotional content',
      channels: { inApp: false, email: true, sms: false, push: false },
      priority: 'low',
      enabled: false,
    },
    {
      category: 'analytics',
      label: 'Analytics Reports',
      description: 'Weekly and monthly reports about your account activity',
      channels: { inApp: false, email: true, sms: false, push: false },
      priority: 'low',
      enabled: true,
    },
  ])

  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    groupSimilar: true,
    maxPerHour: 10,
  })

  const [saved, setSaved] = useState(false)

  // Handle preference changes
  const handlePreferenceChange = (
    index: number,
    field: keyof NotificationPreference,
    value: string | boolean | 'low' | 'medium' | 'high'
  ) => {
    setPreferences(prev =>
      prev.map((pref, i) => (i === index ? { ...pref, [field]: value } : pref))
    )
  }

  const handleChannelChange = (
    index: number,
    channel: keyof NotificationPreference['channels'],
    value: boolean
  ) => {
    setPreferences(prev =>
      prev.map((pref, i) =>
        i === index
          ? {
              ...pref,
              channels: { ...pref.channels, [channel]: value },
            }
          : pref
      )
    )
  }

  const handleGlobalSettingChange = (
    field: string,
    value: boolean | string
  ) => {
    setGlobalSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave?.(preferences)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const getPriorityColor = (
    priority: string
  ): 'error' | 'warning' | 'info' | 'default' => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <NotificationsIcon />
        Notification Preferences
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize how and when you receive notifications across different
        categories.
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Notification preferences saved successfully!
        </Alert>
      )}

      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Global Settings" />
        <CardContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.doNotDisturb}
                  onChange={e =>
                    handleGlobalSettingChange('doNotDisturb', e.target.checked)
                  }
                />
              }
              label="Do Not Disturb"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 4, mb: 2 }}
            >
              Temporarily disable all notifications
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.quietHours.enabled}
                  onChange={e =>
                    handleGlobalSettingChange('quietHours', {
                      ...globalSettings.quietHours,
                      enabled: e.target.checked,
                    })
                  }
                />
              }
              label="Quiet Hours"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 4, mb: 2 }}
            >
              Reduce notifications during specified hours
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.groupSimilar}
                  onChange={e =>
                    handleGlobalSettingChange('groupSimilar', e.target.checked)
                  }
                />
              }
              label="Group Similar Notifications"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
              Combine similar notifications to reduce clutter
            </Typography>
          </FormGroup>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Typography variant="h6" gutterBottom>
        Notification Categories
      </Typography>

      {preferences.map((preference, index) => (
        <Card key={preference.category} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography variant="h6">{preference.label}</Typography>
                  <Chip
                    label={preference.priority.toUpperCase()}
                    size="small"
                    color={getPriorityColor(preference.priority)}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {preference.description}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={preference.enabled}
                    onChange={e =>
                      handlePreferenceChange(index, 'enabled', e.target.checked)
                    }
                  />
                }
                label="Enabled"
              />
            </Box>

            {preference.enabled && (
              <>
                <Divider sx={{ my: 2 }} />

                {/* Priority Setting */}
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={preference.priority}
                      label="Priority"
                      onChange={e =>
                        handlePreferenceChange(
                          index,
                          'priority',
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Delivery Channels */}
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Channels
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preference.channels.inApp}
                        onChange={e =>
                          handleChannelChange(index, 'inApp', e.target.checked)
                        }
                        icon={<NotificationsIcon />}
                        checkedIcon={<NotificationsIcon />}
                      />
                    }
                    label="In-App"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preference.channels.email}
                        onChange={e =>
                          handleChannelChange(index, 'email', e.target.checked)
                        }
                        icon={<EmailIcon />}
                        checkedIcon={<EmailIcon />}
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preference.channels.sms}
                        onChange={e =>
                          handleChannelChange(index, 'sms', e.target.checked)
                        }
                        icon={<SmsIcon />}
                        checkedIcon={<SmsIcon />}
                      />
                    }
                    label="SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preference.channels.push}
                        onChange={e =>
                          handleChannelChange(index, 'push', e.target.checked)
                        }
                        icon={<PushIcon />}
                        checkedIcon={<PushIcon />}
                      />
                    }
                    label="Push"
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Save Preferences
        </Button>
      </Box>
    </Box>
  )
}

export default NotificationPreferences

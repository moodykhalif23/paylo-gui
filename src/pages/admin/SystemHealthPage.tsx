import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import SystemHealthDashboard from '../../components/admin/SystemHealthDashboard'
import SystemMetrics from '../../components/admin/SystemMetrics'
import {
  useGetSystemHealthQuery,
  useGetSystemStatsQuery,
} from '../../store/api/adminApi'

const SystemHealthPage: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const refreshInterval = 30000 // 30 seconds

  const {
    data: systemHealth,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useGetSystemHealthQuery(undefined, {
    pollingInterval: autoRefresh ? refreshInterval : 0,
  })

  const {
    data: systemStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetSystemStatsQuery(
    {},
    {
      pollingInterval: autoRefresh ? refreshInterval : 0,
    }
  )

  const handleRefresh = () => {
    refetchHealth()
    refetchStats()
  }

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  const getOverallStatus = () => {
    if (!systemHealth) return 'unknown'
    return systemHealth.status
  }

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'healthy':
        return 'success'
      case 'degraded':
        return 'warning'
      case 'down':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            System Health Monitor
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Real-time system monitoring and health status
            </Typography>
            <Chip
              label={`Status: ${getOverallStatus().toUpperCase()}`}
              color={getStatusColor(getOverallStatus())}
              size="small"
            />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Download Health Report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="System Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Alert Settings">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={healthLoading || statsLoading}
          >
            Refresh
          </Button>

          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={handleToggleAutoRefresh}
            size="small"
          >
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </Box>
      </Box>

      {/* Error Alerts */}
      {(healthError || statsError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load system data. Please check your connection and try
          again.
          {healthError && <div>Health Error: {healthError.toString()}</div>}
          {statsError && <div>Stats Error: {statsError.toString()}</div>}
        </Alert>
      )}

      {/* Auto Refresh Status */}
      {autoRefresh && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Auto-refresh is enabled. Data updates every {refreshInterval / 1000}{' '}
          seconds.
        </Alert>
      )}

      {/* System Health Dashboard */}
      {systemHealth && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>
            System Overview
          </Typography>
          <SystemHealthDashboard
            systemHealth={systemHealth}
            isLoading={healthLoading}
            error={healthError?.toString()}
          />
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* System Metrics */}
      {systemStats && systemHealth?.metrics && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>
            Performance Metrics
          </Typography>
          <SystemMetrics
            metrics={systemHealth.metrics}
            isLoading={statsLoading}
            error={statsError?.toString()}
          />
        </Box>
      )}

      {/* Additional System Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              {systemHealth && (
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Version: {systemHealth.version}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Uptime: {Math.floor(systemHealth.uptime / 3600)} hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated:{' '}
                    {new Date(systemHealth.lastUpdated).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button variant="outlined" size="small" fullWidth>
                  View System Logs
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  Performance Report
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  Maintenance Mode
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SystemHealthPage

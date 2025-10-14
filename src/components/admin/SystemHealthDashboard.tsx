import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { SystemHealth, ServiceStatus } from '../../types'
// Using native Date methods instead of date-fns

interface SystemHealthDashboardProps {
  systemHealth: SystemHealth
  isLoading?: boolean
  error?: string
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  systemHealth,
  isLoading = false,
  error,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load system health: {error}
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" />
      case 'degraded':
        return <WarningIcon color="warning" />
      case 'down':
        return <ErrorIcon color="error" />
      default:
        return <InfoIcon color="info" />
    }
  }

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatDistanceToNow = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours`
    return `${Math.floor(diffInSeconds / 86400)} days`
  }

  return (
    <Box>
      {/* Overall System Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              {getStatusIcon(systemHealth.status)}
              <Box>
                <Typography variant="h5" component="div">
                  System Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated:{' '}
                  {formatDistanceToNow(new Date(systemHealth.lastUpdated))} ago
                </Typography>
              </Box>
            </Box>
            <Chip
              label={systemHealth.status.toUpperCase()}
              color={getStatusColor(systemHealth.status)}
              variant="filled"
            />
          </Box>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uptime
              </Typography>
              <Typography variant="h4" color="primary">
                {formatUptime(systemHealth.uptime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Version: {systemHealth.version}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" color="primary">
                {systemHealth.metrics.activeUsers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {systemHealth.metrics.totalUsers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Load
              </Typography>
              <Box sx={{ mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={systemHealth.metrics.systemLoad}
                  color={
                    systemHealth.metrics.systemLoad > 80 ? 'error' : 'primary'
                  }
                />
              </Box>
              <Typography variant="h4" color="primary">
                {systemHealth.metrics.systemLoad}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Memory Usage
              </Typography>
              <Box sx={{ mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={systemHealth.metrics.memoryUsage}
                  color={
                    systemHealth.metrics.memoryUsage > 80 ? 'error' : 'primary'
                  }
                />
              </Box>
              <Typography variant="h4" color="primary">
                {systemHealth.metrics.memoryUsage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Status
          </Typography>
          <Grid container spacing={2}>
            {systemHealth.services.map((service: ServiceStatus) => (
              <Grid item xs={12} sm={6} md={4} key={service.name}>
                <Card variant="outlined">
                  <CardContent sx={{ pb: 2 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {service.name}
                      </Typography>
                      <Chip
                        label={service.status}
                        color={getStatusColor(service.status)}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Response Time: {service.responseTime}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Check:{' '}
                      {formatDistanceToNow(new Date(service.lastCheck))} ago
                    </Typography>
                    {service.errorMessage && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Error: {service.errorMessage}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SystemHealthDashboard

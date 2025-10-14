import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import {
  useGetSystemHealthQuery,
  useGetSystemStatsQuery,
} from '../../store/api/adminApi'
import { Link } from 'react-router-dom'

const AdminDashboard: React.FC = () => {
  const {
    data: systemHealth,
    isLoading: healthLoading,
    error: healthError,
  } = useGetSystemHealthQuery()

  const {
    data: systemStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetSystemStatsQuery({})

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
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

  if (healthError || statsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load dashboard data. Please check your connection and try
          again.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System overview and administrative controls
        </Typography>
      </Box>

      {/* System Status Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <DashboardIcon color="primary" />
                <Typography variant="h6">System Status</Typography>
              </Box>
              {healthLoading ? (
                <LinearProgress />
              ) : systemHealth ? (
                <Box>
                  <Chip
                    label={systemHealth.status.toUpperCase()}
                    color={getStatusColor(systemHealth.status) as any}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {Math.floor(systemHealth.uptime / 3600)}h
                  </Typography>
                </Box>
              ) : (
                <Typography color="error">Unable to load</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <PeopleIcon color="primary" />
                <Typography variant="h6">Users</Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" color="primary">
                    {formatNumber(systemStats.activeUsers)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {formatNumber(systemStats.totalUsers)} total
                  </Typography>
                </Box>
              ) : (
                <Typography color="error">Unable to load</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="h6">Transactions</Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" color="primary">
                    {formatNumber(systemStats.totalTransactions)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(systemStats.totalVolumeUSD)} volume
                  </Typography>
                </Box>
              ) : (
                <Typography color="error">Unable to load</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Security</Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" color="success">
                    {(100 - systemStats.errorRate).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success rate
                  </Typography>
                </Box>
              ) : (
                <Typography color="error">Unable to load</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    component={Link}
                    to="/admin/system-health"
                    variant="outlined"
                    fullWidth
                    startIcon={<DashboardIcon />}
                  >
                    System Health
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    component={Link}
                    to="/admin/users"
                    variant="outlined"
                    fullWidth
                    startIcon={<PeopleIcon />}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    component={Link}
                    to="/admin/transactions"
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalanceIcon />}
                  >
                    Transactions
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    component={Link}
                    to="/admin/settings"
                    variant="outlined"
                    fullWidth
                    startIcon={<SecurityIcon />}
                  >
                    System Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUpIcon />}
                  >
                    Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<WarningIcon />}
                  >
                    System Alerts
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              {systemHealth?.metrics ? (
                <Box>
                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      System Load: {systemHealth.metrics.systemLoad}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.metrics.systemLoad}
                      color={
                        systemHealth.metrics.systemLoad > 80
                          ? 'error'
                          : 'primary'
                      }
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Memory Usage: {systemHealth.metrics.memoryUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.metrics.memoryUsage}
                      color={
                        systemHealth.metrics.memoryUsage > 80
                          ? 'error'
                          : 'primary'
                      }
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Disk Usage: {systemHealth.metrics.diskUsage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.metrics.diskUsage}
                      color={
                        systemHealth.metrics.diskUsage > 80
                          ? 'error'
                          : 'primary'
                      }
                    />
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Loading performance data...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent System Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No recent alerts. System is operating normally.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AdminDashboard

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
  // Landing page colors
  const accentGreen = '#7dcd85'
  const softGreen = '#c8ffd8'
  const brandWhite = '#ffffff'

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

  if (healthError || statsError) {
    return (
      <Box sx={{ color: brandWhite }}>
        <Alert severity="error">
          Failed to load dashboard data. Please check your connection and try
          again.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ color: brandWhite }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: accentGreen }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: softGreen }}>
          System overview and administrative controls
        </Typography>
      </Box>

      {/* System Status Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <DashboardIcon sx={{ color: accentGreen }} />
                <Typography variant="h6" sx={{ color: accentGreen }}>
                  System Status
                </Typography>
              </Box>
              {healthLoading ? (
                <LinearProgress />
              ) : systemHealth ? (
                <Box>
                  <Chip
                    label={systemHealth.status.toUpperCase()}
                    color={getStatusColor(systemHealth.status)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ color: softGreen }}>
                    Uptime: {Math.floor(systemHealth.uptime / 3600)}h
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: softGreen }}>
                  Unable to load
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <PeopleIcon sx={{ color: accentGreen }} />
                <Typography variant="h6" sx={{ color: accentGreen }}>
                  Users
                </Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" sx={{ color: accentGreen }}>
                    {formatNumber(systemStats.activeUsers)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: softGreen }}>
                    of {formatNumber(systemStats.totalUsers)} total
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: softGreen }}>
                  Unable to load
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AccountBalanceIcon sx={{ color: accentGreen }} />
                <Typography variant="h6" sx={{ color: accentGreen }}>
                  Transactions
                </Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" sx={{ color: accentGreen }}>
                    {formatNumber(systemStats.totalTransactions)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: softGreen }}>
                    {formatCurrency(systemStats.totalVolumeUSD)} volume
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: softGreen }}>
                  Unable to load
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SecurityIcon sx={{ color: accentGreen }} />
                <Typography variant="h6" sx={{ color: accentGreen }}>
                  Security
                </Typography>
              </Box>
              {statsLoading ? (
                <LinearProgress />
              ) : systemStats ? (
                <Box>
                  <Typography variant="h4" sx={{ color: accentGreen }}>
                    {(100 - systemStats.errorRate).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: softGreen }}>
                    Success rate
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: softGreen }}>
                  Unable to load
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: accentGreen }}>
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
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: accentGreen }}>
                System Performance
              </Typography>
              {systemHealth?.metrics ? (
                <Box>
                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: softGreen }}
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
                      sx={{ color: softGreen }}
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

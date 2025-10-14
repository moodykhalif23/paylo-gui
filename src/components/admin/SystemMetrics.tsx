import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Skeleton,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material'
import { SystemMetrics as SystemMetricsType } from '../../types'

interface SystemMetricsProps {
  metrics: SystemMetricsType
  isLoading?: boolean
  error?: string
}

const SystemMetrics: React.FC<SystemMetricsProps> = ({
  metrics,
  isLoading = false,
  error,
}) => {
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">
            Failed to load system metrics: {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="80%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: string, currency = 'USD') => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const getPerformanceColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'error'
    if (value >= threshold * 0.7) return 'warning'
    return 'success'
  }

  return (
    <Grid container spacing={3}>
      {/* User Metrics */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PeopleIcon color="primary" />
              <Typography variant="h6">Users</Typography>
            </Box>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatNumber(metrics.activeUsers)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active of {formatNumber(metrics.totalUsers)} total
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={(metrics.activeUsers / metrics.totalUsers) * 100}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Transaction Metrics */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AccountBalanceIcon color="primary" />
              <Typography variant="h6">Transactions</Typography>
            </Box>
            <Typography variant="h4" color="primary" gutterBottom>
              {formatNumber(metrics.totalTransactions)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Volume: {formatCurrency(metrics.totalVolumeUSD.toString())}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* System Load */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SpeedIcon color="primary" />
              <Typography variant="h6">System Load</Typography>
            </Box>
            <Typography
              variant="h4"
              color={getPerformanceColor(metrics.systemLoad)}
              gutterBottom
            >
              {metrics.systemLoad}%
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={metrics.systemLoad}
                color={getPerformanceColor(metrics.systemLoad) as any}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {metrics.systemLoad < 50
                ? 'Optimal'
                : metrics.systemLoad < 80
                  ? 'Moderate'
                  : 'High'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Memory Usage */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <MemoryIcon color="primary" />
              <Typography variant="h6">Memory Usage</Typography>
            </Box>
            <Typography
              variant="h4"
              color={getPerformanceColor(metrics.memoryUsage)}
              gutterBottom
            >
              {metrics.memoryUsage}%
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={metrics.memoryUsage}
                color={getPerformanceColor(metrics.memoryUsage) as any}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {metrics.memoryUsage < 50
                ? 'Optimal'
                : metrics.memoryUsage < 80
                  ? 'Moderate'
                  : 'High'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Disk Usage */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AccountBalanceIcon color="primary" />
              <Typography variant="h6">Disk Usage</Typography>
            </Box>
            <Typography
              variant="h4"
              color={getPerformanceColor(metrics.diskUsage)}
              gutterBottom
            >
              {metrics.diskUsage}%
            </Typography>
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={metrics.diskUsage}
                color={getPerformanceColor(metrics.diskUsage) as any}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {metrics.diskUsage < 50
                ? 'Optimal'
                : metrics.diskUsage < 80
                  ? 'Moderate'
                  : 'High'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Network Latency */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SpeedIcon color="primary" />
              <Typography variant="h6">Network Latency</Typography>
            </Box>
            <Typography variant="h4" color="primary" gutterBottom>
              {metrics.networkLatency}ms
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              {metrics.networkLatency < 100 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Chip
                label={
                  metrics.networkLatency < 100
                    ? 'Excellent'
                    : metrics.networkLatency < 300
                      ? 'Good'
                      : 'Poor'
                }
                color={
                  metrics.networkLatency < 100
                    ? 'success'
                    : metrics.networkLatency < 300
                      ? 'warning'
                      : 'error'
                }
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SystemMetrics

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Grid,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  CheckCircle,
  Warning,
  Error,
  Computer,
  Memory,
  Storage,
  Speed,
  BugReport,
} from '@mui/icons-material'
import { useAppSelector } from '../../store'
import {
  selectSystemHealth,
  selectSystemOverallHealth,
  selectSystemServices,
  selectSystemMetrics,
  selectActiveAlerts,
  selectCriticalAlerts,
  selectSystemStats,
  selectConnectionStatus,
} from '../../store/slices/systemSlice'
import { useRealTimeSystemHealth } from '../../hooks/useRealTimeData'
import { formatDistanceToNow } from 'date-fns'

interface RealTimeSystemHealthProps {
  showMetrics?: boolean
  showServices?: boolean
  showAlerts?: boolean
  refreshInterval?: number
}

const getHealthIcon = (status: 'healthy' | 'degraded' | 'down') => {
  switch (status) {
    case 'healthy':
      return <CheckCircle color="success" />
    case 'degraded':
      return <Warning color="warning" />
    case 'down':
      return <Error color="error" />
    default:
      return <Error color="error" />
  }
}

const getHealthColor = (status: 'healthy' | 'degraded' | 'down') => {
  switch (status) {
    case 'healthy':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'down':
      return 'error'
    default:
      return 'error'
  }
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const formatBytes = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const MetricCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error'
  progress?: number
}> = ({ title, value, subtitle, icon, color = 'primary', progress }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: `${color}.main` }}>{icon}</Avatar>
        <Box flex={1}>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {progress !== undefined && (
            <LinearProgress
              variant="determinate"
              value={progress}
              color={color}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const RealTimeSystemHealth: React.FC<RealTimeSystemHealthProps> = ({
  showMetrics = true,
  showServices = true,
  showAlerts = true,
}) => {
  const { isConnected, isAdmin } = useRealTimeSystemHealth()
  const systemHealth = useAppSelector(selectSystemHealth)
  const overallHealth = useAppSelector(selectSystemOverallHealth)
  const services = useAppSelector(selectSystemServices)
  const metrics = useAppSelector(selectSystemMetrics)
  const activeAlerts = useAppSelector(selectActiveAlerts)
  const criticalAlerts = useAppSelector(selectCriticalAlerts)
  const systemStats = useAppSelector(selectSystemStats)
  const connectionStatus = useAppSelector(selectConnectionStatus)

  if (!isAdmin) {
    return (
      <Alert severity="warning">
        Admin access required to view system health information.
      </Alert>
    )
  }

  return (
    <Box>
      {/* Connection Status */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Chip
          size="small"
          label={isConnected ? 'Live System Monitoring' : 'Disconnected'}
          color={isConnected ? 'success' : 'error'}
          variant={isConnected ? 'filled' : 'outlined'}
        />
        <Chip
          size="small"
          label={`Status: ${connectionStatus}`}
          color={connectionStatus === 'connected' ? 'success' : 'warning'}
          variant="outlined"
        />
      </Box>

      {/* Overall System Health */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: `${getHealthColor(overallHealth)}.main`,
                width: 56,
                height: 56,
              }}
            >
              {getHealthIcon(overallHealth)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5">
                System Status: {overallHealth.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {systemStats.totalServices} services •{' '}
                {systemStats.activeAlerts} active alerts
              </Typography>
              {systemHealth && (
                <Typography variant="caption" color="text.secondary">
                  Uptime: {formatUptime(systemHealth.uptime)} • Version:{' '}
                  {systemHealth.version}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {showAlerts && criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {criticalAlerts.length} Critical Alert
            {criticalAlerts.length !== 1 ? 's' : ''}
          </Typography>
          {criticalAlerts.slice(0, 3).map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.title}
            </Typography>
          ))}
        </Alert>
      )}

      {/* System Metrics */}
      {showMetrics && metrics && (
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            System Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="CPU Usage"
                value={`${metrics.cpu.usage.toFixed(1)}%`}
                subtitle={`${metrics.cpu.cores} cores`}
                icon={<Computer />}
                color={
                  metrics.cpu.usage > 80
                    ? 'error'
                    : metrics.cpu.usage > 60
                      ? 'warning'
                      : 'success'
                }
                progress={metrics.cpu.usage}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Memory Usage"
                value={`${metrics.memory.percentage.toFixed(1)}%`}
                subtitle={`${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}`}
                icon={<Memory />}
                color={
                  metrics.memory.percentage > 80
                    ? 'error'
                    : metrics.memory.percentage > 60
                      ? 'warning'
                      : 'success'
                }
                progress={metrics.memory.percentage}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Disk Usage"
                value={`${metrics.disk.percentage.toFixed(1)}%`}
                subtitle={`${formatBytes(metrics.disk.used)} / ${formatBytes(metrics.disk.total)}`}
                icon={<Storage />}
                color={
                  metrics.disk.percentage > 80
                    ? 'error'
                    : metrics.disk.percentage > 60
                      ? 'warning'
                      : 'success'
                }
                progress={metrics.disk.percentage}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Requests/sec"
                value={metrics.requestsPerSecond.toFixed(0)}
                subtitle={`${metrics.errorRate.toFixed(2)}% error rate`}
                icon={<Speed />}
                color={
                  metrics.errorRate > 5
                    ? 'error'
                    : metrics.errorRate > 2
                      ? 'warning'
                      : 'success'
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Services Status */}
      {showServices && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Services Status ({systemStats.totalServices})
            </Typography>
            <List dense>
              {services.map((service, index) => (
                <React.Fragment key={service.name}>
                  <ListItem>
                    <ListItemIcon>{getHealthIcon(service.status)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {service.name}
                          </Typography>
                          <Chip
                            label={service.status}
                            size="small"
                            color={
                              getHealthColor(service.status) as
                                | 'default'
                                | 'primary'
                                | 'secondary'
                                | 'error'
                                | 'info'
                                | 'success'
                                | 'warning'
                            }
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Response time: {service.responseTime}ms
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last check:{' '}
                            {formatDistanceToNow(new Date(service.lastCheck), {
                              addSuffix: true,
                            })}
                          </Typography>
                          {service.uptime && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              Uptime: {formatUptime(service.uptime)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < services.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {showAlerts && activeAlerts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts ({activeAlerts.length})
            </Typography>
            <List dense>
              {activeAlerts.slice(0, 10).map((alert, index) => (
                <React.Fragment key={alert.id}>
                  <ListItem>
                    <ListItemIcon>
                      <BugReport
                        color={alert.type === 'critical' ? 'error' : 'warning'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">{alert.title}</Typography>
                          <Chip
                            label={alert.type}
                            size="small"
                            color={
                              alert.type === 'critical' ? 'error' : 'warning'
                            }
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {alert.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(alert.createdAt), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activeAlerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Alerts Message */}
      {showAlerts && activeAlerts.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No active alerts - system is running smoothly
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default RealTimeSystemHealth

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Circle as CircleIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { SystemHealth } from '../../types'

interface RealTimeSystemMonitorProps {
  onDataUpdate?: (data: SystemHealth) => void
  refreshInterval?: number
}

interface ConnectionStatus {
  isConnected: boolean
  lastUpdate: Date | null
  reconnectAttempts: number
}

const RealTimeSystemMonitor: React.FC<RealTimeSystemMonitorProps> = ({
  onDataUpdate,
  refreshInterval = 5000,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastUpdate: null,
    reconnectAttempts: 0,
  })
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [systemData, setSystemData] = useState<SystemHealth | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Simulate WebSocket connection for real-time updates
  const connectToWebSocket = useCallback(() => {
    // In a real implementation, this would connect to a WebSocket endpoint
    // For now, we'll simulate with polling
    const interval = setInterval(() => {
      if (!isMonitoring) return

      // Simulate fetching real-time data
      const mockSystemHealth: SystemHealth = {
        status: Math.random() > 0.1 ? 'healthy' : 'degraded',
        uptime: Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        version: '1.0.0',
        services: [
          {
            name: 'API Gateway',
            status: Math.random() > 0.05 ? 'healthy' : 'degraded',
            responseTime: Math.floor(Math.random() * 100) + 50,
            lastCheck: new Date().toISOString(),
            endpoint: '/health',
          },
          {
            name: 'Database',
            status: Math.random() > 0.02 ? 'healthy' : 'degraded',
            responseTime: Math.floor(Math.random() * 50) + 10,
            lastCheck: new Date().toISOString(),
            endpoint: '/db/health',
          },
          {
            name: 'Redis Cache',
            status: Math.random() > 0.03 ? 'healthy' : 'degraded',
            responseTime: Math.floor(Math.random() * 20) + 5,
            lastCheck: new Date().toISOString(),
            endpoint: '/cache/health',
          },
          {
            name: 'Blockchain RPC',
            status: Math.random() > 0.08 ? 'healthy' : 'degraded',
            responseTime: Math.floor(Math.random() * 200) + 100,
            lastCheck: new Date().toISOString(),
            endpoint: '/blockchain/health',
          },
        ],
        metrics: {
          totalUsers: 15420,
          activeUsers: Math.floor(Math.random() * 500) + 200,
          totalTransactions: 89234,
          totalVolume: '1234567.89',
          totalVolumeUSD: 1234567.89,
          systemLoad: Math.floor(Math.random() * 40) + 20,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          diskUsage: Math.floor(Math.random() * 20) + 60,
          networkLatency: Math.floor(Math.random() * 50) + 25,
        },
        lastUpdated: new Date().toISOString(),
      }

      setSystemData(mockSystemHealth)
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        lastUpdate: new Date(),
        reconnectAttempts: 0,
      }))
      setError(null)

      if (onDataUpdate) {
        onDataUpdate(mockSystemHealth)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isMonitoring, refreshInterval, onDataUpdate])

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = connectToWebSocket()
      return cleanup
    }
  }, [connectToWebSocket, isMonitoring])

  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  const handleManualRefresh = () => {
    // Trigger immediate update
    setConnectionStatus(prev => ({
      ...prev,
      lastUpdate: new Date(),
    }))
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

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  }

  return (
    <Box>
      {/* Connection Status Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <CircleIcon
                color={connectionStatus.isConnected ? 'success' : 'error'}
                sx={{ fontSize: 16 }}
              />
              <Box>
                <Typography variant="h6">Real-Time Monitor</Typography>
                <Typography variant="body2" color="text.secondary">
                  {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}{' '}
                  • Last update: {formatLastUpdate(connectionStatus.lastUpdate)}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMonitoring}
                    onChange={handleToggleMonitoring}
                    size="small"
                  />
                }
                label="Auto-refresh"
              />

              <Tooltip title="Manual Refresh">
                <IconButton onClick={handleManualRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring'}
              >
                <IconButton onClick={handleToggleMonitoring} size="small">
                  {isMonitoring ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Connection Warning */}
      {!connectionStatus.isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Real-time monitoring is disconnected. Attempting to reconnect...
        </Alert>
      )}

      {/* Live System Status */}
      {systemData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip
                    label={systemData.status.toUpperCase()}
                    color={getStatusColor(systemData.status)}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Version {systemData.version}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Uptime: {Math.floor(systemData.uptime / 3600)} hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {systemData.metrics.activeUsers.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      System Load
                    </Typography>
                    <Typography
                      variant="h6"
                      color={
                        systemData.metrics.systemLoad > 80 ? 'error' : 'primary'
                      }
                    >
                      {systemData.metrics.systemLoad}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Status Grid */}
          {systemData.services.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="subtitle2">{service.name}</Typography>
                    <Chip
                      label={service.status}
                      color={getStatusColor(service.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Response: {service.responseTime}ms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default RealTimeSystemMonitor

import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Build as MaintenanceIcon,
  Monitor as MonitoringIcon,
  Speed as PerformanceIcon,
} from '@mui/icons-material'
import { SystemParametersFormData } from '../../../types'

interface SystemParametersTabProps {
  data: SystemParametersFormData
  onChange: (data: SystemParametersFormData) => void
  onReset: () => void
}

const SystemParametersTab: React.FC<SystemParametersTabProps> = ({
  data,
  onChange,
  onReset,
}) => {
  const handleFieldChange = (
    field: keyof SystemParametersFormData,
    value: string | number | boolean
  ) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          System Parameters
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onReset}
          color="warning"
        >
          Reset to Defaults
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure system maintenance, monitoring, and performance parameters.
      </Typography>

      <Grid container spacing={3}>
        {/* Maintenance Settings */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <MaintenanceIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Maintenance Mode
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.maintenanceEnabled}
                        onChange={e =>
                          handleFieldChange(
                            'maintenanceEnabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable maintenance mode"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Maintenance Message"
                    value={data.maintenanceMessage}
                    onChange={e =>
                      handleFieldChange('maintenanceMessage', e.target.value)
                    }
                    disabled={!data.maintenanceEnabled}
                    placeholder="The system is currently under maintenance. Please try again later."
                    helperText="Message displayed to users during maintenance"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Allowed IPs During Maintenance"
                    value={data.maintenanceAllowedIPs}
                    onChange={e =>
                      handleFieldChange('maintenanceAllowedIPs', e.target.value)
                    }
                    disabled={!data.maintenanceEnabled}
                    placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                    helperText="One IP/CIDR per line. These IPs can access the system during maintenance"
                  />
                </Grid>
              </Grid>

              {data.maintenanceEnabled && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> Maintenance mode is enabled. Only
                    specified IP addresses will be able to access the system.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monitoring Settings */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <MonitoringIcon color="primary" />
                <Typography variant="h6" component="h3">
                  System Monitoring
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Health Check Interval (seconds)"
                    value={data.healthCheckInterval}
                    onChange={e =>
                      handleFieldChange(
                        'healthCheckInterval',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 10, max: 3600 }}
                    helperText="How often to perform system health checks"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Alert Thresholds
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="CPU Usage (%)"
                    value={data.cpuThreshold}
                    onChange={e =>
                      handleFieldChange(
                        'cpuThreshold',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 50, max: 95 }}
                    helperText="Alert when CPU exceeds this percentage"
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Memory Usage (%)"
                    value={data.memoryThreshold}
                    onChange={e =>
                      handleFieldChange(
                        'memoryThreshold',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 50, max: 95 }}
                    helperText="Alert when memory exceeds this percentage"
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Disk Usage (%)"
                    value={data.diskThreshold}
                    onChange={e =>
                      handleFieldChange(
                        'diskThreshold',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 70, max: 95 }}
                    helperText="Alert when disk usage exceeds this percentage"
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Response Time (ms)"
                    value={data.responseTimeThreshold}
                    onChange={e =>
                      handleFieldChange(
                        'responseTimeThreshold',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 100, max: 10000 }}
                    helperText="Alert when response time exceeds this value"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Error Rate (%)"
                    value={data.errorRateThreshold}
                    onChange={e =>
                      handleFieldChange(
                        'errorRateThreshold',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 1, max: 50, step: 0.1 }}
                    helperText="Alert when error rate exceeds this percentage"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Log Level</InputLabel>
                    <Select
                      value={data.logLevel}
                      label="Log Level"
                      onChange={e =>
                        handleFieldChange('logLevel', e.target.value)
                      }
                    >
                      <MenuItem value="debug">Debug</MenuItem>
                      <MenuItem value="info">Info</MenuItem>
                      <MenuItem value="warn">Warning</MenuItem>
                      <MenuItem value="error">Error</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Log Retention (days)"
                    value={data.logRetentionDays}
                    onChange={e =>
                      handleFieldChange(
                        'logRetentionDays',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 7, max: 365 }}
                    helperText="How long to keep log files before deletion"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Settings */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <PerformanceIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Performance Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.cacheEnabled}
                        onChange={e =>
                          handleFieldChange('cacheEnabled', e.target.checked)
                        }
                      />
                    }
                    label="Enable caching"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.compressionEnabled}
                        onChange={e =>
                          handleFieldChange(
                            'compressionEnabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable response compression"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cache TTL (seconds)"
                    value={data.cacheTTL}
                    onChange={e =>
                      handleFieldChange(
                        'cacheTTL',
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!data.cacheEnabled}
                    inputProps={{ min: 60, max: 86400 }}
                    helperText="How long to keep cached data"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Request Size (MB)"
                    value={data.maxRequestSize}
                    onChange={e =>
                      handleFieldChange(
                        'maxRequestSize',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 1, max: 100 }}
                    helperText="Maximum size for incoming requests"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Connection Pool Size"
                    value={data.connectionPoolSize}
                    onChange={e =>
                      handleFieldChange(
                        'connectionPoolSize',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 5, max: 100 }}
                    helperText="Maximum number of database connections"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Query Timeout (seconds)"
                    value={data.queryTimeout}
                    onChange={e =>
                      handleFieldChange(
                        'queryTimeout',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 5, max: 300 }}
                    helperText="Maximum time to wait for database queries"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          System Parameters Guidelines:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Maintenance mode</strong> should only be enabled during
            planned maintenance
          </li>
          <li>
            <strong>Health checks</strong> should run frequently enough to catch
            issues quickly
          </li>
          <li>
            <strong>Alert thresholds</strong> should be set based on your
            system's normal operating ranges
          </li>
          <li>
            <strong>Log levels</strong> should be 'info' or 'warn' in production
            to avoid excessive logging
          </li>
          <li>
            <strong>Caching</strong> improves performance but uses more memory
          </li>
          <li>
            <strong>Connection pools</strong> should be sized based on expected
            concurrent users
          </li>
        </ul>
      </Alert>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recommended Production Values:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Health Check Interval:</strong> 30-60 seconds
          </li>
          <li>
            <strong>CPU/Memory Thresholds:</strong> 80-85%
          </li>
          <li>
            <strong>Disk Threshold:</strong> 85-90%
          </li>
          <li>
            <strong>Response Time:</strong> 1000-2000ms
          </li>
          <li>
            <strong>Error Rate:</strong> 1-5%
          </li>
          <li>
            <strong>Log Level:</strong> 'info' or 'warn'
          </li>
          <li>
            <strong>Cache TTL:</strong> 300-3600 seconds
          </li>
        </ul>
      </Alert>
    </Box>
  )
}

export default SystemParametersTab

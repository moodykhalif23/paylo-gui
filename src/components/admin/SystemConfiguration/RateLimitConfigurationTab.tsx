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
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  SwapHoriz as TransactionIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material'
import { RateLimitFormData } from '../../../types'

interface RateLimitConfigurationTabProps {
  data: RateLimitFormData
  onChange: (data: RateLimitFormData) => void
  onReset: () => void
}

interface RateLimitCardProps {
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  requests: number
  windowMs: number
  onEnabledChange: (enabled: boolean) => void
  onRequestsChange: (requests: number) => void
  onWindowChange: (windowMs: number) => void
}

const RateLimitCard: React.FC<RateLimitCardProps> = ({
  title,
  description,
  icon,
  enabled,
  requests,
  windowMs,
  onEnabledChange,
  onRequestsChange,
  onWindowChange,
}) => {
  const windowMinutes = Math.round(windowMs / 60000)
  const requestsPerMinute =
    windowMinutes > 0 ? Math.round(requests / windowMinutes) : requests

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={e => onEnabledChange(e.target.checked)}
                />
              }
              label={`Enable ${title.toLowerCase()} rate limiting`}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Requests"
              value={requests}
              onChange={e => onRequestsChange(parseInt(e.target.value) || 0)}
              disabled={!enabled}
              inputProps={{ min: 1, max: 10000 }}
              helperText="Maximum number of requests allowed"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Time Window (minutes)"
              value={windowMinutes}
              onChange={e =>
                onWindowChange((parseInt(e.target.value) || 0) * 60000)
              }
              disabled={!enabled}
              inputProps={{ min: 1, max: 1440 }}
              helperText="Time window for rate limit"
            />
          </Grid>

          {enabled && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Rate:</strong> {requests} requests per {windowMinutes}{' '}
                  minute{windowMinutes !== 1 ? 's' : ''}
                  {windowMinutes > 1 && (
                    <span> (~{requestsPerMinute} requests/minute average)</span>
                  )}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

const RateLimitConfigurationTab: React.FC<RateLimitConfigurationTabProps> = ({
  data,
  onChange,
  onReset,
}) => {
  const handleFieldChange = (
    field: keyof RateLimitFormData,
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
          Rate Limiting Configuration
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
        Configure rate limits to protect your system from abuse and ensure fair
        usage across different endpoints.
      </Typography>

      <Grid container spacing={3}>
        {/* Global Rate Limiting */}
        <Grid item xs={12} md={6}>
          <RateLimitCard
            title="Global Rate Limiting"
            description="Overall rate limit applied to all API requests from a single IP address"
            icon={<SpeedIcon color="primary" />}
            enabled={data.globalEnabled}
            requests={data.globalRequests}
            windowMs={data.globalWindowMs}
            onEnabledChange={enabled =>
              handleFieldChange('globalEnabled', enabled)
            }
            onRequestsChange={requests =>
              handleFieldChange('globalRequests', requests)
            }
            onWindowChange={windowMs =>
              handleFieldChange('globalWindowMs', windowMs)
            }
          />
        </Grid>

        {/* Authentication Rate Limiting */}
        <Grid item xs={12} md={6}>
          <RateLimitCard
            title="Authentication Rate Limiting"
            description="Rate limit for login, registration, and password reset endpoints"
            icon={<SecurityIcon color="primary" />}
            enabled={data.authEnabled}
            requests={data.authRequests}
            windowMs={data.authWindowMs}
            onEnabledChange={enabled =>
              handleFieldChange('authEnabled', enabled)
            }
            onRequestsChange={requests =>
              handleFieldChange('authRequests', requests)
            }
            onWindowChange={windowMs =>
              handleFieldChange('authWindowMs', windowMs)
            }
          />
        </Grid>

        {/* API Rate Limiting */}
        <Grid item xs={12} md={6}>
          <RateLimitCard
            title="API Rate Limiting"
            description="Rate limit for general API endpoints (user data, merchant operations)"
            icon={<ApiIcon color="primary" />}
            enabled={data.apiEnabled}
            requests={data.apiRequests}
            windowMs={data.apiWindowMs}
            onEnabledChange={enabled =>
              handleFieldChange('apiEnabled', enabled)
            }
            onRequestsChange={requests =>
              handleFieldChange('apiRequests', requests)
            }
            onWindowChange={windowMs =>
              handleFieldChange('apiWindowMs', windowMs)
            }
          />
        </Grid>

        {/* Transaction Rate Limiting */}
        <Grid item xs={12} md={6}>
          <RateLimitCard
            title="Transaction Rate Limiting"
            description="Rate limit for transaction creation and processing endpoints"
            icon={<TransactionIcon color="primary" />}
            enabled={data.transactionsEnabled}
            requests={data.transactionsRequests}
            windowMs={data.transactionsWindowMs}
            onEnabledChange={enabled =>
              handleFieldChange('transactionsEnabled', enabled)
            }
            onRequestsChange={requests =>
              handleFieldChange('transactionsRequests', requests)
            }
            onWindowChange={windowMs =>
              handleFieldChange('transactionsWindowMs', windowMs)
            }
          />
        </Grid>

        {/* Webhook Rate Limiting */}
        <Grid item xs={12} md={6}>
          <RateLimitCard
            title="Webhook Rate Limiting"
            description="Rate limit for webhook delivery and management endpoints"
            icon={<WebhookIcon color="primary" />}
            enabled={data.webhooksEnabled}
            requests={data.webhooksRequests}
            windowMs={data.webhooksWindowMs}
            onEnabledChange={enabled =>
              handleFieldChange('webhooksEnabled', enabled)
            }
            onRequestsChange={requests =>
              handleFieldChange('webhooksRequests', requests)
            }
            onWindowChange={windowMs =>
              handleFieldChange('webhooksWindowMs', windowMs)
            }
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          Rate Limiting Guidelines:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Global limits</strong> should be the highest to catch
            overall abuse
          </li>
          <li>
            <strong>Authentication limits</strong> should be strict to prevent
            brute force attacks
          </li>
          <li>
            <strong>Transaction limits</strong> should balance security with
            user experience
          </li>
          <li>
            <strong>API limits</strong> should allow normal application usage
            patterns
          </li>
          <li>
            <strong>Webhook limits</strong> should account for retry mechanisms
          </li>
          <li>Consider your user base size when setting limits</li>
          <li>Monitor rate limit hits and adjust accordingly</li>
        </ul>
      </Alert>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recommended Starting Values:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Global:</strong> 1000 requests per 15 minutes
          </li>
          <li>
            <strong>Authentication:</strong> 10 requests per 15 minutes
          </li>
          <li>
            <strong>API:</strong> 500 requests per 15 minutes
          </li>
          <li>
            <strong>Transactions:</strong> 100 requests per 15 minutes
          </li>
          <li>
            <strong>Webhooks:</strong> 200 requests per 15 minutes
          </li>
        </ul>
      </Alert>
    </Box>
  )
}

export default RateLimitConfigurationTab

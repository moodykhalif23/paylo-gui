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
  Security as SecurityIcon,
  Password as PasswordIcon,
  Api as ApiIcon,
} from '@mui/icons-material'
import { SecurityFormData } from '../../../types'

interface SecurityConfigurationTabProps {
  data: SecurityFormData
  onChange: (data: SecurityFormData) => void
  onReset: () => void
}

const SecurityConfigurationTab: React.FC<SecurityConfigurationTabProps> = ({
  data,
  onChange,
  onReset,
}) => {
  const handleFieldChange = (
    field: keyof SecurityFormData,
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
          Security Configuration
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
        Configure authentication, password policies, and API security settings
        to protect your system.
      </Typography>

      <Grid container spacing={3}>
        {/* Authentication Settings */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <SecurityIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Authentication Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="JWT Expiration Time (minutes)"
                    value={data.jwtExpirationTime}
                    onChange={e =>
                      handleFieldChange(
                        'jwtExpirationTime',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 5, max: 1440 }}
                    helperText="How long JWT tokens remain valid"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Refresh Token Expiration (days)"
                    value={data.refreshTokenExpirationTime}
                    onChange={e =>
                      handleFieldChange(
                        'refreshTokenExpirationTime',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 1, max: 365 }}
                    helperText="How long refresh tokens remain valid"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Login Attempts"
                    value={data.maxLoginAttempts}
                    onChange={e =>
                      handleFieldChange(
                        'maxLoginAttempts',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 3, max: 20 }}
                    helperText="Failed attempts before account lockout"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lockout Duration (minutes)"
                    value={data.lockoutDuration}
                    onChange={e =>
                      handleFieldChange(
                        'lockoutDuration',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 5, max: 1440 }}
                    helperText="How long accounts remain locked"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireTwoFactor}
                        onChange={e =>
                          handleFieldChange(
                            'requireTwoFactor',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require Two-Factor Authentication for all users"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Policy */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <PasswordIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Password Policy
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Password Length"
                    value={data.passwordMinLength}
                    onChange={e =>
                      handleFieldChange(
                        'passwordMinLength',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 6, max: 128 }}
                    helperText="Minimum number of characters required"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Password Max Age (days)"
                    value={data.passwordMaxAge}
                    onChange={e =>
                      handleFieldChange(
                        'passwordMaxAge',
                        parseInt(e.target.value) || 0
                      )
                    }
                    inputProps={{ min: 30, max: 365 }}
                    helperText="Force password change after this period (0 = never)"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireUppercase}
                        onChange={e =>
                          handleFieldChange(
                            'requireUppercase',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require uppercase letters"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireLowercase}
                        onChange={e =>
                          handleFieldChange(
                            'requireLowercase',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require lowercase letters"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireNumbers}
                        onChange={e =>
                          handleFieldChange('requireNumbers', e.target.checked)
                        }
                      />
                    }
                    label="Require numbers"
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireSpecialChars}
                        onChange={e =>
                          handleFieldChange(
                            'requireSpecialChars',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require special characters"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* API Security */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <ApiIcon color="primary" />
                <Typography variant="h6" component="h3">
                  API Security Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="CORS Allowed Origins"
                    value={data.corsOrigins}
                    onChange={e =>
                      handleFieldChange('corsOrigins', e.target.value)
                    }
                    placeholder="https://app.example.com&#10;https://admin.example.com&#10;*"
                    helperText="One origin per line. Use * to allow all origins (not recommended for production)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.rateLimitEnabled}
                        onChange={e =>
                          handleFieldChange(
                            'rateLimitEnabled',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Enable API rate limiting"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="IP Whitelist"
                    value={data.ipWhitelist}
                    onChange={e =>
                      handleFieldChange('ipWhitelist', e.target.value)
                    }
                    placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
                    helperText="One IP/CIDR per line. Empty = allow all IPs"
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="IP Blacklist"
                    value={data.ipBlacklist}
                    onChange={e =>
                      handleFieldChange('ipBlacklist', e.target.value)
                    }
                    placeholder="192.168.100.1&#10;10.0.0.50&#10;203.0.113.100/28"
                    helperText="One IP/CIDR per line. These IPs will be blocked"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requireApiKeyForMerchants}
                        onChange={e =>
                          handleFieldChange(
                            'requireApiKeyForMerchants',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Require API keys for merchant endpoints"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Alert severity="warning">
        <Typography variant="subtitle2" gutterBottom>
          Security Best Practices:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            Use short JWT expiration times (15-60 minutes) for better security
          </li>
          <li>Enable two-factor authentication for all admin accounts</li>
          <li>Set strong password requirements including special characters</li>
          <li>Regularly rotate passwords (30-90 days maximum age)</li>
          <li>Use IP whitelisting in production environments</li>
          <li>
            Monitor failed login attempts and adjust lockout settings
            accordingly
          </li>
          <li>Avoid using wildcard (*) CORS origins in production</li>
        </ul>
      </Alert>
    </Box>
  )
}

export default SecurityConfigurationTab

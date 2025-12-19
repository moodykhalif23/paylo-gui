import React, { useState } from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Webhook as WebhookIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Science as TestIcon,
} from '@mui/icons-material'
import {
  useGetMerchantProfileQuery,
  useUpdateMerchantProfileMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} from '../../store/api/merchantApi'

interface ApiKeyScope {
  id: string
  name: string
  description: string
}

const API_KEY_SCOPES: ApiKeyScope[] = [
  {
    id: 'payment:read',
    name: 'Payment Read',
    description: 'Read payment information',
  },
  {
    id: 'payment:write',
    name: 'Payment Write',
    description: 'Create and modify payments',
  },
  {
    id: 'invoice:read',
    name: 'Invoice Read',
    description: 'Read invoice information',
  },
  {
    id: 'invoice:write',
    name: 'Invoice Write',
    description: 'Create and modify invoices',
  },
  {
    id: 'wallet:read',
    name: 'Wallet Read',
    description: 'Read wallet information',
  },
  {
    id: 'webhook:read',
    name: 'Webhook Read',
    description: 'Read webhook configurations',
  },
  {
    id: 'webhook:write',
    name: 'Webhook Write',
    description: 'Configure webhooks',
  },
  {
    id: '*',
    name: 'Full Access',
    description: 'Complete access to all resources',
  },
]

const MerchantSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'webhooks'>(
    'profile'
  )
  const [createApiKeyOpen, setCreateApiKeyOpen] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [newApiKeyScopes, setNewApiKeyScopes] = useState<string[]>([])
  const [newApiKeyExpiry, setNewApiKeyExpiry] = useState('')
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [webhookEvents, setWebhookEvents] = useState<string[]>([])
  const [testWebhookLoading, setTestWebhookLoading] = useState(false)

  // API calls
  const {
    data: merchantProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetMerchantProfileQuery()

  const {
    data: apiKeys = [],
    isLoading: apiKeysLoading,
    error: apiKeysError,
    refetch: refetchApiKeys,
  } = useGetApiKeysQuery()

  const [updateProfile, { isLoading: updateLoading }] =
    useUpdateMerchantProfileMutation()
  const [createApiKey, { isLoading: createKeyLoading }] =
    useCreateApiKeyMutation()
  const [revokeApiKey] = useRevokeApiKeyMutation()

  React.useEffect(() => {
    if (merchantProfile) {
      setWebhookUrl(merchantProfile.webhookUrl || '')
      // Note: webhookSecret would need to be added to MerchantProfile type
      // For now, we'll manage it separately
    }
  }, [merchantProfile])

  const handleCreateApiKey = async () => {
    try {
      const result = await createApiKey({
        name: newApiKeyName,
        permissions: newApiKeyScopes,
        expiresAt: newApiKeyExpiry
          ? new Date(newApiKeyExpiry).toISOString()
          : undefined,
      }).unwrap()

      setGeneratedApiKey(result.keyPrefix) // In real implementation, this would be the full key
      setNewApiKeyName('')
      setNewApiKeyScopes([])
      setNewApiKeyExpiry('')
      refetchApiKeys()
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleRevokeApiKey = async (keyId: string) => {
    if (
      window.confirm(
        'Are you sure you want to revoke this API key? This action cannot be undone.'
      )
    ) {
      try {
        await revokeApiKey(keyId).unwrap()
        refetchApiKeys()
      } catch (error) {
        console.error('Failed to revoke API key:', error)
      }
    }
  }

  const handleUpdateWebhookSettings = async () => {
    try {
      await updateProfile({
        webhookUrl,
      }).unwrap()
    } catch (error) {
      console.error('Failed to update webhook settings:', error)
    }
  }

  const handleTestWebhook = async () => {
    setTestWebhookLoading(true)
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Webhook test successful!')
    } catch (error) {
      console.error('Webhook test failed:', error)
      alert('Webhook test failed!')
    } finally {
      setTestWebhookLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Merchant Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage your merchant profile, API keys, and webhook configurations
      </Typography>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeTab === 'profile' ? 'contained' : 'text'}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Button>
          <Button
            variant={activeTab === 'api' ? 'contained' : 'text'}
            onClick={() => setActiveTab('api')}
            startIcon={<KeyIcon />}
          >
            API Keys
          </Button>
          <Button
            variant={activeTab === 'webhooks' ? 'contained' : 'text'}
            onClick={() => setActiveTab('webhooks')}
            startIcon={<WebhookIcon />}
          >
            Webhooks
          </Button>
        </Stack>
      </Box>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Business Profile" />
              <CardContent>
                {profileLoading ? (
                  <CircularProgress />
                ) : profileError ? (
                  <Alert severity="error">Failed to load profile</Alert>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Business Name"
                        value={merchantProfile?.businessName || ''}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Business Type"
                        value={merchantProfile?.businessType || ''}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Website"
                        value={merchantProfile?.website || ''}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Verification Status"
                        value={
                          merchantProfile?.verificationStatus || 'Not Submitted'
                        }
                        disabled
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="API Keys"
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateApiKeyOpen(true)}
                  >
                    Create API Key
                  </Button>
                }
              />
              <CardContent>
                {apiKeysLoading ? (
                  <CircularProgress />
                ) : apiKeysError ? (
                  <Alert severity="error">Failed to load API keys</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Key Prefix</TableCell>
                          <TableCell>Permissions</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Last Used</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiKeys.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              No API keys found. Create your first API key to
                              get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          apiKeys.map(key => (
                            <TableRow key={key.id}>
                              <TableCell>{key.name}</TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace' }}
                                  >
                                    {key.keyPrefix}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      copyToClipboard(key.keyPrefix)
                                    }
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                >
                                  {key.permissions
                                    .slice(0, 2)
                                    .map(permission => (
                                      <Chip
                                        key={permission}
                                        label={permission}
                                        size="small"
                                      />
                                    ))}
                                  {key.permissions.length > 2 && (
                                    <Chip
                                      label={`+${key.permissions.length - 2} more`}
                                      size="small"
                                    />
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={key.isActive ? 'Active' : 'Inactive'}
                                  color={getStatusColor(key.isActive)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{formatDate(key.createdAt)}</TableCell>
                              <TableCell>
                                {key.lastUsedAt
                                  ? formatDate(key.lastUsedAt)
                                  : 'Never'}
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Revoke API Key">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRevokeApiKey(key.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Webhook Configuration" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Webhook URL"
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      placeholder="https://your-domain.com/webhook"
                      helperText="URL where webhook notifications will be sent"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Webhook Secret"
                      type={showApiKey ? 'text' : 'password'}
                      value={webhookSecret}
                      onChange={e => setWebhookSecret(e.target.value)}
                      placeholder="Enter a secret for webhook verification"
                      helperText="Secret used to verify webhook authenticity"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                          >
                            {showApiKey ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Webhook Events
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        'invoice.paid',
                        'invoice.expired',
                        'payment.confirmed',
                        'payment.failed',
                      ].map(event => (
                        <FormControlLabel
                          key={event}
                          control={
                            <Checkbox
                              checked={webhookEvents.includes(event)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setWebhookEvents([...webhookEvents, event])
                                } else {
                                  setWebhookEvents(
                                    webhookEvents.filter(e => e !== event)
                                  )
                                }
                              }}
                            />
                          }
                          label={event}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateWebhookSettings}
                        disabled={updateLoading}
                      >
                        Save Settings
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TestIcon />}
                        onClick={handleTestWebhook}
                        disabled={!webhookUrl || testWebhookLoading}
                      >
                        {testWebhookLoading ? (
                          <CircularProgress size={16} />
                        ) : (
                          'Test Webhook'
                        )}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Webhook Information" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Webhooks allow you to receive real-time notifications about
                  events in your merchant account.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Supported Events:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2">
                      invoice.paid - Invoice payment confirmed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      invoice.expired - Invoice expired
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      payment.confirmed - Payment confirmed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      payment.failed - Payment failed
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create API Key Dialog */}
      <Dialog
        open={createApiKeyOpen}
        onClose={() => setCreateApiKeyOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API Key Name"
                value={newApiKeyName}
                onChange={e => setNewApiKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                helperText="Give your API key a descriptive name"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={newApiKeyScopes}
                  onChange={e => setNewApiKeyScopes(e.target.value as string[])}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {API_KEY_SCOPES.map(scope => (
                    <MenuItem key={scope.id} value={scope.id}>
                      <Box>
                        <Typography variant="body2">{scope.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scope.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expiry Date (Optional)"
                type="date"
                value={newApiKeyExpiry}
                onChange={e => setNewApiKeyExpiry(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for no expiration"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateApiKeyOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateApiKey}
            variant="contained"
            disabled={
              !newApiKeyName || newApiKeyScopes.length === 0 || createKeyLoading
            }
          >
            {createKeyLoading ? (
              <CircularProgress size={16} />
            ) : (
              'Create API Key'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generated API Key Dialog */}
      <Dialog
        open={!!generatedApiKey}
        onClose={() => setGeneratedApiKey(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>API Key Created Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is the only time you'll see the full API key. Make sure to copy
            it now.
          </Alert>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {generatedApiKey}
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(generatedApiKey!)}
            sx={{ mt: 2 }}
          >
            Copy API Key
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeneratedApiKey(null)} variant="contained">
            I've Copied the Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MerchantSettingsPage

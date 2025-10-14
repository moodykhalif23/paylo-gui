import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  TestTube as TestIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
  useValidateSystemConfigMutation,
  useResetSystemConfigMutation,
} from '../../store/api/adminApi'
import {
  SystemConfiguration,
  SystemConfigFormData,
  ConfigurationValidationResult,
} from '../../types'
import BlockchainConfigurationTab from './SystemConfiguration/BlockchainConfigurationTab'
import SecurityConfigurationTab from './SystemConfiguration/SecurityConfigurationTab'
import RateLimitConfigurationTab from './SystemConfiguration/RateLimitConfigurationTab'
import SystemParametersTab from './SystemConfiguration/SystemParametersTab'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const SystemConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<SystemConfigFormData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationResult, setValidationResult] =
    useState<ConfigurationValidationResult | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetSection, setResetSection] = useState<
    'blockchain' | 'security' | 'rateLimit' | 'system' | undefined
  >()
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // API hooks
  const {
    data: systemConfig,
    isLoading: isLoadingConfig,
    error: configError,
    refetch: refetchConfig,
  } = useGetSystemConfigQuery()

  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateSystemConfigMutation()
  const [validateConfig, { isLoading: isValidating }] =
    useValidateSystemConfigMutation()
  const [resetConfig, { isLoading: isResetting }] =
    useResetSystemConfigMutation()

  // Initialize form data when config is loaded
  useEffect(() => {
    if (systemConfig && !formData) {
      setFormData(transformConfigToFormData(systemConfig))
    }
  }, [systemConfig, formData])

  // Transform system config to form data
  const transformConfigToFormData = (
    config: SystemConfiguration
  ): SystemConfigFormData => {
    return {
      blockchain: {
        bitcoin: {
          enabled: config.blockchain.bitcoin.enabled,
          rpcEndpoint: config.blockchain.bitcoin.rpcEndpoint,
          backupEndpoints: config.blockchain.bitcoin.backupEndpoints.join('\n'),
          timeout: config.blockchain.bitcoin.timeout,
          maxRetries: config.blockchain.bitcoin.maxRetries,
          confirmationsRequired:
            config.blockchain.bitcoin.confirmationsRequired,
          gasSettings: config.blockchain.bitcoin.gasSettings,
        },
        ethereum: {
          enabled: config.blockchain.ethereum.enabled,
          rpcEndpoint: config.blockchain.ethereum.rpcEndpoint,
          backupEndpoints:
            config.blockchain.ethereum.backupEndpoints.join('\n'),
          timeout: config.blockchain.ethereum.timeout,
          maxRetries: config.blockchain.ethereum.maxRetries,
          confirmationsRequired:
            config.blockchain.ethereum.confirmationsRequired,
          gasSettings: config.blockchain.ethereum.gasSettings,
        },
        solana: {
          enabled: config.blockchain.solana.enabled,
          rpcEndpoint: config.blockchain.solana.rpcEndpoint,
          backupEndpoints: config.blockchain.solana.backupEndpoints.join('\n'),
          timeout: config.blockchain.solana.timeout,
          maxRetries: config.blockchain.solana.maxRetries,
          confirmationsRequired: config.blockchain.solana.confirmationsRequired,
          gasSettings: config.blockchain.solana.gasSettings,
        },
      },
      security: {
        jwtExpirationTime: config.security.authentication.jwtExpirationTime,
        refreshTokenExpirationTime:
          config.security.authentication.refreshTokenExpirationTime,
        maxLoginAttempts: config.security.authentication.maxLoginAttempts,
        lockoutDuration: config.security.authentication.lockoutDuration,
        requireTwoFactor: config.security.authentication.requireTwoFactor,
        passwordMinLength:
          config.security.authentication.passwordPolicy.minLength,
        requireUppercase:
          config.security.authentication.passwordPolicy.requireUppercase,
        requireLowercase:
          config.security.authentication.passwordPolicy.requireLowercase,
        requireNumbers:
          config.security.authentication.passwordPolicy.requireNumbers,
        requireSpecialChars:
          config.security.authentication.passwordPolicy.requireSpecialChars,
        passwordMaxAge: config.security.authentication.passwordPolicy.maxAge,
        corsOrigins: config.security.apiSecurity.corsOrigins.join('\n'),
        rateLimitEnabled: config.security.apiSecurity.rateLimitEnabled,
        ipWhitelist: config.security.apiSecurity.ipWhitelist.join('\n'),
        ipBlacklist: config.security.apiSecurity.ipBlacklist.join('\n'),
        requireApiKeyForMerchants:
          config.security.apiSecurity.requireApiKeyForMerchants,
      },
      rateLimit: {
        globalEnabled: config.rateLimit.global.enabled,
        globalRequests: config.rateLimit.global.requests,
        globalWindowMs: config.rateLimit.global.windowMs,
        authEnabled: config.rateLimit.authentication.enabled,
        authRequests: config.rateLimit.authentication.requests,
        authWindowMs: config.rateLimit.authentication.windowMs,
        apiEnabled: config.rateLimit.api.enabled,
        apiRequests: config.rateLimit.api.requests,
        apiWindowMs: config.rateLimit.api.windowMs,
        transactionsEnabled: config.rateLimit.transactions.enabled,
        transactionsRequests: config.rateLimit.transactions.requests,
        transactionsWindowMs: config.rateLimit.transactions.windowMs,
        webhooksEnabled: config.rateLimit.webhooks.enabled,
        webhooksRequests: config.rateLimit.webhooks.requests,
        webhooksWindowMs: config.rateLimit.webhooks.windowMs,
      },
      system: {
        maintenanceEnabled: config.system.maintenance.enabled,
        maintenanceMessage: config.system.maintenance.message,
        maintenanceAllowedIPs: config.system.maintenance.allowedIPs.join('\n'),
        healthCheckInterval: config.system.monitoring.healthCheckInterval,
        cpuThreshold: config.system.monitoring.alertThresholds.cpuUsage,
        memoryThreshold: config.system.monitoring.alertThresholds.memoryUsage,
        diskThreshold: config.system.monitoring.alertThresholds.diskUsage,
        responseTimeThreshold:
          config.system.monitoring.alertThresholds.responseTime,
        errorRateThreshold: config.system.monitoring.alertThresholds.errorRate,
        logLevel: config.system.monitoring.logLevel,
        logRetentionDays: config.system.monitoring.logRetentionDays,
        cacheEnabled: config.system.performance.cacheEnabled,
        cacheTTL: config.system.performance.cacheTTL,
        compressionEnabled: config.system.performance.compressionEnabled,
        maxRequestSize: config.system.performance.maxRequestSize,
        connectionPoolSize: config.system.performance.connectionPoolSize,
        queryTimeout: config.system.performance.queryTimeout,
      },
    }
  }

  // Transform form data back to system config
  const transformFormDataToConfig = (
    data: SystemConfigFormData
  ): Partial<SystemConfiguration> => {
    return {
      blockchain: {
        bitcoin: {
          enabled: data.blockchain.bitcoin.enabled,
          rpcEndpoint: data.blockchain.bitcoin.rpcEndpoint,
          backupEndpoints: data.blockchain.bitcoin.backupEndpoints
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0),
          timeout: data.blockchain.bitcoin.timeout,
          maxRetries: data.blockchain.bitcoin.maxRetries,
          confirmationsRequired: data.blockchain.bitcoin.confirmationsRequired,
          gasSettings: data.blockchain.bitcoin.gasSettings,
        },
        ethereum: {
          enabled: data.blockchain.ethereum.enabled,
          rpcEndpoint: data.blockchain.ethereum.rpcEndpoint,
          backupEndpoints: data.blockchain.ethereum.backupEndpoints
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0),
          timeout: data.blockchain.ethereum.timeout,
          maxRetries: data.blockchain.ethereum.maxRetries,
          confirmationsRequired: data.blockchain.ethereum.confirmationsRequired,
          gasSettings: data.blockchain.ethereum.gasSettings,
        },
        solana: {
          enabled: data.blockchain.solana.enabled,
          rpcEndpoint: data.blockchain.solana.rpcEndpoint,
          backupEndpoints: data.blockchain.solana.backupEndpoints
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0),
          timeout: data.blockchain.solana.timeout,
          maxRetries: data.blockchain.solana.maxRetries,
          confirmationsRequired: data.blockchain.solana.confirmationsRequired,
          gasSettings: data.blockchain.solana.gasSettings,
        },
      },
      security: {
        authentication: {
          jwtExpirationTime: data.security.jwtExpirationTime,
          refreshTokenExpirationTime: data.security.refreshTokenExpirationTime,
          maxLoginAttempts: data.security.maxLoginAttempts,
          lockoutDuration: data.security.lockoutDuration,
          requireTwoFactor: data.security.requireTwoFactor,
          passwordPolicy: {
            minLength: data.security.passwordMinLength,
            requireUppercase: data.security.requireUppercase,
            requireLowercase: data.security.requireLowercase,
            requireNumbers: data.security.requireNumbers,
            requireSpecialChars: data.security.requireSpecialChars,
            maxAge: data.security.passwordMaxAge,
          },
        },
        apiSecurity: {
          corsOrigins: data.security.corsOrigins
            .split('\n')
            .map(origin => origin.trim())
            .filter(origin => origin.length > 0),
          rateLimitEnabled: data.security.rateLimitEnabled,
          ipWhitelist: data.security.ipWhitelist
            .split('\n')
            .map(ip => ip.trim())
            .filter(ip => ip.length > 0),
          ipBlacklist: data.security.ipBlacklist
            .split('\n')
            .map(ip => ip.trim())
            .filter(ip => ip.length > 0),
          requireApiKeyForMerchants: data.security.requireApiKeyForMerchants,
        },
      },
      rateLimit: {
        global: {
          enabled: data.rateLimit.globalEnabled,
          requests: data.rateLimit.globalRequests,
          windowMs: data.rateLimit.globalWindowMs,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        authentication: {
          enabled: data.rateLimit.authEnabled,
          requests: data.rateLimit.authRequests,
          windowMs: data.rateLimit.authWindowMs,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        api: {
          enabled: data.rateLimit.apiEnabled,
          requests: data.rateLimit.apiRequests,
          windowMs: data.rateLimit.apiWindowMs,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        transactions: {
          enabled: data.rateLimit.transactionsEnabled,
          requests: data.rateLimit.transactionsRequests,
          windowMs: data.rateLimit.transactionsWindowMs,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
        webhooks: {
          enabled: data.rateLimit.webhooksEnabled,
          requests: data.rateLimit.webhooksRequests,
          windowMs: data.rateLimit.webhooksWindowMs,
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        },
      },
      system: {
        maintenance: {
          enabled: data.system.maintenanceEnabled,
          message: data.system.maintenanceMessage,
          allowedIPs: data.system.maintenanceAllowedIPs
            .split('\n')
            .map(ip => ip.trim())
            .filter(ip => ip.length > 0),
        },
        monitoring: {
          healthCheckInterval: data.system.healthCheckInterval,
          alertThresholds: {
            cpuUsage: data.system.cpuThreshold,
            memoryUsage: data.system.memoryThreshold,
            diskUsage: data.system.diskThreshold,
            responseTime: data.system.responseTimeThreshold,
            errorRate: data.system.errorRateThreshold,
          },
          logLevel: data.system.logLevel,
          logRetentionDays: data.system.logRetentionDays,
        },
        performance: {
          cacheEnabled: data.system.cacheEnabled,
          cacheTTL: data.system.cacheTTL,
          compressionEnabled: data.system.compressionEnabled,
          maxRequestSize: data.system.maxRequestSize,
          connectionPoolSize: data.system.connectionPoolSize,
          queryTimeout: data.system.queryTimeout,
        },
      },
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleFormChange = (updatedData: Partial<SystemConfigFormData>) => {
    if (formData) {
      const newFormData = { ...formData, ...updatedData }
      setFormData(newFormData)
      setHasChanges(true)
      setValidationResult(null)
    }
  }

  const handleValidate = async () => {
    if (!formData) return

    try {
      const configData = transformFormDataToConfig(formData)
      const result = await validateConfig(configData).unwrap()
      setValidationResult(result)

      if (result.isValid) {
        setSnackbar({
          open: true,
          message: 'Configuration validation passed successfully',
          severity: 'success',
        })
      } else {
        setSnackbar({
          open: true,
          message: `Configuration validation failed with ${result.errors.length} errors`,
          severity: 'error',
        })
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to validate configuration',
        severity: 'error',
      })
    }
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      const configData = transformFormDataToConfig(formData)
      await updateConfig(configData).unwrap()
      setHasChanges(false)
      setValidationResult(null)
      setSnackbar({
        open: true,
        message: 'System configuration updated successfully',
        severity: 'success',
      })
      refetchConfig()
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update system configuration',
        severity: 'error',
      })
    }
  }

  const handleReset = async () => {
    try {
      const result = await resetConfig({ section: resetSection }).unwrap()
      setFormData(transformConfigToFormData(result))
      setHasChanges(false)
      setValidationResult(null)
      setShowResetDialog(false)
      setResetSection(undefined)
      setSnackbar({
        open: true,
        message: resetSection
          ? `${resetSection} configuration reset to defaults`
          : 'All configuration reset to defaults',
        severity: 'success',
      })
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to reset configuration',
        severity: 'error',
      })
    }
  }

  const handleRefresh = () => {
    refetchConfig()
    setHasChanges(false)
    setValidationResult(null)
    setSnackbar({
      open: true,
      message: 'Configuration refreshed from server',
      severity: 'info',
    })
  }

  if (isLoadingConfig) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (configError || !formData) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load system configuration. Please try refreshing the page.
      </Alert>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h4" component="h1">
            System Configuration
          </Typography>
          {hasChanges && (
            <Chip
              label="Unsaved Changes"
              color="warning"
              size="small"
              icon={<WarningIcon />}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isUpdating || isValidating || isResetting}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={handleValidate}
            disabled={!hasChanges || isUpdating || isValidating || isResetting}
          >
            {isValidating ? <CircularProgress size={20} /> : 'Validate'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || isUpdating || isValidating || isResetting}
          >
            {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Validation Results */}
      {validationResult && (
        <Box sx={{ mb: 3 }}>
          {validationResult.isValid ? (
            <Alert severity="success" icon={<CheckIcon />}>
              Configuration validation passed successfully
            </Alert>
          ) : (
            <Alert severity="error" icon={<ErrorIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Configuration validation failed with{' '}
                {validationResult.errors.length} errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {validationResult.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Configuration warnings:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>
                    <strong>{warning.field}:</strong> {warning.message}
                    {warning.recommendation && (
                      <em> (Recommendation: {warning.recommendation})</em>
                    )}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )}

      {/* Configuration Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="system configuration tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Blockchain RPC" id="config-tab-0" />
            <Tab label="Security" id="config-tab-1" />
            <Tab label="Rate Limiting" id="config-tab-2" />
            <Tab label="System Parameters" id="config-tab-3" />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <BlockchainConfigurationTab
              data={formData.blockchain}
              onChange={blockchainData =>
                handleFormChange({ blockchain: blockchainData })
              }
              onReset={() => {
                setResetSection('blockchain')
                setShowResetDialog(true)
              }}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <SecurityConfigurationTab
              data={formData.security}
              onChange={securityData =>
                handleFormChange({ security: securityData })
              }
              onReset={() => {
                setResetSection('security')
                setShowResetDialog(true)
              }}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <RateLimitConfigurationTab
              data={formData.rateLimit}
              onChange={rateLimitData =>
                handleFormChange({ rateLimit: rateLimitData })
              }
              onReset={() => {
                setResetSection('rateLimit')
                setShowResetDialog(true)
              }}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <SystemParametersTab
              data={formData.system}
              onChange={systemData => handleFormChange({ system: systemData })}
              onReset={() => {
                setResetSection('system')
                setShowResetDialog(true)
              }}
            />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset the {resetSection || 'entire'}{' '}
            configuration to default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReset}
            color="error"
            variant="contained"
            disabled={isResetting}
          >
            {isResetting ? <CircularProgress size={20} /> : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default SystemConfigurationPanel

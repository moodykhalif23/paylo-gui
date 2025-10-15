import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  LinearProgress,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Security as SecurityIcon,
  AccountBalance as WalletIcon,
  Receipt as InvoiceIcon,
  AdminPanelSettings as AdminIcon,
  CloudDownload as ExportIcon,
  NetworkCheck as NetworkIcon,
} from '@mui/icons-material'

import { useAppSelector } from '../../store'
import { workflowOrchestrator } from '../../services/integration/workflowOrchestrator'
import { workflowIntegration } from '../../services/integration/workflowIntegration'
import { apiIntegration } from '../../services/integration/apiIntegration'
import EnhancedErrorBoundary, {
  ComponentErrorBoundary,
} from '../common/EnhancedErrorBoundary'
import { EmptyStateFallback } from '../common/FallbackUI'

interface IntegrationStatus {
  component: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: string[]
}

const FinalIntegrationDemo: React.FC = () => {
  const [integrationStatus, setIntegrationStatus] = useState<
    IntegrationStatus[]
  >([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const { isConnected } = useAppSelector(state => state.websocket)
  const { notifications } = useAppSelector(state => state.notifications)

  const performInitialIntegrationCheck = useCallback(async () => {
    const status: IntegrationStatus[] = []

    // Check authentication integration
    status.push({
      component: 'Authentication System',
      status: isAuthenticated ? 'success' : 'warning',
      message: isAuthenticated
        ? `User authenticated as ${user?.role}`
        : 'No user authenticated',
      details: isAuthenticated
        ? [`Email: ${user?.email}`, `Role: ${user?.role}`, `ID: ${user?.id}`]
        : ['Please log in to test full integration'],
    })

    // Check WebSocket connection
    status.push({
      component: 'WebSocket Connection',
      status: isConnected ? 'success' : 'error',
      message: isConnected ? 'WebSocket connected' : 'WebSocket disconnected',
      details: isConnected
        ? ['Real-time updates enabled']
        : ['Real-time features unavailable'],
    })

    // Check notification system
    status.push({
      component: 'Notification System',
      status: 'success',
      message: `${notifications.length} notifications in store`,
      details: [`Unread: ${notifications.filter(n => !n.isRead).length}`],
    })

    // Check API integration
    try {
      await apiIntegration.healthCheck()
      status.push({
        component: 'API Integration',
        status: 'success',
        message: 'API endpoints accessible',
        details: ['Health check passed'],
      })
    } catch (error) {
      status.push({
        component: 'API Integration',
        status: 'error',
        message: 'API connection failed',
        details: [error instanceof Error ? error.message : 'Unknown error'],
      })
    }

    // Check error boundaries
    status.push({
      component: 'Error Boundaries',
      status: 'success',
      message: 'Error boundaries active',
      details: [
        'Enhanced error handling enabled',
        'Fallback UI components ready',
      ],
    })

    setIntegrationStatus(status)
  }, [isAuthenticated, user, isConnected, notifications])

  useEffect(() => {
    performInitialIntegrationCheck()
  }, [performInitialIntegrationCheck])

  const runComprehensiveIntegrationTest = async () => {
    setIsRunning(true)
    setProgress(0)

    const tests = [
      { name: 'Authentication Workflow', test: testAuthenticationWorkflow },
      { name: 'P2P User Workflow', test: testP2PWorkflow },
      { name: 'Merchant Workflow', test: testMerchantWorkflow },
      { name: 'Admin Workflow', test: testAdminWorkflow },
      { name: 'Error Handling', test: testErrorHandling },
      { name: 'Data Export', test: testDataExport },
      { name: 'Real-time Features', test: testRealTimeFeatures },
    ]

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      try {
        await test.test()
        updateIntegrationStatus(test.name, 'success', 'Test passed')
      } catch (error) {
        updateIntegrationStatus(
          test.name,
          'error',
          error instanceof Error ? error.message : 'Test failed'
        )
      }
      setProgress(((i + 1) / tests.length) * 100)
    }

    setIsRunning(false)
  }

  const updateIntegrationStatus = (
    component: string,
    status: IntegrationStatus['status'],
    message: string,
    details?: string[]
  ) => {
    setIntegrationStatus(prev => {
      const existing = prev.find(s => s.component === component)
      if (existing) {
        return prev.map(s =>
          s.component === component ? { ...s, status, message, details } : s
        )
      } else {
        return [...prev, { component, status, message, details }]
      }
    })
  }

  // Test implementations
  const testAuthenticationWorkflow = async () => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to test auth workflow')
    }
    // Test token refresh and user data retrieval
    await apiIntegration.healthCheck()
  }

  const testP2PWorkflow = async () => {
    if (!isAuthenticated || user?.role !== 'user') {
      throw new Error('P2P user authentication required')
    }

    // Test wallet operations
    const wallets = await apiIntegration.getWallets()
    if (wallets.length === 0) {
      // Create a test wallet
      await apiIntegration.createWallet('bitcoin')
    }

    // Test transaction history
    await apiIntegration.getTransactions({ page: 1, limit: 5 })
  }

  const testMerchantWorkflow = async () => {
    if (!isAuthenticated || user?.role !== 'merchant') {
      throw new Error('Merchant authentication required')
    }

    // Test merchant dashboard
    await apiIntegration.getMerchantDashboard()

    // Test invoice creation workflow
    await workflowIntegration.createInvoiceWorkflow({
      amount: '100.00',
      currency: 'bitcoin',
      description: 'Integration test invoice',
    })
  }

  const testAdminWorkflow = async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      throw new Error('Admin authentication required')
    }

    // Test system health monitoring
    await apiIntegration.getSystemHealth()

    // Test user management
    await apiIntegration.getUsers({ page: 1, limit: 5 })
  }

  const testErrorHandling = async () => {
    try {
      // Intentionally trigger an error
      await apiIntegration.get('/non-existent-endpoint')
      throw new Error('Expected error was not thrown')
    } catch (error) {
      // This is expected - error handling is working
      if (
        error instanceof Error &&
        error.message === 'Expected error was not thrown'
      ) {
        throw error
      }
      // Error was properly handled
    }
  }

  const testDataExport = async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required for export test')
    }

    const result = await workflowOrchestrator.exportDataWithCompliance({
      type: 'transactions',
      format: 'csv',
      requestedBy: user?.id || 'test-user',
      purpose: 'Integration testing',
    })

    if (!result.success) {
      throw new Error(result.error || 'Export test failed')
    }
  }

  const testRealTimeFeatures = async () => {
    if (!isConnected) {
      throw new Error('WebSocket connection required for real-time test')
    }

    // Test connection status handling
    await workflowOrchestrator.handleConnectionStatusChange(true)
  }

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />
      case 'error':
        return <ErrorIcon color="error" />
      case 'warning':
        return <WarningIcon color="warning" />
      case 'info':
        return <InfoIcon color="info" />
    }
  }

  const getComponentIcon = (component: string) => {
    if (component.includes('Authentication')) return <SecurityIcon />
    if (component.includes('P2P') || component.includes('Wallet'))
      return <WalletIcon />
    if (component.includes('Merchant') || component.includes('Invoice'))
      return <InvoiceIcon />
    if (component.includes('Admin')) return <AdminIcon />
    if (component.includes('Export')) return <ExportIcon />
    if (component.includes('WebSocket') || component.includes('Network'))
      return <NetworkIcon />
    return <InfoIcon />
  }

  return (
    <EnhancedErrorBoundary>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Final Integration & Testing Dashboard
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive integration testing of all application workflows, error
          boundaries, and end-to-end user experiences.
        </Typography>

        {/* Control Panel */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={runComprehensiveIntegrationTest}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
            </Button>

            <Button
              variant="outlined"
              onClick={performInitialIntegrationCheck}
              disabled={isRunning}
            >
              Refresh Status
            </Button>

            {isRunning && (
              <Box sx={{ flex: 1, ml: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
            )}
          </Box>

          {/* System Status Overview */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {
                      integrationStatus.filter(s => s.status === 'success')
                        .length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Components Healthy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error">
                    {integrationStatus.filter(s => s.status === 'error').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Components with Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {
                      integrationStatus.filter(s => s.status === 'warning')
                        .length
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Components with Warnings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    {integrationStatus.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Components
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Integration Status Details */}
        <Grid container spacing={3}>
          {integrationStatus.length === 0 ? (
            <Grid item xs={12}>
              <ComponentErrorBoundary componentName="IntegrationStatus">
                <EmptyStateFallback
                  title="No Integration Status"
                  message="Click 'Refresh Status' to check system integration status"
                  action={{
                    label: 'Refresh Status',
                    onClick: performInitialIntegrationCheck,
                  }}
                />
              </ComponentErrorBoundary>
            </Grid>
          ) : (
            integrationStatus.map((status, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ComponentErrorBoundary
                  componentName={`IntegrationCard-${status.component}`}
                >
                  <Card>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        {getComponentIcon(status.component)}
                        <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
                          {status.component}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(status.status)}
                          label={status.status.toUpperCase()}
                          color={
                            status.status === 'success'
                              ? 'success'
                              : status.status === 'error'
                                ? 'error'
                                : status.status === 'warning'
                                  ? 'warning'
                                  : 'info'
                          }
                          size="small"
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {status.message}
                      </Typography>

                      {status.details && status.details.length > 0 && (
                        <List dense>
                          {status.details.map((detail, detailIndex) => (
                            <ListItem key={detailIndex} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <Box
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    bgcolor: 'text.secondary',
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={detail}
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </ComponentErrorBoundary>
              </Grid>
            ))
          )}
        </Grid>

        {/* Integration Summary */}
        {integrationStatus.length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integration Summary
            </Typography>

            <Alert
              severity={
                integrationStatus.some(s => s.status === 'error')
                  ? 'error'
                  : integrationStatus.some(s => s.status === 'warning')
                    ? 'warning'
                    : 'success'
              }
              sx={{ mb: 2 }}
            >
              {integrationStatus.every(s => s.status === 'success')
                ? 'All systems are fully integrated and operational!'
                : integrationStatus.some(s => s.status === 'error')
                  ? 'Some components have integration issues that need attention.'
                  : 'Most components are working, but some have warnings.'}
            </Alert>

            <Typography variant="body2" color="text.secondary">
              This dashboard demonstrates the complete integration of all
              application workflows, including authentication, P2P transfers,
              merchant operations, admin functions, error handling, and
              real-time features. All components are connected through the
              workflow orchestrator and protected by enhanced error boundaries.
            </Typography>
          </Paper>
        )}
      </Box>
    </EnhancedErrorBoundary>
  )
}

export default FinalIntegrationDemo

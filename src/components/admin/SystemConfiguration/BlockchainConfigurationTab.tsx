import React, { useState } from 'react'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Science as TestIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useTestBlockchainConnectionMutation } from '../../../store/api/adminApi'
import { BlockchainRPCFormData, ConfigurationTestResult } from '../../../types'

interface BlockchainConfigurationTabProps {
  data: {
    bitcoin: BlockchainRPCFormData
    ethereum: BlockchainRPCFormData
    solana: BlockchainRPCFormData
  }
  onChange: (data: {
    bitcoin: BlockchainRPCFormData
    ethereum: BlockchainRPCFormData
    solana: BlockchainRPCFormData
  }) => void
  onReset: () => void
}

interface BlockchainCardProps {
  blockchain: 'bitcoin' | 'ethereum' | 'solana'
  data: BlockchainRPCFormData
  onChange: (data: BlockchainRPCFormData) => void
  onTest: (
    blockchain: 'bitcoin' | 'ethereum' | 'solana',
    endpoint: string
  ) => void
  testResult?: ConfigurationTestResult
  isTestingConnection: boolean
}

const BlockchainCard: React.FC<BlockchainCardProps> = ({
  blockchain,
  data,
  onChange,
  onTest,
  testResult,
  isTestingConnection,
}) => {
  const blockchainLabels = {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
  }

  const handleFieldChange = (
    field: keyof BlockchainRPCFormData,
    value: string | number | boolean
  ) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handleGasSettingChange = (field: string, value: string) => {
    const currentGasSettings = data.gasSettings || {}
    onChange({
      ...data,
      gasSettings: {
        ...currentGasSettings,
        [field]: value,
      },
    })
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h3">
            {blockchainLabels[blockchain]} Configuration
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {testResult && (
              <Chip
                icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
                label={testResult.success ? 'Connected' : 'Failed'}
                color={testResult.success ? 'success' : 'error'}
                size="small"
              />
            )}
            <Button
              size="small"
              variant="outlined"
              startIcon={
                isTestingConnection ? (
                  <CircularProgress size={16} />
                ) : (
                  <TestIcon />
                )
              }
              onClick={() => onTest(blockchain, data.rpcEndpoint)}
              disabled={
                !data.enabled || !data.rpcEndpoint || isTestingConnection
              }
            >
              Test Connection
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.enabled}
                  onChange={e => handleFieldChange('enabled', e.target.checked)}
                />
              }
              label={`Enable ${blockchainLabels[blockchain]} support`}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Primary RPC Endpoint"
              value={data.rpcEndpoint}
              onChange={e => handleFieldChange('rpcEndpoint', e.target.value)}
              disabled={!data.enabled}
              placeholder={`https://${blockchain}.example.com/rpc`}
              helperText="Primary RPC endpoint for blockchain communication"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Backup RPC Endpoints"
              value={data.backupEndpoints}
              onChange={e =>
                handleFieldChange('backupEndpoints', e.target.value)
              }
              disabled={!data.enabled}
              placeholder="https://backup1.example.com/rpc&#10;https://backup2.example.com/rpc"
              helperText="One endpoint per line. Used as fallbacks if primary endpoint fails"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Connection Timeout (ms)"
              value={data.timeout}
              onChange={e =>
                handleFieldChange('timeout', parseInt(e.target.value) || 0)
              }
              disabled={!data.enabled}
              inputProps={{ min: 1000, max: 60000, step: 1000 }}
              helperText="Request timeout in milliseconds"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Retries"
              value={data.maxRetries}
              onChange={e =>
                handleFieldChange('maxRetries', parseInt(e.target.value) || 0)
              }
              disabled={!data.enabled}
              inputProps={{ min: 0, max: 10 }}
              helperText="Maximum retry attempts for failed requests"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Required Confirmations"
              value={data.confirmationsRequired}
              onChange={e =>
                handleFieldChange(
                  'confirmationsRequired',
                  parseInt(e.target.value) || 0
                )
              }
              disabled={!data.enabled}
              inputProps={{ min: 1, max: 100 }}
              helperText="Number of confirmations required before considering transaction final"
            />
          </Grid>

          {/* Gas Settings for Ethereum */}
          {blockchain === 'ethereum' && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Gas Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Max Gas Price (Gwei)"
                        value={data.gasSettings?.maxGasPrice || ''}
                        onChange={e =>
                          handleGasSettingChange('maxGasPrice', e.target.value)
                        }
                        disabled={!data.enabled}
                        placeholder="100"
                        helperText="Maximum gas price in Gwei"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Gas Limit"
                        value={data.gasSettings?.gasLimit || ''}
                        onChange={e =>
                          handleGasSettingChange('gasLimit', e.target.value)
                        }
                        disabled={!data.enabled}
                        placeholder="21000"
                        helperText="Default gas limit for transactions"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Priority Fee (Gwei)"
                        value={data.gasSettings?.priorityFee || ''}
                        onChange={e =>
                          handleGasSettingChange('priorityFee', e.target.value)
                        }
                        disabled={!data.enabled}
                        placeholder="2"
                        helperText="Priority fee for EIP-1559 transactions"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {testResult && (
            <Grid item xs={12}>
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2">
                  <strong>Connection Test Result:</strong> {testResult.message}
                  {testResult.responseTime && (
                    <span> (Response time: {testResult.responseTime}ms)</span>
                  )}
                </Typography>
                {testResult.details && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" component="pre">
                      {JSON.stringify(testResult.details, null, 2)}
                    </Typography>
                  </Box>
                )}
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

const BlockchainConfigurationTab: React.FC<BlockchainConfigurationTabProps> = ({
  data,
  onChange,
  onReset,
}) => {
  const [testResults, setTestResults] = useState<
    Record<string, ConfigurationTestResult>
  >({})
  const [testBlockchainConnection, { isLoading: isTestingConnection }] =
    useTestBlockchainConnectionMutation()

  const handleBlockchainChange = (
    blockchain: 'bitcoin' | 'ethereum' | 'solana',
    blockchainData: BlockchainRPCFormData
  ) => {
    onChange({
      ...data,
      [blockchain]: blockchainData,
    })
  }

  const handleTestConnection = async (
    blockchain: 'bitcoin' | 'ethereum' | 'solana',
    endpoint: string
  ) => {
    try {
      const result = await testBlockchainConnection({
        blockchain,
        rpcEndpoint: endpoint,
        timeout: 10000,
      }).unwrap()

      setTestResults(prev => ({
        ...prev,
        [blockchain]: result,
      }))
    } catch {
      setTestResults(prev => ({
        ...prev,
        [blockchain]: {
          field: blockchain,
          success: false,
          message: 'Connection test failed',
        },
      }))
    }
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
          Blockchain RPC Configuration
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
        Configure RPC endpoints and connection settings for supported
        blockchains. Test connections to ensure proper connectivity before
        saving changes.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <BlockchainCard
            blockchain="bitcoin"
            data={data.bitcoin}
            onChange={blockchainData =>
              handleBlockchainChange('bitcoin', blockchainData)
            }
            onTest={handleTestConnection}
            testResult={testResults.bitcoin}
            isTestingConnection={isTestingConnection}
          />
        </Grid>

        <Grid item xs={12}>
          <BlockchainCard
            blockchain="ethereum"
            data={data.ethereum}
            onChange={blockchainData =>
              handleBlockchainChange('ethereum', blockchainData)
            }
            onTest={handleTestConnection}
            testResult={testResults.ethereum}
            isTestingConnection={isTestingConnection}
          />
        </Grid>

        <Grid item xs={12}>
          <BlockchainCard
            blockchain="solana"
            data={data.solana}
            onChange={blockchainData =>
              handleBlockchainChange('solana', blockchainData)
            }
            onTest={handleTestConnection}
            testResult={testResults.solana}
            isTestingConnection={isTestingConnection}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          Configuration Guidelines:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Use HTTPS endpoints for production environments</li>
          <li>Configure multiple backup endpoints for high availability</li>
          <li>Set appropriate timeouts based on network conditions</li>
          <li>
            Higher confirmation requirements increase security but reduce speed
          </li>
          <li>Test all connections before saving configuration changes</li>
        </ul>
      </Alert>
    </Box>
  )
}

export default BlockchainConfigurationTab

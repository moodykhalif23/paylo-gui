import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import { ContentCopy, Refresh, AccountBalanceWallet } from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { BlockchainType } from '../../types'

interface PaymentAddressGeneratorProps {
  invoiceId?: string
  amount?: string
  currency?: string
  blockchain?: BlockchainType
  paymentAddress?: string
  qrCode?: string
  onAddressGenerated?: (address: string) => void
}

const PaymentAddressGenerator: React.FC<PaymentAddressGeneratorProps> = ({
  invoiceId,
  amount,
  currency,
  blockchain = 'bitcoin',
  paymentAddress,

  onAddressGenerated,
}) => {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType>(blockchain)
  const [generatedAddress, setGeneratedAddress] = useState<string>(
    paymentAddress || ''
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateAddress = async () => {
    setIsGenerating(true)
    try {
      // Simulate address generation - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock address generation based on blockchain
      let mockAddress = ''
      switch (selectedBlockchain) {
        case 'bitcoin':
          mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
          break
        case 'ethereum':
          mockAddress = '0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4'
          break
        case 'solana':
          mockAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          break
      }

      setGeneratedAddress(mockAddress)
      onAddressGenerated?.(mockAddress)
    } catch (error) {
      console.error('Failed to generate address:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyAddress = async () => {
    if (generatedAddress) {
      try {
        await navigator.clipboard.writeText(generatedAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy address:', err)
      }
    }
  }

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain.toLowerCase()) {
      case 'bitcoin':
        return '#f7931a'
      case 'ethereum':
        return '#627eea'
      case 'solana':
        return '#9945ff'
      default:
        return '#666'
    }
  }

  const formatPaymentUri = () => {
    if (!generatedAddress) return ''

    let uri = ''
    switch (selectedBlockchain) {
      case 'bitcoin':
        uri = `bitcoin:${generatedAddress}`
        if (amount) uri += `?amount=${amount}`
        break
      case 'ethereum':
        uri = `ethereum:${generatedAddress}`
        if (amount) uri += `?value=${amount}`
        break
      case 'solana':
        uri = `solana:${generatedAddress}`
        if (amount) uri += `?amount=${amount}`
        break
    }
    return uri
  }

  return (
    <Card>
      <CardHeader
        title="Payment Address Generator"
        subheader="Generate secure payment addresses for invoices"
        avatar={<AccountBalanceWallet color="primary" />}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Blockchain Selection */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select Blockchain Network
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {(['bitcoin', 'ethereum', 'solana'] as BlockchainType[]).map(
                chain => (
                  <Chip
                    key={chain}
                    label={chain.charAt(0).toUpperCase() + chain.slice(1)}
                    onClick={() => setSelectedBlockchain(chain)}
                    color={selectedBlockchain === chain ? 'primary' : 'default'}
                    variant={
                      selectedBlockchain === chain ? 'filled' : 'outlined'
                    }
                    sx={{
                      ...(selectedBlockchain === chain && {
                        bgcolor: getBlockchainColor(chain),
                        color: 'white',
                        '&:hover': {
                          bgcolor: getBlockchainColor(chain),
                          opacity: 0.8,
                        },
                      }),
                    }}
                  />
                )
              )}
            </Box>
          </Grid>

          {/* Invoice Details */}
          {(invoiceId || amount) && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {invoiceId && `Invoice ID: ${invoiceId}`}
                  {amount && currency && (
                    <span>
                      {invoiceId ? ' | ' : ''}
                      Amount: {amount} {currency}
                    </span>
                  )}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Address Generation */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <Button
                variant="contained"
                onClick={generateAddress}
                disabled={isGenerating}
                startIcon={<Refresh />}
              >
                {isGenerating
                  ? 'Generating...'
                  : generatedAddress
                    ? 'Regenerate Address'
                    : 'Generate Address'}
              </Button>

              {generatedAddress && (
                <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
                  <IconButton onClick={handleCopyAddress} color="primary">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {generatedAddress && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Address ({selectedBlockchain.toUpperCase()})
                </Typography>
                <TextField
                  fullWidth
                  value={generatedAddress}
                  InputProps={{
                    readOnly: true,
                    style: { fontFamily: 'monospace', fontSize: '0.875rem' },
                  }}
                  variant="outlined"
                  size="small"
                />
              </Paper>
            )}
          </Grid>

          {/* QR Code */}
          {generatedAddress && (
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  QR Code for Payment
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <QRCodeSVG
                    value={formatPaymentUri() || generatedAddress}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                >
                  Scan with a {selectedBlockchain} wallet to make payment
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Payment Instructions */}
          {generatedAddress && (
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Instructions
                </Typography>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="body2" gutterBottom>
                    Copy the payment address above or scan the QR code
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Send exactly{' '}
                    {amount ? `${amount} ${currency}` : 'the specified amount'}{' '}
                    to this address
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Payment will be confirmed after network confirmations
                  </Typography>
                  <Typography component="li" variant="body2">
                    Do not send from an exchange - use a personal wallet
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Only send {selectedBlockchain.toUpperCase()} to this
                    address. Sending other cryptocurrencies will result in
                    permanent loss.
                  </Typography>
                </Alert>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PaymentAddressGenerator

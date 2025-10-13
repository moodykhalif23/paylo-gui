import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
} from '@mui/material'
import {
  Close,
  Send,
  AccountBalanceWallet,
  Schedule,
  Security,
  Warning,
} from '@mui/icons-material'
import { TransferFormData } from './P2PTransferForm'
import { Wallet, TransactionFee } from '../../types'

interface TransactionConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  transferData: TransferFormData
  selectedWallet: Wallet | undefined
  feeData: TransactionFee | undefined
  isLoading?: boolean
  estimatedConfirmationTime?: number
}

const TransactionConfirmationDialog: React.FC<
  TransactionConfirmationDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  transferData,
  selectedWallet,
  feeData,
  isLoading = false,
  estimatedConfirmationTime,
}) => {
  const blockchainConfig = {
    bitcoin: {
      name: 'Bitcoin',
      symbol: 'BTC',
      color: '#f7931a',
      explorer: 'https://blockstream.info',
    },
    ethereum: {
      name: 'Ethereum',
      symbol: 'ETH',
      color: '#627eea',
      explorer: 'https://etherscan.io',
    },
    solana: {
      name: 'Solana',
      symbol: 'SOL',
      color: '#9945ff',
      explorer: 'https://explorer.solana.com',
    },
  }

  const config = blockchainConfig[transferData.blockchain]
  const selectedFee = feeData?.[transferData.feeLevel]

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0.00'
    if (num < 0.001) return num.toFixed(8)
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const calculateTotal = () => {
    if (!selectedFee) return '0'
    const amount = parseFloat(transferData.amount)
    const fee = parseFloat(selectedFee.fee)
    return (amount + fee).toFixed(8)
  }

  const calculateTotalUSD = () => {
    if (!selectedWallet) return 0
    const total = parseFloat(calculateTotal())
    const rate = selectedWallet.usdValue / parseFloat(selectedWallet.balance)
    return total * rate
  }

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getConfirmationTimeText = () => {
    if (estimatedConfirmationTime) {
      if (estimatedConfirmationTime < 60) {
        return `~${estimatedConfirmationTime} minutes`
      } else {
        const hours = Math.floor(estimatedConfirmationTime / 60)
        const minutes = estimatedConfirmationTime % 60
        return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours} hours`
      }
    }
    return selectedFee ? `~${selectedFee.estimatedTime} minutes` : 'Unknown'
  }

  const hasInsufficientBalance = () => {
    if (!selectedWallet) return false
    const total = parseFloat(calculateTotal())
    const balance = parseFloat(selectedWallet.balance)
    return total > balance
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Send color="primary" />
            <Typography variant="h6">Confirm Transaction</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Transaction Overview */}
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: 'background.default' }}
          >
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Transaction Overview
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {config.symbol}
              </Box>
              <Box flex={1}>
                <Typography variant="h6">
                  {formatBalance(transferData.amount)} {config.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatUSD(calculateTotalUSD())} (including fees)
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Transaction Details */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    From Wallet:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceWallet fontSize="small" />
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedWallet
                        ? formatAddress(selectedWallet.address)
                        : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    To Address:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {formatAddress(transferData.toAddress)}
                  </Typography>
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    Network:
                  </Typography>
                  <Chip
                    label={config.name}
                    size="small"
                    sx={{ bgcolor: config.color, color: 'white' }}
                  />
                </Box>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    Transaction Speed:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Schedule fontSize="small" />
                    <Typography
                      variant="body2"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {transferData.feeLevel} ({getConfirmationTimeText()})
                    </Typography>
                  </Box>
                </Box>
                <Divider />
              </Grid>

              {transferData.memo && (
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    py={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Memo:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ maxWidth: '60%', wordBreak: 'break-word' }}
                    >
                      {transferData.memo}
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Fee Breakdown */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Fee Breakdown
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Amount:</Typography>
                  <Typography variant="body2">
                    {formatBalance(transferData.amount)} {config.symbol}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Network Fee:</Typography>
                  <Typography variant="body2">
                    {selectedFee ? formatBalance(selectedFee.fee) : '0'}{' '}
                    {config.symbol}
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight="bold">
                    Total:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatBalance(calculateTotal())} {config.symbol}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Warnings and Alerts */}
          {hasInsufficientBalance() && (
            <Alert severity="error" icon={<Warning />}>
              Insufficient balance. You need {formatBalance(calculateTotal())}{' '}
              {config.symbol} but only have{' '}
              {selectedWallet ? formatBalance(selectedWallet.balance) : '0'}{' '}
              {config.symbol}.
            </Alert>
          )}

          <Alert severity="info" icon={<Security />}>
            <Typography variant="body2">
              This transaction is irreversible. Please verify all details before
              confirming. You can track your transaction on the {config.name}{' '}
              blockchain explorer.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="large"
          disabled={isLoading || hasInsufficientBalance()}
          startIcon={<Send />}
          sx={{ minWidth: 140 }}
        >
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionConfirmationDialog

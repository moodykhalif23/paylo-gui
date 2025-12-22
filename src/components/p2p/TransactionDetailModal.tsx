import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material'
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { Transaction, BlockchainType, TransactionStatus } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useGetTransactionByIdQuery } from '../../store/api/adminApi'

interface TransactionDetailModalProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  open,
  onClose,
  transaction,
}) => {
  const {
    data: detailedTransaction,
    isLoading,
    error,
    refetch,
  } = useGetTransactionByIdQuery(transaction?.id || '', {
    skip: !transaction?.id || !open,
  })

  const currentTransaction = detailedTransaction || transaction

  if (!currentTransaction) return null

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'default'
      case 'expired':
        return 'default'
      default:
        return 'default'
    }
  }

  const getBlockchainColor = (blockchain: BlockchainType) => {
    switch (blockchain) {
      case 'bitcoin':
        return '#f7931a'
      case 'ethereum':
        return '#627eea'
      case 'solana':
        return '#9945ff'
      case 'erc20':
        return '#627eea'
      case 'trc20':
        return '#ff0628'
      default:
        return '#666'
    }
  }

  const getBlockchainSymbol = (blockchain: BlockchainType) => {
    switch (blockchain) {
      case 'bitcoin':
        return 'BTC'
      case 'ethereum':
        return 'ETH'
      case 'solana':
        return 'SOL'
      case 'erc20':
        return 'ERC20'
      case 'trc20':
        return 'TRC20'
      default:
        return (blockchain as string).toUpperCase()
    }
  }

  const getExplorerUrl = (transaction: Transaction) => {
    if (!transaction.txHash) return null

    switch (transaction.blockchain) {
      case 'bitcoin':
        return `https://blockstream.info/tx/${transaction.txHash}`
      case 'ethereum':
        return `https://etherscan.io/tx/${transaction.txHash}`
      case 'solana':
        return `https://explorer.solana.com/tx/${transaction.txHash}`
      case 'erc20':
        return `https://etherscan.io/tx/${transaction.txHash}`
      case 'trc20':
        return `https://tronscan.org/#/transaction/${transaction.txHash}`
      default:
        return null
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getConfirmationProgress = () => {
    if (!detailedTransaction || currentTransaction.status !== 'pending')
      return 0
    return Math.min(
      (detailedTransaction.confirmations /
        detailedTransaction.requiredConfirmations) *
        100,
      100
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">Transaction Details</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load transaction details
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Chip
                label={`${currentTransaction.type.toUpperCase()} Transaction`}
                variant="outlined"
              />
              <Chip
                label={currentTransaction.status.toUpperCase()}
                color={getStatusColor(currentTransaction.status)}
                variant={
                  currentTransaction.status === 'confirmed'
                    ? 'filled'
                    : 'outlined'
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getBlockchainColor(
                      currentTransaction.blockchain
                    ),
                  }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {getBlockchainSymbol(currentTransaction.blockchain)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Transaction Hash */}
          {currentTransaction.txHash && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Hash
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {currentTransaction.txHash}
                </Typography>
                <Tooltip title="Copy">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(currentTransaction.txHash!)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View on Explorer">
                  <IconButton
                    size="small"
                    component="a"
                    href={getExplorerUrl(currentTransaction) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LaunchIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          )}

          {/* Addresses */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              From Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ wordBreak: 'break-all' }}
              >
                {currentTransaction.fromAddress}
              </Typography>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() =>
                    copyToClipboard(currentTransaction.fromAddress)
                  }
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              To Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ wordBreak: 'break-all' }}
              >
                {currentTransaction.toAddress}
              </Typography>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(currentTransaction.toAddress)}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {/* Amount and Fee */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Amount
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              {formatCurrency(
                currentTransaction.amount,
                getBlockchainSymbol(currentTransaction.blockchain)
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Network Fee
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatCurrency(
                currentTransaction.fee,
                getBlockchainSymbol(currentTransaction.blockchain)
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${currentTransaction.feeUSD?.toFixed(2) || '0.00'} USD
            </Typography>
          </Grid>

          {/* Confirmations */}
          {detailedTransaction && currentTransaction.status === 'pending' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Confirmations
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
              >
                <Typography variant="body2">
                  {detailedTransaction.confirmations} /{' '}
                  {detailedTransaction.requiredConfirmations}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getConfirmationProgress()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {getConfirmationProgress().toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Timestamps */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Created At
            </Typography>
            <Typography variant="body2">
              {formatDate(currentTransaction.createdAt)}
            </Typography>
          </Grid>

          {currentTransaction.confirmedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Confirmed At
              </Typography>
              <Typography variant="body2">
                {formatDate(currentTransaction.confirmedAt)}
              </Typography>
            </Grid>
          )}

          {currentTransaction.failedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Failed At
              </Typography>
              <Typography variant="body2">
                {formatDate(currentTransaction.failedAt)}
              </Typography>
            </Grid>
          )}

          {/* Memo */}
          {currentTransaction.memo && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Memo
              </Typography>
              <Typography variant="body2">{currentTransaction.memo}</Typography>
            </Grid>
          )}

          {/* Metadata */}
          {currentTransaction.metadata &&
            Object.keys(currentTransaction.metadata).length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Additional Information
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {JSON.stringify(currentTransaction.metadata, null, 2)}
                  </pre>
                </Box>
              </Grid>
            )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionDetailModal

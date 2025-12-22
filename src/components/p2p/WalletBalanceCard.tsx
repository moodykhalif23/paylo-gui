import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  QrCode,
  ContentCopy,
  Add,
} from '@mui/icons-material'
import { Wallet, BlockchainType } from '../../types'
import QRCodeDisplay from './QRCodeDisplay'

interface WalletBalanceCardProps {
  wallet: Wallet
  onGenerateAddress?: () => void
  onCopyAddress?: (address: string) => void
}

const blockchainConfig: Record<
  BlockchainType,
  {
    name: string
    symbol: string
    color: string
    icon: string
  }
> = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#f7931a',
    icon: '₿',
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627eea',
    icon: 'Ξ',
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945ff',
    icon: '◎',
  },
  erc20: {
    name: 'USDT (ERC-20)',
    symbol: 'USDT',
    color: '#26a17b',
    icon: '₮',
  },
  trc20: {
    name: 'USDT (TRC-20)',
    symbol: 'USDT',
    color: '#26a17b',
    icon: '₮',
  },
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  wallet,
  onGenerateAddress,
  onCopyAddress,
}) => {
  const [showBalance, setShowBalance] = useState(true)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const config = blockchainConfig[wallet.blockchain]

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

  const handleCopyAddress = () => {
    if (onCopyAddress) {
      onCopyAddress(wallet.address)
    }
    navigator.clipboard.writeText(wallet.address)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
          border: `1px solid ${config.color}30`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="h4"
                sx={{ color: config.color, fontWeight: 'bold' }}
              >
                {config.icon}
              </Typography>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {config.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {config.symbol}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={wallet.isActive ? 'Active' : 'Inactive'}
              color={wallet.isActive ? 'success' : 'default'}
              size="small"
            />
          </Box>

          {/* Balance */}
          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2" color="text.secondary">
                Balance
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {showBalance ? (
                <>
                  {formatBalance(wallet.balance)} {config.symbol}
                </>
              ) : (
                '••••••••'
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {showBalance ? formatUSD(wallet.usdValue) : '••••••'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Address */}
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Wallet Address
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              p={1}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 1,
                backdropFilter: 'blur(6px)',
              }}
            >
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ flex: 1, wordBreak: 'break-all' }}
              >
                {truncateAddress(wallet.address)}
              </Typography>
              <Tooltip title="Copy Address">
                <IconButton size="small" onClick={handleCopyAddress}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show QR Code">
                <IconButton size="small" onClick={() => setShowQRDialog(true)}>
                  <QrCode fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            {onGenerateAddress && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={onGenerateAddress}
                fullWidth
              >
                New Address
              </Button>
            )}
          </Stack>

          {/* Metadata */}
          <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(wallet.createdAt).toLocaleDateString()}
            </Typography>
            {wallet.label && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Label: {wallet.label}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h4" sx={{ color: config.color }}>
              {config.icon}
            </Typography>
            <Box>
              <Typography variant="h6">{config.name} Address</Typography>
              <Typography variant="caption" color="text.secondary">
                Scan to receive {config.symbol}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <QRCodeDisplay
            value={wallet.address}
            size={300}
            blockchain={wallet.blockchain}
          />
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Address:
            </Typography>
            <Box
              p={2}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 1,
                backdropFilter: 'blur(6px)',
              }}
            >
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{ wordBreak: 'break-all' }}
              >
                {wallet.address}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyAddress} startIcon={<ContentCopy />}>
            Copy Address
          </Button>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WalletBalanceCard

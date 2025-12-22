import React, { useState } from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import {
  useGetUserWalletsQuery,
  useGetWalletSummaryQuery,
  useCreateWalletMutation,
} from '../../store/api/walletApi'
import { BlockchainType } from '../../types'

const WalletsPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWalletBlockchain, setNewWalletBlockchain] =
    useState<BlockchainType>('bitcoin')
  const [newWalletLabel, setNewWalletLabel] = useState('')
  const [showBalances, setShowBalances] = useState(true)

  // Theme colors
  const accentGreen = '#7dcd85'
  const brandWhite = '#ffffff'

  const {
    data: wallets = [],
    isLoading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets,
  } = useGetUserWalletsQuery()

  const {
    data: walletSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetWalletSummaryQuery()

  const [createWallet, { isLoading: isCreating }] = useCreateWalletMutation()

  const handleCreateWallet = async () => {
    try {
      await createWallet({
        blockchain: newWalletBlockchain,
        label:
          newWalletLabel ||
          `${newWalletBlockchain.charAt(0).toUpperCase() + newWalletBlockchain.slice(1)} Wallet`,
      }).unwrap()

      setCreateDialogOpen(false)
      setNewWalletLabel('')
      setNewWalletBlockchain('bitcoin')
      refetchWallets()
      refetchSummary()
    } catch (error) {
      console.error('Failed to create wallet:', error)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    // In a real app, you'd show a toast notification here
    console.log('Address copied to clipboard:', address)
  }

  const handleRefresh = () => {
    refetchWallets()
    refetchSummary()
  }

  const formatBalance = (balance: string, blockchain: BlockchainType) => {
    const value = parseFloat(balance)
    if (value === 0) return '0'

    // Format based on blockchain
    switch (blockchain) {
      case 'bitcoin':
        return `${value.toFixed(8)} BTC`
      case 'ethereum':
        return `${value.toFixed(6)} ETH`
      case 'solana':
        return `${value.toFixed(4)} SOL`
      default:
        return balance
    }
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
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

  if (walletsLoading || summaryLoading) {
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

  return (
    <Box sx={{ color: brandWhite, width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
        mb={3}
        sx={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          p: 3,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: accentGreen, fontWeight: 600 }}
          >
            My Wallets
          </Typography>
          <Typography variant="body1" sx={{ color: '#c8ffd8' }}>
            Manage your cryptocurrency wallets and addresses
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderColor: 'rgba(124, 205, 133, 0.3)',
              color: accentGreen,
              '&:hover': {
                borderColor: accentGreen,
                backgroundColor: 'rgba(124, 205, 133, 0.05)',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              backgroundColor: accentGreen,
              color: '#07180d',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#6bc074',
              },
            }}
          >
            Create Wallet
          </Button>
        </Stack>
      </Box>

      {/* Error States */}
      {(walletsError || summaryError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load wallet data. Please check your connection and try
          again.
        </Alert>
      )}

      {/* Summary Card */}
      {walletSummary && (
        <Card
          sx={{
            mb: 3,
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(6px)',
            color: brandWhite,
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                sx={{ color: accentGreen, fontWeight: 600 }}
              >
                <WalletIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Portfolio Summary
              </Typography>
              <IconButton
                onClick={() => setShowBalances(!showBalances)}
                size="small"
                sx={{ color: brandWhite }}
              >
                {showBalances ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{ color: accentGreen, fontWeight: 'bold' }}
                  >
                    {showBalances
                      ? formatUSD(walletSummary.totalBalanceUSD)
                      : '****'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                    Total Balance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{ color: accentGreen, fontWeight: 'bold' }}
                  >
                    {walletSummary.walletCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                    Active Wallets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{ color: accentGreen, fontWeight: 'bold' }}
                  >
                    {walletSummary.activeAddresses}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                    Addresses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    sx={{ color: accentGreen, fontWeight: 'bold' }}
                  >
                    {walletSummary.balancesByBlockchain.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                    Blockchains
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {walletSummary.balancesByBlockchain.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: accentGreen, fontWeight: 600 }}
                >
                  Balance by Blockchain
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {walletSummary.balancesByBlockchain.map(balance => (
                    <Box
                      key={balance.blockchain}
                      textAlign="center"
                      minWidth={120}
                    >
                      <Chip
                        label={balance.blockchain.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getBlockchainColor(
                            balance.blockchain
                          ),
                          color: 'white',
                          mb: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                        {showBalances ? formatUSD(balance.usdValue) : '****'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wallet Cards */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: accentGreen,
          fontWeight: 600,
          mb: 2,
        }}
      >
        Your Wallets
      </Typography>

      {wallets.length === 0 ? (
        <Card
          sx={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(6px)',
            color: brandWhite,
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <WalletIcon sx={{ fontSize: 64, color: '#c8ffd8', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: brandWhite }}>
              No Wallets Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#c8ffd8' }} gutterBottom>
              Create your first wallet to start managing cryptocurrency
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                mt: 2,
                backgroundColor: accentGreen,
                color: '#07180d',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#6bc074',
                },
              }}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {wallets.map(wallet => (
            <Grid item xs={12} md={6} lg={4} key={wallet.id}>
              <Card
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(6px)',
                  color: brandWhite,
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={wallet.blockchain.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getBlockchainColor(
                            wallet.blockchain
                          ),
                          color: 'white',
                          mr: 1,
                        }}
                      />
                      <Typography variant="h6" sx={{ color: brandWhite }}>
                        {wallet.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={wallet.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        backgroundColor: wallet.isActive
                          ? 'rgba(124, 205, 133, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                        color: wallet.isActive ? accentGreen : brandWhite,
                        border: wallet.isActive
                          ? '1px solid rgba(124, 205, 133, 0.3)'
                          : '1px solid rgba(255,255,255,0.2)',
                      }}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#c8ffd8' }}
                      gutterBottom
                    >
                      Address
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          wordBreak: 'break-all',
                          flex: 1,
                          color: brandWhite,
                        }}
                      >
                        {wallet.address}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyAddress(wallet.address)}
                        sx={{ ml: 1, color: brandWhite }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#c8ffd8' }}
                      gutterBottom
                    >
                      Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: brandWhite }}>
                      {showBalances
                        ? formatBalance(wallet.balance, wallet.blockchain)
                        : '****'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#c8ffd8' }}>
                      {showBalances ? formatUSD(wallet.usdValue) : '****'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<QrCodeIcon />}
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: 'rgba(124, 205, 133, 0.3)',
                        color: accentGreen,
                        '&:hover': {
                          borderColor: accentGreen,
                          backgroundColor: 'rgba(124, 205, 133, 0.05)',
                        },
                      }}
                    >
                      QR Code
                    </Button>
                    <Button
                      size="small"
                      startIcon={<CopyIcon />}
                      variant="outlined"
                      fullWidth
                      onClick={() => handleCopyAddress(wallet.address)}
                      sx={{
                        borderColor: 'rgba(124, 205, 133, 0.3)',
                        color: accentGreen,
                        '&:hover': {
                          borderColor: accentGreen,
                          backgroundColor: 'rgba(124, 205, 133, 0.05)',
                        },
                      }}
                    >
                      Copy
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Wallet Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#07180d' }}>Create New Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Blockchain"
              value={newWalletBlockchain}
              onChange={e =>
                setNewWalletBlockchain(e.target.value as BlockchainType)
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="bitcoin">Bitcoin (BTC)</MenuItem>
              <MenuItem value="ethereum">Ethereum (ETH)</MenuItem>
              <MenuItem value="solana">Solana (SOL)</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Wallet Label (Optional)"
              value={newWalletLabel}
              onChange={e => setNewWalletLabel(e.target.value)}
              placeholder={`${newWalletBlockchain.charAt(0).toUpperCase() + newWalletBlockchain.slice(1)} Wallet`}
              helperText="Give your wallet a custom name for easy identification"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateWallet}
            variant="contained"
            disabled={isCreating}
            startIcon={
              isCreating ? <CircularProgress size={16} /> : <AddIcon />
            }
          >
            Create Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WalletsPage

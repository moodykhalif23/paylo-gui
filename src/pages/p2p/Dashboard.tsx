import React, { useState } from 'react'
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Add,
  AccountBalanceWallet,
  Refresh,
  Visibility,
  VisibilityOff,
  ContentCopy,
  QrCode,
  Home,
} from '@mui/icons-material'
import {
  useGetUserWalletsQuery,
  useGetWalletSummaryQuery,
  useCreateWalletMutation,
} from '../../store/api/walletApi'
import { WalletAddressManager } from '../../components/p2p'
import { BlockchainType } from '../../types'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const P2PDashboard: React.FC = () => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWalletBlockchain, setNewWalletBlockchain] =
    useState<BlockchainType>('bitcoin')
  const [newWalletLabel, setNewWalletLabel] = useState('')
  const [showBalances, setShowBalances] = useState(true)

  // Landing page colors
  const accentGreen = '#7dcd85'
  const softGreen = '#c8ffd8'
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

  const handleGenerateAddress = (
    walletId: string,
    blockchain: BlockchainType
  ) => {
    setSelectedWalletId(walletId)
    setSelectedBlockchain(blockchain)
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    console.log('Address copied:', address)
  }

  const handleRefresh = () => {
    refetchWallets()
    refetchSummary()
  }

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

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatBalance = (balance: string, blockchain: BlockchainType) => {
    const value = parseFloat(balance)
    if (value === 0) return '0'

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

  // Prepare pie chart data
  const pieChartData =
    walletSummary?.balancesByBlockchain.map(balance => ({
      name: balance.blockchain.toUpperCase(),
      value: balance.usdValue,
      color: getBlockchainColor(balance.blockchain),
    })) || []

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

  if (walletsError || summaryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load wallet data. Please try again.
        </Alert>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<Refresh />}
        >
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ color: brandWhite }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
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
            P2P Wallet Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: softGreen }}>
            Manage your cryptocurrency wallets and addresses
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
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
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
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

      {/* Enhanced Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Portfolio Overview Card */}
        <Grid item xs={12} lg={8}>
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
                <Typography
                  variant="h6"
                  sx={{ color: accentGreen, fontWeight: 600 }}
                >
                  <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Portfolio Overview
                </Typography>
                <IconButton
                  onClick={() => setShowBalances(!showBalances)}
                  size="small"
                  sx={{ color: brandWhite }}
                >
                  {showBalances ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Box>

              {walletSummary ? (
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
                      <Typography variant="body2" sx={{ color: softGreen }}>
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
                      <Typography variant="body2" sx={{ color: softGreen }}>
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
                      <Typography variant="body2" sx={{ color: softGreen }}>
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
                      <Typography variant="body2" sx={{ color: softGreen }}>
                        Blockchains
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    color: softGreen,
                  }}
                >
                  <Typography variant="body2">
                    {summaryLoading
                      ? 'Loading portfolio data...'
                      : 'No portfolio data available'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(6px)',
              color: brandWhite,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: accentGreen, fontWeight: 600 }}
              >
                Portfolio Distribution
              </Typography>
              {walletSummary && pieChartData.length > 0 ? (
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          showBalances ? formatUSD(value) : '****',
                          'Value',
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: softGreen,
                  }}
                >
                  <Typography variant="body2">
                    {summaryLoading ? 'Loading...' : 'No data available'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Wallet Balance Cards */}
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
            <AccountBalanceWallet
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom sx={{ color: brandWhite }}>
              No Wallets Found
            </Typography>
            <Typography variant="body2" sx={{ color: softGreen }} gutterBottom>
              Create your first wallet to start managing cryptocurrency
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
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
                      sx={{ color: softGreen }}
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
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: softGreen }}
                      gutterBottom
                    >
                      Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: brandWhite }}>
                      {showBalances
                        ? formatBalance(wallet.balance, wallet.blockchain)
                        : '****'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: softGreen }}>
                      {showBalances ? formatUSD(wallet.usdValue) : '****'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<QrCode />}
                      variant="outlined"
                      fullWidth
                      onClick={() =>
                        handleGenerateAddress(wallet.id, wallet.blockchain)
                      }
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
                      startIcon={<ContentCopy />}
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

      {/* Address Manager */}
      {selectedWalletId && selectedBlockchain && (
        <Box mt={4}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: accentGreen,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Address Management
          </Typography>
          <WalletAddressManager
            walletId={selectedWalletId}
            blockchain={selectedBlockchain}
          />
        </Box>
      )}

      {/* Create Wallet Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            m: 0,
          },
        }}
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
              <MenuItem value="erc20">ERC20 Tokens</MenuItem>
              <MenuItem value="trc20">TRC20 Tokens</MenuItem>
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
            startIcon={isCreating ? <CircularProgress size={16} /> : <Add />}
          >
            Create Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default P2PDashboard

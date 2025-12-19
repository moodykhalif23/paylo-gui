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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            P2P Wallet Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your cryptocurrency wallets and addresses
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Enhanced Summary Cards */}
      {walletSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Portfolio Overview Card */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6">
                    <AccountBalanceWallet
                      sx={{ mr: 1, verticalAlign: 'middle' }}
                    />
                    Portfolio Overview
                  </Typography>
                  <IconButton
                    onClick={() => setShowBalances(!showBalances)}
                    size="small"
                  >
                    {showBalances ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        {showBalances
                          ? formatUSD(walletSummary.totalBalanceUSD)
                          : '****'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Balance
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        {walletSummary.walletCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Wallets
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        {walletSummary.activeAddresses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Addresses
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        {walletSummary.balancesByBlockchain.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Blockchains
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Portfolio Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Portfolio Distribution
                </Typography>
                {pieChartData.length > 0 ? (
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
                      color: 'text.secondary',
                    }}
                  >
                    No data available
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Wallet Balance Cards */}
      <Typography variant="h6" gutterBottom>
        Your Wallets
      </Typography>

      {wallets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalanceWallet
              sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              No Wallets Found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create your first wallet to start managing cryptocurrency
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
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
              <Card>
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
                      <Typography variant="h6">{wallet.label}</Typography>
                    </Box>
                    <Chip
                      label={wallet.isActive ? 'Active' : 'Inactive'}
                      color={wallet.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
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
                        }}
                      >
                        {wallet.address}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyAddress(wallet.address)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Balance
                    </Typography>
                    <Typography variant="h6">
                      {showBalances
                        ? formatBalance(wallet.balance, wallet.blockchain)
                        : '****'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                    >
                      QR Code
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      variant="outlined"
                      fullWidth
                      onClick={() => handleCopyAddress(wallet.address)}
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
          <Typography variant="h6" gutterBottom>
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
      >
        <DialogTitle>Create New Wallet</DialogTitle>
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

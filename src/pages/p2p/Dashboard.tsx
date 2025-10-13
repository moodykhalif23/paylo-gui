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
  Divider,
} from '@mui/material'
import { Add, AccountBalanceWallet, Refresh } from '@mui/icons-material'
import {
  useGetUserWalletsQuery,
  useGetWalletSummaryQuery,
} from '../../store/api/walletApi'
import { WalletBalanceCard, WalletAddressManager } from '../../components/p2p'
import { BlockchainType } from '../../types'

const P2PDashboard: React.FC = () => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType | null>(null)

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

  const handleGenerateAddress = (
    walletId: string,
    blockchain: BlockchainType
  ) => {
    setSelectedWalletId(walletId)
    setSelectedBlockchain(blockchain)
  }

  const handleCopyAddress = (address: string) => {
    // Show success notification (would typically use a toast/snackbar)
    console.log('Address copied:', address)
  }

  const handleRefresh = () => {
    refetchWallets()
    refetchSummary()
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
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

      {/* Summary Card */}
      {walletSummary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AccountBalanceWallet sx={{ mr: 1, verticalAlign: 'middle' }} />
              Portfolio Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatUSD(walletSummary.totalBalanceUSD)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Balance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {walletSummary.walletCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Wallets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {walletSummary.activeAddresses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Addresses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {walletSummary.balancesByBlockchain.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blockchains
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {walletSummary.balancesByBlockchain.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Balance by Blockchain
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {walletSummary.balancesByBlockchain.map(balance => (
                    <Box
                      key={balance.blockchain}
                      textAlign="center"
                      minWidth={120}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {balance.blockchain.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatUSD(balance.usdValue)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
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
            <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }}>
              Create Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {wallets.map(wallet => (
            <Grid item xs={12} md={6} lg={4} key={wallet.id}>
              <WalletBalanceCard
                wallet={wallet}
                onGenerateAddress={() =>
                  handleGenerateAddress(wallet.id, wallet.blockchain)
                }
                onCopyAddress={handleCopyAddress}
              />
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
    </Box>
  )
}

export default P2PDashboard

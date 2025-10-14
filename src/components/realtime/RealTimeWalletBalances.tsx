import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Grid,
} from '@mui/material'
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material'
import { useAppSelector } from '../../store'
import {
  selectAllWallets,
  selectTotalUsdValue,
  selectRecentBalanceUpdates,
  selectBlockchainBalances,
  selectWalletStats,
} from '../../store/slices/walletSlice'
import { useRealTimeWallets } from '../../hooks/useRealTimeData'
import { BlockchainType } from '../../types'
import { formatDistanceToNow } from 'date-fns'

interface RealTimeWalletBalancesProps {
  userId?: string
  showRecentUpdates?: boolean
  showBreakdown?: boolean
  maxUpdates?: number
}

const getBlockchainIcon = (blockchain: BlockchainType) => {
  const icons = {
    bitcoin: '₿',
    ethereum: 'Ξ',
    solana: '◎',
  }
  return icons[blockchain] || '?'
}

const getBlockchainColor = (blockchain: BlockchainType) => {
  const colors = {
    bitcoin: '#f7931a',
    ethereum: '#627eea',
    solana: '#9945ff',
  }
  return colors[blockchain] || '#666'
}

const getTrendIcon = (previousValue: number, newValue: number) => {
  if (newValue > previousValue) {
    return <TrendingUp color="success" />
  } else if (newValue < previousValue) {
    return <TrendingDown color="error" />
  }
  return <TrendingFlat color="disabled" />
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatBalance = (balance: string, blockchain: BlockchainType) => {
  const numBalance = parseFloat(balance)

  // Format based on blockchain
  switch (blockchain) {
    case 'bitcoin':
      return `${numBalance.toFixed(8)} BTC`
    case 'ethereum':
      return `${numBalance.toFixed(6)} ETH`
    case 'solana':
      return `${numBalance.toFixed(4)} SOL`
    default:
      return balance
  }
}

export const RealTimeWalletBalances: React.FC<RealTimeWalletBalancesProps> = ({
  userId,
  showRecentUpdates = true,
  showBreakdown = true,
  maxUpdates = 10,
}) => {
  const { isConnected } = useRealTimeWallets(userId)
  const wallets = useAppSelector(selectAllWallets)
  const totalUsdValue = useAppSelector(selectTotalUsdValue)
  const recentUpdates = useAppSelector(selectRecentBalanceUpdates(maxUpdates))
  const blockchainBalances = useAppSelector(selectBlockchainBalances)
  const walletStats = useAppSelector(selectWalletStats)

  return (
    <Box>
      {/* Connection Status */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Chip
          size="small"
          label={isConnected ? 'Live Balance Updates' : 'Disconnected'}
          color={isConnected ? 'success' : 'error'}
          variant={isConnected ? 'filled' : 'outlined'}
        />
        <Typography variant="caption" color="text.secondary">
          Real-time wallet monitoring
        </Typography>
      </Box>

      {/* Total Portfolio Value */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AccountBalanceWallet />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6">Total Portfolio Value</Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalUsdValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across {walletStats.total} wallets
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Blockchain Breakdown */}
      {showBreakdown && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Blockchain Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(blockchainBalances).map(([blockchain, data]) => (
                <Grid item xs={12} sm={4} key={blockchain}>
                  <Box
                    p={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={1}
                    textAlign="center"
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: getBlockchainColor(blockchain as BlockchainType),
                      }}
                    >
                      {getBlockchainIcon(blockchain as BlockchainType)}
                    </Typography>
                    <Typography variant="subtitle2" textTransform="capitalize">
                      {blockchain}
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(data.usdValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.count} wallet{data.count !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Active Wallets */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Wallets ({walletStats.active})
          </Typography>
          <List dense>
            {wallets
              .filter(wallet => wallet.isActive)
              .slice(0, 5)
              .map(wallet => (
                <ListItem key={wallet.id}>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: getBlockchainColor(wallet.blockchain),
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                      }}
                    >
                      {getBlockchainIcon(wallet.blockchain)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" noWrap>
                          {wallet.address.substring(0, 8)}...
                          {wallet.address.substring(-6)}
                        </Typography>
                        <Chip
                          label={wallet.blockchain}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {formatBalance(wallet.balance, wallet.blockchain)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(wallet.usdValue)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>

      {/* Recent Balance Updates */}
      {showRecentUpdates && recentUpdates.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Balance Updates
            </Typography>
            <List dense>
              {recentUpdates.map((update, index) => (
                <React.Fragment key={`${update.walletId}-${update.timestamp}`}>
                  <ListItem>
                    <ListItemIcon>
                      {getTrendIcon(
                        update.previousUsdValue,
                        update.newUsdValue
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              bgcolor: getBlockchainColor(update.blockchain),
                              width: 24,
                              height: 24,
                              fontSize: '0.75rem',
                            }}
                          >
                            {getBlockchainIcon(update.blockchain)}
                          </Avatar>
                          <Typography variant="body2" noWrap>
                            {update.address.substring(0, 8)}...
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {formatBalance(
                              update.previousBalance,
                              update.blockchain
                            )}{' '}
                            →{' '}
                            {formatBalance(
                              update.newBalance,
                              update.blockchain
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(update.previousUsdValue)} →{' '}
                            {formatCurrency(update.newUsdValue)}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(new Date(update.timestamp), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentUpdates.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Updates Message */}
      {showRecentUpdates && recentUpdates.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Balance Updates
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No recent balance updates
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default RealTimeWalletBalances

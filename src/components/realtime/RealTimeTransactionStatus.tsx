import React from 'react'
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  CheckCircle,
  Pending,
  Error,
  Cancel,
  Refresh,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'
import { useAppSelector } from '../../store'
import {
  selectRecentTransactionUpdates,
  selectTransactionStats,
  selectPendingTransactions,
} from '../../store/slices/transactionSlice'
import { useRealTimeTransactions } from '../../hooks/useRealTimeData'
import { TransactionStatus } from '../../types'
import { formatDistanceToNow } from 'date-fns'

interface RealTimeTransactionStatusProps {
  userId?: string
  showRecentUpdates?: boolean
  showStats?: boolean
  maxUpdates?: number
}

const getStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle color="success" />
    case 'pending':
      return <Pending color="warning" />
    case 'failed':
      return <Error color="error" />
    case 'cancelled':
      return <Cancel color="disabled" />
    default:
      return <Pending color="warning" />
  }
}

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
    default:
      return 'warning'
  }
}

const getStatusChangeIcon = (
  previousStatus: TransactionStatus,
  newStatus: TransactionStatus
) => {
  if (newStatus === 'confirmed' && previousStatus === 'pending') {
    return <TrendingUp color="success" />
  }
  if (newStatus === 'failed' || newStatus === 'cancelled') {
    return <TrendingDown color="error" />
  }
  return <Refresh color="info" />
}

export const RealTimeTransactionStatus: React.FC<
  RealTimeTransactionStatusProps
> = ({
  userId,
  showRecentUpdates = true,
  showStats = true,
  maxUpdates = 10,
}) => {
  const { isConnected } = useRealTimeTransactions(userId)
  const recentUpdates = useAppSelector(selectRecentTransactionUpdates)
  const transactionStats = useAppSelector(selectTransactionStats)
  const pendingTransactions = useAppSelector(selectPendingTransactions)

  const displayUpdates = recentUpdates.slice(0, maxUpdates)

  return (
    <Box>
      {/* Connection Status */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Chip
          size="small"
          label={isConnected ? 'Live Updates' : 'Disconnected'}
          color={isConnected ? 'success' : 'error'}
          variant={isConnected ? 'filled' : 'outlined'}
        />
        <Typography variant="caption" color="text.secondary">
          Real-time transaction monitoring
        </Typography>
      </Box>

      {/* Transaction Stats */}
      {showStats && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Overview
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                label={`Total: ${transactionStats.total}`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Pending: ${transactionStats.pending}`}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Confirmed: ${transactionStats.confirmed}`}
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Failed: ${transactionStats.failed}`}
                color="error"
                variant="outlined"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Transactions ({pendingTransactions.length})
            </Typography>
            <List dense>
              {pendingTransactions.slice(0, 5).map(transaction => (
                <ListItem key={transaction.id}>
                  <ListItemIcon>
                    {getStatusIcon(transaction.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" noWrap>
                          {transaction.id.substring(0, 8)}...
                        </Typography>
                        <Chip
                          label={transaction.blockchain}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Amount: {transaction.amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(
                            new Date(transaction.createdAt),
                            { addSuffix: true }
                          )}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates */}
      {showRecentUpdates && displayUpdates.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Updates
            </Typography>
            <List dense>
              {displayUpdates.map((update, index) => (
                <React.Fragment
                  key={`${update.transactionId}-${update.timestamp}`}
                >
                  <ListItem>
                    <ListItemIcon>
                      {getStatusChangeIcon(
                        update.previousStatus,
                        update.newStatus
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" noWrap>
                            {update.transactionId.substring(0, 8)}...
                          </Typography>
                          <Chip
                            label={update.previousStatus}
                            size="small"
                            color={
                              getStatusColor(update.previousStatus) as
                                | 'default'
                                | 'primary'
                                | 'secondary'
                                | 'error'
                                | 'info'
                                | 'success'
                                | 'warning'
                            }
                            variant="outlined"
                          />
                          <Typography variant="caption">→</Typography>
                          <Chip
                            label={update.newStatus}
                            size="small"
                            color={
                              getStatusColor(update.newStatus) as
                                | 'default'
                                | 'primary'
                                | 'secondary'
                                | 'error'
                                | 'info'
                                | 'success'
                                | 'warning'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(update.timestamp), {
                            addSuffix: true,
                          })}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < displayUpdates.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Updates Message */}
      {showRecentUpdates && displayUpdates.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Updates
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No recent transaction updates
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default RealTimeTransactionStatus

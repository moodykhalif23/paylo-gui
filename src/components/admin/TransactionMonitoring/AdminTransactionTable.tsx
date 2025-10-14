import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Box,
  Tooltip,
  TablePagination,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Search as InvestigationIcon,
} from '@mui/icons-material'
import { Transaction, BlockchainType, TransactionStatus } from '../../../types'

interface TransactionMetadata {
  riskScore?: number
  isSuspicious?: boolean
  hasInvestigation?: boolean
  userName?: string
  userId?: string
}
import {
  formatCurrency,
  formatDate,
  truncateAddress,
} from '../../../utils/formatters'

interface AdminTransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  error?: string
  totalCount: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onViewDetails: (transaction: Transaction) => void
  onViewUser?: (userId: string) => void
  onStartInvestigation: (transaction: Transaction) => void
}

const AdminTransactionTable: React.FC<AdminTransactionTableProps> = ({
  transactions,
  loading = false,
  error,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onViewUser,
  onStartInvestigation,
}) => {
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
      default:
        return null
    }
  }

  const getRiskLevel = (transaction: Transaction) => {
    // Mock risk calculation based on transaction metadata
    const metadata = transaction.metadata as TransactionMetadata
    if (metadata?.riskScore) {
      if (metadata.riskScore >= 80) return 'critical'
      if (metadata.riskScore >= 60) return 'high'
      if (metadata.riskScore >= 40) return 'medium'
      return 'low'
    }
    return null
  }

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'critical':
        return 'error'
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return null
    }
  }

  const isSuspicious = (transaction: Transaction) => {
    const metadata = transaction.metadata as TransactionMetadata
    return metadata?.isSuspicious || metadata?.riskScore >= 60
  }

  const hasInvestigation = (transaction: Transaction) => {
    const metadata = transaction.metadata as TransactionMetadata
    return metadata?.hasInvestigation
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Blockchain</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(transaction => {
                const riskLevel = getRiskLevel(transaction)
                const suspicious = isSuspicious(transaction)
                const investigation = hasInvestigation(transaction)

                return (
                  <TableRow
                    key={transaction.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: suspicious ? 'error.light' : 'inherit',
                      opacity: suspicious ? 0.9 : 1,
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getBlockchainColor(
                              transaction.blockchain
                            ),
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {getBlockchainSymbol(transaction.blockchain)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={transaction.fromAddress}>
                        <Typography variant="body2" fontFamily="monospace">
                          {truncateAddress(transaction.fromAddress)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={transaction.toAddress}>
                        <Typography variant="body2" fontFamily="monospace">
                          {truncateAddress(transaction.toAddress)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(
                          transaction.amount,
                          getBlockchainSymbol(transaction.blockchain)
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(
                          transaction.fee,
                          getBlockchainSymbol(transaction.blockchain)
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(transaction.status)}
                        variant={
                          transaction.status === 'confirmed'
                            ? 'filled'
                            : 'outlined'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {riskLevel && (
                          <Chip
                            label={riskLevel.toUpperCase()}
                            size="small"
                            color={
                              getRiskColor(riskLevel) as
                                | 'error'
                                | 'warning'
                                | 'info'
                            }
                            variant="outlined"
                          />
                        )}
                        {suspicious && (
                          <Tooltip title="Suspicious Activity">
                            <SecurityIcon fontSize="small" color="error" />
                          </Tooltip>
                        )}
                        {investigation && (
                          <Tooltip title="Under Investigation">
                            <InvestigationIcon
                              fontSize="small"
                              color="warning"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        >
                          {(
                            transaction.metadata as TransactionMetadata
                          )?.userName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="body2">
                          {(transaction.metadata as TransactionMetadata)
                            ?.userName || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onViewDetails(transaction)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onViewUser &&
                          (transaction.metadata as TransactionMetadata)
                            ?.userId && (
                            <Tooltip title="View User">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  onViewUser(
                                    (
                                      transaction.metadata as TransactionMetadata
                                    ).userId!
                                  )
                                }
                              >
                                <PersonIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        <Tooltip title="Start Investigation">
                          <IconButton
                            size="small"
                            onClick={() => onStartInvestigation(transaction)}
                            color={investigation ? 'warning' : 'default'}
                          >
                            <InvestigationIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {transaction.txHash && (
                          <Tooltip title="View on Explorer">
                            <IconButton
                              size="small"
                              component="a"
                              href={getExplorerUrl(transaction) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              disabled={!getExplorerUrl(transaction)}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={event =>
          onRowsPerPageChange(parseInt(event.target.value, 10))
        }
      />
    </Paper>
  )
}

export default AdminTransactionTable

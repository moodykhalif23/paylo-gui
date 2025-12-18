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
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material'
import { Transaction, BlockchainType, TransactionStatus } from '../../types'
import {
  formatCurrency,
  formatDate,
  truncateAddress,
} from '../../utils/formatters'

interface TransactionHistoryTableProps {
  transactions: Transaction[]
  loading?: boolean
  error?: string
  totalCount: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onViewDetails: (transaction: Transaction) => void
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  loading = false,
  error,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  // Mobile Card View
  const renderMobileView = () => (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={40} />
        </Box>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No transactions found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {transactions.map(transaction => (
            <Card key={transaction.id}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(transaction.createdAt)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
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
                      <Chip
                        label={transaction.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Chip
                    label={transaction.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(transaction.status)}
                    variant={
                      transaction.status === 'confirmed' ? 'filled' : 'outlined'
                    }
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(
                      transaction.amount,
                      getBlockchainSymbol(transaction.blockchain)
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fee:{' '}
                    {formatCurrency(
                      transaction.fee,
                      getBlockchainSymbol(transaction.blockchain)
                    )}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    From
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    fontSize="0.75rem"
                  >
                    {transaction.fromAddress}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    To
                  </Typography>
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    fontSize="0.75rem"
                  >
                    {transaction.toAddress}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(transaction)}
                      >
                        <VisibilityIcon fontSize="small" />
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
                  {transaction.txHash && (
                    <Typography variant="caption" color="text.secondary">
                      Hash: {truncateAddress(transaction.txHash)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Box mt={2}>
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
      </Box>
    </Box>
  )

  // Desktop Table View
  const renderDesktopView = () => (
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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(transaction => (
                <TableRow
                  key={transaction.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              ))
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

  return isMobile ? renderMobileView() : renderDesktopView()
}

export default TransactionHistoryTable

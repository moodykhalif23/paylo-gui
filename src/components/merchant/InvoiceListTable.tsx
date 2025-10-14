import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Skeleton,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Button,
} from '@mui/material'
import {
  MoreVert,
  Search,
  FilterList,
  Visibility,
  Cancel,
  ContentCopy,
  QrCode,
} from '@mui/icons-material'
import {
  useGetInvoicesQuery,
  useCancelInvoiceMutation,
} from '../../store/api/merchantApi'
import { Invoice, BlockchainType } from '../../types'

interface InvoiceListTableProps {
  onInvoiceSelect?: (invoice: Invoice) => void
}

const InvoiceListTable: React.FC<InvoiceListTableProps> = ({
  onInvoiceSelect,
}) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [blockchainFilter, setBlockchainFilter] = useState<string>('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const {
    data: invoicesResponse,
    isLoading,
    error,
    refetch,
  } = useGetInvoicesQuery({
    page: page + 1,
    limit: rowsPerPage,
    filters: {
      ...(statusFilter && { status: statusFilter as any }),
      ...(blockchainFilter && {
        blockchain: blockchainFilter as BlockchainType,
      }),
    },
  })

  const [cancelInvoice, { isLoading: isCancelling }] =
    useCancelInvoiceMutation()

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    invoice: Invoice
  ) => {
    setAnchorEl(event.currentTarget)
    setSelectedInvoice(invoice)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedInvoice(null)
  }

  const handleCancelInvoice = async () => {
    if (selectedInvoice) {
      try {
        await cancelInvoice(selectedInvoice.id).unwrap()
        refetch()
      } catch (err) {
        console.error('Failed to cancel invoice:', err)
      }
    }
    handleMenuClose()
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    // You could add a toast notification here
  }

  const handleViewInvoice = () => {
    if (selectedInvoice) {
      onInvoiceSelect?.(selectedInvoice)
    }
    handleMenuClose()
  }

  const getStatusColor = (
    status: Invoice['status']
  ): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'expired':
      case 'cancelled':
        return 'error'
      case 'overpaid':
      case 'underpaid':
        return 'info'
      default:
        return 'default'
    }
  }

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain.toLowerCase()) {
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

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount)
    return `${numAmount.toFixed(4)} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (expirationTime: string) => {
    return new Date(expirationTime) < new Date()
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load invoices. Please try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Invoice Management"
        subheader={`${invoicesResponse?.pagination.totalCount || 0} total invoices`}
      />
      <CardContent>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="overpaid">Overpaid</MenuItem>
                <MenuItem value="underpaid">Underpaid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Blockchain</InputLabel>
              <Select
                value={blockchainFilter}
                onChange={e => setBlockchainFilter(e.target.value)}
                label="Blockchain"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="bitcoin">Bitcoin</MenuItem>
                <MenuItem value="ethereum">Ethereum</MenuItem>
                <MenuItem value="solana">Solana</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setStatusFilter('')
                  setBlockchainFilter('')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Blockchain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : invoicesResponse?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        No invoices found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first invoice to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                invoicesResponse?.data.map(invoice => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {invoice.id.slice(-8)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={invoice.blockchain.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getBlockchainColor(invoice.blockchain),
                          color: 'white',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={invoice.status.toUpperCase()}
                        color={getStatusColor(invoice.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(invoice.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          isExpired(invoice.expirationTime)
                            ? 'error'
                            : 'text.primary'
                        }
                      >
                        {formatDate(invoice.expirationTime)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={e => handleMenuOpen(e, invoice)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {invoicesResponse && (
          <TablePagination
            component="div"
            count={invoicesResponse.pagination.totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewInvoice}>
            <Visibility sx={{ mr: 1 }} />
            View Details
          </MenuItem>

          {selectedInvoice && (
            <MenuItem
              onClick={() => handleCopyAddress(selectedInvoice.paymentAddress)}
            >
              <ContentCopy sx={{ mr: 1 }} />
              Copy Address
            </MenuItem>
          )}

          <MenuItem>
            <QrCode sx={{ mr: 1 }} />
            Show QR Code
          </MenuItem>

          {selectedInvoice?.status === 'pending' && (
            <MenuItem
              onClick={handleCancelInvoice}
              disabled={isCancelling}
              sx={{ color: 'error.main' }}
            >
              <Cancel sx={{ mr: 1 }} />
              Cancel Invoice
            </MenuItem>
          )}
        </Menu>
      </CardContent>
    </Card>
  )
}

export default InvoiceListTable

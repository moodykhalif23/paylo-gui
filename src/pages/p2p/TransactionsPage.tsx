import React, { useState, useCallback } from 'react'
import { Typography, Box, Alert, Button, CircularProgress } from '@mui/material'
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
  TransactionHistoryTable,
  TransactionFilters,
  TransactionDetailModal,
} from '../../components/p2p'
import {
  useGetUserTransactionsQuery,
  useExportTransactionsMutation,
  TransactionFilters as FilterType,
} from '../../store/api/transactionApi'
import { Transaction } from '../../types'

const TransactionsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [filters, setFilters] = useState<FilterType>({})
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Theme colors
  const accentGreen = '#7dcd85'
  const softGreen = '#c8ffd8'
  const brandWhite = '#ffffff'

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useGetUserTransactionsQuery({
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    filters,
  })

  const [exportTransactions, { isLoading: isExporting }] =
    useExportTransactionsMutation()

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0) // Reset to first page
  }, [])

  const handleFiltersChange = useCallback((newFilters: FilterType) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setPage(0)
  }, [])

  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailModalOpen(true)
  }, [])

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false)
    setSelectedTransaction(null)
  }, [])

  const handleExport = useCallback(
    async (format: 'csv' | 'json' | 'excel') => {
      try {
        const result = await exportTransactions({
          format,
          filters,
        }).unwrap()

        // Open download URL in new tab
        window.open(result.downloadUrl, '_blank')
      } catch (error) {
        console.error('Export failed:', error)
      }
    },
    [exportTransactions, filters]
  )

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <Box sx={{ color: brandWhite }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3,
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
            Transaction History
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: { xs: 'block', sm: 'none' }, color: softGreen }}
          >
            View and manage your transaction history
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
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
            startIcon={
              isExporting ? <CircularProgress size={16} /> : <DownloadIcon />
            }
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            variant="outlined"
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
            Export CSV
          </Button>
          <Button
            startIcon={
              isExporting ? <CircularProgress size={16} /> : <DownloadIcon />
            }
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              display: { xs: 'none', sm: 'flex' },
              borderColor: 'rgba(124, 205, 133, 0.3)',
              color: accentGreen,
              '&:hover': {
                borderColor: accentGreen,
                backgroundColor: 'rgba(124, 205, 133, 0.05)',
              },
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load transactions. Please try again.
        </Alert>
      )}

      <TransactionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      <TransactionHistoryTable
        transactions={transactionsData?.transactions || []}
        loading={isLoading}
        error={error ? 'Failed to load transactions' : undefined}
        totalCount={transactionsData?.pagination.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onViewDetails={handleViewDetails}
      />

      <TransactionDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        transaction={selectedTransaction}
      />
    </Box>
  )
}

export default TransactionsPage

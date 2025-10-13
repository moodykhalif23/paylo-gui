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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Transaction History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
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

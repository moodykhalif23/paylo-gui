import React, { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  List as ListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
  AdvancedTransactionFilters,
  SuspiciousActivityPanel,
  TransactionInvestigationTools,
  AdminTransactionTable,
  TransactionAnalyticsDashboard,
} from '../../components/admin/TransactionMonitoring'
import { TransactionDetailModal } from '../../components/p2p'
import { Transaction } from '../../types'
import { useGetAllTransactionsQuery } from '../../store/api/adminApi'
import type { AdvancedTransactionFiltersType } from '../../components/admin/TransactionMonitoring'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transaction-monitor-tabpanel-${index}`}
      aria-labelledby={`transaction-monitor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const TransactionMonitorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [filters, setFilters] = useState<AdvancedTransactionFiltersType>({})
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [investigationModalOpen, setInvestigationModalOpen] = useState(false)

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useGetAllTransactionsQuery({
    page: page + 1,
    limit: rowsPerPage,
    filters,
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleFiltersChange = (newFilters: AdvancedTransactionFiltersType) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(0)
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailModalOpen(true)
  }

  const handleStartInvestigation = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setInvestigationModalOpen(true)
  }

  const handleViewTransaction = (transactionId: string) => {
    // Find transaction by ID and open details modal
    const transaction = transactionsData?.data.find(
      tx => tx.id === transactionId
    )
    if (transaction) {
      handleViewDetails(transaction)
    }
  }

  const transactions = transactionsData?.data || []
  const totalCount = transactionsData?.pagination.totalCount || 0

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <SecurityIcon />
          Transaction Monitor
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {totalCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {
                  transactions.filter(
                    tx =>
                      (tx.metadata as { isSuspicious?: boolean })?.isSuspicious
                  ).length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspicious Activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {
                  transactions.filter(
                    tx =>
                      (tx.metadata as { hasInvestigation?: boolean })
                        ?.hasInvestigation
                  ).length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under Investigation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {transactions.filter(tx => tx.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confirmed Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="transaction monitor tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<ListIcon />}
            label="All Transactions"
            id="transaction-monitor-tab-0"
            aria-controls="transaction-monitor-tabpanel-0"
          />
          <Tab
            icon={<SecurityIcon />}
            label="Suspicious Activity"
            id="transaction-monitor-tab-1"
            aria-controls="transaction-monitor-tabpanel-1"
          />
          <Tab
            icon={<AssessmentIcon />}
            label="Analytics"
            id="transaction-monitor-tab-2"
            aria-controls="transaction-monitor-tabpanel-2"
          />
        </Tabs>

        {/* All Transactions Tab */}
        <TabPanel value={activeTab} index={0}>
          <AdvancedTransactionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <AdminTransactionTable
            transactions={transactions}
            loading={isLoading}
            error={error ? 'Failed to load transactions' : undefined}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            onViewDetails={handleViewDetails}
            onStartInvestigation={handleStartInvestigation}
          />
        </TabPanel>

        {/* Suspicious Activity Tab */}
        <TabPanel value={activeTab} index={1}>
          <SuspiciousActivityPanel onViewTransaction={handleViewTransaction} />
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={2}>
          <TransactionAnalyticsDashboard
            dateRange={{
              fromDate: filters.fromDate,
              toDate: filters.toDate,
            }}
          />
        </TabPanel>
      </Paper>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Investigation Tools Modal */}
      <TransactionInvestigationTools
        transaction={selectedTransaction}
        open={investigationModalOpen}
        onClose={() => setInvestigationModalOpen(false)}
      />
    </Box>
  )
}

export default TransactionMonitorPage

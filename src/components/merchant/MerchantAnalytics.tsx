import React, { useState, useCallback } from 'react'
import { Box, Typography, Grid, Alert, Paper, Tabs, Tab } from '@mui/material'
import { TrendingUp, PieChart, Assessment } from '@mui/icons-material'
import { useGetMerchantAnalyticsQuery } from '../../store/api/merchantApi'
import RevenueTrendChart from './RevenueTrendChart'
import CurrencyBreakdownChart from './CurrencyBreakdownChart'
import AnalyticsFiltersComponent from './AnalyticsFilters'
import MerchantSummaryCard from './MerchantSummaryCard'
import { BlockchainType } from '../../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface AnalyticsFilters {
  fromDate?: string
  toDate?: string
  blockchain?: BlockchainType
  groupBy?: 'day' | 'week' | 'month'
}

const MerchantAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [filters, setFilters] = useState<AnalyticsFilters>({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  })

  // Fetch analytics data based on current filters
  const {
    data: analytics,
    isLoading,
    error,
  } = useGetMerchantAnalyticsQuery({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    blockchain: filters.blockchain,
    groupBy: filters.groupBy,
  })

  const handleFiltersChange = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(newFilters)
  }, [])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleTimeRangeChange = (range: 'day' | 'week' | 'month') => {
    setFilters(prev => ({ ...prev, groupBy: range }))
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive insights into your merchant performance and revenue
          trends
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load analytics data. Please try refreshing the page.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <AnalyticsFiltersComponent
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </Grid>

        {/* Summary Overview */}
        <Grid item xs={12}>
          <MerchantSummaryCard analytics={analytics} isLoading={isLoading} />
        </Grid>

        {/* Analytics Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="analytics tabs"
              >
                <Tab
                  icon={<TrendingUp />}
                  label="Revenue Trends"
                  id="analytics-tab-0"
                  aria-controls="analytics-tabpanel-0"
                />
                <Tab
                  icon={<PieChart />}
                  label="Currency Breakdown"
                  id="analytics-tab-1"
                  aria-controls="analytics-tabpanel-1"
                />
                <Tab
                  icon={<Assessment />}
                  label="Performance Metrics"
                  id="analytics-tab-2"
                  aria-controls="analytics-tabpanel-2"
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <RevenueTrendChart
                data={analytics?.revenueByPeriod}
                isLoading={isLoading}
                error={error ? new Error('Failed to load data') : null}
                timeRange={filters.groupBy}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <CurrencyBreakdownChart
                    data={analytics?.revenueByBlockchain}
                    isLoading={isLoading}
                    error={error ? new Error('Failed to load data') : null}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  {/* Transaction Status Breakdown */}
                  <Paper sx={{ p: 3, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom>
                      Transaction Status
                    </Typography>
                    {analytics?.transactionsByStatus.map((status, index) => (
                      <Box
                        key={status.status}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                        borderBottom={
                          index < analytics.transactionsByStatus.length - 1
                            ? 1
                            : 0
                        }
                        borderColor="divider"
                      >
                        <Typography variant="body2" textTransform="capitalize">
                          {status.status}
                        </Typography>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {status.count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {status.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                {/* Key Performance Indicators */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Key Performance Indicators
                    </Typography>
                    {analytics && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="primary">
                              {analytics.successRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Success Rate
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="success.main">
                              ${analytics.averageTransactionValueUSD.toFixed(0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Avg Transaction
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4">
                              {analytics.totalTransactions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Transactions
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="h4" color="error.main">
                              {analytics.failedTransactions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Failed Transactions
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </Paper>
                </Grid>

                {/* Top Currency Performance */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Performing Currency
                    </Typography>
                    {analytics && (
                      <Box textAlign="center" py={2}>
                        <Typography variant="h3" color="primary" gutterBottom>
                          {analytics.topCurrency.toUpperCase()}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          gutterBottom
                        >
                          Leading blockchain by transaction volume
                        </Typography>
                        <Typography variant="h5">
                          ${analytics.totalRevenueUSD.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Revenue Generated
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MerchantAnalytics

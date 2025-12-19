import React, { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff, Home } from '@mui/icons-material'
import {
  useGetMerchantAnalyticsQuery,
  useGetRecentInvoicesQuery,
  useGetPendingInvoicesQuery,
} from '../../store/api/merchantApi'
import MerchantSummaryCard from './MerchantSummaryCard'
import RecentActivityFeed from './RecentActivityFeed'
import QuickStatsWidget from './QuickStatsWidget'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const MerchantDashboard: React.FC = () => {
  const [showValues, setShowValues] = useState(true)

  // Fetch analytics data for the last 30 days by default
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useGetMerchantAnalyticsQuery({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    toDate: new Date().toISOString(),
  })

  // Fetch recent invoices for activity feed
  const {
    data: recentInvoices,
    isLoading: recentInvoicesLoading,
    error: recentInvoicesError,
  } = useGetRecentInvoicesQuery({ limit: 10 })

  // Fetch pending invoices for quick stats
  const {
    data: pendingInvoices,
    isLoading: pendingInvoicesLoading,
    error: pendingInvoicesError,
  } = useGetPendingInvoicesQuery()

  const hasError = analyticsError || recentInvoicesError || pendingInvoicesError
  const isLoading =
    analyticsLoading || recentInvoicesLoading || pendingInvoicesLoading

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

  // Prepare pie chart data for revenue by blockchain
  const revenueChartData =
    analytics?.revenueByBlockchain.map(item => ({
      name: item.blockchain.toUpperCase(),
      value: item.revenueUSD,
      color: getBlockchainColor(item.blockchain),
    })) || []

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
            Merchant Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your business performance and recent activity
          </Typography>
        </Box>
        <IconButton onClick={() => setShowValues(!showValues)} size="small">
          {showValues ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </Box>

      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards - Full Width */}
        <Grid item xs={12}>
          <MerchantSummaryCard
            analytics={analytics}
            isLoading={analyticsLoading}
            showValues={showValues}
          />
        </Grid>

        {/* Revenue Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Blockchain
              </Typography>
              {analytics && revenueChartData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          showValues ? formatUSD(value) : '****',
                          'Revenue',
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">
                    {analyticsLoading
                      ? 'Loading...'
                      : 'No revenue data available'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Widget */}
        <Grid item xs={12} md={6}>
          <QuickStatsWidget
            analytics={analytics}
            pendingInvoices={pendingInvoices}
            isLoading={isLoading}
            showValues={showValues}
          />
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12}>
          <RecentActivityFeed
            recentInvoices={recentInvoices}
            isLoading={recentInvoicesLoading}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default MerchantDashboard

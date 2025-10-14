import React from 'react'
import { Box, Grid, Typography, Alert } from '@mui/material'
import {
  useGetMerchantAnalyticsQuery,
  useGetRecentInvoicesQuery,
  useGetPendingInvoicesQuery,
} from '../../store/api/merchantApi'
import MerchantSummaryCard from './MerchantSummaryCard'
import RecentActivityFeed from './RecentActivityFeed'
import QuickStatsWidget from './QuickStatsWidget'

const MerchantDashboard: React.FC = () => {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Merchant Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Monitor your business performance and recent activity
      </Typography>

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
          />
        </Grid>

        {/* Quick Stats Widget */}
        <Grid item xs={12} md={6}>
          <QuickStatsWidget
            analytics={analytics}
            pendingInvoices={pendingInvoices}
            isLoading={isLoading}
          />
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12} md={6}>
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

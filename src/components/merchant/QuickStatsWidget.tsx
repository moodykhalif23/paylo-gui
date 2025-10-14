import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Skeleton,
} from '@mui/material'
import { Schedule, CheckCircle, AccountBalance } from '@mui/icons-material'
import { MerchantAnalytics, Invoice } from '../../types'

interface QuickStatsWidgetProps {
  analytics?: MerchantAnalytics
  pendingInvoices?: Invoice[]
  isLoading?: boolean
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  analytics,
  pendingInvoices = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Stats
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(item => (
              <Grid item xs={12} sm={6} key={item}>
                <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="rectangular" width="100%" height={4} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            Quick stats unavailable
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const pendingInvoicesCount = pendingInvoices.length
  const pendingAmount = pendingInvoices.reduce(
    (sum, invoice) => sum + parseFloat(invoice.amount),
    0
  )

  // Calculate blockchain distribution percentages
  const blockchainStats = analytics.revenueByBlockchain.map(blockchain => ({
    ...blockchain,
    progressValue: (blockchain.percentage / 100) * 100,
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Stats
        </Typography>
        <Grid container spacing={2}>
          {/* Pending Invoices */}
          <Grid item xs={12} sm={6}>
            <Box
              p={2}
              border={1}
              borderColor="divider"
              borderRadius={1}
              height="100%"
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Schedule color="warning" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Pending Invoices
                </Typography>
              </Box>
              <Typography variant="h6" color="warning.main">
                {pendingInvoicesCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${pendingAmount.toFixed(2)} pending
              </Typography>
            </Box>
          </Grid>

          {/* Success Rate Progress */}
          <Grid item xs={12} sm={6}>
            <Box
              p={2}
              border={1}
              borderColor="divider"
              borderRadius={1}
              height="100%"
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                {analytics.successRate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={analytics.successRate}
                color="success"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Grid>

          {/* Top Blockchain Performance */}
          {blockchainStats.slice(0, 2).map(blockchain => (
            <Grid item xs={12} sm={6} key={blockchain.blockchain}>
              <Box
                p={2}
                border={1}
                borderColor="divider"
                borderRadius={1}
                height="100%"
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccountBalance color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {blockchain.blockchain.charAt(0).toUpperCase() +
                      blockchain.blockchain.slice(1)}{' '}
                    Revenue
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {formatCurrency(blockchain.revenueUSD)}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={blockchain.percentage}
                    sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {blockchain.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Performance Indicators */}
        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Performance Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {analytics.totalTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Txns
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {analytics.successfulTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Successful
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h6" color="error.main">
                  {analytics.failedTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Failed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickStatsWidget

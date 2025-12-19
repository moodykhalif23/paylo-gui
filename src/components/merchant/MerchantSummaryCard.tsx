import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Skeleton,
} from '@mui/material'
import { Receipt, CheckCircle } from '@mui/icons-material'
import { MerchantAnalytics } from '../../types'

interface MerchantSummaryCardProps {
  analytics?: MerchantAnalytics
  isLoading?: boolean
  showValues?: boolean
}

const MerchantSummaryCard: React.FC<MerchantSummaryCardProps> = ({
  analytics,
  isLoading = false,
  showValues = true,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(item => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Box>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="40%" height={20} />
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
            No analytics data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Business Overview
        </Typography>
        <Grid container spacing={3}>
          {/* Total Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {showValues
                  ? formatCurrency(analytics.totalRevenueUSD)
                  : '****'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  {showValues
                    ? `${analytics.totalRevenue} ${analytics.topCurrency.toUpperCase()}`
                    : '****'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Total Transactions */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Receipt color="action" />
                <Typography variant="h4">
                  {analytics.totalTransactions.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {analytics.successfulTransactions} successful
              </Typography>
            </Box>
          </Grid>

          {/* Success Rate */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CheckCircle color="success" />
                <Typography variant="h4" color="success.main">
                  {formatPercentage(analytics.successRate)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {analytics.failedTransactions} failed
              </Typography>
            </Box>
          </Grid>

          {/* Average Transaction Value */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg. Transaction
              </Typography>
              <Typography variant="h4" gutterBottom>
                {showValues
                  ? formatCurrency(analytics.averageTransactionValueUSD)
                  : '****'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {showValues
                  ? `${analytics.averageTransactionValue} ${analytics.topCurrency.toUpperCase()}`
                  : '****'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Top Currency Chip */}
        <Box mt={2}>
          <Chip
            label={`Top Currency: ${analytics.topCurrency.toUpperCase()}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default MerchantSummaryCard

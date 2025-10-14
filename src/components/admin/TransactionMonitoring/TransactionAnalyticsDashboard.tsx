import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'

import { formatLargeNumber, formatPercentage } from '../../../utils/formatters'
import { useGetTransactionAnalyticsQuery } from '../../../store/api/adminApi'

interface TransactionAnalyticsDashboardProps {
  dateRange?: {
    fromDate?: string
    toDate?: string
  }
}

const TransactionAnalyticsDashboard: React.FC<
  TransactionAnalyticsDashboardProps
> = ({ dateRange }) => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useGetTransactionAnalyticsQuery(dateRange || {})

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Analytics
        </Typography>
        <LinearProgress />
      </Paper>
    )
  }

  if (error || !analytics) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transaction Analytics
        </Typography>
        <Typography variant="body2" color="error">
          Failed to load analytics data
        </Typography>
      </Paper>
    )
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'error'
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <FlagIcon />
      case 'high':
        return <WarningIcon />
      case 'medium':
        return <SecurityIcon />
      case 'low':
        return <SecurityIcon />
      default:
        return <SecurityIcon />
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <AssessmentIcon />
        Transaction Risk Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Risk Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Risk Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(analytics.riskDistribution).map(
                  ([level, count]) => (
                    <Box key={level} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getRiskIcon(level)}
                          <Typography
                            variant="body2"
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {level} Risk
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatLargeNumber(count)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (count /
                            Object.values(analytics.riskDistribution).reduce(
                              (a, b) => a + b,
                              0
                            )) *
                          100
                        }
                        color={
                          getRiskColor(level) as
                            | 'primary'
                            | 'secondary'
                            | 'error'
                            | 'info'
                            | 'success'
                            | 'warning'
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Investigation Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Investigation Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {formatLargeNumber(analytics.investigationsOpen)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open Investigations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {formatLargeNumber(analytics.investigationsClosed)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Closed Investigations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {formatLargeNumber(analytics.flaggedTransactions)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Flagged Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {analytics.averageInvestigationTime}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Investigation Time
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Risk Factors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Top Risk Factors
              </Typography>
              <List dense>
                {analytics.topRiskFactors.map((factor, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Chip
                        label={index + 1}
                        size="small"
                        color={index < 3 ? 'error' : 'default'}
                        sx={{ minWidth: 32 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={factor.factor}
                      secondary={`${formatLargeNumber(factor.count)} occurrences (${formatPercentage(factor.percentage)})`}
                    />
                    <Box sx={{ width: 100, ml: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={factor.percentage}
                        color={index < 3 ? 'error' : 'primary'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TransactionAnalyticsDashboard

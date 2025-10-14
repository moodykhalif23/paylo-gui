import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { AccountBalance, Circle } from '@mui/icons-material'
import { BlockchainRevenue } from '../../types'

interface CurrencyBreakdownChartProps {
  data?: BlockchainRevenue[]
  isLoading?: boolean
  error?: any
}

const CurrencyBreakdownChart: React.FC<CurrencyBreakdownChartProps> = ({
  data = [],
  isLoading = false,
  error,
}) => {
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

  const chartData = data.map(item => ({
    name: item.blockchain.charAt(0).toUpperCase() + item.blockchain.slice(1),
    value: item.revenueUSD,
    percentage: item.percentage,
    transactions: item.transactionCount,
    color: getBlockchainColor(item.blockchain),
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.transactions}
          </Typography>
        </Box>
      )
    }
    return null
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load currency breakdown data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Currency Breakdown"
        subheader="Revenue distribution by blockchain"
        avatar={<AccountBalance color="primary" />}
      />
      <CardContent>
        {isLoading ? (
          <Box>
            <Box display="flex" justifyContent="center" mb={3}>
              <Skeleton variant="circular" width={200} height={200} />
            </Box>
            <List>
              {[1, 2, 3].map(item => (
                <ListItem key={item}>
                  <ListItemIcon>
                    <Skeleton variant="circular" width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={<Skeleton variant="text" width="40%" />}
                  />
                  <ListItemSecondaryAction>
                    <Skeleton variant="text" width={60} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : chartData.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height={300}
            color="text.secondary"
          >
            <AccountBalance sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">No currency data available</Typography>
            <Typography variant="body2">
              Start accepting payments to see currency breakdown
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend and Details */}
            <List dense>
              {chartData.map((item, index) => (
                <ListItem key={index} divider={index < chartData.length - 1}>
                  <ListItemIcon>
                    <Circle sx={{ color: item.color, fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {item.name}
                        </Typography>
                        <Chip
                          label={`${item.percentage.toFixed(1)}%`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: item.color,
                            color: item.color,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {item.transactions} transactions
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(item.value)}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {/* Summary */}
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue Distribution
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">
                  {formatCurrency(
                    chartData.reduce((sum, item) => sum + item.value, 0)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chartData.reduce((sum, item) => sum + item.transactions, 0)}{' '}
                  total transactions
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CurrencyBreakdownChart

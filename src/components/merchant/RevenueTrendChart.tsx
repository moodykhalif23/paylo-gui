import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp } from '@mui/icons-material'
import { RevenueDataPoint } from '../../types'

interface RevenueTrendChartProps {
  data?: RevenueDataPoint[]
  isLoading?: boolean
  error?: Error | null
  timeRange?: 'day' | 'week' | 'month'
  onTimeRangeChange?: (range: 'day' | 'week' | 'month') => void
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data = [],
  isLoading = false,
  error,
  timeRange = 'day',
  onTimeRangeChange,
}) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(timeRange === 'month' && { year: 'numeric' }),
      }),
      revenueUSD: Number(point.revenueUSD.toFixed(2)),
    }))
  }, [data, timeRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTooltip = (value: number, name: string) => {
    if (name === 'revenueUSD') {
      return [formatCurrency(value), 'Revenue (USD)']
    }
    if (name === 'transactionCount') {
      return [value, 'Transactions']
    }
    return [value, name]
  }

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, point) => sum + point.revenueUSD, 0)
  }, [data])

  const totalTransactions = useMemo(() => {
    return data.reduce((sum, point) => sum + point.transactionCount, 0)
  }, [data])

  const averageRevenue = useMemo(() => {
    return data.length > 0 ? totalRevenue / data.length : 0
  }, [totalRevenue, data.length])

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load revenue trend data. Please try again.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Revenue Trends"
        subheader="Track your revenue performance over time"
        avatar={<TrendingUp color="primary" />}
        action={
          onTimeRangeChange && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={e =>
                  onTimeRangeChange(e.target.value as 'day' | 'week' | 'month')
                }
                label="Time Range"
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
          )
        }
      />
      <CardContent>
        {isLoading ? (
          <Box>
            <Box display="flex" gap={4} mb={3}>
              {[1, 2, 3].map(item => (
                <Box key={item} textAlign="center">
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={100} height={32} />
                </Box>
              ))}
            </Box>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Box>
        ) : (
          <>
            {/* Summary Stats */}
            <Box display="flex" gap={4} mb={3} flexWrap="wrap">
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totalRevenue)}
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h6">
                  {totalTransactions.toLocaleString()}
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Average Daily Revenue
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(averageRevenue)}
                </Typography>
              </Box>
            </Box>

            {/* Chart */}
            {chartData.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height={300}
                color="text.secondary"
              >
                <TrendingUp sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">No revenue data available</Typography>
                <Typography variant="body2">
                  Start accepting payments to see your revenue trends
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCurrency}
                  />
                  <YAxis
                    yAxisId="transactions"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    labelStyle={{ color: '#666' }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenueUSD"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue (USD)"
                  />
                  <Line
                    yAxisId="transactions"
                    type="monotone"
                    dataKey="transactionCount"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueTrendChart

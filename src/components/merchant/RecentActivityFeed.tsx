import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Box,
  Skeleton,
  Avatar,
} from '@mui/material'
import {
  Receipt,
  CheckCircle,
  Schedule,
  Error,
  Cancel,
  Payment,
} from '@mui/icons-material'
import { Invoice } from '../../types'

interface RecentActivityFeedProps {
  recentInvoices?: Invoice[]
  isLoading?: boolean
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  recentInvoices = [],
  isLoading = false,
}) => {
  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />
      case 'pending':
        return <Schedule color="warning" />
      case 'expired':
        return <Error color="error" />
      case 'cancelled':
        return <Cancel color="disabled" />
      case 'overpaid':
        return <Payment color="info" />
      case 'underpaid':
        return <Payment color="warning" />
      default:
        return <Receipt color="action" />
    }
  }

  const getStatusColor = (
    status: Invoice['status']
  ): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'expired':
      case 'cancelled':
        return 'error'
      case 'overpaid':
      case 'underpaid':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount)
    return `${numAmount.toFixed(4)} ${currency.toUpperCase()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

  if (isLoading) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
        }}
      >
        <CardHeader title="Recent Activity" />
        <CardContent>
          <List>
            {[1, 2, 3, 4, 5].map(item => (
              <ListItem key={item}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={24} height={24} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width="60%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
                <ListItemSecondaryAction>
                  <Skeleton variant="rectangular" width={60} height={24} />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(6px)',
        color: '#ffffff',
      }}
    >
      <CardHeader
        title="Recent Activity"
        subheader={`${recentInvoices.length} recent invoices`}
      />
      <CardContent sx={{ pt: 0 }}>
        {recentInvoices.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={4}
            color="text.secondary"
          >
            <Receipt sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">No recent activity</Typography>
            <Typography variant="body2">
              Create your first invoice to get started
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentInvoices.map((invoice, index) => (
              <ListItem
                key={invoice.id}
                divider={index < recentInvoices.length - 1}
                sx={{ px: 0 }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: getBlockchainColor(invoice.blockchain),
                      width: 32,
                      height: 32,
                    }}
                  >
                    {invoice.blockchain.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </Typography>
                      {getStatusIcon(invoice.status)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.description ||
                          `Invoice #${invoice.id.slice(-8)}`}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(invoice.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={invoice.status.toUpperCase()}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    variant="outlined"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityFeed

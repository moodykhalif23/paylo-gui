import React from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  Typography,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import { BlockchainType, TransactionStatus } from '../../../types'

export interface AdvancedTransactionFilters {
  status?: TransactionStatus
  blockchain?: BlockchainType
  type?: 'p2p' | 'merchant' | 'withdraw' | 'deposit'
  fromDate?: string
  toDate?: string
  minAmount?: string
  maxAmount?: string
  userId?: string
  isSuspicious?: boolean
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  hasInvestigation?: boolean
  fromAddress?: string
  toAddress?: string
  txHash?: string
}

interface AdvancedTransactionFiltersProps {
  filters: AdvancedTransactionFilters
  onFiltersChange: (filters: AdvancedTransactionFilters) => void
  onClearFilters: () => void
}

const AdvancedTransactionFilters: React.FC<AdvancedTransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (
    field: keyof AdvancedTransactionFilters,
    value: string | number | boolean | string[]
  ) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== '' && value !== false
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Paper sx={{ mb: 3 }}>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Advanced Filters</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} active`}
                size="small"
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Basic Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Basic Filters
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status"
                  onChange={e =>
                    handleFilterChange(
                      'status',
                      e.target.value as TransactionStatus
                    )
                  }
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Blockchain</InputLabel>
                <Select
                  value={filters.blockchain || ''}
                  label="Blockchain"
                  onChange={e =>
                    handleFilterChange(
                      'blockchain',
                      e.target.value as BlockchainType
                    )
                  }
                >
                  <MenuItem value="">All Blockchains</MenuItem>
                  <MenuItem value="bitcoin">Bitcoin</MenuItem>
                  <MenuItem value="ethereum">Ethereum</MenuItem>
                  <MenuItem value="solana">Solana</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type || ''}
                  label="Type"
                  onChange={e => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="p2p">P2P Transfer</MenuItem>
                  <MenuItem value="merchant">Merchant Payment</MenuItem>
                  <MenuItem value="withdraw">Withdrawal</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={filters.riskLevel || ''}
                  label="Risk Level"
                  onChange={e =>
                    handleFilterChange('riskLevel', e.target.value)
                  }
                >
                  <MenuItem value="">All Risk Levels</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Date Range
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={filters.fromDate || ''}
                onChange={e => handleFilterChange('fromDate', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={filters.toDate || ''}
                onChange={e => handleFilterChange('toDate', e.target.value)}
              />
            </Grid>

            {/* Amount Range */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Min Amount"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={e => handleFilterChange('minAmount', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Max Amount"
                placeholder="0.00"
                value={filters.maxAmount || ''}
                onChange={e => handleFilterChange('maxAmount', e.target.value)}
              />
            </Grid>

            {/* Address Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Address & Transaction Filters
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="From Address"
                placeholder="Search by from address..."
                value={filters.fromAddress || ''}
                onChange={e =>
                  handleFilterChange('fromAddress', e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="To Address"
                placeholder="Search by to address..."
                value={filters.toAddress || ''}
                onChange={e => handleFilterChange('toAddress', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Transaction Hash"
                placeholder="Search by tx hash..."
                value={filters.txHash || ''}
                onChange={e => handleFilterChange('txHash', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="User ID"
                placeholder="Search by user ID..."
                value={filters.userId || ''}
                onChange={e => handleFilterChange('userId', e.target.value)}
              />
            </Grid>

            {/* Risk & Investigation Filters */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Risk & Investigation Filters
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isSuspicious || false}
                    onChange={e =>
                      handleFilterChange('isSuspicious', e.target.checked)
                    }
                  />
                }
                label="Suspicious Activity Only"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasInvestigation || false}
                    onChange={e =>
                      handleFilterChange('hasInvestigation', e.target.checked)
                    }
                  />
                }
                label="Has Investigation"
              />
            </Grid>
          </Grid>

          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={onClearFilters}
                variant="outlined"
                size="small"
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

export default AdvancedTransactionFilters

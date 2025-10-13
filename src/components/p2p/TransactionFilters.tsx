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
} from '@mui/material'
import {
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'
import { BlockchainType, TransactionStatus } from '../../types'
import { TransactionFilters as FilterType } from '../../store/api/transactionApi'

interface TransactionFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: FilterType) => void
  onClearFilters: () => void
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (field: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== ''
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Filters</Typography>
        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} active`}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
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
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Address"
            placeholder="Search by address..."
            value={filters.address || ''}
            onChange={e => handleFilterChange('address', e.target.value)}
          />
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
      </Grid>

      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
    </Paper>
  )
}

export default TransactionFilters

import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Grid,
  Paper,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'

import { UserFilters as UserFiltersType } from '../../../store/api/adminApi'

interface UserFiltersProps {
  filters: UserFiltersType
  onFiltersChange: (filters: UserFiltersType) => void
  onClearFilters: () => void
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [expanded, setExpanded] = React.useState(false)

  const handleFilterChange = (
    key: keyof UserFiltersType,
    value: string | boolean | string[]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== '' && value !== null
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          <Typography variant="h6">Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFiltersCount > 0 && (
            <Button
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              size="small"
              variant="outlined"
            >
              Clear All
            </Button>
          )}
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Search Bar - Always Visible */}
      <TextField
        fullWidth
        placeholder="Search users by name, email, or ID..."
        value={filters.search || ''}
        onChange={e => handleFilterChange('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          ),
        }}
        sx={{ mb: expanded ? 2 : 0 }}
      />

      {/* Advanced Filters - Collapsible */}
      <Collapse in={expanded}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role || ''}
                label="Role"
                onChange={e => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="merchant">Merchant</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.isActive?.toString() || ''}
                label="Status"
                onChange={e => {
                  const value = e.target.value
                  if (value === '') {
                    handleFilterChange('isActive', '')
                  } else {
                    handleFilterChange('isActive', value === 'true')
                  }
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Email Verified</InputLabel>
              <Select
                value={filters.isEmailVerified?.toString() || ''}
                label="Email Verified"
                onChange={e => {
                  const value = e.target.value
                  if (value === '') {
                    handleFilterChange('isEmailVerified', '')
                  } else {
                    handleFilterChange('isEmailVerified', value === 'true')
                  }
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={filters.kycStatus || ''}
                label="KYC Status"
                onChange={e => handleFilterChange('kycStatus', e.target.value)}
              >
                <MenuItem value="">All KYC Status</MenuItem>
                <MenuItem value="not_submitted">Not Submitted</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={filters.fromDate || ''}
              onChange={e => handleFilterChange('fromDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={filters.toDate || ''}
              onChange={e => handleFilterChange('toDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  )
}

export default UserFilters

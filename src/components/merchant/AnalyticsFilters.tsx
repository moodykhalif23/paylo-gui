import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  Typography,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  FilterList,
  GetApp,
  FileDownload,
  TableChart,
  PictureAsPdf,
} from '@mui/icons-material'
import { useExportMerchantDataMutation } from '../../store/api/merchantApi'
import { BlockchainType } from '../../types'

interface AnalyticsFiltersProps {
  onFiltersChange?: (filters: AnalyticsFilters) => void
  isLoading?: boolean
}

interface AnalyticsFilters {
  fromDate?: string
  toDate?: string
  blockchain?: BlockchainType
  groupBy?: 'day' | 'week' | 'month'
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFiltersChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    blockchain: undefined,
    groupBy: 'day',
  })

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const [exportMerchantData, { isLoading: isExporting }] =
    useExportMerchantDataMutation()

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handlePresetRange = (days: number) => {
    const toDate = new Date().toISOString().split('T')[0]
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const newFilters = { ...filters, fromDate, toDate }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: AnalyticsFilters = {
      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      blockchain: undefined,
      groupBy: 'day',
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportClose = () => {
    setExportAnchorEl(null)
  }

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await exportMerchantData({
        type: 'analytics',
        format,
        filters: {
          ...filters,
          ...(filters.blockchain && { blockchain: filters.blockchain }),
        },
      }).unwrap()

      // Open download URL in new tab
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
    handleExportClose()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.blockchain) count++
    if (filters.groupBy !== 'day') count++
    return count
  }

  return (
    <Card>
      <CardHeader
        title="Analytics Filters"
        subheader="Customize your analytics view and export data"
        avatar={<FilterList color="primary" />}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Date Range */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={filters.fromDate}
              onChange={e => handleFilterChange('fromDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={filters.toDate}
              onChange={e => handleFilterChange('toDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={isLoading}
            />
          </Grid>

          {/* Blockchain Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Blockchain</InputLabel>
              <Select
                value={filters.blockchain || ''}
                onChange={e =>
                  handleFilterChange('blockchain', e.target.value || '')
                }
                label="Blockchain"
                disabled={isLoading}
              >
                <MenuItem value="">All Blockchains</MenuItem>
                <MenuItem value="bitcoin">Bitcoin</MenuItem>
                <MenuItem value="ethereum">Ethereum</MenuItem>
                <MenuItem value="solana">Solana</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Group By */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                value={filters.groupBy}
                onChange={e => handleFilterChange('groupBy', e.target.value)}
                label="Group By"
                disabled={isLoading}
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quick Date Presets */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Date Ranges
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label="Last 7 days"
                onClick={() => handlePresetRange(7)}
                variant="outlined"
                size="small"
              />
              <Chip
                label="Last 30 days"
                onClick={() => handlePresetRange(30)}
                variant="outlined"
                size="small"
              />
              <Chip
                label="Last 90 days"
                onClick={() => handlePresetRange(90)}
                variant="outlined"
                size="small"
              />
              <Chip
                label="Last 365 days"
                onClick={() => handlePresetRange(365)}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box
              display="flex"
              gap={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  startIcon={<FilterList />}
                >
                  Clear Filters
                  {getActiveFiltersCount() > 0 && (
                    <Chip
                      label={getActiveFiltersCount()}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>
              </Box>

              <Button
                variant="contained"
                onClick={handleExportClick}
                disabled={isLoading || isExporting}
                startIcon={<GetApp />}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Export Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportClose}
        >
          <MenuItemComponent onClick={() => handleExport('csv')}>
            <ListItemIcon>
              <TableChart />
            </ListItemIcon>
            <ListItemText primary="Export as CSV" />
          </MenuItemComponent>

          <MenuItemComponent onClick={() => handleExport('excel')}>
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            <ListItemText primary="Export as Excel" />
          </MenuItemComponent>

          <MenuItemComponent onClick={() => handleExport('json')}>
            <ListItemIcon>
              <PictureAsPdf />
            </ListItemIcon>
            <ListItemText primary="Export as JSON" />
          </MenuItemComponent>
        </Menu>
      </CardContent>
    </Card>
  )
}

export default AnalyticsFilters

import React from 'react'
import { Box, TextField, FormControl, FormLabel, Stack } from '@mui/material'
import { DateRange } from '../../services/export/types'

interface DateRangePickerProps {
  value: DateRange
  onChange: (dateRange: DateRange) => void
  label?: string
  disabled?: boolean
  error?: boolean
  helperText?: string
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label = 'Date Range',
  disabled = false,
  error = false,
  helperText,
}) => {
  const handleFromDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      from: event.target.value,
    })
  }

  const handleToDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      to: event.target.value,
    })
  }

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        {label}
      </FormLabel>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          type="date"
          label="From"
          value={value.from}
          onChange={handleFromDateChange}
          disabled={disabled}
          error={error}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />
        <Box sx={{ minWidth: 'auto', color: 'text.secondary' }}>to</Box>
        <TextField
          type="date"
          label="To"
          value={value.to}
          onChange={handleToDateChange}
          disabled={disabled}
          error={error}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />
      </Stack>
      {helperText && (
        <Box
          sx={{
            mt: 1,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {helperText}
        </Box>
      )}
    </FormControl>
  )
}

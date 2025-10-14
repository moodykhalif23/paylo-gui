import React, { useState } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { ExportDialog } from './ExportDialog'
import { ExportType } from '../../services/export/types'

interface ExportButtonProps {
  exportType: ExportType
  data?: unknown[]
  title?: string
  availableColumns?: string[]
  filters?: Record<string, unknown>
  variant?: 'button' | 'menu'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  exportType,
  data,
  title,
  availableColumns,
  filters,
  variant = 'button',
  size = 'medium',
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === 'menu') {
      setAnchorEl(event.currentTarget)
    } else {
      setDialogOpen(true)
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleFormatSelect = () => {
    setDialogOpen(true)
    handleMenuClose()
  }

  const handleQuickExport = async (format: 'csv' | 'json' | 'excel') => {
    if (data && data.length > 0) {
      const { exportService } = await import('../../services/export')

      try {
        await exportService.exportToFile(data, {
          format,
          type: exportType,
          options: {
            fileName: `${exportType}_export_${new Date().toISOString().split('T')[0]}`,
            includeHeaders: true,
          },
        })
      } catch (error) {
        console.error('Export failed:', error)
        // You might want to show a toast notification here
      }
    }
    handleMenuClose()
  }

  const formatIcons = {
    csv: <TableChartIcon fontSize="small" />,
    json: <CodeIcon fontSize="small" />,
    excel: <DescriptionIcon fontSize="small" />,
  }

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<FileDownloadIcon />}
        variant="outlined"
        size={size}
        disabled={disabled}
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleFormatSelect}>
          <ListItemIcon>{formatIcons.csv}</ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleFormatSelect}>
          <ListItemIcon>{formatIcons.json}</ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleFormatSelect}>
          <ListItemIcon>{formatIcons.excel}</ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>

        {data && data.length > 0 && (
          <>
            <Divider />
            <MenuItem onClick={() => handleQuickExport('csv')}>
              <ListItemIcon>{formatIcons.csv}</ListItemIcon>
              <ListItemText>Quick CSV Export</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      <ExportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        exportType={exportType}
        title={title}
        availableColumns={availableColumns}
        defaultFilters={filters}
      />
    </>
  )
}

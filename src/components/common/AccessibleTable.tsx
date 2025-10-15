import React, { useState, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Box,
} from '@mui/material'
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  UnfoldMore,
} from '@mui/icons-material'
import { AccessibilityUtils } from '../../utils/accessibility'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { useAccessibility } from '../../contexts/AccessibilityContext'

export interface TableColumn {
  id: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string | number
  render?: (value: unknown, row: unknown) => React.ReactNode
  ariaLabel?: string
}

export interface AccessibleTableProps {
  columns: TableColumn[]
  data: unknown[]
  caption: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onRowClick?: (row: unknown, index: number) => void
  selectedRowId?: string | number
  loading?: boolean
  emptyMessage?: string
  rowIdField?: string
  stickyHeader?: boolean
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  caption,
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  selectedRowId,
  loading = false,
  emptyMessage = 'No data available',
  rowIdField = 'id',
  stickyHeader = false,
}) => {
  const { announceMessage } = useAccessibility()
  const tableRef = useRef<HTMLTableElement>(null)
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1)

  // Keyboard navigation for table rows
  useKeyboardNavigation(tableRef, {
    onArrowUp: () => {
      if (focusedRowIndex > 0) {
        setFocusedRowIndex(focusedRowIndex - 1)
        focusRow(focusedRowIndex - 1)
      }
    },
    onArrowDown: () => {
      if (focusedRowIndex < data.length - 1) {
        setFocusedRowIndex(focusedRowIndex + 1)
        focusRow(focusedRowIndex + 1)
      }
    },
    onEnter: () => {
      if (focusedRowIndex >= 0 && onRowClick) {
        onRowClick(data[focusedRowIndex], focusedRowIndex)
      }
    },
  })

  const focusRow = (index: number) => {
    const row = tableRef.current?.querySelector(
      `tbody tr:nth-child(${index + 1})`
    ) as HTMLElement
    if (row) {
      row.focus()
      setFocusedRowIndex(index)
    }
  }

  const handleSort = (columnId: string) => {
    if (!onSort) return

    const newDirection =
      sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnId, newDirection)

    const column = columns.find(col => col.id === columnId)
    announceMessage(
      `Table sorted by ${column?.label || columnId} in ${newDirection}ending order`
    )
  }

  const handleRowClick = (row: unknown, index: number) => {
    setFocusedRowIndex(index)
    if (onRowClick) {
      onRowClick(row, index)
    }
  }

  const handleRowKeyDown = (
    event: React.KeyboardEvent,
    row: unknown,
    index: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRowClick(row, index)
    }
  }

  const getSortIcon = (columnId: string) => {
    if (sortBy !== columnId) {
      return <UnfoldMore fontSize="small" />
    }
    return sortDirection === 'asc' ? (
      <KeyboardArrowUp fontSize="small" />
    ) : (
      <KeyboardArrowDown fontSize="small" />
    )
  }

  const tableId = AccessibilityUtils.generateId('table')
  const captionId = AccessibilityUtils.generateId('table-caption')

  return (
    <Box>
      <Typography
        id={captionId}
        variant="h6"
        component="h2"
        sx={{
          marginBottom: 2,
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {caption}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: stickyHeader ? 400 : undefined,
          '&:focus-within': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
        }}
      >
        <Table
          ref={tableRef}
          id={tableId}
          stickyHeader={stickyHeader}
          aria-label={caption}
          aria-describedby={onSort ? 'table-sort-instructions' : undefined}
          role="table"
        >
          <TableHead>
            <TableRow role="row">
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  role="columnheader"
                  aria-sort={
                    sortBy === column.id
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                        ? 'none'
                        : undefined
                  }
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                      aria-label={`Sort by ${column.label}`}
                      IconComponent={() => getSortIcon(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    <Typography variant="subtitle2" component="span">
                      {column.label}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  role="cell"
                  aria-live="polite"
                >
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  role="cell"
                  aria-live="polite"
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = (row as Record<string, unknown>)[rowIdField]
                const isSelected = selectedRowId === rowId
                const isFocused = focusedRowIndex === rowIndex

                return (
                  <TableRow
                    key={
                      typeof rowId === 'string' || typeof rowId === 'number'
                        ? rowId
                        : rowIndex
                    }
                    role="row"
                    tabIndex={onRowClick ? 0 : -1}
                    onClick={() => handleRowClick(row, rowIndex)}
                    onKeyDown={e => handleRowKeyDown(e, row, rowIndex)}
                    aria-selected={isSelected}
                    aria-rowindex={rowIndex + 2} // +2 because header is row 1
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected
                        ? 'action.selected'
                        : isFocused
                          ? 'action.hover'
                          : 'inherit',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&:focus': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '-2px',
                        backgroundColor: 'action.focus',
                      },
                    }}
                  >
                    {columns.map(column => {
                      const cellValue = (row as Record<string, unknown>)[
                        column.id
                      ]
                      const displayValue = column.render
                        ? column.render(cellValue, row)
                        : cellValue

                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          role="cell"
                          aria-label={column.ariaLabel}
                        >
                          {displayValue as React.ReactNode}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onSort && (
        <Typography
          id="table-sort-instructions"
          variant="body2"
          color="text.secondary"
          sx={{
            marginTop: 1,
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Click column headers to sort. Use arrow keys to navigate rows.
        </Typography>
      )}

      <Box
        sx={{
          marginTop: 2,
          padding: 1,
          backgroundColor: 'action.hover',
          borderRadius: 1,
          display: { xs: 'block', md: 'none' }, // Show only on mobile
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
          Table Navigation:
        </Typography>
        <Typography
          variant="body2"
          component="ul"
          sx={{ margin: 0, paddingLeft: 2 }}
        >
          <li>Use Tab to enter the table</li>
          <li>Use Arrow keys to navigate between rows</li>
          <li>Use Enter to select a row</li>
          <li>Use Escape to exit table navigation</li>
        </Typography>
      </Box>
    </Box>
  )
}

export default AccessibleTable

import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Card,
  CardContent,
  Fab,
} from '@mui/material'
import { FileDownload as FileDownloadIcon } from '@mui/icons-material'
import {
  ExportButton,
  ExportManager,
  useExportManager,
} from '../components/common'

// Sample data for demonstration
const sampleTransactions = [
  {
    id: 'tx_001',
    type: 'p2p',
    blockchain: 'bitcoin',
    fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    amount: '0.00123456',
    fee: '0.00000500',
    status: 'confirmed',
    confirmations: 6,
    txHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
  },
  {
    id: 'tx_002',
    type: 'merchant',
    blockchain: 'ethereum',
    fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c4C5d',
    toAddress: '0x8ba1f109551bD432803012645Hac136c22C',
    amount: '1.5',
    fee: '0.002',
    status: 'pending',
    confirmations: 2,
    txHash:
      '0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:05:00Z',
  },
  {
    id: 'tx_003',
    type: 'p2p',
    blockchain: 'solana',
    fromAddress: '11111111111111111111111111111112',
    toAddress: '22222222222222222222222222222223',
    amount: '10.5',
    fee: '0.000005',
    status: 'confirmed',
    confirmations: 32,
    txHash: '5VfYD3F6DJPiQwyvDdtgTED7LpRnf9RfHmd2ue71ZEbGCfWeCGwF7i3rJpQKn6jjp',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:16:00Z',
  },
]

const sampleInvoices = [
  {
    id: 'inv_001',
    merchantId: 'merchant_123',
    amount: '99.99',
    currency: 'USD',
    status: 'paid',
    paymentAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    expirationTime: '2024-01-16T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'inv_002',
    merchantId: 'merchant_456',
    amount: '249.50',
    currency: 'USD',
    status: 'pending',
    paymentAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c4C5d',
    expirationTime: '2024-01-16T11:00:00Z',
    createdAt: '2024-01-15T11:00:00Z',
  },
]

export const ExportDemo: React.FC = () => {
  const exportManager = useExportManager()
  const [selectedData, setSelectedData] = useState<'transactions' | 'invoices'>(
    'transactions'
  )

  const currentData =
    selectedData === 'transactions' ? sampleTransactions : sampleInvoices
  const availableColumns = Object.keys(currentData[0] || {})

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Export Functionality Demo
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates the export functionality with sample data. You
        can export data in CSV, JSON, or Excel formats with customizable
        options.
      </Typography>

      <Stack spacing={4}>
        {/* Data Selection */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Data to Export
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant={
                  selectedData === 'transactions' ? 'contained' : 'outlined'
                }
                onClick={() => setSelectedData('transactions')}
              >
                Transactions ({sampleTransactions.length})
              </Button>
              <Button
                variant={selectedData === 'invoices' ? 'contained' : 'outlined'}
                onClick={() => setSelectedData('invoices')}
              >
                Invoices ({sampleInvoices.length})
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Export Options</Typography>
              <ExportButton
                exportType={selectedData}
                data={currentData}
                availableColumns={availableColumns}
                title={`Export ${selectedData}`}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Click the export button to see the export dialog with customizable
              options including:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Multiple format options (CSV, JSON, Excel)</li>
              <li>Custom date range selection</li>
              <li>Column selection</li>
              <li>File naming options</li>
              <li>Progress tracking for large exports</li>
            </Box>
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Preview - {selectedData}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {availableColumns.slice(0, 6).map(column => (
                      <TableCell key={column}>
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData.map((row, index) => (
                    <TableRow key={index}>
                      {availableColumns.slice(0, 6).map(column => (
                        <TableCell key={column}>
                          {String(row[column as keyof typeof row]).substring(
                            0,
                            20
                          )}
                          {String(row[column as keyof typeof row]).length > 20
                            ? '...'
                            : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Export Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How to Use Export Features
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <li>
                <strong>Quick Export:</strong> Use the export button menu for
                immediate CSV export of current data
              </li>
              <li>
                <strong>Advanced Export:</strong> Click "Export" to open the
                dialog with customization options
              </li>
              <li>
                <strong>Progress Tracking:</strong> Large exports show progress
                indicators and can be cancelled
              </li>
              <li>
                <strong>Export Manager:</strong> Click the floating action
                button to view all export jobs
              </li>
              <li>
                <strong>Date Filtering:</strong> Set custom date ranges for
                time-based data exports
              </li>
              <li>
                <strong>Column Selection:</strong> Choose specific columns to
                include in your export
              </li>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Floating Export Manager Button */}
      <Fab
        color="primary"
        aria-label="export manager"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => exportManager.setIsOpen(true)}
      >
        <FileDownloadIcon />
      </Fab>

      {/* Export Manager */}
      <ExportManager
        open={exportManager.isOpen}
        onClose={() => exportManager.setIsOpen(false)}
        jobs={exportManager.jobs}
        onJobComplete={job => {
          console.log('Export completed:', job)
        }}
        onJobCancel={jobId => {
          exportManager.removeJob(jobId)
        }}
        onClearCompleted={exportManager.clearCompleted}
      />
    </Container>
  )
}

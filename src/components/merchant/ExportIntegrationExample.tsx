import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { ExportButton } from '../common'

// Sample merchant data
const sampleInvoices = [
  {
    id: 'inv_001',
    amount: '99.99',
    currency: 'USD',
    status: 'paid',
    customerEmail: 'customer1@example.com',
    paymentAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    createdAt: '2024-01-15T10:30:00Z',
    paidAt: '2024-01-15T10:45:00Z',
  },
  {
    id: 'inv_002',
    amount: '249.50',
    currency: 'USD',
    status: 'pending',
    customerEmail: 'customer2@example.com',
    paymentAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c4C5d',
    createdAt: '2024-01-15T11:00:00Z',
    paidAt: null,
  },
  {
    id: 'inv_003',
    amount: '75.00',
    currency: 'USD',
    status: 'expired',
    customerEmail: 'customer3@example.com',
    paymentAddress: '11111111111111111111111111111112',
    createdAt: '2024-01-14T09:15:00Z',
    paidAt: null,
  },
]

const availableColumns = [
  'id',
  'amount',
  'currency',
  'status',
  'customerEmail',
  'paymentAddress',
  'createdAt',
  'paidAt',
]

export const ExportIntegrationExample: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Invoice Management</Typography>
          <ExportButton
            exportType="invoices"
            data={sampleInvoices}
            availableColumns={availableColumns}
            title="Export Invoices"
            filters={{
              merchantId: 'merchant_123',
              status: ['paid', 'pending', 'expired'],
            }}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleInvoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>
                    {invoice.currency} {invoice.amount}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        backgroundColor:
                          invoice.status === 'paid'
                            ? 'success.light'
                            : invoice.status === 'pending'
                              ? 'warning.light'
                              : 'error.light',
                        color:
                          invoice.status === 'paid'
                            ? 'success.dark'
                            : invoice.status === 'pending'
                              ? 'warning.dark'
                              : 'error.dark',
                      }}
                    >
                      {invoice.status.toUpperCase()}
                    </Box>
                  </TableCell>
                  <TableCell>{invoice.customerEmail}</TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {invoice.paidAt
                      ? new Date(invoice.paidAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            This example shows how the export functionality integrates with
            existing data tables. The export button provides both quick export
            options and advanced customization through the dialog.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

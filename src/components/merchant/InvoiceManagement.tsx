import React, { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material'
import { Add, Receipt, List, QrCode } from '@mui/icons-material'
import InvoiceCreationForm from './InvoiceCreationForm'
import InvoiceListTable from './InvoiceListTable'
import PaymentAddressGenerator from './PaymentAddressGenerator'
import { Invoice } from '../../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const InvoiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoiceDetailDialogOpen, setInvoiceDetailDialogOpen] = useState(false)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleInvoiceCreated = () => {
    setCreateDialogOpen(false)
    // Optionally switch to the list tab to show the new invoice
    setActiveTab(1)
  }

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setInvoiceDetailDialogOpen(true)
  }

  const handleCloseInvoiceDetail = () => {
    setSelectedInvoice(null)
    setInvoiceDetailDialogOpen(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Invoice Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and track your payment invoices
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="invoice management tabs"
          >
            <Tab
              icon={<Receipt />}
              label="Create Invoice"
              id="invoice-tab-0"
              aria-controls="invoice-tabpanel-0"
            />
            <Tab
              icon={<List />}
              label="Invoice List"
              id="invoice-tab-1"
              aria-controls="invoice-tabpanel-1"
            />
            <Tab
              icon={<QrCode />}
              label="Address Generator"
              id="invoice-tab-2"
              aria-controls="invoice-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <InvoiceCreationForm onInvoiceCreated={handleInvoiceCreated} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <InvoiceListTable onInvoiceSelect={handleInvoiceSelect} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PaymentAddressGenerator />
        </TabPanel>
      </Paper>

      {/* Floating Action Button for Quick Invoice Creation */}
      <Fab
        color="primary"
        aria-label="create invoice"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Quick Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <InvoiceCreationForm onInvoiceCreated={handleInvoiceCreated} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={invoiceDetailDialogOpen}
        onClose={handleCloseInvoiceDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Invoice ID
                </Typography>
                <Typography variant="body1" fontFamily="monospace" gutterBottom>
                  {selectedInvoice.id}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Amount
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {selectedInvoice.amount} {selectedInvoice.currency}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvoice.status.toUpperCase()}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Blockchain
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedInvoice.blockchain.toUpperCase()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Payment Address
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ wordBreak: 'break-all' }}
                  gutterBottom
                >
                  {selectedInvoice.paymentAddress}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedInvoice.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expires At
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedInvoice.expirationTime).toLocaleString()}
                </Typography>

                {selectedInvoice.description && (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedInvoice.description}
                    </Typography>
                  </>
                )}
              </Grid>

              {selectedInvoice.status === 'pending' && (
                <Grid item xs={12}>
                  <PaymentAddressGenerator
                    invoiceId={selectedInvoice.id}
                    amount={selectedInvoice.amount}
                    currency={selectedInvoice.currency}
                    blockchain={selectedInvoice.blockchain}
                    paymentAddress={selectedInvoice.paymentAddress}
                    qrCode={selectedInvoice.qrCode}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InvoiceManagement

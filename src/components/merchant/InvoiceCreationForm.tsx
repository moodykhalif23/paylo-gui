import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material'
import { Receipt, QrCode, Timer, Link as LinkIcon } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useCreateInvoiceMutation } from '../../store/api/merchantApi'
import { BlockchainType, Invoice } from '../../types'

interface InvoiceCreationFormProps {
  onInvoiceCreated?: (invoice: Invoice) => void
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .min(0.0001, 'Amount must be at least 0.0001'),
  currency: Yup.string().required('Currency is required'),
  blockchain: Yup.string()
    .required('Blockchain is required')
    .oneOf(['bitcoin', 'ethereum', 'solana'], 'Invalid blockchain'),
  description: Yup.string().max(
    500,
    'Description must be less than 500 characters'
  ),
  expirationMinutes: Yup.number()
    .required('Expiration time is required')
    .min(5, 'Minimum expiration is 5 minutes')
    .max(10080, 'Maximum expiration is 7 days'),
  webhookUrl: Yup.string().url('Must be a valid URL'),
})

const InvoiceCreationForm: React.FC<InvoiceCreationFormProps> = ({
  onInvoiceCreated,
}) => {
  const [createInvoice, { isLoading, error }] = useCreateInvoiceMutation()
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null)

  const formik = useFormik({
    initialValues: {
      amount: '',
      currency: 'BTC',
      blockchain: 'bitcoin' as BlockchainType,
      description: '',
      expirationMinutes: 60,
      webhookUrl: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const invoice = await createInvoice({
          amount: values.amount,
          currency: values.currency,
          blockchain: values.blockchain,
          description: values.description || undefined,
          expirationMinutes: values.expirationMinutes,
          webhookUrl: values.webhookUrl || undefined,
        }).unwrap()

        setCreatedInvoice(invoice)
        onInvoiceCreated?.(invoice)
        resetForm()
      } catch (err) {
        console.error('Failed to create invoice:', err)
      }
    },
  })

  const getCurrencyOptions = (blockchain: BlockchainType) => {
    switch (blockchain) {
      case 'bitcoin':
        return ['BTC']
      case 'ethereum':
        return ['ETH', 'USDT', 'USDC', 'DAI']
      case 'solana':
        return ['SOL', 'USDC']
      default:
        return []
    }
  }

  const handleBlockchainChange = (blockchain: BlockchainType) => {
    formik.setFieldValue('blockchain', blockchain)
    const currencies = getCurrencyOptions(blockchain)
    if (currencies.length > 0) {
      formik.setFieldValue('currency', currencies[0])
    }
  }

  const formatExpirationTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(minutes / 1440)
      return `${days} day${days > 1 ? 's' : ''}`
    }
  }

  if (createdInvoice) {
    return (
      <Card>
        <CardHeader
          title="Invoice Created Successfully"
          avatar={<Receipt color="success" />}
        />
        <CardContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your invoice has been created and is ready to receive payments.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice ID
              </Typography>
              <Typography variant="body1" fontFamily="monospace">
                {createdInvoice.id}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount
              </Typography>
              <Typography variant="body1">
                {createdInvoice.amount} {createdInvoice.currency}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payment Address
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {createdInvoice.paymentAddress}
                </Typography>
                <Chip
                  icon={<QrCode />}
                  label="QR Code"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Expires At
              </Typography>
              <Typography variant="body2">
                {new Date(createdInvoice.expirationTime).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" gap={2}>
            <Button variant="outlined" onClick={() => setCreatedInvoice(null)}>
              Create Another Invoice
            </Button>
            <Button
              variant="contained"
              href={`/merchant/invoices/${createdInvoice.id}`}
            >
              View Invoice Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Create New Invoice"
        subheader="Generate a payment request for your customers"
        avatar={<Receipt color="primary" />}
      />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Amount and Currency */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                inputProps={{
                  step: '0.0001',
                  min: '0.0001',
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formik.values.currency}
                  onChange={formik.handleChange}
                  label="Currency"
                >
                  {getCurrencyOptions(formik.values.blockchain).map(
                    currency => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Blockchain Selection */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Blockchain Network
              </Typography>
              <Box display="flex" gap={1}>
                {(['bitcoin', 'ethereum', 'solana'] as BlockchainType[]).map(
                  blockchain => (
                    <Chip
                      key={blockchain}
                      label={
                        blockchain.charAt(0).toUpperCase() + blockchain.slice(1)
                      }
                      onClick={() => handleBlockchainChange(blockchain)}
                      color={
                        formik.values.blockchain === blockchain
                          ? 'primary'
                          : 'default'
                      }
                      variant={
                        formik.values.blockchain === blockchain
                          ? 'filled'
                          : 'outlined'
                      }
                    />
                  )
                )}
              </Box>
              {formik.touched.blockchain && formik.errors.blockchain && (
                <Typography variant="caption" color="error">
                  {formik.errors.blockchain}
                </Typography>
              )}
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description (Optional)"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                placeholder="Brief description of the payment request..."
              />
            </Grid>

            {/* Expiration Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="expirationMinutes"
                label="Expiration Time"
                type="number"
                value={formik.values.expirationMinutes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.expirationMinutes &&
                  Boolean(formik.errors.expirationMinutes)
                }
                helperText={
                  (formik.touched.expirationMinutes &&
                    formik.errors.expirationMinutes) ||
                  `Invoice will expire in ${formatExpirationTime(formik.values.expirationMinutes)}`
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Timer />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">minutes</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 5,
                  max: 10080,
                }}
              />
            </Grid>

            {/* Webhook URL */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="webhookUrl"
                label="Webhook URL (Optional)"
                type="url"
                value={formik.values.webhookUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.webhookUrl && Boolean(formik.errors.webhookUrl)
                }
                helperText={
                  formik.touched.webhookUrl && formik.errors.webhookUrl
                }
                placeholder="https://your-site.com/webhook"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Error Display */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  Failed to create invoice. Please try again.
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => formik.resetForm()}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !formik.isValid}
                >
                  {isLoading ? 'Creating...' : 'Create Invoice'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default InvoiceCreationForm

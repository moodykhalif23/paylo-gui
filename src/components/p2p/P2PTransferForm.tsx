import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import { Send, AccountBalanceWallet, SwapHoriz } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { BlockchainType, TransactionFee, Wallet } from '../../types'
import {
  useGetUserWalletsQuery,
  useLazyValidateAddressQuery,
  useGetTransactionFeesQuery,
} from '../../store/api/walletApi'

interface P2PTransferFormProps {
  onSubmit: (transferData: TransferFormData) => void
  isLoading?: boolean
}

export interface TransferFormData {
  fromWalletId: string
  toAddress: string
  amount: string
  blockchain: BlockchainType
  feeLevel: 'slow' | 'standard' | 'fast'
  memo?: string
}

const createValidationSchema = (
  wallets: Wallet[],
  feeData: TransactionFee | undefined
) =>
  Yup.object({
    fromWalletId: Yup.string().required('Please select a wallet'),
    toAddress: Yup.string()
      .required('Recipient address is required')
      .min(26, 'Address is too short')
      .max(62, 'Address is too long'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .test('sufficient-balance', 'Insufficient balance', function (value) {
        const { fromWalletId, feeLevel } = this.parent

        if (!value || !fromWalletId || !wallets || !feeData) return true

        const wallet = wallets.find((w: Wallet) => w.id === fromWalletId)
        if (!wallet) return true

        const amount = parseFloat(value.toString())
        const feeLevelKey = (feeLevel || 'standard') as
          | 'slow'
          | 'standard'
          | 'fast'
        const fee = parseFloat(feeData[feeLevelKey]?.fee || '0')
        const total = amount + fee
        const balance = parseFloat(wallet.balance)

        return total <= balance
      }),
    blockchain: Yup.string().required('Please select a blockchain'),
    feeLevel: Yup.string().oneOf(['slow', 'standard', 'fast']).required(),
    memo: Yup.string().max(100, 'Memo must be less than 100 characters'),
  })

const P2PTransferForm: React.FC<P2PTransferFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    message?: string
  } | null>(null)

  const { data: wallets = [] } = useGetUserWalletsQuery()
  const [validateAddress] = useLazyValidateAddressQuery()

  const [selectedBlockchain, setSelectedBlockchain] =
    useState<BlockchainType>('bitcoin')
  const { data: feeData } = useGetTransactionFeesQuery(selectedBlockchain)

  const formik = useFormik<TransferFormData>({
    initialValues: {
      fromWalletId: '',
      toAddress: '',
      amount: '',
      blockchain: 'bitcoin',
      feeLevel: 'standard',
      memo: '',
    },
    validationSchema: createValidationSchema(wallets, feeData),
    onSubmit: values => {
      onSubmit(values)
    },
  })

  const selectedWallet = wallets.find(w => w.id === formik.values.fromWalletId)

  // Validate address when it changes
  useEffect(() => {
    const validateAddressAsync = async () => {
      if (formik.values.toAddress && formik.values.blockchain) {
        try {
          const result = await validateAddress({
            address: formik.values.toAddress,
            blockchain: formik.values.blockchain,
          }).unwrap()

          setAddressValidation({
            isValid: result.valid,
            message: result.valid ? 'Valid address' : 'Invalid address format',
          })
        } catch {
          setAddressValidation({
            isValid: false,
            message: 'Unable to validate address',
          })
        }
      } else {
        setAddressValidation(null)
      }
    }

    const timeoutId = setTimeout(validateAddressAsync, 500)
    return () => clearTimeout(timeoutId)
  }, [formik.values.toAddress, formik.values.blockchain, validateAddress])

  // Update blockchain when wallet changes
  useEffect(() => {
    if (selectedWallet) {
      formik.setFieldValue('blockchain', selectedWallet.blockchain)
      setSelectedBlockchain(selectedWallet.blockchain)
    }
  }, [selectedWallet, formik])

  const blockchainConfig = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627eea' },
    solana: { name: 'Solana', symbol: 'SOL', color: '#9945ff' },
    erc20: { name: 'USDT (ERC-20)', symbol: 'USDT', color: '#26a17b' },
    trc20: { name: 'USDT (TRC-20)', symbol: 'USDT', color: '#26a17b' },
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0.00'
    if (num < 0.001) return num.toFixed(8)
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
  }

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const calculateTotal = () => {
    if (!formik.values.amount || !feeData) return '0'
    const amount = parseFloat(formik.values.amount)
    const fee = parseFloat(feeData[formik.values.feeLevel].fee)
    return (amount + fee).toFixed(8)
  }

  const isFormValid = formik.isValid && addressValidation?.isValid && !isLoading

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Send color="primary" />
          <Typography variant="h6">Send Cryptocurrency</Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* From Wallet Selection */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={
                  formik.touched.fromWalletId && !!formik.errors.fromWalletId
                }
              >
                <InputLabel>From Wallet</InputLabel>
                <Select
                  name="fromWalletId"
                  value={formik.values.fromWalletId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="From Wallet"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountBalanceWallet />
                    </InputAdornment>
                  }
                >
                  {wallets.map(wallet => {
                    const config = blockchainConfig[wallet.blockchain]
                    return (
                      <MenuItem key={wallet.id} value={wallet.id}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          width="100%"
                        >
                          <Typography
                            sx={{ color: config.color, fontWeight: 'bold' }}
                          >
                            {config.symbol}
                          </Typography>
                          <Box flex={1}>
                            <Typography variant="body2">
                              {config.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Balance: {formatBalance(wallet.balance)}{' '}
                              {config.symbol}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatUSD(wallet.usdValue)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
                {formik.touched.fromWalletId && formik.errors.fromWalletId && (
                  <Typography variant="caption" color="error">
                    {formik.errors.fromWalletId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Recipient Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="toAddress"
                label="Recipient Address"
                value={formik.values.toAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.toAddress && !!formik.errors.toAddress}
                helperText={
                  formik.touched.toAddress && formik.errors.toAddress
                    ? formik.errors.toAddress
                    : addressValidation?.message
                }
                placeholder="Enter recipient's wallet address"
                InputProps={{
                  style: { fontFamily: 'monospace' },
                  endAdornment: addressValidation && (
                    <InputAdornment position="end">
                      <Chip
                        label={addressValidation.isValid ? 'Valid' : 'Invalid'}
                        color={addressValidation.isValid ? 'success' : 'error'}
                        size="small"
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && !!formik.errors.amount}
                helperText={formik.touched.amount && formik.errors.amount}
                placeholder="0.00"
                InputProps={{
                  endAdornment: selectedWallet && (
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        {blockchainConfig[selectedWallet.blockchain].symbol}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
              {selectedWallet && (
                <Typography variant="caption" color="text.secondary">
                  Available: {formatBalance(selectedWallet.balance)}{' '}
                  {blockchainConfig[selectedWallet.blockchain].symbol}
                </Typography>
              )}
            </Grid>

            {/* Fee Level */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Speed</InputLabel>
                <Select
                  name="feeLevel"
                  value={formik.values.feeLevel}
                  onChange={formik.handleChange}
                  label="Transaction Speed"
                >
                  {feeData &&
                    Object.entries(feeData)
                      .filter(([key]) => key !== 'blockchain')
                      .map(([level, data]) => {
                        const feeInfo = data as {
                          fee: string
                          estimatedTime: number
                        }
                        return (
                          <MenuItem key={level} value={level}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ textTransform: 'capitalize' }}
                              >
                                {level} - {feeInfo.estimatedTime} min
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Fee: {feeInfo.fee}{' '}
                                {selectedWallet
                                  ? blockchainConfig[selectedWallet.blockchain]
                                      .symbol
                                  : ''}
                              </Typography>
                            </Box>
                          </MenuItem>
                        )
                      })}
                </Select>
              </FormControl>
            </Grid>

            {/* Memo (Optional) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="memo"
                label="Memo (Optional)"
                value={formik.values.memo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.memo && !!formik.errors.memo}
                helperText={formik.touched.memo && formik.errors.memo}
                placeholder="Add a note for this transaction"
                multiline
                rows={2}
              />
            </Grid>

            {/* Transaction Summary */}
            {formik.values.amount && feeData && (
              <Grid item xs={12}>
                <Box
                  p={2}
                  bgcolor="background.paper"
                  borderRadius={1}
                  border="1px solid"
                  borderColor="divider"
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Amount:</Typography>
                      <Typography variant="body2">
                        {formik.values.amount}{' '}
                        {selectedWallet
                          ? blockchainConfig[selectedWallet.blockchain].symbol
                          : ''}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Network Fee:</Typography>
                      <Typography variant="body2">
                        {feeData[formik.values.feeLevel].fee}{' '}
                        {selectedWallet
                          ? blockchainConfig[selectedWallet.blockchain].symbol
                          : ''}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">
                        Total:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {calculateTotal()}{' '}
                        {selectedWallet
                          ? blockchainConfig[selectedWallet.blockchain].symbol
                          : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!isFormValid}
                startIcon={<SwapHoriz />}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Processing...' : 'Review Transaction'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Validation Errors */}
        {!addressValidation?.isValid && formik.values.toAddress && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please enter a valid {formik.values.blockchain} address
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default P2PTransferForm

import React, { useState } from 'react'
import { Typography, Box, Container, Alert, Snackbar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import P2PTransferForm, {
  TransferFormData,
} from '../../components/p2p/P2PTransferForm'
import TransactionConfirmationDialog from '../../components/p2p/TransactionConfirmationDialog'
import {
  useGetUserWalletsQuery,
  useGetTransactionFeesQuery,
} from '../../store/api/walletApi'
import { useCreateP2PTransactionMutation } from '../../store/api/transactionApi'

const TransferPage: React.FC = () => {
  const navigate = useNavigate()
  const [transferData, setTransferData] = useState<TransferFormData | null>(
    null
  )
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: wallets = [] } = useGetUserWalletsQuery()
  const { data: feeData } = useGetTransactionFeesQuery(
    transferData?.blockchain || 'bitcoin',
    { skip: !transferData?.blockchain }
  )
  const [createTransaction, { isLoading: isCreatingTransaction }] =
    useCreateP2PTransactionMutation()

  const selectedWallet = transferData
    ? wallets.find(w => w.id === transferData.fromWalletId)
    : undefined

  const handleTransferSubmit = (data: TransferFormData) => {
    setTransferData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmTransaction = async () => {
    if (!transferData || !selectedWallet) return

    try {
      const transaction = await createTransaction({
        fromAddress: selectedWallet.address,
        toAddress: transferData.toAddress,
        amount: transferData.amount,
        blockchain: transferData.blockchain,
        fee: feeData?.[transferData.feeLevel]?.fee,
        memo: transferData.memo,
      }).unwrap()

      setShowConfirmDialog(false)
      setTransferData(null)
      setSuccessMessage(
        `Transaction submitted successfully! Transaction ID: ${transaction.id}`
      )

      // Navigate to transactions page after a short delay
      setTimeout(() => {
        navigate('/p2p/transactions')
      }, 3000)
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data &&
        typeof error.data.message === 'string'
          ? error.data.message
          : 'Failed to create transaction. Please try again.'
      setErrorMessage(errorMessage)
    }
  }

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false)
    setTransferData(null)
  }

  const handleCloseSnackbar = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Send Payment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Send cryptocurrency to any wallet address across Bitcoin, Ethereum,
          and Solana networks.
        </Typography>

        <P2PTransferForm
          onSubmit={handleTransferSubmit}
          isLoading={isCreatingTransaction}
        />

        {/* Transaction Confirmation Dialog */}
        {transferData && (
          <TransactionConfirmationDialog
            open={showConfirmDialog}
            onClose={handleCloseConfirmDialog}
            onConfirm={handleConfirmTransaction}
            transferData={transferData}
            selectedWallet={selectedWallet}
            feeData={feeData}
            isLoading={isCreatingTransaction}
          />
        )}

        {/* Success/Error Messages */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  )
}

export default TransferPage

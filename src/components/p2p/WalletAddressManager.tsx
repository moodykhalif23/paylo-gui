import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material'
import {
  Add,
  ContentCopy,
  QrCode,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import { BlockchainType } from '../../types'
import {
  useGetWalletAddressesQuery,
  useGenerateAddressMutation,
  AddressInfo,
} from '../../store/api/walletApi'
import QRCodeDisplay from './QRCodeDisplay'

interface WalletAddressManagerProps {
  walletId: string
  blockchain: BlockchainType
}

// Extended address info for display purposes
interface ExtendedAddressInfo extends AddressInfo {
  id?: string
  balance?: string
  usdValue?: number
  label?: string
}

const WalletAddressManager: React.FC<WalletAddressManagerProps> = ({
  walletId,
  blockchain,
}) => {
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showLabelDialog, setShowLabelDialog] = useState(false)
  const [selectedAddress, setSelectedAddress] =
    useState<ExtendedAddressInfo | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [showBalances, setShowBalances] = useState(true)

  const {
    data: addresses = [],
    isLoading,
    error,
    refetch,
  } = useGetWalletAddressesQuery(walletId)

  const [generateAddress, { isLoading: isGenerating }] =
    useGenerateAddressMutation()

  const blockchainConfig = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627eea' },
    solana: { name: 'Solana', symbol: 'SOL', color: '#9945ff' },
  }

  const config = blockchainConfig[blockchain]

  const handleGenerateAddress = async () => {
    try {
      await generateAddress({ walletId, blockchain }).unwrap()
      refetch()
    } catch (error) {
      console.error('Failed to generate address:', error)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const handleShowQR = (address: ExtendedAddressInfo) => {
    setSelectedAddress(address)
    setShowQRDialog(true)
  }

  const handleEditLabel = (address: ExtendedAddressInfo) => {
    setSelectedAddress(address)
    setNewLabel(address.label || '')
    setShowLabelDialog(true)
  }

  const handleSaveLabel = () => {
    // This would typically call an API to update the label
    // For now, we'll just close the dialog
    setShowLabelDialog(false)
    setSelectedAddress(null)
    setNewLabel('')
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
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

  if (error) {
    return (
      <Alert severity="error">
        Failed to load wallet addresses. Please try again.
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" color={config.color}>
              {config.name} Addresses
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title={showBalances ? 'Hide Balances' : 'Show Balances'}>
                <IconButton
                  size="small"
                  onClick={() => setShowBalances(!showBalances)}
                >
                  {showBalances ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={handleGenerateAddress}
                disabled={isGenerating}
                sx={{
                  bgcolor: config.color,
                  '&:hover': { bgcolor: config.color + 'dd' },
                }}
              >
                {isGenerating ? 'Generating...' : 'New Address'}
              </Button>
            </Stack>
          </Box>

          {isLoading ? (
            <Typography>Loading addresses...</Typography>
          ) : addresses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" gutterBottom>
                No addresses found for this wallet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleGenerateAddress}
                disabled={isGenerating}
              >
                Generate First Address
              </Button>
            </Box>
          ) : (
            <List>
              {addresses.map((address, index) => {
                const extendedAddress: ExtendedAddressInfo = {
                  ...address,
                  id: address.address, // Use address as ID if not provided
                  balance: '0.00', // Default balance
                  usdValue: 0, // Default USD value
                  label: undefined, // No label by default
                }

                return (
                  <React.Fragment key={extendedAddress.id}>
                    <ListItem
                      sx={{
                        bgcolor: address.isActive
                          ? 'transparent'
                          : 'action.disabled',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                              sx={{ fontWeight: 'medium' }}
                            >
                              {truncateAddress(address.address)}
                            </Typography>
                            {extendedAddress.label && (
                              <Chip
                                label={extendedAddress.label}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <Chip
                              label={address.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={address.isActive ? 'success' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            {showBalances &&
                              extendedAddress.balance &&
                              extendedAddress.usdValue !== undefined && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Balance:{' '}
                                  {formatBalance(extendedAddress.balance)}{' '}
                                  {config.symbol}(
                                  {formatUSD(extendedAddress.usdValue)})
                                </Typography>
                              )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Created:{' '}
                              {new Date(address.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Copy Address">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyAddress(address.address)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Show QR Code">
                            <IconButton
                              size="small"
                              onClick={() => handleShowQR(extendedAddress)}
                            >
                              <QrCode fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Label">
                            <IconButton
                              size="small"
                              onClick={() => handleEditLabel(extendedAddress)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < addresses.length - 1 && <Divider />}
                  </React.Fragment>
                )
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">{config.name} Address QR Code</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAddress && (
            <>
              <QRCodeDisplay
                value={selectedAddress.address}
                size={300}
                blockchain={blockchain}
              />
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Address:
                </Typography>
                <Box
                  p={2}
                  bgcolor="background.paper"
                  borderRadius={1}
                  border="1px solid"
                  borderColor="divider"
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {selectedAddress.address}
                  </Typography>
                </Box>
                {selectedAddress.label && (
                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Label: {selectedAddress.label}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              selectedAddress && handleCopyAddress(selectedAddress.address)
            }
            startIcon={<ContentCopy />}
          >
            Copy Address
          </Button>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Label Edit Dialog */}
      <Dialog
        open={showLabelDialog}
        onClose={() => setShowLabelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Address Label</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="outlined"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Enter a label for this address"
            sx={{ mt: 2 }}
          />
          {selectedAddress && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Address:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {selectedAddress.address}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLabelDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveLabel} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WalletAddressManager

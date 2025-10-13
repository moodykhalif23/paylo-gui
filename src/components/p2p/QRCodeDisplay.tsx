import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import QRCode from 'qrcode'
import { BlockchainType } from '../../types'

interface QRCodeDisplayProps {
  value: string
  size?: number
  blockchain?: BlockchainType
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 256,
  blockchain,
  errorCorrectionLevel = 'M',
  margin = 4,
  color = { dark: '#000000', light: '#FFFFFF' },
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current || !value) return

      setLoading(true)
      setError(null)

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin,
          errorCorrectionLevel,
          color,
        })
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Failed to generate QR code')
      } finally {
        setLoading(false)
      }
    }

    generateQRCode()
  }, [value, size, margin, errorCorrectionLevel, color])

  const getBlockchainColor = (blockchain?: BlockchainType) => {
    switch (blockchain) {
      case 'bitcoin':
        return '#f7931a'
      case 'ethereum':
        return '#627eea'
      case 'solana':
        return '#9945ff'
      default:
        return '#000000'
    }
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={size}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Unable to generate QR code for the provided value
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
    >
      {loading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '2px solid',
          borderColor: blockchain ? getBlockchainColor(blockchain) : 'divider',
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </Box>

      {blockchain && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {blockchain.charAt(0).toUpperCase() + blockchain.slice(1)} Address
        </Typography>
      )}
    </Box>
  )
}

export default QRCodeDisplay

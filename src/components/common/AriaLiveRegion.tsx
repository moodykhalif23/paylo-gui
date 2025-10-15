import React, { useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'

interface AriaLiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number // Clear message after X milliseconds
  id?: string
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  priority = 'polite',
  clearAfter = 5000,
  id = 'aria-live-region',
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (message && clearAfter > 0) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout to clear message
      timeoutRef.current = setTimeout(() => {
        // Message will be cleared by parent component
      }, clearAfter)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, clearAfter])

  if (!message) {
    return null
  }

  return (
    <Box
      id={id}
      aria-live={priority}
      aria-atomic="true"
      sx={{
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
      <Typography component="div">{message}</Typography>
    </Box>
  )
}

export default AriaLiveRegion

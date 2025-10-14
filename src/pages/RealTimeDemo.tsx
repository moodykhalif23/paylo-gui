import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import { RealTimeDashboard } from '../components/realtime/RealTimeDashboard'
import { RealTimeInitializer } from '../services/realtime'

/**
 * Demo page showing real-time data features
 * This demonstrates how to integrate real-time components into your application
 */
export const RealTimeDemo: React.FC = () => {
  return (
    <RealTimeInitializer>
      <Container maxWidth="xl">
        <Box py={3}>
          <Typography variant="h3" component="h1" gutterBottom>
            Real-Time Data Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This page demonstrates the real-time data features including live
            transaction updates, wallet balance monitoring, and system health
            tracking.
          </Typography>

          <RealTimeDashboard />
        </Box>
      </Container>
    </RealTimeInitializer>
  )
}

export default RealTimeDemo

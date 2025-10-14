import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SystemAlert } from '../../types'
import { SystemAlertMessage } from '../../types/websocket'

// ============================================================================
// Types
// ============================================================================

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastCheck: string
  endpoint: string
  uptime?: number
  version?: string
  dependencies?: string[]
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    inbound: number
    outbound: number
  }
  activeConnections: number
  requestsPerSecond: number
  errorRate: number
  lastUpdated: string
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down'
  services: ServiceStatus[]
  metrics: SystemMetrics
  uptime: number
  version: string
  lastUpdated: string
}

// ============================================================================
// Initial State
// ============================================================================

interface SystemState {
  health: SystemHealth | null
  alerts: SystemAlert[]
  recentAlerts: SystemAlert[]
  maintenanceMode: boolean
  maintenanceMessage?: string
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
}

const initialState: SystemState = {
  health: null,
  alerts: [],
  recentAlerts: [],
  maintenanceMode: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
  connectionStatus: 'disconnected',
}

// ============================================================================
// System Slice
// ============================================================================

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },

    // Connection status
    setConnectionStatus: (
      state,
      action: PayloadAction<'connected' | 'disconnected' | 'reconnecting'>
    ) => {
      state.connectionStatus = action.payload
    },

    // System health management
    setSystemHealth: (state, action: PayloadAction<SystemHealth>) => {
      state.health = action.payload
      state.lastUpdated = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },

    updateSystemMetrics: (state, action: PayloadAction<SystemMetrics>) => {
      if (state.health) {
        state.health.metrics = action.payload
        state.health.lastUpdated = new Date().toISOString()
        state.lastUpdated = new Date().toISOString()
      }
    },

    updateServiceStatus: (state, action: PayloadAction<ServiceStatus>) => {
      if (state.health) {
        const serviceIndex = state.health.services.findIndex(
          service => service.name === action.payload.name
        )

        if (serviceIndex >= 0) {
          state.health.services[serviceIndex] = action.payload
        } else {
          state.health.services.push(action.payload)
        }

        // Update overall health based on service statuses
        const hasDownServices = state.health.services.some(
          s => s.status === 'down'
        )
        const hasDegradedServices = state.health.services.some(
          s => s.status === 'degraded'
        )

        if (hasDownServices) {
          state.health.overall = 'down'
        } else if (hasDegradedServices) {
          state.health.overall = 'degraded'
        } else {
          state.health.overall = 'healthy'
        }

        state.health.lastUpdated = new Date().toISOString()
        state.lastUpdated = new Date().toISOString()
      }
    },

    // Alert management
    setAlerts: (state, action: PayloadAction<SystemAlert[]>) => {
      state.alerts = action.payload
      state.lastUpdated = new Date().toISOString()
    },

    addAlert: (state, action: PayloadAction<SystemAlert>) => {
      const alert = action.payload

      // Add to current alerts
      const existingIndex = state.alerts.findIndex(a => a.id === alert.id)
      if (existingIndex >= 0) {
        state.alerts[existingIndex] = alert
      } else {
        state.alerts.unshift(alert)
      }

      // Add to recent alerts
      state.recentAlerts.unshift(alert)

      // Keep only last 50 recent alerts
      if (state.recentAlerts.length > 50) {
        state.recentAlerts = state.recentAlerts.slice(0, 50)
      }

      state.lastUpdated = new Date().toISOString()
    },

    removeAlert: (state, action: PayloadAction<string>) => {
      const alertId = action.payload
      state.alerts = state.alerts.filter(alert => alert.id !== alertId)
      state.lastUpdated = new Date().toISOString()
    },

    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alertId = action.payload
      const alert = state.alerts.find(a => a.id === alertId)

      if (alert) {
        alert.isResolved = true
        alert.resolvedAt = new Date().toISOString()
      }

      state.lastUpdated = new Date().toISOString()
    },

    // Real-time system alert updates
    handleSystemAlert: (state, action: PayloadAction<SystemAlertMessage>) => {
      const alertMessage = action.payload
      const alert = alertMessage.alert

      // Add or update alert
      const existingIndex = state.alerts.findIndex(a => a.id === alert.id)
      if (existingIndex >= 0) {
        state.alerts[existingIndex] = alert
      } else {
        state.alerts.unshift(alert)
      }

      // Add to recent alerts
      state.recentAlerts.unshift(alert)

      // Keep only last 50 recent alerts
      if (state.recentAlerts.length > 50) {
        state.recentAlerts = state.recentAlerts.slice(0, 50)
      }

      state.lastUpdated = new Date().toISOString()
    },

    // Maintenance mode
    setMaintenanceMode: (
      state,
      action: PayloadAction<{ enabled: boolean; message?: string }>
    ) => {
      state.maintenanceMode = action.payload.enabled
      state.maintenanceMessage = action.payload.message
    },

    // Clear data
    clearSystemData: state => {
      state.health = null
      state.alerts = []
      state.recentAlerts = []
      state.lastUpdated = null
    },

    clearAlerts: state => {
      state.alerts = []
      state.recentAlerts = []
    },
  },
})

// ============================================================================
// Actions
// ============================================================================

export const {
  setLoading,
  setError,
  setConnectionStatus,
  setSystemHealth,
  updateSystemMetrics,
  updateServiceStatus,
  setAlerts,
  addAlert,
  removeAlert,
  acknowledgeAlert,
  handleSystemAlert,
  setMaintenanceMode,
  clearSystemData,
  clearAlerts,
} = systemSlice.actions

// ============================================================================
// Selectors
// ============================================================================

export const selectSystemState = (state: { system: SystemState }) =>
  state.system

export const selectSystemHealth = (state: { system: SystemState }) =>
  state.system.health

export const selectSystemOverallHealth = (state: { system: SystemState }) =>
  state.system.health?.overall || 'down'

export const selectSystemServices = (state: { system: SystemState }) =>
  state.system.health?.services || []

export const selectSystemMetrics = (state: { system: SystemState }) =>
  state.system.health?.metrics

export const selectServiceByName =
  (serviceName: string) => (state: { system: SystemState }) =>
    state.system.health?.services.find(service => service.name === serviceName)

export const selectHealthyServices = (state: { system: SystemState }) =>
  state.system.health?.services.filter(
    service => service.status === 'healthy'
  ) || []

export const selectDegradedServices = (state: { system: SystemState }) =>
  state.system.health?.services.filter(
    service => service.status === 'degraded'
  ) || []

export const selectDownServices = (state: { system: SystemState }) =>
  state.system.health?.services.filter(service => service.status === 'down') ||
  []

export const selectSystemAlerts = (state: { system: SystemState }) =>
  state.system.alerts

export const selectActiveAlerts = (state: { system: SystemState }) =>
  state.system.alerts.filter(alert => !alert.isResolved)

export const selectCriticalAlerts = (state: { system: SystemState }) =>
  state.system.alerts.filter(
    alert => alert.type === 'critical' && !alert.isResolved
  )

export const selectRecentAlerts = (state: { system: SystemState }) =>
  state.system.recentAlerts

export const selectUnacknowledgedAlerts = (state: { system: SystemState }) =>
  state.system.alerts.filter(alert => !alert.isResolved)

export const selectSystemUptime = (state: { system: SystemState }) =>
  state.system.health?.uptime || 0

export const selectSystemVersion = (state: { system: SystemState }) =>
  state.system.health?.version || 'Unknown'

export const selectMaintenanceMode = (state: { system: SystemState }) => ({
  enabled: state.system.maintenanceMode,
  message: state.system.maintenanceMessage,
})

export const selectConnectionStatus = (state: { system: SystemState }) =>
  state.system.connectionStatus

export const selectIsSystemLoading = (state: { system: SystemState }) =>
  state.system.isLoading

export const selectSystemError = (state: { system: SystemState }) =>
  state.system.error

export const selectLastSystemUpdate = (state: { system: SystemState }) =>
  state.system.lastUpdated

export const selectSystemStats = (state: { system: SystemState }) => {
  const services = state.system.health?.services || []
  const alerts = state.system.alerts

  return {
    totalServices: services.length,
    healthyServices: services.filter(s => s.status === 'healthy').length,
    degradedServices: services.filter(s => s.status === 'degraded').length,
    downServices: services.filter(s => s.status === 'down').length,
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => !a.isResolved).length,
    criticalAlerts: alerts.filter(a => a.type === 'critical' && !a.isResolved)
      .length,
    unacknowledgedAlerts: alerts.filter(a => !a.isResolved).length,
  }
}

// ============================================================================
// Export
// ============================================================================

export default systemSlice.reducer

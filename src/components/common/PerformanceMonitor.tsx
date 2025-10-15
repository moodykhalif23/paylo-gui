import React, { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Typography,
  Paper,
} from '@mui/material'
import { ExpandMore, ExpandLess, Speed } from '@mui/icons-material'
import {
  usePerformanceMonitoring,
  useWebVitals,
  useMemoryMonitoring,
} from '../../hooks/usePerformanceMonitoring'

interface PerformanceStats {
  renderTime: number
  memoryUsage: number
  fps: number
  timestamp: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [stats, setStats] = useState<PerformanceStats[]>([])
  const [currentFPS, setCurrentFPS] = useState(0)

  // Monitor Web Vitals
  useWebVitals()

  // Monitor memory usage
  useMemoryMonitoring(2000)

  // Monitor component performance
  const { renderCount } = usePerformanceMonitoring('PerformanceMonitor', {
    enabled,
    threshold: 16,
    onSlowRender: metrics => {
      console.warn('Slow render detected:', metrics)
    },
  })

  // FPS monitoring
  useEffect(() => {
    if (!enabled) return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        setCurrentFPS(
          Math.round((frameCount * 1000) / (currentTime - lastTime))
        )
        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [enabled])

  // Collect performance stats
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory
      const memoryUsage = memory
        ? Math.round(memory.usedJSHeapSize / 1048576)
        : 0

      const newStat: PerformanceStats = {
        renderTime: 0, // Will be updated by performance monitoring
        memoryUsage,
        fps: currentFPS,
        timestamp: Date.now(),
      }

      setStats(prev => {
        const updated = [...prev, newStat]
        // Keep only last 20 entries
        return updated.slice(-20)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [enabled, currentFPS])

  if (!enabled) return null

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      maxWidth: 300,
    }

    switch (position) {
      case 'top-left':
        return { ...base, top: 16, left: 16 }
      case 'top-right':
        return { ...base, top: 16, right: 16 }
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16 }
      case 'bottom-right':
      default:
        return { ...base, bottom: 16, right: 16 }
    }
  }

  const getPerformanceColor = (value: number, type: 'fps' | 'memory') => {
    if (type === 'fps') {
      if (value >= 55) return 'success'
      if (value >= 30) return 'warning'
      return 'error'
    } else {
      if (value <= 50) return 'success'
      if (value <= 100) return 'warning'
      return 'error'
    }
  }

  const latestStats = stats[stats.length - 1]

  return (
    <Paper
      elevation={3}
      sx={{
        ...getPositionStyles(),
        p: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed fontSize="small" />
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Performance
        </Typography>
        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ color: 'white', ml: 'auto' }}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {latestStats && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip
            label={`${latestStats.fps} FPS`}
            size="small"
            color={getPerformanceColor(latestStats.fps, 'fps')}
            variant="filled"
          />
          <Chip
            label={`${latestStats.memoryUsage}MB`}
            size="small"
            color={getPerformanceColor(latestStats.memoryUsage, 'memory')}
            variant="filled"
          />
        </Box>
      )}

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
            Render Count: {renderCount}
          </Typography>

          {stats.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                Performance History:
              </Typography>
              <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                {stats
                  .slice(-5)
                  .reverse()
                  .map((stat, index) => (
                    <Box
                      key={stat.timestamp}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        py: 0.5,
                        borderBottom:
                          index < 4
                            ? '1px solid rgba(255,255,255,0.1)'
                            : 'none',
                      }}
                    >
                      <span>
                        {new Date(stat.timestamp).toLocaleTimeString()}
                      </span>
                      <span>{stat.fps}fps</span>
                      <span>{stat.memoryUsage}MB</span>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 1, opacity: 0.7 }}
          >
            Development mode only
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default PerformanceMonitor

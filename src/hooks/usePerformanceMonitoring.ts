import { useEffect, useCallback, useRef } from 'react'

interface PerformanceMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

interface PerformanceMonitoringOptions {
  enabled?: boolean
  threshold?: number // ms
  onSlowRender?: (metrics: PerformanceMetrics) => void
}

/**
 * Hook for monitoring component performance
 * Tracks render times and reports slow renders
 */
export const usePerformanceMonitoring = (
  componentName: string,
  options: PerformanceMonitoringOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    threshold = 16, // 16ms for 60fps
    onSlowRender,
  } = options

  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  const startMeasure = useCallback(() => {
    if (!enabled) return
    renderStartTime.current = performance.now()
  }, [enabled])

  const endMeasure = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return

    const renderTime = performance.now() - renderStartTime.current
    renderCount.current += 1

    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    }

    // Log performance metrics
    if (renderTime > threshold) {
      console.warn(`Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        threshold: `${threshold}ms`,
      })

      onSlowRender?.(metrics)
    }

    // Reset for next measurement
    renderStartTime.current = 0
  }, [enabled, componentName, threshold, onSlowRender])

  useEffect(() => {
    startMeasure()
    return endMeasure
  })

  return {
    startMeasure,
    endMeasure,
    renderCount: renderCount.current,
  }
}

/**
 * Hook for measuring Web Vitals and Core Web Vitals
 */
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime)
          }
        })
      })
      observer.observe({ entryTypes: ['paint'] })
    }

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // Measure First Input Delay (FID)
    const measureFID = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          const performanceEventTiming = entry as PerformanceEntry & {
            processingStart?: number
          }
          if (performanceEventTiming.processingStart) {
            const fid = performanceEventTiming.processingStart - entry.startTime
            console.log('FID:', fid)
          }
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
    }

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      let clsValue = 0
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(
          (
            entry: PerformanceEntry & {
              hadRecentInput?: boolean
              value?: number
            }
          ) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value || 0
            }
          }
        )
        console.log('CLS:', clsValue)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    }

    measureFCP()
    measureLCP()
    measureFID()
    measureCLS()
  }, [])
}

/**
 * Hook for monitoring memory usage
 */
export const useMemoryMonitoring = (intervalMs: number = 5000) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const interval = setInterval(() => {
      const memory = (performance as PerformanceMemory).memory
      if (memory) {
        const memoryInfo = {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        }

        // Log memory usage if it's getting high
        const usagePercentage =
          (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
        if (usagePercentage > 80) {
          console.warn('High memory usage detected:', memoryInfo)
        }
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])
}

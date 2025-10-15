import React, { memo, forwardRef } from 'react'
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring'

interface MemoizedComponentProps {
  children: React.ReactNode
  name?: string
  deps?: unknown[]
  debug?: boolean
}

/**
 * Performance-monitored memoized component wrapper
 */
export const MemoizedComponent = memo(
  forwardRef<unknown, MemoizedComponentProps>(
    ({ children, name = 'MemoizedComponent', debug = false }, _ref) => {
      // Monitor performance if debug is enabled
      usePerformanceMonitoring(name, {
        enabled: debug,
        threshold: 16,
        onSlowRender: metrics => {
          console.warn(`Slow render in ${name}:`, metrics)
        },
      })

      return <>{children}</>
    }
  )
)

MemoizedComponent.displayName = 'MemoizedComponent'

export default MemoizedComponent

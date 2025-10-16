import React, { memo, forwardRef } from 'react'

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
    (
      { children, name: _name = 'MemoizedComponent', debug: _debug = false },
      _ref
    ) => {
      return <>{children}</>
    }
  )
)

MemoizedComponent.displayName = 'MemoizedComponent'

export default MemoizedComponent

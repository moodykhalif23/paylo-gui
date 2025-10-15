import React, { memo } from 'react'

/**
 * Higher-order component for memoization with performance monitoring
 */
export function withMemoization<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string,
  customComparison?: (prevProps: P, nextProps: P) => boolean
) {
  const MemoizedComponent = memo(Component, customComparison)
  MemoizedComponent.displayName =
    displayName || `Memoized(${Component.displayName || Component.name})`
  return MemoizedComponent
}

/**
 * Shallow comparison function for props
 */
export function shallowEqual<T extends Record<string, unknown>>(
  prev: T,
  next: T
): boolean {
  const prevKeys = Object.keys(prev)
  const nextKeys = Object.keys(next)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  return prevKeys.every(key => prev[key] === next[key])
}

/**
 * Deep comparison function for props (use sparingly)
 */
export function deepEqual<T>(prev: T, next: T): boolean {
  if (prev === next) return true
  if (prev == null || next == null) return false
  if (typeof prev !== typeof next) return false

  if (typeof prev === 'object') {
    const prevKeys = Object.keys(prev as Record<string, unknown>)
    const nextKeys = Object.keys(next as Record<string, unknown>)

    if (prevKeys.length !== nextKeys.length) return false

    return prevKeys.every(key =>
      deepEqual(
        (prev as Record<string, unknown>)[key],
        (next as Record<string, unknown>)[key]
      )
    )
  }

  return false
}

/**
 * Comparison function that ignores specific props
 */
export function createIgnorePropsComparison<T extends Record<string, unknown>>(
  ignoredProps: (keyof T)[]
) {
  return (prev: T, next: T): boolean => {
    const filteredPrev = { ...prev }
    const filteredNext = { ...next }

    ignoredProps.forEach(prop => {
      delete filteredPrev[prop]
      delete filteredNext[prop]
    })

    return shallowEqual(filteredPrev, filteredNext)
  }
}

/**
 * Comparison function that only considers specific props
 */
export function createSelectiveComparison<T extends Record<string, unknown>>(
  watchedProps: (keyof T)[]
) {
  return (prev: T, next: T): boolean => {
    return watchedProps.every(prop => prev[prop] === next[prop])
  }
}

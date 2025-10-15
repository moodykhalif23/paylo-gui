import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

/**
 * Enhanced useMemo with debugging capabilities
 */
export const useDebugMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  const prevDeps = useRef<React.DependencyList>()
  const computeCount = useRef(0)

  return useMemo(() => {
    computeCount.current += 1

    if (process.env.NODE_ENV === 'development' && debugName) {
      console.log(`[${debugName}] Recomputing (${computeCount.current} times)`)

      if (prevDeps.current) {
        const changedDeps = deps
          .map((dep, index) => ({
            index,
            prev: prevDeps.current?.[index],
            current: dep,
            changed: prevDeps.current?.[index] !== dep,
          }))
          .filter(item => item.changed)

        if (changedDeps.length > 0) {
          console.log(`[${debugName}] Changed dependencies:`, changedDeps)
        }
      }
    }

    prevDeps.current = deps
    return factory()
  }, [factory, deps, debugName])
}

/**
 * Enhanced useCallback with debugging capabilities
 */
export const useDebugCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  const prevDeps = useRef<React.DependencyList>()
  const recreateCount = useRef(0)

  return useCallback(
    (...args: Parameters<T>) => {
      if (process.env.NODE_ENV === 'development' && debugName) {
        recreateCount.current += 1

        if (prevDeps.current) {
          const changedDeps = deps
            .map((dep, index) => ({
              index,
              prev: prevDeps.current?.[index],
              current: dep,
              changed: prevDeps.current?.[index] !== dep,
            }))
            .filter(item => item.changed)

          if (changedDeps.length > 0) {
            console.log(
              `[${debugName}] Callback recreated (${recreateCount.current} times)`,
              changedDeps
            )
          }
        }
      }

      prevDeps.current = deps
      return callback(...args)
    },
    [callback, deps, debugName]
  ) as T
}

/**
 * Memoization hook for expensive computations with cache
 */
export const useComputationCache = <TArgs extends unknown[], TResult>(
  computeFn: (...args: TArgs) => TResult,
  maxCacheSize: number = 10
) => {
  const cache = useRef(
    new Map<string, { result: TResult; timestamp: number }>()
  )

  const compute = useCallback(
    (...args: TArgs): TResult => {
      const key = JSON.stringify(args)
      const cached = cache.current.get(key)

      if (cached) {
        // Move to end (LRU)
        cache.current.delete(key)
        cache.current.set(key, cached)
        return cached.result
      }

      const result = computeFn(...args)

      // Add to cache
      cache.current.set(key, { result, timestamp: Date.now() })

      // Cleanup old entries if cache is full
      if (cache.current.size > maxCacheSize) {
        const firstKey = cache.current.keys().next().value
        if (firstKey) {
          cache.current.delete(firstKey)
        }
      }

      return result
    },
    [computeFn, maxCacheSize]
  )

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  const getCacheStats = useCallback(
    () => ({
      size: cache.current.size,
      maxSize: maxCacheSize,
      keys: Array.from(cache.current.keys()),
    }),
    [maxCacheSize]
  )

  return { compute, clearCache, getCacheStats }
}

/**
 * Hook for memoizing object properties to prevent unnecessary re-renders
 */
export const useStableObject = <T extends Record<string, unknown>>(
  obj: T
): T => {
  return useMemo(() => obj, [obj])
}

/**
 * Hook for memoizing arrays to prevent unnecessary re-renders
 */
export const useStableArray = <T>(arr: T[]): T[] => {
  return useMemo(() => arr, [arr])
}

/**
 * Hook for deep comparison memoization
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  const deepEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      if (keysA.length !== keysB.length) return false

      return keysA.every(key =>
        deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      )
    }

    return false
  }

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: factory(),
    }
  }

  return ref.current.value
}

/**
 * Hook for throttled memoization - only recomputes after a delay
 */
export const useThrottledMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T => {
  const [value, setValue] = useState<T>(() => factory())
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setValue(factory())
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [factory, delay, deps])

  return value
}

/**
 * Hook for selective memoization based on specific properties
 */
export const useSelectiveMemo = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return useMemo(() => {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      result[key] = obj[key]
    })
    return result
  }, [obj, keys])
}

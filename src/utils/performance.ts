/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit the rate of function calls
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Throttle function to limit function calls to once per specified time period
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request idle callback wrapper with fallback
 */
export const requestIdleCallback = (
  callback: (deadline: {
    timeRemaining: () => number
    didTimeout: boolean
  }) => void,
  options?: { timeout?: number }
): number => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  }

  // Fallback for browsers that don't support requestIdleCallback
  const timeoutId = setTimeout(() => {
    const start = Date.now()
    callback({
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      didTimeout: false,
    })
  }, 1) as unknown as number

  return timeoutId
}

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback = (id: number): void => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Preload a component for better performance
 */
export const preloadComponent = (
  componentImport: () => Promise<unknown>
): void => {
  requestIdleCallback(() => {
    componentImport().catch(error => {
      console.warn('Failed to preload component:', error)
    })
  })
}

/**
 * Batch DOM updates using requestAnimationFrame
 */
export const batchDOMUpdates = (callback: () => void): void => {
  requestAnimationFrame(callback)
}

/**
 * Measure function execution time
 */
export const measurePerformance = <T extends (...args: unknown[]) => unknown>(
  func: T,
  name?: string
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now()
    const result = func(...args)
    const endTime = performance.now()

    const executionTime = endTime - startTime
    const functionName = name || func.name || 'anonymous'

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${functionName} execution time: ${executionTime.toFixed(2)}ms`
      )
    }

    return result
  }) as T
}

/**
 * Create a performance observer for monitoring specific metrics
 */
export const createPerformanceObserver = (
  entryTypes: string[],
  callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | null => {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported')
    return null
  }

  const observer = new PerformanceObserver(list => {
    callback(list.getEntries())
  })

  try {
    observer.observe({ entryTypes })
    return observer
  } catch (error) {
    console.warn('Failed to create PerformanceObserver:', error)
    return null
  }
}

/**
 * Optimize images by creating optimized versions
 */
export const optimizeImage = (
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const {
        width = img.width,
        height = img.height,
        quality = 0.8,
        format = 'jpeg',
      } = options

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = `image/${format}`
      const optimizedDataUrl = canvas.toDataURL(mimeType, quality)

      resolve(optimizedDataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = src
  })
}

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    img.src = src
    return
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement
          target.src = src
          observer.unobserve(target)
        }
      })
    },
    {
      rootMargin: '50px',
      ...options,
    }
  )

  observer.observe(img)
}

/**
 * Bundle size analyzer helper
 */
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    // This would typically integrate with webpack-bundle-analyzer
    console.log('Bundle analysis would run here in development mode')
  }
}

/**
 * Memory usage tracker
 */
interface PerformanceMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export const trackMemoryUsage = (): {
  used: number
  total: number
  limit: number
} | null => {
  const perf = performance as PerformanceMemory
  if (perf.memory) {
    const memory = perf.memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    }
  }
  return null
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get connection information for adaptive loading
 */
interface NavigatorConnection extends Navigator {
  connection?: {
    effectiveType?: string
    downlink?: number
    saveData?: boolean
  }
  mozConnection?: {
    effectiveType?: string
    downlink?: number
    saveData?: boolean
  }
  webkitConnection?: {
    effectiveType?: string
    downlink?: number
    saveData?: boolean
  }
}

export const getConnectionInfo = (): {
  effectiveType: string
  downlink: number
  saveData: boolean
} | null => {
  const nav = navigator as NavigatorConnection
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection

  if (connection) {
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      saveData: connection.saveData || false,
    }
  }

  return null
}

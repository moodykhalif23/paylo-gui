import { lazy, ComponentType, ComponentProps } from 'react'
import { preloadComponent } from './performance'

interface NetworkInformation {
  connection?: {
    effectiveType?: string
    saveData?: boolean
  }
}

/**
 * Enhanced lazy loading with preloading capabilities
 */
export const createLazyComponent = <T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  preload: boolean = false
): ComponentType<ComponentProps<T>> => {
  const LazyComponent = lazy(importFunc)

  // Preload component if requested
  if (preload) {
    preloadComponent(importFunc)
  }

  return LazyComponent as ComponentType<React.ComponentProps<T>>
}

/**
 * Route-based code splitting with preloading
 */
export const createRouteComponent = <T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  options: {
    preload?: boolean
    preloadDelay?: number
    preloadOnHover?: boolean
  } = {}
): ComponentType<React.ComponentProps<T>> => {
  const { preload = false, preloadDelay = 0, preloadOnHover = false } = options

  const LazyComponent = lazy(importFunc)

  // Immediate preload
  if (preload) {
    if (preloadDelay > 0) {
      setTimeout(() => preloadComponent(importFunc), preloadDelay)
    } else {
      preloadComponent(importFunc)
    }
  }

  // Preload on hover (for navigation links)
  if (preloadOnHover) {
    // This would be handled by the navigation component
    // Store the import function for later use
    ;(
      LazyComponent as ComponentType<ComponentProps<T>> & {
        __preloadFunc?: () => Promise<{ default: T }>
      }
    ).__preloadFunc = importFunc
  }

  return LazyComponent as ComponentType<ComponentProps<T>>
}

/**
 * Feature-based code splitting
 */
export const createFeatureBundle = <
  T extends Record<string, ComponentType<unknown>>,
>(
  importFunc: () => Promise<T>,
  componentNames: (keyof T)[]
): Record<keyof T, ComponentType<unknown>> => {
  const components = {} as Record<keyof T, ComponentType<unknown>>

  componentNames.forEach(name => {
    components[name] = lazy(async () => {
      const module = await importFunc()
      return { default: module[name] }
    }) as ComponentType<unknown>
  })

  return components
}

/**
 * Conditional loading based on user role or feature flags
 */
export const createConditionalComponent = <T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  condition: () => boolean | Promise<boolean>
): ComponentType<React.ComponentProps<T>> => {
  return lazy(async () => {
    const shouldLoad = await condition()

    if (shouldLoad) {
      return importFunc()
    } else {
      // Return a placeholder component
      return {
        default: (() => null) as unknown as T,
      }
    }
  }) as ComponentType<React.ComponentProps<T>>
}

/**
 * Progressive loading for heavy components
 */
export const createProgressiveComponent = <T extends ComponentType<unknown>>(
  lightImportFunc: () => Promise<{ default: T }>,
  heavyImportFunc: () => Promise<{ default: T }>,
  shouldLoadHeavy: () => boolean = () => true
): ComponentType<React.ComponentProps<T>> => {
  return lazy(async () => {
    // Load light version first
    const lightModule = await lightImportFunc()

    // Check if we should load the heavy version
    if (shouldLoadHeavy()) {
      try {
        const heavyModule = await heavyImportFunc()
        return heavyModule
      } catch (error) {
        console.warn(
          'Failed to load heavy component, falling back to light version:',
          error
        )
        return lightModule
      }
    }

    return lightModule
  }) as ComponentType<React.ComponentProps<T>>
}

/**
 * Network-aware code splitting
 */
export const createNetworkAwareComponent = <T extends ComponentType<unknown>>(
  fastNetworkImport: () => Promise<{ default: T }>,
  slowNetworkImport: () => Promise<{ default: T }>
): ComponentType<React.ComponentProps<T>> => {
  return lazy(async () => {
    const connection = (navigator as NetworkInformation & Navigator).connection

    // Use slow network version for 2G or save-data mode
    if (
      connection &&
      (connection.effectiveType === '2g' || connection.saveData)
    ) {
      return slowNetworkImport()
    }

    return fastNetworkImport()
  }) as ComponentType<React.ComponentProps<T>>
}

/**
 * Preload strategy manager
 */
export class PreloadManager {
  private preloadedComponents = new Set<string>()
  private preloadQueue: Array<{
    name: string
    importFunc: () => Promise<unknown>
  }> = []
  private isProcessing = false

  /**
   * Add component to preload queue
   */
  addToQueue(name: string, importFunc: () => Promise<unknown>): void {
    if (this.preloadedComponents.has(name)) {
      return
    }

    this.preloadQueue.push({ name, importFunc })
    this.processQueue()
  }

  /**
   * Process preload queue during idle time
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const { name, importFunc } = this.preloadQueue.shift()!

      try {
        await new Promise<void>(resolve => {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              importFunc()
                .then(() => {
                  this.preloadedComponents.add(name)
                  resolve()
                })
                .catch(error => {
                  console.warn(`Failed to preload component ${name}:`, error)
                  resolve()
                })
            })
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              importFunc()
                .then(() => {
                  this.preloadedComponents.add(name)
                  resolve()
                })
                .catch(error => {
                  console.warn(`Failed to preload component ${name}:`, error)
                  resolve()
                })
            }, 100)
          }
        })
      } catch (error) {
        console.warn(`Error processing preload for ${name}:`, error)
      }
    }

    this.isProcessing = false
  }

  /**
   * Check if component is preloaded
   */
  isPreloaded(name: string): boolean {
    return this.preloadedComponents.has(name)
  }

  /**
   * Clear preload cache
   */
  clear(): void {
    this.preloadedComponents.clear()
    this.preloadQueue = []
    this.isProcessing = false
  }
}

// Global preload manager instance
export const preloadManager = new PreloadManager()

/**
 * Hook for preloading components on route change
 */
export const preloadRouteComponents = (routeName: string): void => {
  const routePreloadMap: Record<string, () => Promise<unknown>> = {
    'p2p-dashboard': () => import('../pages/p2p/Dashboard'),
    'merchant-dashboard': () => import('../pages/merchant/Dashboard'),
    'admin-dashboard': () => import('../pages/admin/Dashboard'),
    wallets: () => import('../pages/p2p/WalletsPage'),
    transactions: () => import('../pages/p2p/TransactionsPage'),
    invoices: () => import('../pages/merchant/InvoicesPage'),
    analytics: () => import('../pages/merchant/AnalyticsPage'),
    'user-management': () => import('../pages/admin/UserManagementPage'),
    'system-health': () => import('../pages/admin/SystemHealthPage'),
  }

  const importFunc = routePreloadMap[routeName]
  if (importFunc) {
    preloadManager.addToQueue(routeName, importFunc)
  }
}

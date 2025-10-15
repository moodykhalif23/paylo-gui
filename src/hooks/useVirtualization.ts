import { useState, useEffect, useMemo, useCallback } from 'react'

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number // Number of items to render outside visible area
  scrollThreshold?: number // Threshold for scroll optimization
}

interface VirtualizedItem {
  index: number
  style: React.CSSProperties
}

/**
 * Hook for virtualizing large lists to improve performance
 * Only renders visible items plus a small buffer
 */
export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollThreshold = 10,
  } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Get visible items with their positions
  const virtualizedItems = useMemo(() => {
    const result: VirtualizedItem[] = []

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      })
    }

    return result
  }, [visibleRange, itemHeight])

  // Handle scroll events with throttling
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop

      // Only update if scroll difference is significant
      if (Math.abs(newScrollTop - scrollTop) > scrollThreshold) {
        setScrollTop(newScrollTop)
      }

      setIsScrolling(true)
    },
    [scrollTop, scrollThreshold]
  )

  // Reset scrolling state after scroll ends
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScrolling(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [scrollTop])

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight

  return {
    virtualizedItems,
    totalHeight,
    handleScroll,
    isScrolling,
    visibleRange,
  }
}

/**
 * Hook for infinite scrolling with virtualization
 */
export const useInfiniteVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions & {
    loadMore: () => Promise<void>
    hasMore: boolean
    isLoading: boolean
    threshold?: number // Distance from bottom to trigger load
  }
) => {
  const { loadMore, hasMore, isLoading, threshold = 200 } = options

  const virtualization = useVirtualization(items, options)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  // Enhanced scroll handler with infinite loading
  const handleInfiniteScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      virtualization.handleScroll(event)

      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      // Trigger load more when near bottom and scrolling down
      if (
        distanceFromBottom < threshold &&
        scrollTop > lastScrollTop &&
        hasMore &&
        !isLoading
      ) {
        loadMore()
      }

      setLastScrollTop(scrollTop)
    },
    [virtualization, lastScrollTop, threshold, hasMore, isLoading, loadMore]
  )

  return {
    ...virtualization,
    handleScroll: handleInfiniteScroll,
    isLoading,
  }
}

/**
 * Hook for grid virtualization (2D virtualization)
 */
export const useGridVirtualization = <T>(
  items: T[],
  options: {
    itemWidth: number
    itemHeight: number
    containerWidth: number
    containerHeight: number
    columnsCount: number
    overscan?: number
  }
) => {
  const {
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    columnsCount,
    overscan = 2,
  } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const rowsCount = Math.ceil(items.length / columnsCount)

  // Calculate visible range for rows and columns
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / itemHeight)
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / itemHeight),
      rowsCount - 1
    )

    const startCol = Math.floor(scrollLeft / itemWidth)
    const endCol = Math.min(
      startCol + Math.ceil(containerWidth / itemWidth),
      columnsCount - 1
    )

    return {
      startRow: Math.max(0, startRow - overscan),
      endRow: Math.min(rowsCount - 1, endRow + overscan),
      startCol: Math.max(0, startCol - overscan),
      endCol: Math.min(columnsCount - 1, endCol + overscan),
    }
  }, [
    scrollTop,
    scrollLeft,
    itemHeight,
    itemWidth,
    containerHeight,
    containerWidth,
    rowsCount,
    columnsCount,
    overscan,
  ])

  // Get visible items for grid
  const virtualizedItems = useMemo(() => {
    const result: (VirtualizedItem & { row: number; col: number })[] = []

    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
        const index = row * columnsCount + col
        if (index < items.length) {
          result.push({
            index,
            row,
            col,
            style: {
              position: 'absolute',
              top: row * itemHeight,
              left: col * itemWidth,
              width: itemWidth,
              height: itemHeight,
            },
          })
        }
      }
    }

    return result
  }, [visibleRange, itemHeight, itemWidth, columnsCount, items.length])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
    setScrollLeft(event.currentTarget.scrollLeft)
  }, [])

  return {
    virtualizedItems,
    totalHeight: rowsCount * itemHeight,
    totalWidth: columnsCount * itemWidth,
    handleScroll,
    visibleRange,
  }
}

import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import {
  useVirtualization,
  useInfiniteVirtualization,
} from '../../hooks/useVirtualization'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  emptyMessage?: string
}

interface InfiniteVirtualizedListProps<T>
  extends Omit<VirtualizedListProps<T>, 'loadingMessage'> {
  hasMore: boolean
  isLoading: boolean
  loadMore: () => Promise<void>
  threshold?: number
}

export interface VirtualizedListRef {
  scrollTo: (index: number) => void
  scrollToTop: () => void
  getScrollTop: () => number
}

/**
 * Basic virtualized list component for performance optimization
 */
export const VirtualizedList = forwardRef(
  <T,>(props: VirtualizedListProps<T>, ref: React.Ref<VirtualizedListRef>) => {
    const {
      items,
      itemHeight,
      height,
      renderItem,
      overscan = 5,
      className,
      onScroll,
      emptyMessage = 'No items to display',
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    const { virtualizedItems, totalHeight, handleScroll, isScrolling } =
      useVirtualization(items, {
        itemHeight,
        containerHeight: height,
        overscan,
      })

    // Expose scroll methods via ref
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (index: number) => {
          if (containerRef.current) {
            const scrollTop = index * itemHeight
            containerRef.current.scrollTop = scrollTop
          }
        },
        scrollToTop: () => {
          if (containerRef.current) {
            containerRef.current.scrollTop = 0
          }
        },
        getScrollTop: () => {
          return containerRef.current?.scrollTop || 0
        },
      }),
      [itemHeight]
    )

    const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll(event)
      onScroll?.(event.currentTarget.scrollTop)
    }

    if (items.length === 0) {
      return (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
          className={className}
        >
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      )
    }

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          height,
          overflow: 'auto',
          position: 'relative',
          // Optimize scrolling performance
          willChange: isScrolling ? 'scroll-position' : 'auto',
          // Enable hardware acceleration
          transform: 'translateZ(0)',
        }}
        onScroll={handleScrollEvent}
      >
        {/* Total height container for scrollbar */}
        <Box sx={{ height: totalHeight, position: 'relative' }}>
          {virtualizedItems.map(({ index, style }) => (
            <Box key={index} style={style}>
              {renderItem(items[index], index, style)}
            </Box>
          ))}
        </Box>
      </Box>
    )
  }
)

VirtualizedList.displayName = 'VirtualizedList'

/**
 * Infinite scrolling virtualized list component
 */
export const InfiniteVirtualizedList = forwardRef(
  <T,>(
    props: InfiniteVirtualizedListProps<T>,
    ref: React.Ref<VirtualizedListRef>
  ) => {
    const {
      items,
      itemHeight,
      height,
      renderItem,
      hasMore,
      isLoading,
      loadMore,
      threshold = 200,
      overscan = 5,
      className,
      onScroll,
      emptyMessage = 'No items to display',
    } = props

    const containerRef = useRef<HTMLDivElement>(null)

    const { virtualizedItems, totalHeight, handleScroll, isScrolling } =
      useInfiniteVirtualization(items, {
        itemHeight,
        containerHeight: height,
        overscan,
        loadMore,
        hasMore,
        isLoading,
        threshold,
      })

    // Expose scroll methods via ref
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (index: number) => {
          if (containerRef.current) {
            const scrollTop = index * itemHeight
            containerRef.current.scrollTop = scrollTop
          }
        },
        scrollToTop: () => {
          if (containerRef.current) {
            containerRef.current.scrollTop = 0
          }
        },
        getScrollTop: () => {
          return containerRef.current?.scrollTop || 0
        },
      }),
      [itemHeight]
    )

    const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll(event)
      onScroll?.(event.currentTarget.scrollTop)
    }

    if (items.length === 0 && !isLoading) {
      return (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
          className={className}
        >
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      )
    }

    return (
      <Box
        ref={containerRef}
        className={className}
        sx={{
          height,
          overflow: 'auto',
          position: 'relative',
          // Optimize scrolling performance
          willChange: isScrolling ? 'scroll-position' : 'auto',
          // Enable hardware acceleration
          transform: 'translateZ(0)',
        }}
        onScroll={handleScrollEvent}
      >
        {/* Total height container for scrollbar */}
        <Box sx={{ height: totalHeight, position: 'relative' }}>
          {virtualizedItems.map(({ index, style }) => (
            <Box key={index} style={style}>
              {renderItem(items[index], index, style)}
            </Box>
          ))}

          {/* Loading indicator at the bottom */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: totalHeight,
                left: 0,
                right: 0,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading more...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  }
)

InfiniteVirtualizedList.displayName = 'InfiniteVirtualizedList'

export default VirtualizedList

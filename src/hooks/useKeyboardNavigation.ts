import { useEffect, useCallback, useRef } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'

interface KeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: (event: KeyboardEvent) => void
  trapFocus?: boolean
  autoFocus?: boolean
}

export const useKeyboardNavigation = (
  elementRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) => {
  const { settings, announceMessage } = useAccessibility()
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    trapFocus = false,
    autoFocus = false,
  } = options

  const focusableElementsRef = useRef<HTMLElement[]>([])

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!elementRef.current) return []

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(
      elementRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }, [elementRef])

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
      return true
    }
    return false
  }, [getFocusableElements])

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
      return true
    }
    return false
  }, [getFocusableElements])

  // Focus the next focusable element
  const focusNext = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex >= 0 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus()
      return true
    } else if (trapFocus && elements.length > 0) {
      elements[0].focus()
      return true
    }
    return false
  }, [getFocusableElements, trapFocus])

  // Focus the previous focusable element
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex > 0) {
      elements[currentIndex - 1].focus()
      return true
    } else if (trapFocus && elements.length > 0) {
      elements[elements.length - 1].focus()
      return true
    }
    return false
  }, [getFocusableElements, trapFocus])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!settings.keyboardNavigation && !trapFocus) return

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
            announceMessage('Dialog closed')
          }
          break

        case 'Enter':
          if (onEnter && event.target === elementRef.current) {
            event.preventDefault()
            onEnter()
          }
          break

        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault()
            onArrowUp()
          }
          break

        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault()
            onArrowDown()
          }
          break

        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault()
            onArrowLeft()
          }
          break

        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault()
            onArrowRight()
          }
          break

        case 'Tab':
          if (trapFocus) {
            const elements = getFocusableElements()
            if (elements.length === 0) {
              event.preventDefault()
              return
            }

            const currentIndex = elements.indexOf(
              document.activeElement as HTMLElement
            )

            if (event.shiftKey) {
              // Shift + Tab (backward)
              if (currentIndex <= 0) {
                event.preventDefault()
                focusLast()
              }
            } else {
              // Tab (forward)
              if (currentIndex >= elements.length - 1) {
                event.preventDefault()
                focusFirst()
              }
            }
          }

          if (onTab) {
            onTab(event)
          }
          break

        case 'Home':
          if (settings.keyboardNavigation) {
            event.preventDefault()
            focusFirst()
          }
          break

        case 'End':
          if (settings.keyboardNavigation) {
            event.preventDefault()
            focusLast()
          }
          break
      }
    },
    [
      settings.keyboardNavigation,
      trapFocus,
      onEscape,
      onEnter,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onTab,
      elementRef,
      announceMessage,
      getFocusableElements,
      focusFirst,
      focusLast,
    ]
  )

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Update focusable elements list
    focusableElementsRef.current = getFocusableElements()

    // Add keyboard event listener
    element.addEventListener('keydown', handleKeyDown)

    // Auto-focus if requested
    if (autoFocus) {
      const focusTimeout = setTimeout(() => {
        focusFirst()
      }, 100)

      return () => {
        clearTimeout(focusTimeout)
        element.removeEventListener('keydown', handleKeyDown)
      }
    }

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [elementRef, handleKeyDown, getFocusableElements, focusFirst, autoFocus])

  // Return utility functions
  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements,
  }
}

// Hook for managing roving tabindex (for complex widgets like menus, grids)
export const useRovingTabIndex = (
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string = '[role="menuitem"], [role="option"], [role="gridcell"]'
) => {
  const { settings } = useAccessibility()
  const currentIndexRef = useRef(0)

  const updateTabIndex = useCallback(() => {
    if (!containerRef.current || !settings.keyboardNavigation) return

    const items = Array.from(
      containerRef.current.querySelectorAll(itemSelector)
    ) as HTMLElement[]

    items.forEach((item, index) => {
      item.tabIndex = index === currentIndexRef.current ? 0 : -1
    })
  }, [containerRef, itemSelector, settings.keyboardNavigation])

  const setActiveIndex = useCallback(
    (index: number) => {
      if (!containerRef.current) return

      const items = Array.from(
        containerRef.current.querySelectorAll(itemSelector)
      ) as HTMLElement[]

      if (index >= 0 && index < items.length) {
        currentIndexRef.current = index
        updateTabIndex()
        items[index].focus()
      }
    },
    [containerRef, itemSelector, updateTabIndex]
  )

  const moveNext = useCallback(() => {
    if (!containerRef.current) return

    const items = Array.from(
      containerRef.current.querySelectorAll(itemSelector)
    ) as HTMLElement[]

    const nextIndex = (currentIndexRef.current + 1) % items.length
    setActiveIndex(nextIndex)
  }, [containerRef, itemSelector, setActiveIndex])

  const movePrevious = useCallback(() => {
    if (!containerRef.current) return

    const items = Array.from(
      containerRef.current.querySelectorAll(itemSelector)
    ) as HTMLElement[]

    const prevIndex =
      currentIndexRef.current === 0
        ? items.length - 1
        : currentIndexRef.current - 1
    setActiveIndex(prevIndex)
  }, [containerRef, itemSelector, setActiveIndex])

  useEffect(() => {
    updateTabIndex()
  }, [updateTabIndex])

  return {
    setActiveIndex,
    moveNext,
    movePrevious,
    currentIndex: currentIndexRef.current,
  }
}

// Hook for skip links
export const useSkipLinks = () => {
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector(
      'main, [role="main"], #main-content'
    )
    if (mainContent instanceof HTMLElement) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const skipToNavigation = useCallback(() => {
    const navigation = document.querySelector(
      'nav, [role="navigation"], #main-navigation'
    )
    if (navigation instanceof HTMLElement) {
      const firstLink = navigation.querySelector('a, button') as HTMLElement
      if (firstLink) {
        firstLink.focus()
        firstLink.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  return {
    skipToContent,
    skipToNavigation,
  }
}

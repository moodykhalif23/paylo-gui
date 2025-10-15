import React, { ReactNode, useRef } from 'react'
import { Box } from '@mui/material'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import {
  KeyboardNavigationContext,
  KeyboardNavigationContextType,
} from './keyboardNavigationContext'

interface KeyboardNavigationProviderProps {
  children: ReactNode
  onEscape?: () => void
  trapFocus?: boolean
  autoFocus?: boolean
  ariaLabel?: string
}

export const KeyboardNavigationProvider: React.FC<
  KeyboardNavigationProviderProps
> = ({
  children,
  onEscape,
  trapFocus = false,
  autoFocus = false,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusableGroups = useRef<Map<string, HTMLElement[]>>(new Map())

  useKeyboardNavigation(containerRef, {
    onEscape,
    trapFocus,
    autoFocus,
  })

  const registerFocusable = (
    element: HTMLElement,
    group: string = 'default'
  ) => {
    if (!focusableGroups.current.has(group)) {
      focusableGroups.current.set(group, [])
    }

    const groupElements = focusableGroups.current.get(group)!
    if (!groupElements.includes(element)) {
      groupElements.push(element)
    }
  }

  const unregisterFocusable = (
    element: HTMLElement,
    group: string = 'default'
  ) => {
    const groupElements = focusableGroups.current.get(group)
    if (groupElements) {
      const index = groupElements.indexOf(element)
      if (index > -1) {
        groupElements.splice(index, 1)
      }
    }
  }

  const focusNext = (group: string = 'default') => {
    const groupElements = focusableGroups.current.get(group)
    if (!groupElements || groupElements.length === 0) return

    const currentIndex = groupElements.indexOf(
      document.activeElement as HTMLElement
    )
    const nextIndex = (currentIndex + 1) % groupElements.length
    groupElements[nextIndex].focus()
  }

  const focusPrevious = (group: string = 'default') => {
    const groupElements = focusableGroups.current.get(group)
    if (!groupElements || groupElements.length === 0) return

    const currentIndex = groupElements.indexOf(
      document.activeElement as HTMLElement
    )
    const prevIndex =
      currentIndex <= 0 ? groupElements.length - 1 : currentIndex - 1
    groupElements[prevIndex].focus()
  }

  const focusFirstInGroup = (group: string = 'default') => {
    const groupElements = focusableGroups.current.get(group)
    if (groupElements && groupElements.length > 0) {
      groupElements[0].focus()
    }
  }

  const focusLastInGroup = (group: string = 'default') => {
    const groupElements = focusableGroups.current.get(group)
    if (groupElements && groupElements.length > 0) {
      groupElements[groupElements.length - 1].focus()
    }
  }

  const contextValue: KeyboardNavigationContextType = {
    registerFocusable,
    unregisterFocusable,
    focusNext,
    focusPrevious,
    focusFirst: focusFirstInGroup,
    focusLast: focusLastInGroup,
  }

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      <Box
        ref={containerRef}
        role={trapFocus ? 'application' : undefined}
        aria-label={ariaLabel}
        sx={{
          '&:focus': {
            outline: 'none',
          },
          // Enhanced focus styles for keyboard navigation
          '&.keyboard-navigation *:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        }}
        className={''} // Removed settings.keyboardNavigation to avoid import
      >
        {children}
      </Box>
    </KeyboardNavigationContext.Provider>
  )
}

export default KeyboardNavigationProvider

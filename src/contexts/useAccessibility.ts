import React from 'react'
import {
  AccessibilityContext,
  AccessibilityContextType,
} from './AccessibilityContext'

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = (): AccessibilityContextType => {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    )
  }
  return context
}

import React from 'react'
import {
  AccessibilityContext,
  AccessibilityContextType,
} from './AccessibilityContext'

export const useAccessibility = (): AccessibilityContextType => {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    )
  }
  return context
}

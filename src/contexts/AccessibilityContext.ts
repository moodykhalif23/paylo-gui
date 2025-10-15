import { createContext } from 'react'

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReaderMode: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  skipLinks: boolean
  announcements: boolean
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  focusTrap: (element: HTMLElement) => () => void
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  screenReaderMode: false,
  keyboardNavigation: false,
  focusIndicators: true,
  skipLinks: true,
  announcements: true,
}

export const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined)

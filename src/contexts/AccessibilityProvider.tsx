import React, { useEffect, useState, ReactNode } from 'react'
import { AccessibilityUtils } from '../utils/accessibility'
import {
  AccessibilityContext,
  AccessibilityContextType,
  AccessibilitySettings,
  defaultAccessibilitySettings,
} from './AccessibilityContext'

interface AccessibilityProviderProps {
  children: ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    defaultAccessibilitySettings
  )

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(
          savedSettings
        ) as Partial<AccessibilitySettings>
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error)
      }
    }

    // Detect system preferences
    const detectSystemPreferences = () => {
      const highContrast = AccessibilityUtils.prefersHighContrast()
      const reducedMotion = AccessibilityUtils.prefersReducedMotion()

      setSettings(prev => ({
        ...prev,
        highContrast: prev.highContrast || highContrast,
        reducedMotion: prev.reducedMotion || reducedMotion,
      }))
    }

    detectSystemPreferences()

    // Listen for system preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleContrastChange = (event: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: event.matches }))
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: event.matches }))
    }

    contrastQuery.addEventListener('change', handleContrastChange)
    motionQuery.addEventListener('change', handleMotionChange)

    // Detect keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setSettings(prev => ({ ...prev, keyboardNavigation: true }))
      }
    }

    const handleMouseDown = () => {
      setSettings(prev => ({ ...prev, keyboardNavigation: false }))
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility_settings', JSON.stringify(settings))

    // Apply CSS classes to document
    const root = document.documentElement

    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('reduced-motion', settings.reducedMotion)
    root.classList.toggle('keyboard-navigation', settings.keyboardNavigation)
    root.classList.toggle('screen-reader-mode', settings.screenReaderMode)

    // Apply font size
    root.style.setProperty(
      '--accessibility-font-scale',
      settings.fontSize === 'small'
        ? '0.875'
        : settings.fontSize === 'large'
          ? '1.125'
          : '1'
    )
  }, [settings])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const announceMessage = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    AccessibilityUtils.announceToScreenReader(message, priority)
  }

  const focusTrap = (element: HTMLElement) => {
    return AccessibilityUtils.trapFocus(element)
  }

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceMessage,
    focusTrap,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

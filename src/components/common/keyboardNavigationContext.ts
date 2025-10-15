import { createContext } from 'react'

export interface KeyboardNavigationContextType {
  registerFocusable: (element: HTMLElement, group?: string) => void
  unregisterFocusable: (element: HTMLElement, group?: string) => void
  focusNext: (group?: string) => void
  focusPrevious: (group?: string) => void
  focusFirst: (group?: string) => void
  focusLast: (group?: string) => void
}

export const KeyboardNavigationContext = createContext<
  KeyboardNavigationContextType | undefined
>(undefined)

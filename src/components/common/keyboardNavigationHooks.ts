import { useContext } from 'react'
import { KeyboardNavigationContext } from './keyboardNavigationContext'

export const useKeyboardNavigationContext = () => {
  const context = useContext(KeyboardNavigationContext)
  if (!context) {
    throw new Error(
      'useKeyboardNavigationContext must be used within a KeyboardNavigationProvider'
    )
  }
  return context
}

export const useFocusableElement = (group: string = 'default') => {
  const { registerFocusable, unregisterFocusable } =
    useKeyboardNavigationContext()

  return {
    registerFocusable: (element: HTMLElement) =>
      registerFocusable(element, group),
    unregisterFocusable: (element: HTMLElement) =>
      unregisterFocusable(element, group),
  }
}

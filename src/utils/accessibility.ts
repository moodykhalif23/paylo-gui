/**
 * Accessibility utilities for ARIA labels, keyboard navigation, and screen reader support
 */

export class AccessibilityUtils {
  /**
   * Generate unique IDs for form elements and ARIA relationships
   */
  static generateId(prefix: string = 'element'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Create ARIA label for form fields
   */
  static createAriaLabel(
    label: string,
    required: boolean = false,
    description?: string
  ): string {
    let ariaLabel = label

    if (required) {
      ariaLabel += ', required'
    }

    if (description) {
      ariaLabel += `, ${description}`
    }

    return ariaLabel
  }

  /**
   * Create ARIA description for complex form fields
   */
  static createAriaDescription(
    fieldType: string,
    format?: string,
    example?: string
  ): string {
    let description = `${fieldType} field`

    if (format) {
      description += `, format: ${format}`
    }

    if (example) {
      description += `, example: ${example}`
    }

    return description
  }

  /**
   * Get ARIA attributes for cryptocurrency address input
   */
  static getCryptoAddressAria(blockchain: string) {
    return {
      'aria-label': `${blockchain} cryptocurrency address, required`,
      'aria-describedby': `${blockchain.toLowerCase()}-address-help`,
      'aria-invalid': false,
      role: 'textbox',
    }
  }

  /**
   * Get ARIA attributes for amount input
   */
  static getAmountInputAria(currency: string, balance?: string) {
    const description = balance
      ? `Amount in ${currency}, available balance: ${balance}`
      : `Amount in ${currency}`

    return {
      'aria-label': description,
      'aria-describedby': `${currency.toLowerCase()}-amount-help`,
      'aria-invalid': false,
      role: 'spinbutton',
      'aria-valuemin': '0',
    }
  }

  /**
   * Get ARIA attributes for transaction status
   */
  static getTransactionStatusAria(status: string) {
    const statusDescriptions: Record<string, string> = {
      pending: 'Transaction is pending confirmation',
      confirmed: 'Transaction has been confirmed',
      failed: 'Transaction has failed',
      cancelled: 'Transaction has been cancelled',
    }

    const description =
      statusDescriptions[status] || `Transaction status: ${status}`

    return {
      'aria-label': description,
      'aria-describedby': `status-${status}`,
      role: 'status',
      'aria-live': 'polite',
    }
  }

  /**
   * Get ARIA attributes for data tables
   */
  static getTableAria(caption: string, sortable: boolean = false) {
    return {
      role: 'table',
      'aria-label': caption,
      'aria-describedby': sortable ? 'table-sort-help' : undefined,
    }
  }

  /**
   * Get ARIA attributes for sortable table headers
   */
  static getSortableHeaderAria(column: string, sortDirection?: 'asc' | 'desc') {
    return {
      role: 'columnheader',
      'aria-label': `${column}, sortable column`,
      'aria-sort': sortDirection || 'none',
      tabIndex: 0,
    }
  }

  /**
   * Get ARIA attributes for navigation menus
   */
  static getNavigationAria(label: string, current?: boolean) {
    return {
      role: 'navigation',
      'aria-label': label,
      'aria-current': current ? 'page' : undefined,
    }
  }

  /**
   * Get ARIA attributes for modal dialogs
   */
  static getModalAria(title: string, describedBy?: string) {
    return {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': 'modal-title',
      'aria-describedby': describedBy,
      'aria-label': title,
    }
  }

  /**
   * Get ARIA attributes for alert messages
   */
  static getAlertAria(type: 'error' | 'warning' | 'info' | 'success') {
    return {
      role: 'alert',
      'aria-live': type === 'error' ? 'assertive' : 'polite',
      'aria-atomic': true,
    }
  }

  /**
   * Get ARIA attributes for progress indicators
   */
  static getProgressAria(value: number, max: number = 100, label?: string) {
    return {
      role: 'progressbar',
      'aria-valuenow': value,
      'aria-valuemin': 0,
      'aria-valuemax': max,
      'aria-label': label || `Progress: ${value} of ${max}`,
    }
  }

  /**
   * Announce message to screen readers
   */
  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  /**
   * Focus management for modals and dialogs
   */
  static trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }

      if (e.key === 'Escape') {
        // Allow escape key to close modal
        const closeButton = element.querySelector(
          '[data-close-modal]'
        ) as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)

    // Focus first element
    if (firstElement) {
      firstElement.focus()
    }

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Check if user prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * Get keyboard navigation instructions
   */
  static getKeyboardInstructions(context: string): string {
    const instructions = {
      table:
        'Use arrow keys to navigate, Enter to select, Space to sort columns',
      form: 'Use Tab to navigate between fields, Enter to submit, Escape to cancel',
      menu: 'Use arrow keys to navigate, Enter to select, Escape to close',
      modal: 'Use Tab to navigate, Escape to close',
      chart: 'Use arrow keys to navigate data points, Enter for details',
    }

    return (
      instructions[context as keyof typeof instructions] ||
      'Use Tab to navigate, Enter to select'
    )
  }
}

/**
 * Screen reader only CSS class utility
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
}

/**
 * Focus visible styles for keyboard navigation
 */
export const focusVisibleStyles = (theme: {
  palette: { primary: { main: string } }
}) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderRadius: '4px',
  },
})

/**
 * High contrast mode styles
 */
export const highContrastStyles = (theme: {
  palette: { text: { primary: string }; background: { paper: string } }
}) => ({
  '@media (prefers-contrast: high)': {
    border: `1px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
})

/**
 * Reduced motion styles
 */
export const reducedMotionStyles = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'none',
  },
}

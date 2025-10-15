/**
 * Accessibility testing utilities for automated compliance checking
 */

import { ColorContrastUtils } from './colorContrast'

export interface AccessibilityTestResult {
  passed: boolean
  score: number
  issues: AccessibilityIssue[]
  recommendations: string[]
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  category: 'contrast' | 'aria' | 'keyboard' | 'structure' | 'semantics'
  message: string
  element?: HTMLElement
  suggestion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriterion: string
}

export class AccessibilityTesting {
  /**
   * Run comprehensive accessibility tests on the current page
   */
  static async runFullAudit(): Promise<AccessibilityTestResult> {
    const issues: AccessibilityIssue[] = []

    // Run all test categories
    issues.push(...(await this.testColorContrast()))
    issues.push(...this.testAriaLabels())
    issues.push(...this.testKeyboardNavigation())
    issues.push(...this.testSemanticStructure())
    issues.push(...this.testFormLabels())
    issues.push(...this.testImageAltText())
    issues.push(...this.testHeadingStructure())
    issues.push(...this.testLandmarks())
    issues.push(...this.testFocusManagement())
    issues.push(...this.testLiveRegions())

    const errorCount = issues.filter(issue => issue.type === 'error').length
    const warningCount = issues.filter(issue => issue.type === 'warning').length

    // Calculate score based on issues
    const totalTests = 50 // Approximate number of tests
    const passedTests = totalTests - errorCount - warningCount * 0.5
    const score = Math.max(0, Math.round((passedTests / totalTests) * 100))

    const recommendations = this.generateRecommendations(issues)

    return {
      passed: errorCount === 0,
      score,
      issues,
      recommendations,
    }
  }

  /**
   * Test color contrast ratios
   */
  static async testColorContrast(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []

    // Get all text elements
    const textElements = document.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, button, a, label'
    )

    for (const element of textElements) {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Skip if no background color or transparent
      if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)') continue

      try {
        const foregroundHex = this.rgbToHex(color)
        const backgroundHex = this.rgbToHex(backgroundColor)

        if (foregroundHex && backgroundHex) {
          const result = ColorContrastUtils.checkAccessibility(
            foregroundHex,
            backgroundHex
          )

          if (!result.passes.normalText) {
            issues.push({
              type: 'error',
              category: 'contrast',
              message: `Insufficient color contrast ratio: ${result.ratio}:1`,
              element: element as HTMLElement,
              suggestion:
                'Increase contrast between text and background colors to meet WCAG AA standard (4.5:1)',
              wcagLevel: 'AA',
              wcagCriterion: '1.4.3 Contrast (Minimum)',
            })
          } else if (result.level === 'AA' && result.ratio < 7) {
            issues.push({
              type: 'warning',
              category: 'contrast',
              message: `Color contrast could be improved: ${result.ratio}:1`,
              element: element as HTMLElement,
              suggestion:
                'Consider using higher contrast colors for AAA compliance (7:1)',
              wcagLevel: 'AAA',
              wcagCriterion: '1.4.6 Contrast (Enhanced)',
            })
          }
        }
      } catch {
        // Skip elements with complex color values
      }
    }

    return issues
  }

  /**
   * Test ARIA labels and attributes
   */
  static testAriaLabels(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Test buttons without accessible names
    const buttons = document.querySelectorAll('button')
    buttons.forEach(button => {
      if (!this.hasAccessibleName(button)) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Button missing accessible name',
          element: button as HTMLElement,
          suggestion:
            'Add aria-label, aria-labelledby, or text content to button',
          wcagLevel: 'A',
          wcagCriterion: '4.1.2 Name, Role, Value',
        })
      }
    })

    // Test form inputs without labels
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      if (!this.hasAccessibleName(input)) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Form input missing label',
          element: input as HTMLElement,
          suggestion: 'Associate input with a label element or add aria-label',
          wcagLevel: 'A',
          wcagCriterion: '3.3.2 Labels or Instructions',
        })
      }
    })

    // Test images without alt text
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Image missing alt attribute',
          element: img as HTMLElement,
          suggestion:
            'Add alt attribute to describe image content or use alt="" for decorative images',
          wcagLevel: 'A',
          wcagCriterion: '1.1.1 Non-text Content',
        })
      }
    })

    return issues
  }

  /**
   * Test keyboard navigation
   */
  static testKeyboardNavigation(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Test focusable elements
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex')

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          type: 'warning',
          category: 'keyboard',
          message: 'Positive tabindex detected (anti-pattern)',
          element: element as HTMLElement,
          suggestion: 'Use tabindex="0" or rely on natural tab order',
          wcagLevel: 'A',
          wcagCriterion: '2.4.3 Focus Order',
        })
      }
    })

    return issues
  }

  /**
   * Test semantic structure
   */
  static testSemanticStructure(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Test for main landmark
    const mainElements = document.querySelectorAll('main, [role="main"]')
    if (mainElements.length === 0) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Page missing main landmark',
        suggestion:
          'Add <main> element or role="main" to identify main content',
        wcagLevel: 'A',
        wcagCriterion: '1.3.1 Info and Relationships',
      })
    } else if (mainElements.length > 1) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Multiple main landmarks detected',
        suggestion: 'Use only one main landmark per page',
        wcagLevel: 'A',
        wcagCriterion: '1.3.1 Info and Relationships',
      })
    }

    return issues
  }

  /**
   * Test form labels
   */
  static testFormLabels(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      if (!this.hasAccessibleName(form)) {
        issues.push({
          type: 'info',
          category: 'aria',
          message: 'Form missing accessible name',
          element: form as HTMLElement,
          suggestion: 'Add aria-label or aria-labelledby to form element',
          wcagLevel: 'AA',
          wcagCriterion: '2.4.6 Headings and Labels',
        })
      }
    })

    return issues
  }

  /**
   * Test image alt text
   */
  static testImageAltText(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    const images = document.querySelectorAll('img')
    images.forEach(img => {
      const altText = img.getAttribute('alt')

      if (
        altText &&
        (altText.includes('image') || altText.includes('picture'))
      ) {
        issues.push({
          type: 'warning',
          category: 'aria',
          message: 'Alt text contains redundant words',
          element: img as HTMLElement,
          suggestion:
            'Describe the content of the image, not that it is an image',
          wcagLevel: 'A',
          wcagCriterion: '1.1.1 Non-text Content',
        })
      }
    })

    return issues
  }

  /**
   * Test heading structure
   */
  static testHeadingStructure(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))

      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'structure',
          message: `Heading level skipped (h${previousLevel} to h${level})`,
          element: heading as HTMLElement,
          suggestion:
            'Use sequential heading levels for proper document structure',
          wcagLevel: 'AA',
          wcagCriterion: '2.4.6 Headings and Labels',
        })
      }

      previousLevel = level
    })

    return issues
  }

  /**
   * Test landmarks
   */
  static testLandmarks(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for navigation landmark
    const navElements = document.querySelectorAll('nav, [role="navigation"]')
    if (navElements.length === 0) {
      issues.push({
        type: 'info',
        category: 'structure',
        message: 'No navigation landmark found',
        suggestion:
          'Add <nav> element or role="navigation" for main navigation',
        wcagLevel: 'AA',
        wcagCriterion: '2.4.1 Bypass Blocks',
      })
    }

    return issues
  }

  /**
   * Test focus management
   */
  static testFocusManagement(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Test for focus traps in modals
    const modals = document.querySelectorAll(
      '[role="dialog"], [aria-modal="true"]'
    )
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) {
        issues.push({
          type: 'warning',
          category: 'keyboard',
          message: 'Modal has no focusable elements',
          element: modal as HTMLElement,
          suggestion: 'Ensure modals contain at least one focusable element',
          wcagLevel: 'AA',
          wcagCriterion: '2.4.3 Focus Order',
        })
      }
    })

    return issues
  }

  /**
   * Test live regions
   */
  static testLiveRegions(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    const liveRegions = document.querySelectorAll('[aria-live]')
    if (liveRegions.length === 0) {
      issues.push({
        type: 'info',
        category: 'aria',
        message: 'No ARIA live regions found',
        suggestion: 'Consider adding live regions for dynamic content updates',
        wcagLevel: 'AA',
        wcagCriterion: '4.1.3 Status Messages',
      })
    }

    return issues
  }

  /**
   * Check if element has accessible name
   */
  private static hasAccessibleName(element: Element): boolean {
    const hasAriaLabel = element.hasAttribute('aria-label')
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby')
    const hasTextContent = element.textContent?.trim()
    const hasLabel =
      element.id && document.querySelector(`label[for="${element.id}"]`)

    return !!(hasAriaLabel || hasAriaLabelledBy || hasTextContent || hasLabel)
  }

  /**
   * Convert RGB to hex
   */
  private static rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return null

    const [, r, g, b] = match
    return `#${[r, g, b]
      .map(x => {
        const hex = parseInt(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')}`
  }

  /**
   * Generate recommendations based on issues
   */
  private static generateRecommendations(
    issues: AccessibilityIssue[]
  ): string[] {
    const recommendations: string[] = []

    const errorCount = issues.filter(issue => issue.type === 'error').length
    const warningCount = issues.filter(issue => issue.type === 'warning').length

    if (errorCount > 0) {
      recommendations.push(
        `Fix ${errorCount} critical accessibility error${errorCount > 1 ? 's' : ''} first`
      )
    }

    if (warningCount > 0) {
      recommendations.push(
        `Address ${warningCount} accessibility warning${warningCount > 1 ? 's' : ''} to improve compliance`
      )
    }

    const contrastIssues = issues.filter(
      issue => issue.category === 'contrast'
    ).length
    if (contrastIssues > 0) {
      recommendations.push(
        'Review color choices to ensure sufficient contrast ratios'
      )
    }

    const ariaIssues = issues.filter(issue => issue.category === 'aria').length
    if (ariaIssues > 0) {
      recommendations.push(
        'Add proper ARIA labels and attributes for screen reader support'
      )
    }

    const keyboardIssues = issues.filter(
      issue => issue.category === 'keyboard'
    ).length
    if (keyboardIssues > 0) {
      recommendations.push('Improve keyboard navigation and focus management')
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Great job! Your application meets accessibility standards'
      )
    }

    return recommendations
  }
}

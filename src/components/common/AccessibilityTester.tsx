import React, { useState, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Accessibility,
  Visibility,
  Keyboard,
  VolumeUp,
} from '@mui/icons-material'
import { ColorContrastUtils } from '../../utils/colorContrast'

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  category: 'contrast' | 'aria' | 'keyboard' | 'structure'
  message: string
  element?: HTMLElement
  suggestion?: string
}

interface AccessibilityTestResult {
  score: number
  issues: AccessibilityIssue[]
  passedTests: number
  totalTests: number
}

export const AccessibilityTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<AccessibilityTestResult | null>(null)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const runAccessibilityTests = async () => {
    setIsRunning(true)
    setProgress(0)

    const issues: AccessibilityIssue[] = []
    let passedTests = 0
    const totalTests = 8 // Number of test categories

    // Test 1: Color Contrast
    setProgress(12.5)
    const contrastIssues = await testColorContrast()
    issues.push(...contrastIssues)
    if (contrastIssues.length === 0) passedTests++

    // Test 2: ARIA Labels
    setProgress(25)
    const ariaIssues = testAriaLabels()
    issues.push(...ariaIssues)
    if (ariaIssues.length === 0) passedTests++

    // Test 3: Keyboard Navigation
    setProgress(37.5)
    const keyboardIssues = testKeyboardNavigation()
    issues.push(...keyboardIssues)
    if (keyboardIssues.length === 0) passedTests++

    // Test 4: Semantic Structure
    setProgress(50)
    const structureIssues = testSemanticStructure()
    issues.push(...structureIssues)
    if (structureIssues.length === 0) passedTests++

    // Test 5: Form Labels
    setProgress(62.5)
    const formIssues = testFormLabels()
    issues.push(...formIssues)
    if (formIssues.length === 0) passedTests++

    // Test 6: Image Alt Text
    setProgress(75)
    const imageIssues = testImageAltText()
    issues.push(...imageIssues)
    if (imageIssues.length === 0) passedTests++

    // Test 7: Focus Management
    setProgress(87.5)
    const focusIssues = testFocusManagement()
    issues.push(...focusIssues)
    if (focusIssues.length === 0) passedTests++

    // Test 8: Screen Reader Support
    setProgress(100)
    const screenReaderIssues = testScreenReaderSupport()
    issues.push(...screenReaderIssues)
    if (screenReaderIssues.length === 0) passedTests++

    const score = Math.round((passedTests / totalTests) * 100)

    setResults({
      score,
      issues,
      passedTests,
      totalTests,
    })

    setIsRunning(false)
  }

  const testColorContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = []

    // Get all text elements
    const textElements = document.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, button, a'
    )

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Skip if no background color or transparent
      if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)') return

      try {
        // Convert colors to hex for testing
        const foregroundHex = rgbToHex(color)
        const backgroundHex = rgbToHex(backgroundColor)

        if (foregroundHex && backgroundHex) {
          const result = ColorContrastUtils.checkAccessibility(
            foregroundHex,
            backgroundHex
          )

          if (!result.passes.normalText) {
            issues.push({
              type: 'error',
              category: 'contrast',
              message: `Insufficient color contrast ratio: ${result.ratio}:1 (minimum 4.5:1 required)`,
              element: element as HTMLElement,
              suggestion:
                'Increase contrast between text and background colors',
            })
          } else if (result.level === 'AA' && result.ratio < 7.0) {
            issues.push({
              type: 'warning',
              category: 'contrast',
              message: `Color contrast could be improved: ${result.ratio}:1 (7:1 recommended for AAA)`,
              element: element as HTMLElement,
              suggestion:
                'Consider using higher contrast colors for better accessibility',
            })
          }
        }
      } catch {
        // Skip elements with complex color values
      }
    })

    return issues
  }

  const testAriaLabels = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = []

    // Test buttons without accessible names
    const buttons = document.querySelectorAll('button')
    buttons.forEach(button => {
      const hasAriaLabel = button.hasAttribute('aria-label')
      const hasAriaLabelledBy = button.hasAttribute('aria-labelledby')
      const hasTextContent = button.textContent?.trim()

      if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Button missing accessible name',
          element: button as HTMLElement,
          suggestion:
            'Add aria-label, aria-labelledby, or text content to button',
        })
      }
    })

    // Test form inputs without labels
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`)
      const hasAriaLabel = input.hasAttribute('aria-label')
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby')

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Form input missing label',
          element: input as HTMLElement,
          suggestion: 'Associate input with a label element or add aria-label',
        })
      }
    })

    return issues
  }

  const testKeyboardNavigation = (): AccessibilityIssue[] => {
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
        })
      }

      // Check if element is visible but not focusable
      const styles = window.getComputedStyle(element)
      if (
        styles.display !== 'none' &&
        styles.visibility !== 'hidden' &&
        tabIndex === '-1'
      ) {
        issues.push({
          type: 'info',
          category: 'keyboard',
          message: 'Interactive element not keyboard accessible',
          element: element as HTMLElement,
          suggestion: 'Ensure interactive elements are keyboard focusable',
        })
      }
    })

    return issues
  }

  const testSemanticStructure = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = []

    // Test heading hierarchy
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
        })
      }

      previousLevel = level
    })

    // Test for main landmark
    const mainElements = document.querySelectorAll('main, [role="main"]')
    if (mainElements.length === 0) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Page missing main landmark',
        suggestion:
          'Add <main> element or role="main" to identify main content',
      })
    } else if (mainElements.length > 1) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Multiple main landmarks detected',
        suggestion: 'Use only one main landmark per page',
      })
    }

    return issues
  }

  const testFormLabels = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = []

    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      // Check if form has accessible name
      const hasAriaLabel = form.hasAttribute('aria-label')
      const hasAriaLabelledBy = form.hasAttribute('aria-labelledby')

      if (!hasAriaLabel && !hasAriaLabelledBy) {
        issues.push({
          type: 'info',
          category: 'aria',
          message: 'Form missing accessible name',
          element: form as HTMLElement,
          suggestion: 'Add aria-label or aria-labelledby to form element',
        })
      }
    })

    return issues
  }

  const testImageAltText = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = []

    const images = document.querySelectorAll('img')
    images.forEach(img => {
      const hasAlt = img.hasAttribute('alt')
      const altText = img.getAttribute('alt')

      if (!hasAlt) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'Image missing alt attribute',
          element: img as HTMLElement,
          suggestion:
            'Add alt attribute to describe image content or use alt="" for decorative images',
        })
      } else if (
        altText &&
        (altText.includes('image') || altText.includes('picture'))
      ) {
        issues.push({
          type: 'warning',
          category: 'aria',
          message:
            'Alt text contains redundant words like "image" or "picture"',
          element: img as HTMLElement,
          suggestion:
            'Describe the content of the image, not that it is an image',
        })
      }
    })

    return issues
  }

  const testFocusManagement = (): AccessibilityIssue[] => {
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
        })
      }
    })

    return issues
  }

  const testScreenReaderSupport = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = []

    // Test for live regions
    const liveRegions = document.querySelectorAll('[aria-live]')
    if (liveRegions.length === 0) {
      issues.push({
        type: 'info',
        category: 'aria',
        message: 'No ARIA live regions found',
        suggestion: 'Consider adding live regions for dynamic content updates',
      })
    }

    // Test for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]')
    const hasSkipToMain = Array.from(skipLinks).some(
      link =>
        link.textContent?.toLowerCase().includes('skip') &&
        link.textContent?.toLowerCase().includes('main')
    )

    if (!hasSkipToMain) {
      issues.push({
        type: 'warning',
        category: 'keyboard',
        message: 'No skip to main content link found',
        suggestion: 'Add skip links to help keyboard users navigate quickly',
      })
    }

    return issues
  }

  // Helper function to convert RGB to hex
  const rgbToHex = (rgb: string): string | null => {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'warning'
    return 'error'
  }

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <Error color="error" />
      case 'warning':
        return <Warning color="warning" />
      case 'info':
        return <Info color="info" />
      default:
        return <CheckCircle color="success" />
    }
  }

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'contrast':
        return <Visibility />
      case 'aria':
        return <VolumeUp />
      case 'keyboard':
        return <Keyboard />
      case 'structure':
        return <Accessibility />
      default:
        return <Info />
    }
  }

  return (
    <Card ref={containerRef} sx={{ maxWidth: 800, margin: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginBottom: 3,
          }}
        >
          <Accessibility color="primary" />
          <Typography variant="h5" component="h2">
            Accessibility Tester
          </Typography>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ marginBottom: 3 }}
        >
          Run comprehensive accessibility tests to identify potential issues and
          improve compliance with WCAG guidelines.
        </Typography>

        <Button
          variant="contained"
          onClick={runAccessibilityTests}
          disabled={isRunning}
          sx={{ marginBottom: 3 }}
        >
          {isRunning ? 'Running Tests...' : 'Run Accessibility Tests'}
        </Button>

        {isRunning && (
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              Testing in progress...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {results && (
          <Box>
            <Alert
              severity={getScoreColor(results.score)}
              sx={{ marginBottom: 3 }}
            >
              <Typography variant="h6">
                Accessibility Score: {results.score}/100
              </Typography>
              <Typography variant="body2">
                {results.passedTests} of {results.totalTests} test categories
                passed
              </Typography>
            </Alert>

            {results.issues.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  Issues Found ({results.issues.length})
                </Typography>

                {['error', 'warning', 'info'].map(type => {
                  const typeIssues = results.issues.filter(
                    issue => issue.type === type
                  )
                  if (typeIssues.length === 0) return null

                  return (
                    <Accordion key={type} defaultExpanded={type === 'error'}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {getIssueIcon(type as AccessibilityIssue['type'])}
                          <Typography
                            variant="subtitle1"
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {type} ({typeIssues.length})
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {typeIssues.map((issue, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {getCategoryIcon(issue.category)}
                              </ListItemIcon>
                              <ListItemText
                                primary={issue.message}
                                secondary={issue.suggestion}
                              />
                              <Chip
                                label={issue.category}
                                size="small"
                                variant="outlined"
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )
                })}
              </Box>
            ) : (
              <Alert severity="success">
                <Typography variant="h6">
                  Excellent! No accessibility issues found.
                </Typography>
                <Typography variant="body2">
                  Your application meets all tested accessibility standards.
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AccessibilityTester

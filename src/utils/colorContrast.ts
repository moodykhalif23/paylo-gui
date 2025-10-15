/**
 * Color contrast utilities for accessibility compliance
 */

export interface ColorContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'A' | 'FAIL'
  passes: {
    normalText: boolean
    largeText: boolean
    uiComponents: boolean
  }
}

export class ColorContrastUtils {
  /**
   * Convert hex color to RGB values
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) {
      throw new Error('Invalid color format. Please use hex colors.')
    }

    const lum1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * Check if color combination meets WCAG accessibility standards
   */
  static checkAccessibility(
    foreground: string,
    background: string
  ): ColorContrastResult {
    const ratio = this.getContrastRatio(foreground, background)

    // WCAG 2.1 standards
    const passes = {
      normalText: ratio >= 4.5, // AA standard for normal text
      largeText: ratio >= 3.0, // AA standard for large text (18pt+ or 14pt+ bold)
      uiComponents: ratio >= 3.0, // AA standard for UI components
    }

    let level: ColorContrastResult['level']
    if (ratio >= 7.0) {
      level = 'AAA' // Enhanced contrast
    } else if (ratio >= 4.5) {
      level = 'AA' // Standard contrast
    } else if (ratio >= 3.0) {
      level = 'A' // Minimum contrast
    } else {
      level = 'FAIL' // Does not meet standards
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      passes,
    }
  }

  /**
   * Get high contrast version of a color
   */
  static getHighContrastColor(
    color: string,
    background: string = '#ffffff'
  ): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    // Check if current color has sufficient contrast
    const currentContrast = this.getContrastRatio(color, background)
    if (currentContrast >= 7.0) {
      return color // Already high contrast
    }

    // Determine if we should make it darker or lighter
    const backgroundRgb = this.hexToRgb(background)
    if (!backgroundRgb) return color

    const backgroundLum = this.getRelativeLuminance(
      backgroundRgb.r,
      backgroundRgb.g,
      backgroundRgb.b
    )

    // If background is light, make color darker; if dark, make color lighter
    if (backgroundLum > 0.5) {
      // Light background - make color darker
      return this.adjustColorForContrast(rgb, background, 'darker')
    } else {
      // Dark background - make color lighter
      return this.adjustColorForContrast(rgb, background, 'lighter')
    }
  }

  /**
   * Adjust color to meet contrast requirements
   */
  private static adjustColorForContrast(
    rgb: { r: number; g: number; b: number },
    background: string,
    direction: 'darker' | 'lighter'
  ): string {
    let { r, g, b } = rgb
    const step = direction === 'darker' ? -10 : 10

    // Iteratively adjust color until we meet contrast requirements
    for (let i = 0; i < 25; i++) {
      // Max 25 iterations to prevent infinite loop
      const testColor = this.rgbToHex(r, g, b)
      const contrast = this.getContrastRatio(testColor, background)

      if (contrast >= 7.0) {
        return testColor
      }

      // Adjust RGB values
      r = Math.max(0, Math.min(255, r + step))
      g = Math.max(0, Math.min(255, g + step))
      b = Math.max(0, Math.min(255, b + step))

      // Stop if we've reached the limit
      if (
        (direction === 'darker' && r === 0 && g === 0 && b === 0) ||
        (direction === 'lighter' && r === 255 && g === 255 && b === 255)
      ) {
        break
      }
    }

    return this.rgbToHex(r, g, b)
  }

  /**
   * Convert RGB to hex
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = Math.round(x).toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')
    )
  }

  /**
   * Get accessible color palette
   */
  static getAccessiblePalette(baseColor: string): {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  } {
    return {
      primary: this.getHighContrastColor(baseColor),
      secondary: this.getHighContrastColor('#6c757d'),
      success: this.getHighContrastColor('#28a745'),
      warning: this.getHighContrastColor('#ffc107', '#000000'), // Warning needs dark background
      error: this.getHighContrastColor('#dc3545'),
      info: this.getHighContrastColor('#17a2b8'),
    }
  }

  /**
   * Check if system prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  /**
   * Get system color scheme preference
   */
  static getColorSchemePreference(): 'light' | 'dark' | 'no-preference' {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'no-preference'
  }
}

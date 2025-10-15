import { createTheme, ThemeOptions } from '@mui/material/styles'

// Extend MUI theme to include custom Typography variants
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    srOnly: true
  }
}

// Custom color palette with accessibility considerations
const palette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
}

// High contrast palette for accessibility
const highContrastPalette = {
  primary: {
    main: '#000000',
    light: '#333333',
    dark: '#000000',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ffffff',
    light: '#ffffff',
    dark: '#cccccc',
    contrastText: '#000000',
  },
  success: {
    main: '#006600',
    light: '#009900',
    dark: '#003300',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#cc6600',
    light: '#ff9900',
    dark: '#993300',
    contrastText: '#ffffff',
  },
  error: {
    main: '#cc0000',
    light: '#ff3333',
    dark: '#990000',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0066cc',
    light: '#3399ff',
    dark: '#003399',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  text: {
    primary: '#000000',
    secondary: '#333333',
  },
}

// Create accessible theme function
export const createAccessibleTheme = (
  options: {
    highContrast?: boolean
    fontSize?: 'small' | 'medium' | 'large'
    reducedMotion?: boolean
  } = {}
) => {
  const {
    highContrast = false,
    fontSize = 'medium',
    reducedMotion = false,
  } = options

  // Font scale based on accessibility preferences
  const fontScale =
    fontSize === 'small' ? 0.875 : fontSize === 'large' ? 1.125 : 1

  const themeOptions: ThemeOptions = {
    palette: highContrast ? highContrastPalette : palette,
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14 * fontScale,
      h1: {
        fontSize: `${2.5 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: `${2 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: `${1.75 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: `${1.5 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: `${1.25 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: `${1 * fontScale}rem`,
        fontWeight: 500,
        lineHeight: 1.6,
      },
      body1: {
        fontSize: `${1 * fontScale}rem`,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: `${0.875 * fontScale}rem`,
        lineHeight: 1.43,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      // Enhanced button accessibility
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'none',
            fontWeight: 500,
            minHeight: '44px', // WCAG minimum touch target
            '&:focus-visible': {
              outline: `3px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
              borderRadius: '4px',
            },
            // High contrast mode
            ...(highContrast && {
              border: `2px solid ${theme.palette.text.primary}`,
              '&:hover': {
                backgroundColor: theme.palette.text.primary,
                color: theme.palette.background.paper,
              },
            }),
            // Reduced motion
            ...(reducedMotion && {
              transition: 'none',
              '&:hover': {
                transform: 'none',
              },
            }),
          }),
        },
      },

      // Enhanced card accessibility
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: highContrast
              ? `0 0 0 2px ${theme.palette.text.primary}`
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: highContrast
                ? `0 0 0 3px ${theme.palette.text.primary}`
                : '0 4px 16px rgba(0, 0, 0, 0.15)',
            },
            '&:focus-within': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
            ...(reducedMotion && {
              transition: 'none',
            }),
          }),
        },
      },

      // Enhanced input accessibility
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiInputBase-root': {
              minHeight: '44px', // WCAG minimum touch target
              '&:focus-within': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              },
              ...(highContrast && {
                border: `2px solid ${theme.palette.text.primary}`,
                backgroundColor: theme.palette.background.paper,
              }),
            },
            '& .MuiInputLabel-root': {
              fontSize: `${1 * fontScale}rem`,
              '&.Mui-focused': {
                fontWeight: 600,
              },
            },
            '& .MuiFormHelperText-root': {
              fontSize: `${0.875 * fontScale}rem`,
              lineHeight: 1.5,
            },
          }),
        },
      },

      // Enhanced table accessibility
      MuiTable: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: highContrast
                ? theme.palette.background.paper
                : theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            '& .MuiTableRow-root': {
              '&:focus-within': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '-2px',
              },
              '&:hover': {
                backgroundColor: highContrast
                  ? theme.palette.action.selected
                  : theme.palette.action.hover,
              },
            },
          }),
        },
      },

      // Enhanced navigation accessibility
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: highContrast
              ? `0 2px 0 ${theme.palette.text.primary}`
              : '0 1px 3px rgba(0, 0, 0, 0.12)',
          }),
        },
      },

      // Enhanced link accessibility
      MuiLink: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
              borderRadius: '2px',
            },
            textDecorationLine: 'underline',
            textDecorationThickness: '2px',
            textUnderlineOffset: '2px',
            ...(highContrast && {
              textDecorationThickness: '3px',
              fontWeight: 600,
            }),
          }),
        },
      },

      // Enhanced chip accessibility
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: '32px',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
            ...(highContrast && {
              border: `2px solid ${theme.palette.text.primary}`,
              fontWeight: 600,
            }),
          }),
        },
      },

      // Screen reader only content
      MuiTypography: {
        variants: [
          {
            props: { variant: 'srOnly' },
            style: {
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            },
          },
        ],
      },
    },
  }

  return createTheme(themeOptions)
}

// Default theme
export const theme = createAccessibleTheme()

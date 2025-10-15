import React, { forwardRef } from 'react'
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Info as InfoIcon,
} from '@mui/icons-material'
import { AccessibilityUtils } from '../../utils/accessibility'
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface AccessibleTextFieldProps extends Omit<TextFieldProps, 'id'> {
  name: string
  description?: string
  errorMessage?: string
  showPasswordToggle?: boolean
  infoTooltip?: string
}

export const AccessibleTextField = forwardRef<
  HTMLInputElement,
  AccessibleTextFieldProps
>(
  (
    {
      name,
      label,
      description,
      errorMessage,
      required = false,
      showPasswordToggle = false,
      infoTooltip,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const { settings } = useAccessibility()
    const [showPassword, setShowPassword] = React.useState(false)

    const fieldId = AccessibilityUtils.generateId(name)
    const helpId = AccessibilityUtils.generateId(`${name}-help`)
    const errorId = AccessibilityUtils.generateId(`${name}-error`)
    const infoId = AccessibilityUtils.generateId(`${name}-info`)

    const ariaLabel = AccessibilityUtils.createAriaLabel(
      String(label || name || ''),
      required,
      description
    )

    const actualType =
      showPasswordToggle && type === 'password'
        ? showPassword
          ? 'text'
          : 'password'
        : type

    const describedByIds =
      [
        description ? helpId : null,
        errorMessage ? errorId : null,
        infoTooltip ? infoId : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <FormControl fullWidth error={!!errorMessage}>
        <TextField
          {...props}
          ref={ref}
          id={fieldId}
          name={name}
          label={label}
          type={actualType}
          required={required}
          error={!!errorMessage}
          aria-label={ariaLabel}
          aria-describedby={describedByIds}
          aria-invalid={!!errorMessage}
          InputProps={{
            ...props.InputProps,
            'aria-required': required,
            endAdornment: (
              <>
                {showPasswordToggle && type === 'password' && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}
                {infoTooltip && (
                  <InputAdornment position="end">
                    <Tooltip title={infoTooltip} arrow>
                      <IconButton
                        aria-label="Additional information"
                        aria-describedby={infoId}
                        size="small"
                        edge="end"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )}
                {props.InputProps?.endAdornment}
              </>
            ),
          }}
          sx={{
            ...props.sx,
            '& .MuiInputBase-root': {
              minHeight: '48px', // Enhanced touch target
              '&:focus-within': {
                outline: settings.keyboardNavigation ? '2px solid' : 'none',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            },
          }}
        />

        {description && (
          <FormHelperText id={helpId}>{description}</FormHelperText>
        )}

        {errorMessage && (
          <FormHelperText id={errorId} error role="alert">
            {errorMessage}
          </FormHelperText>
        )}

        {infoTooltip && (
          <div
            id={infoId}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {infoTooltip}
          </div>
        )}
      </FormControl>
    )
  }
)

AccessibleTextField.displayName = 'AccessibleTextField'

export default AccessibleTextField

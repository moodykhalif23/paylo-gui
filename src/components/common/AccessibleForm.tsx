import React, { ReactNode, FormEvent, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Alert,
  FormControl,
  FormHelperText,
  TextField,
  TextFieldProps,
  Button,
  ButtonProps,
} from '@mui/material'
import { AccessibilityUtils } from '../../utils/accessibility'
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface AccessibleFormProps {
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  title: string
  description?: string
  errors?: string[]
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  autoFocus?: boolean
}

interface AccessibleTextFieldProps extends Omit<TextFieldProps, 'id'> {
  name: string
  description?: string
  errorMessage?: string
}

interface AccessibleButtonProps extends ButtonProps {
  loadingText?: string
  keyboardShortcut?: string
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  title,
  description,
  errors = [],
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  autoFocus = true,
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const { announceMessage } = useAccessibility()
  const formId = AccessibilityUtils.generateId('form')
  const titleId = AccessibilityUtils.generateId('form-title')
  const descriptionId = AccessibilityUtils.generateId('form-description')
  const errorsId = AccessibilityUtils.generateId('form-errors')

  useEffect(() => {
    if (autoFocus && formRef.current) {
      const firstInput = formRef.current.querySelector(
        'input, select, textarea'
      ) as HTMLElement
      if (firstInput) {
        firstInput.focus()
      }
    }
  }, [autoFocus])

  useEffect(() => {
    if (errors.length > 0) {
      announceMessage(
        `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}`,
        'assertive'
      )
    }
  }, [errors, announceMessage])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return
    onSubmit(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && onCancel) {
      onCancel()
    }
  }

  return (
    <Box
      component="form"
      ref={formRef}
      id={formId}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      role="form"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-invalid={errors.length > 0}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 600,
        margin: '0 auto',
        padding: 3,
      }}
    >
      <Typography
        id={titleId}
        variant="h4"
        component="h1"
        sx={{ marginBottom: 1 }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          id={descriptionId}
          variant="body1"
          color="text.secondary"
          sx={{ marginBottom: 2 }}
        >
          {description}
        </Typography>
      )}

      {errors.length > 0 && (
        <Alert
          severity="error"
          id={errorsId}
          role="alert"
          aria-live="assertive"
          sx={{ marginBottom: 2 }}
        >
          <Typography variant="body2" component="div">
            {errors.length === 1 ? (
              errors[0]
            ) : (
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </Box>
            )}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
          marginTop: 3,
        }}
      >
        {onCancel && (
          <AccessibleButton
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </AccessibleButton>
        )}
        <AccessibleButton
          type="submit"
          variant="contained"
          disabled={isLoading}
          loadingText="Processing..."
        >
          {isLoading ? 'Processing...' : submitLabel}
        </AccessibleButton>
      </Box>
    </Box>
  )
}

export const AccessibleTextField: React.FC<AccessibleTextFieldProps> = ({
  name,
  label,
  description,
  errorMessage,
  required = false,
  ...props
}) => {
  const fieldId = AccessibilityUtils.generateId(name)
  const helpId = AccessibilityUtils.generateId(`${name}-help`)
  const errorId = AccessibilityUtils.generateId(`${name}-error`)

  const ariaLabel = AccessibilityUtils.createAriaLabel(
    typeof label === 'string' ? label : String(name),
    required,
    description
  )

  return (
    <FormControl fullWidth error={!!errorMessage}>
      <TextField
        {...props}
        id={fieldId}
        name={name}
        label={label}
        required={required}
        error={!!errorMessage}
        aria-label={ariaLabel}
        aria-describedby={
          [description ? helpId : null, errorMessage ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={!!errorMessage}
        InputProps={{
          ...props.InputProps,
          'aria-required': required,
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
    </FormControl>
  )
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  loadingText: _loadingText,
  keyboardShortcut,
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (keyboardShortcut && buttonRef.current) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === keyboardShortcut &&
          (event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault()
          buttonRef.current?.click()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [keyboardShortcut])

  const ariaLabel = keyboardShortcut
    ? `${children} (Keyboard shortcut: Ctrl+${keyboardShortcut})`
    : children?.toString()

  return (
    <Button
      {...props}
      ref={buttonRef}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={keyboardShortcut ? 'keyboard-shortcut-help' : undefined}
      sx={{
        ...props.sx,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      {children}
    </Button>
  )
}

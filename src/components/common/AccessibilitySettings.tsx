import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Accessibility as AccessibilityIcon,
  Contrast as ContrastIcon,
  TextFields as TextFieldsIcon,
  Keyboard as KeyboardIcon,
  VolumeUp as VolumeUpIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface AccessibilitySettingsProps {
  open?: boolean
  onClose?: () => void
  compact?: boolean
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  open = false,
  onClose,
  compact = false,
}) => {
  const { settings, updateSettings, announceMessage } = useAccessibility()
  const [isOpen, setIsOpen] = useState(open)

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      announceMessage('Accessibility settings opened')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
    announceMessage('Accessibility settings closed')
  }

  const handleSettingChange = (
    setting: string,
    value: boolean | string | number
  ) => {
    updateSettings({ [setting]: value })
    announceMessage(`${setting} ${value ? 'enabled' : 'disabled'}`)
  }

  const resetToDefaults = () => {
    updateSettings({
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReaderMode: false,
      keyboardNavigation: false,
      focusIndicators: true,
      skipLinks: true,
      announcements: true,
    })
    announceMessage('Accessibility settings reset to defaults')
  }

  if (compact) {
    return (
      <Tooltip title="Accessibility Settings">
        <IconButton
          onClick={handleToggle}
          aria-label="Open accessibility settings"
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          <AccessibilityIcon />
        </IconButton>
      </Tooltip>
    )
  }

  if (!isOpen) {
    return (
      <Button
        variant="outlined"
        startIcon={<AccessibilityIcon />}
        onClick={handleToggle}
        aria-label="Open accessibility settings"
        sx={{
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
        }}
      >
        Accessibility Settings
      </Button>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: 500,
        margin: 2,
        position: 'relative',
      }}
      role="dialog"
      aria-labelledby="accessibility-settings-title"
      aria-describedby="accessibility-settings-description"
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessibilityIcon color="primary" />
            <Typography
              id="accessibility-settings-title"
              variant="h6"
              component="h2"
            >
              Accessibility Settings
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            aria-label="Close accessibility settings"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          id="accessibility-settings-description"
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 3 }}
        >
          Customize the interface to meet your accessibility needs. Changes are
          saved automatically.
        </Typography>

        <Alert severity="info" sx={{ marginBottom: 3 }}>
          <Typography variant="body2">
            These settings work alongside your system preferences. Some changes
            may require a page refresh.
          </Typography>
        </Alert>

        {/* Visual Settings */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginBottom: 2,
            }}
          >
            <ContrastIcon />
            Visual Settings
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highContrast}
                  onChange={e =>
                    handleSettingChange('highContrast', e.target.checked)
                  }
                  aria-describedby="high-contrast-help"
                />
              }
              label="High Contrast Mode"
            />
            <Typography
              id="high-contrast-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Increases color contrast for better visibility
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={e =>
                    handleSettingChange('reducedMotion', e.target.checked)
                  }
                  aria-describedby="reduced-motion-help"
                />
              }
              label="Reduce Motion"
            />
            <Typography
              id="reduced-motion-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Minimizes animations and transitions
            </Typography>
          </FormGroup>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        {/* Text Settings */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginBottom: 2,
            }}
          >
            <TextFieldsIcon />
            Text Settings
          </Typography>

          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <FormLabel id="font-size-label">Font Size</FormLabel>
            <Select
              labelId="font-size-label"
              value={settings.fontSize}
              onChange={e => handleSettingChange('fontSize', e.target.value)}
              aria-describedby="font-size-help"
            >
              <MenuItem value="small">Small (87.5%)</MenuItem>
              <MenuItem value="medium">Medium (100%)</MenuItem>
              <MenuItem value="large">Large (112.5%)</MenuItem>
            </Select>
            <Typography
              id="font-size-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginTop: 1 }}
            >
              Adjust text size for better readability
            </Typography>
          </FormControl>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        {/* Navigation Settings */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginBottom: 2,
            }}
          >
            <KeyboardIcon />
            Navigation Settings
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.keyboardNavigation}
                  onChange={e =>
                    handleSettingChange('keyboardNavigation', e.target.checked)
                  }
                  aria-describedby="keyboard-nav-help"
                />
              }
              label="Enhanced Keyboard Navigation"
            />
            <Typography
              id="keyboard-nav-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Shows focus indicators and enables keyboard shortcuts
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.focusIndicators}
                  onChange={e =>
                    handleSettingChange('focusIndicators', e.target.checked)
                  }
                  aria-describedby="focus-indicators-help"
                />
              }
              label="Enhanced Focus Indicators"
            />
            <Typography
              id="focus-indicators-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Makes focus outlines more visible for keyboard navigation
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.skipLinks}
                  onChange={e =>
                    handleSettingChange('skipLinks', e.target.checked)
                  }
                  aria-describedby="skip-links-help"
                />
              }
              label="Skip Navigation Links"
            />
            <Typography
              id="skip-links-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Provides quick navigation links for keyboard users
            </Typography>
          </FormGroup>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        {/* Screen Reader Settings */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginBottom: 2,
            }}
          >
            <VolumeUpIcon />
            Screen Reader Settings
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.screenReaderMode}
                  onChange={e =>
                    handleSettingChange('screenReaderMode', e.target.checked)
                  }
                  aria-describedby="screen-reader-help"
                />
              }
              label="Screen Reader Optimizations"
            />
            <Typography
              id="screen-reader-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Enhances compatibility with screen reading software
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.announcements}
                  onChange={e =>
                    handleSettingChange('announcements', e.target.checked)
                  }
                  aria-describedby="announcements-help"
                />
              }
              label="Live Announcements"
            />
            <Typography
              id="announcements-help"
              variant="body2"
              color="text.secondary"
              sx={{ marginLeft: 4, marginBottom: 2 }}
            >
              Enables automatic announcements for dynamic content changes
            </Typography>
          </FormGroup>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            marginTop: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={resetToDefaults}
            aria-label="Reset all accessibility settings to defaults"
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            onClick={handleClose}
            aria-label="Close accessibility settings"
          >
            Done
          </Button>
        </Box>

        {/* Keyboard Instructions */}
        <Box
          sx={{
            marginTop: 3,
            padding: 2,
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
            Keyboard Navigation Tips:
          </Typography>
          <Typography
            variant="body2"
            component="ul"
            sx={{ margin: 0, paddingLeft: 2 }}
          >
            <li>Use Tab to navigate between elements</li>
            <li>Use Enter or Space to activate buttons</li>
            <li>Use Arrow keys to navigate within components</li>
            <li>Use Escape to close dialogs and menus</li>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AccessibilitySettings

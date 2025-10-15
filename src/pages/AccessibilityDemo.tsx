import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
  Chip,
  Link,
  Divider,
} from '@mui/material'
import {
  AccessibilitySettings,
  AccessibleForm,
  AccessibleTextField as AccessibleFormTextField,
  AccessibleTextField,
  AccessibleButton,
  AccessibleModal,
  AccessibleTable,
  AriaLiveRegion,
  KeyboardNavigationProvider,
  AccessibilityTester,
} from '../components/common'
import { useAccessibility } from '../contexts/useAccessibility'

const AccessibilityDemo: React.FC = () => {
  const { announceMessage } = useAccessibility()
  const [modalOpen, setModalOpen] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preference: 'email',
    newsletter: false,
  })

  // Sample data for accessible table
  const tableData = [
    {
      id: 1,
      name: 'Bitcoin Transaction',
      amount: '0.5 BTC',
      status: 'Confirmed',
      date: '2024-01-15',
    },
    {
      id: 2,
      name: 'Ethereum Transfer',
      amount: '2.3 ETH',
      status: 'Pending',
      date: '2024-01-14',
    },
    {
      id: 3,
      name: 'Solana Payment',
      amount: '100 SOL',
      status: 'Failed',
      date: '2024-01-13',
    },
  ]

  const tableColumns = [
    { id: 'name', label: 'Transaction Name', sortable: true },
    { id: 'amount', label: 'Amount', sortable: true, align: 'right' as const },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'date', label: 'Date', sortable: true },
  ]

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    announceMessage('Form submitted successfully')
    setLiveMessage('Form has been submitted successfully!')
    setTimeout(() => setLiveMessage(''), 3000)
  }

  const handleLiveRegionTest = () => {
    const messages = [
      'Transaction completed successfully',
      'New notification received',
      'Balance updated',
      'System maintenance scheduled',
    ]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setLiveMessage(randomMessage)
    setTimeout(() => setLiveMessage(''), 3000)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <KeyboardNavigationProvider ariaLabel="Accessibility demonstration page">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
            Accessibility Features Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page demonstrates the comprehensive accessibility features
            implemented in the Paylo GUI. Use keyboard navigation, screen
            readers, and accessibility settings to explore the features.
          </Typography>
        </Box>

        {/* Accessibility Settings Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Accessibility Settings
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Customize the interface to meet your accessibility needs. These
              settings are automatically saved.
            </Typography>
            <AccessibilitySettings />
          </CardContent>
        </Card>

        {/* Live Region Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Live Region Announcements
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Screen readers will announce dynamic content changes using ARIA
              live regions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button variant="contained" onClick={handleLiveRegionTest}>
                Test Live Announcement
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  announceMessage('This is a polite announcement', 'polite')
                }
              >
                Polite Announcement
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  announceMessage(
                    'This is an assertive announcement',
                    'assertive'
                  )
                }
              >
                Assertive Announcement
              </Button>
            </Box>
            {liveMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {liveMessage}
              </Alert>
            )}
            <AriaLiveRegion message={liveMessage} priority="polite" />
          </CardContent>
        </Card>

        {/* Enhanced Accessible Components Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Enhanced Accessible Components
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              These components demonstrate enhanced accessibility features
              including ARIA labels, keyboard navigation, and screen reader
              support.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <AccessibleTextField
                  name="demo-input"
                  label="Enhanced Text Field"
                  placeholder="Type something..."
                  description="This field includes enhanced accessibility features"
                  infoTooltip="Additional information about this field"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <AccessibleTextField
                  name="demo-password"
                  label="Password Field"
                  type="password"
                  showPasswordToggle
                  description="Password field with show/hide toggle"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <AccessibleButton
                    variant="contained"
                    keyboardShortcut="s"
                    tooltip="Save your changes"
                  >
                    Save (Ctrl+S)
                  </AccessibleButton>

                  <AccessibleButton
                    variant="outlined"
                    confirmAction
                    confirmMessage="Delete this item?"
                  >
                    Delete Item
                  </AccessibleButton>

                  <AccessibleButton
                    variant="text"
                    loading={false}
                    loadingText="Processing..."
                  >
                    Process Data
                  </AccessibleButton>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Accessible Form Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Accessible Form Components
            </Typography>
            <AccessibleForm
              title="Contact Information"
              description="Please fill out your contact information. All fields marked with * are required."
              onSubmit={handleFormSubmit}
              submitLabel="Submit Form"
            >
              <AccessibleFormTextField
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                description="Enter your first and last name"
              />

              <AccessibleFormTextField
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                description="We'll use this to send you important updates"
              />

              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend">
                  Preferred Contact Method
                </FormLabel>
                <RadioGroup
                  value={formData.preference}
                  onChange={e =>
                    setFormData({ ...formData, preference: e.target.value })
                  }
                  aria-describedby="contact-preference-help"
                >
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label="Email"
                  />
                  <FormControlLabel
                    value="phone"
                    control={<Radio />}
                    label="Phone"
                  />
                  <FormControlLabel
                    value="sms"
                    control={<Radio />}
                    label="SMS"
                  />
                </RadioGroup>
                <Typography
                  id="contact-preference-help"
                  variant="body2"
                  color="text.secondary"
                >
                  Choose how you'd like us to contact you
                </Typography>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.newsletter}
                    onChange={e =>
                      setFormData({ ...formData, newsletter: e.target.checked })
                    }
                  />
                }
                label="Subscribe to newsletter"
              />
            </AccessibleForm>
          </CardContent>
        </Card>

        {/* Accessible Table Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Accessible Data Table
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This table demonstrates keyboard navigation, screen reader
              support, and sortable columns. Use Tab to enter the table, arrow
              keys to navigate, and Enter to sort columns.
            </Typography>
            <AccessibleTable
              columns={tableColumns}
              data={tableData}
              caption="Recent cryptocurrency transactions"
              sortBy="date"
              sortDirection="desc"
              onSort={(column, direction) => {
                announceMessage(
                  `Table sorted by ${column} in ${direction}ending order`
                )
              }}
              onRowClick={row => {
                announceMessage(
                  `Selected transaction: ${(row as { name?: string }).name}`
                )
              }}
            />
          </CardContent>
        </Card>

        {/* Modal Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Accessible Modal Dialog
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              This modal demonstrates focus trapping, keyboard navigation, and
              proper ARIA attributes.
            </Typography>
            <Button variant="contained" onClick={() => setModalOpen(true)}>
              Open Modal Dialog
            </Button>

            <AccessibleModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Example Modal Dialog"
              actions={
                <>
                  <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button
                    variant="contained"
                    onClick={() => setModalOpen(false)}
                  >
                    Confirm
                  </Button>
                </>
              }
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                This is an example of an accessible modal dialog. Focus is
                trapped within the modal, and you can navigate using the Tab
                key. Press Escape to close the modal.
              </Typography>
              <TextField
                fullWidth
                label="Example Input"
                placeholder="Try tabbing through the modal elements"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                The modal will return focus to the button that opened it when
                closed.
              </Typography>
            </AccessibleModal>
          </CardContent>
        </Card>

        {/* Keyboard Navigation Demo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Keyboard Navigation
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              All interactive elements are keyboard accessible. Here are the
              keyboard shortcuts:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  General Navigation
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Tab - Move to next focusable element</li>
                  <li>Shift + Tab - Move to previous focusable element</li>
                  <li>Enter/Space - Activate buttons and links</li>
                  <li>Escape - Close modals and menus</li>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Table Navigation
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Arrow Keys - Navigate between table cells</li>
                  <li>Home/End - Jump to first/last element</li>
                  <li>Enter - Sort columns or select rows</li>
                  <li>Space - Select checkboxes</li>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Interactive Elements Test
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Button variant="contained">Primary Button</Button>
              <Button variant="outlined">Secondary Button</Button>
              <Button variant="text">Text Button</Button>
              <Link href="#" onClick={e => e.preventDefault()}>
                Accessible Link
              </Link>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="Chip 1" onClick={() => {}} />
              <Chip label="Chip 2" onClick={() => {}} />
              <Chip label="Chip 3" onClick={() => {}} />
            </Box>
          </CardContent>
        </Card>

        {/* Accessibility Tester */}
        <AccessibilityTester />

        {/* Color Contrast Examples */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Color Contrast Examples
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              These examples show different contrast ratios for accessibility
              compliance.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#ffffff',
                    color: '#000000',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6">AAA Contrast (21:1)</Typography>
                  <Typography variant="body2">
                    Black text on white background
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#ffffff',
                    color: '#595959',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6">AA Contrast (7:1)</Typography>
                  <Typography variant="body2">
                    Dark gray text on white background
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#ffffff',
                    color: '#767676',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6">AA Large Text (4.5:1)</Typography>
                  <Typography variant="body2">
                    Medium gray text on white background
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Screen Reader Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Screen Reader Instructions
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This application is optimized for screen readers. Here are some
              tips for the best experience:
            </Typography>

            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                Use heading navigation (H key in NVDA/JAWS) to quickly move
                between sections
              </li>
              <li>
                Use landmark navigation (D key) to jump between main content
                areas
              </li>
              <li>Form fields have descriptive labels and help text</li>
              <li>Tables include column headers and sorting information</li>
              <li>Dynamic content changes are announced via live regions</li>
              <li>
                All interactive elements have accessible names and descriptions
              </li>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                If you encounter any accessibility issues, please contact our
                support team. We are committed to providing an inclusive
                experience for all users.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </KeyboardNavigationProvider>
    </Container>
  )
}

export default AccessibilityDemo

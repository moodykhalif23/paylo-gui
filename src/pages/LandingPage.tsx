import React from 'react'
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Chip,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Security,
  Speed,
  Accessibility,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGetStarted = (role: string) => {
    navigate(`/auth/register?role=${role}`)
  }

  const features = [
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'Bank-Grade Security',
      description:
        'Multi-signature wallets, encrypted transactions, and comprehensive audit trails',
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description:
        'Sub-second transaction confirmations across Bitcoin, Ethereum,USDT and Solana networks',
    },
    {
      icon: <Accessibility color="primary" sx={{ fontSize: 40 }} />,
      title: 'Fully Accessible',
      description:
        'WCAG 2.1 compliant with screen reader support, keyboard navigation, and high contrast modes',
    },
  ]

  const supportedCurrencies = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      logo: '/bitcoin-btc-logo.svg',
      color: '#f7931e',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      logo: '/ethereum-eth-logo.svg',
      color: '#627eea',
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      logo: '/solana-sol-logo.svg',
      color: '#9945ff',
    },
    {
      name: 'Tether',
      symbol: 'usdt',
      logo: '/tether-usdt-logo.svg',
      color: '#2f98c9ff',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 6, md: 10 },
          mb: 8,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 700,
            mb: 3,
            background: 'linear-gradient(45deg, #0d4074ff 30%, #42a5f5 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Paylo
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 400,
            color: 'text.secondary',
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          The most secure and accessible cryptocurrency payment gateway
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleGetStarted('user')}
            endIcon={<ArrowForward />}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              borderRadius: 2,
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Supported Currencies */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          {supportedCurrencies.map(currency => (
            <Box
              key={currency.symbol}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
              }}
            >
              <Box
                component="img"
                src={currency.logo}
                alt={`${currency.name} logo`}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0,
                }}
              />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {currency.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currency.symbol}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Why Choose Paylo?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    fontWeight={600}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* User Types Section */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ mb: 6, fontWeight: 600 }}
        >
          Choose Your Experience
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: 'primary.main',
                position: 'relative',
              }}
            >
              <Chip
                label="Most Popular"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: 16,
                  fontWeight: 600,
                }}
              />
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  fontWeight={600}
                >
                  P2P User
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Send and receive cryptocurrency directly between wallets with
                  real-time transaction tracking
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">
                      Instant wallet creation
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">
                      Real-time notifications
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Transaction history</Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleGetStarted('user')}
                    startIcon={<ArrowForward />}
                    fullWidth
                    size="large"
                  >
                    Get Started
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  fontWeight={600}
                >
                  Merchant
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Accept cryptocurrency payments and manage your business with
                  comprehensive analytics
                </Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Payment processing</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Invoice management</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Revenue analytics</Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleGetStarted('merchant')}
                    startIcon={<ArrowForward />}
                    fullWidth
                    size="large"
                  >
                    Get Started
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  fontWeight={600}
                >
                  Administrator
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Monitor system health, manage users, and ensure platform
                  security and compliance
                </Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">System monitoring</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">User management</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Compliance tools</Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => handleGetStarted('admin')}
                  startIcon={<ArrowForward />}
                  fullWidth
                  size="large"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Accessibility Demo CTA */}
      <Box
        sx={{
          p: 4,
          bgcolor: 'action.hover',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Accessibility color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={600}>
            Accessibility First
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          Paylo is built with comprehensive accessibility features including
          keyboard navigation, screen reader support, high contrast mode, and
          WCAG 2.1 compliance.
        </Typography>
        <Button
          component={RouterLink}
          to="/accessibility-demo"
          variant="contained"
          startIcon={<Accessibility />}
          size="large"
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          Explore Accessibility Features
        </Button>
      </Box>
    </Box>
  )
}

export default LandingPage

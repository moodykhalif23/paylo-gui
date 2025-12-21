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
      color: '#f7931a',
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
      symbol: 'USDT',
      logo: '/tether-usdt-logo.svg',
      color: '#26a17b',
    },
  ]

  const brandWhite = '#ffffff'
  const accentGreen = '#7dcd85'
  const softGreen = '#c8ffd8'

  const heroBg = 'rgba(7, 24, 13, 0.92)'

  const fullBleedSx = {
    width: '100%',
    px: { xs: 2, md: 4 },
    py: { xs: 5, md: 7 },
    backgroundColor: heroBg,
    marginTop: 0,
    marginBottom: 0,
  }

  const sectionWrapperSx = {
    px: { xs: 2, md: 6 },
    py: { xs: 4, md: 6 },
    width: '100%',
    boxSizing: 'border-box',
    color: brandWhite,
    backgroundColor: heroBg,
  }

  const sectionDivider = '1px solid rgba(255,255,255,0.12)'

  return (
    <Box
      sx={{
        color: 'inherit',
        backgroundColor: heroBg,
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          ...fullBleedSx,
          pt: { xs: 4, md: 6 },
          pb: { xs: 5, md: 8 },
          mb: 0,
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 4, md: 6 },
            maxWidth: '1100px',
            mx: 'auto',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(45deg, #5ba663 30%, #7dcd85 90%)',
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
              color: brandWhite,
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            The secure and accessible cryptocurrency payment gateway in Africa
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

          {/* Quick Currency Preview */}
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
                  <Typography variant="caption" color={softGreen}>
                    {currency.symbol}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box
        id="features"
        sx={{ ...fullBleedSx, borderTop: sectionDivider, mb: 0 }}
      >
        <Box sx={sectionWrapperSx}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ mb: 6, fontWeight: 600, color: accentGreen }}
          >
            Why Choose Paylo?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    color: brandWhite,
                    backdropFilter: 'blur(6px)',
                    transition: 'transform 0.2s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(91, 166, 99, 0.4)',
                    }}
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
                  <Typography variant="body1" color={softGreen}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Supported Currencies Section */}
      <Box
        id="currencies"
        sx={{ ...fullBleedSx, borderTop: sectionDivider, mb: 0 }}
      >
        <Box sx={sectionWrapperSx}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ mb: 2, fontWeight: 600, color: accentGreen }}
          >
            Supported Cryptocurrencies
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color={softGreen}
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Trade and transact with the most popular cryptocurrencies across
            multiple blockchain networks
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {supportedCurrencies.map(currency => (
              <Grid item xs={12} sm={6} md={3} key={currency.symbol}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '2px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease-in-out',
                    color: brandWhite,
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: currency.color,
                      boxShadow: `0 8px 25px ${currency.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        borderRadius: '50%',
                        bgcolor: `${currency.color}10`,
                        border: `2px solid ${currency.color}30`,
                      }}
                    >
                      <Box
                        component="img"
                        src={currency.logo}
                        alt={`${currency.name} logo`}
                        sx={{
                          width: 48,
                          height: 48,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      fontWeight={600}
                      sx={{ color: currency.color }}
                    >
                      {currency.name}
                    </Typography>

                    <Typography
                      variant="h6"
                      color={softGreen}
                      sx={{ mb: 2, fontFamily: 'monospace' }}
                    >
                      {currency.symbol.toUpperCase()}
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color={brandWhite}>
                        {currency.name === 'Bitcoin' &&
                          'The original cryptocurrency with the highest security and adoption'}
                        {currency.name === 'Ethereum' &&
                          'Smart contract platform enabling DeFi and NFT transactions'}
                        {currency.name === 'Solana' &&
                          'High-speed blockchain with low transaction fees'}
                        {currency.name === 'Tether' &&
                          'Stable cryptocurrency pegged to the US Dollar'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" color={softGreen}>
                        Network:{' '}
                        {currency.name === 'Tether'
                          ? 'Ethereum (ERC-20)'
                          : currency.name}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Additional Info */}
          <Stack
            spacing={1.5}
            sx={{
              mt: 6,
              textAlign: 'center',
              color: brandWhite,
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              More Cryptocurrencies Coming Soon
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.85,
                maxWidth: 520,
                width: '100%',
                textAlign: 'center',
              }}
            >
              We're continuously expanding our supported cryptocurrencies.
              Request support for your favorite crypto by contacting our team.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* User Types Section */}
      <Box
        id="how-it-works"
        sx={{ ...fullBleedSx, borderTop: sectionDivider, mb: 0 }}
      >
        <Box sx={sectionWrapperSx}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ mb: 6, fontWeight: 600, color: accentGreen }}
          >
            Choose Your Experience
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  color: brandWhite,
                  backdropFilter: 'blur(6px)',
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
                  <Typography variant="body1" color={softGreen} sx={{ mb: 3 }}>
                    Send and receive cryptocurrency directly between wallets
                    with real-time transaction tracking
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignments: 'center', gap: 1 }}>
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
                      <Typography variant="body2">
                        Transaction history
                      </Typography>
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

            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  color: brandWhite,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    fontWeight={600}
                  >
                    Merchant
                  </Typography>
                  <Typography variant="body1" color={softGreen} sx={{ mb: 3 }}>
                    Accept cryptocurrency payments and manage your business with
                    comprehensive analytics
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2">
                        Payment processing
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body2">
                        Invoice management
                      </Typography>
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
          </Grid>
        </Box>
      </Box>

      {/* Accessibility Demo CTA */}
      <Box sx={{ ...fullBleedSx, borderTop: sectionDivider, mb: 8 }}>
        <Box
          sx={{
            px: { xs: 2, md: 6 },
            py: { xs: 4, md: 6 },
            bgcolor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 0,
            textAlign: 'center',
            color: brandWhite,
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
    </Box>
  )
}

export default LandingPage

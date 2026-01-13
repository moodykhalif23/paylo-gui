import React from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import {
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Security,
  Accessibility,
  Speed,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'

const heroBg = 'rgba(7, 24, 13, 0.92)'
const textOnHero = '#f5fff5'
const mutedText = 'rgba(255,255,255,0.75)'
const faintText = 'rgba(255,255,255,0.5)'
const borderTone = 'rgba(255,255,255,0.08)'

const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Supported Currencies', href: '#currencies' },
      { label: 'Accessibility', to: '/accessibility-demo' },
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press', href: '#press' },
      { label: 'Blog', href: '#blog' },
    ],
    support: [
      { label: 'Help Center', href: '#help' },
      { label: 'API Documentation', href: '#api-docs' },
      { label: 'Status Page', href: '#status' },
      { label: 'Contact Support', href: '#support' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'Compliance', href: '#compliance' },
    ],
  }

  const socialLinks = [
    { icon: <Twitter />, href: 'https://twitter.com/paylo', label: 'Twitter' },
    {
      icon: <LinkedIn />,
      href: 'https://linkedin.com/company/paylo',
      label: 'LinkedIn',
    },
    { icon: <GitHub />, href: 'https://github.com/paylo', label: 'GitHub' },
  ]

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: heroBg,
        color: textOnHero,
        pt: 6,
        pb: 3,
        mt: 0,
        borderTop: `1px solid ${borderTone}`,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: textOnHero,
              }}
            >
              Paylo
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: mutedText }}>
              The secure and accessible cryptocurrency payment gateway in
              Africa. Empowering businesses and individuals with fast, secure,
              and compliant blockchain transactions.
            </Typography>

            {/* Key Features */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="caption" color={mutedText}>
                  Bank-grade security
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="caption" color={mutedText}>
                  Lightning-fast transactions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Accessibility sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="caption" color={mutedText}>
                  WCAG 2.1 compliant
                </Typography>
              </Box>
            </Stack>

            {/* Contact Info */}
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16, color: faintText }} />
                <Typography variant="caption" color={mutedText}>
                  support@paylo.africa
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 16, color: faintText }} />
                <Typography variant="caption" color={mutedText}>
                  +2547680-470-009
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: faintText }} />
                <Typography variant="caption" color={mutedText}>
                  Nairobi, Kenya
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Product Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product
            </Typography>
            <Stack spacing={1}>
              {footerLinks.product.map(link => (
                <Link
                  key={link.label}
                  component={link.to ? RouterLink : 'button'}
                  to={link.to}
                  onClick={
                    link.href
                      ? () => handleScrollToSection(link.href)
                      : undefined
                  }
                  sx={{
                    color: mutedText,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    p: 0,
                    '&:hover': {
                      color: 'primary.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                      borderRadius: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Company
            </Typography>
            <Stack spacing={1}>
              {footerLinks.company.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: mutedText,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                      borderRadius: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Support
            </Typography>
            <Stack spacing={1}>
              {footerLinks.support.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: mutedText,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                      borderRadius: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Legal
            </Typography>
            <Stack spacing={1}>
              {footerLinks.legal.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: mutedText,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                      borderRadius: 1,
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: borderTone }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography variant="body2" color={mutedText}>
            © {currentYear} Paylo. All rights reserved. | Licensed and
            regulated cryptocurrency payment gateway.
          </Typography>

          {/* Social Links */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialLinks.map(social => (
              <IconButton
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{
                  color: mutedText,
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(91, 166, 99, 0.1)',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Compliance Notice */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color={faintText}>
            Paylo is committed to regulatory compliance and operates under
            applicable cryptocurrency and financial services regulations. All
            transactions are monitored for compliance with anti-money laundering
            (AML) and know-your-customer (KYC) requirements.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LandingFooter

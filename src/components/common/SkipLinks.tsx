import React from 'react'
import { Box, Link } from '@mui/material'
import { useSkipLinks } from '../../hooks/useKeyboardNavigation'

interface SkipLinksProps {
  links?: Array<{
    href: string
    label: string
    onClick?: () => void
  }>
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
  const { skipToContent, skipToNavigation } = useSkipLinks()

  const defaultLinks = [
    {
      href: '#main-content',
      label: 'Skip to main content',
      onClick: skipToContent,
    },
    {
      href: '#main-navigation',
      label: 'Skip to navigation',
      onClick: skipToNavigation,
    },
  ]

  const skipLinks = links || defaultLinks

  return (
    <Box
      component="nav"
      role="navigation"
      aria-label="Skip links"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
        '& a': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: 'primary.main',
          color: 'primary.contrastText',
          padding: '8px 16px',
          textDecoration: 'none',
          borderRadius: '0 0 4px 4px',
          fontSize: '14px',
          fontWeight: 600,
          transition: 'top 0.3s ease',
          '&:focus': {
            top: 0,
            outline: '2px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px',
          },
        },
      }}
    >
      {skipLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          onClick={e => {
            if (link.onClick) {
              e.preventDefault()
              link.onClick()
            }
          }}
          sx={{
            left: `${6 + index * 160}px`, // Offset each link
          }}
        >
          {link.label}
        </Link>
      ))}
    </Box>
  )
}

export default SkipLinks

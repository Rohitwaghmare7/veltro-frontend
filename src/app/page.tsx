'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import SplineBackground from '../components/SplineBackground';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <SplineBackground />
      </Box>

      {/* Content Layer */}
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {/* App Title */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '4rem', md: '6rem', lg: '8rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #AAA 50%, #FF6B4A 100%)', // Coral touch
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(255, 107, 74, 0.3))', // Coral glow
            }}
          >
            VELTRO
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/login" passHref>
              <Button
                variant="contained"
                size="medium"
                sx={{
                  px: 6,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'white',
                  color: 'black',
                  fontFamily: 'var(--font-geist-sans)',
                  boxShadow: '0 0 15px rgba(255, 107, 74, 0.5)', // Coral shadow
                  '&:hover': {
                    background: 'rgba(255,255,255,1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 25px rgba(255, 107, 74, 0.8)', // Brighter glow on hover
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Login
              </Button>
            </Link>
            <Link href="/register" passHref>
              <Button
                variant="outlined"
                size="medium"
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'white',
                  color: 'black',
                  fontFamily: 'var(--font-geist-sans)',
                  boxShadow: '0 0 15px rgba(255, 107, 74, 0.5)', // Coral shadow
                  '&:hover': {
                    background: 'rgba(255,255,255,1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 25px rgba(255, 107, 74, 0.8)', // Brighter glow on hover
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Register
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

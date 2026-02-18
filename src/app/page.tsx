'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import SplineBackground from '../components/SplineBackground';
import { motion } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import BarChartIcon from '@mui/icons-material/BarChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';

const features = [
  { icon: CalendarMonthIcon, title: 'Smart Bookings', desc: 'Calendar & appointment scheduling' },
  { icon: ViewKanbanIcon, title: 'Kanban Board', desc: 'Visual lead pipeline management' },
  { icon: AutoAwesomeIcon, title: 'Automations', desc: 'Trigger-based workflow automation' },
  { icon: InboxIcon, title: 'Unified Inbox', desc: 'Centralized message management' },
  { icon: DescriptionIcon, title: 'Smart Forms', desc: 'Custom forms with auto-send' },
  { icon: EmailIcon, title: 'Email Templates', desc: 'Pre-built email campaigns' },
  { icon: PeopleIcon, title: 'Team Management', desc: 'Role-based access control' },
  { icon: InventoryIcon, title: 'Inventory', desc: 'Product & service catalog' },
  { icon: IntegrationInstructionsIcon, title: 'Integrations', desc: 'Gmail, Calendar & more' },
  { icon: NotificationsIcon, title: 'Notifications', desc: 'Real-time alerts & updates' },
  { icon: BarChartIcon, title: 'Analytics', desc: 'Business insights dashboard' },
  { icon: SmartToyIcon, title: 'AI Assistant', desc: 'Voice-powered onboarding' },
];

export default function Home() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'auto',
        bgcolor: 'black',
      }}
    >
      {/* Background Layer */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      >
        <SplineBackground />
      </Box>

      {/* Hero Section - Original Design */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
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
                background: 'linear-gradient(135deg, #FFFFFF 0%, #AAA 50%, #FF6B4A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(255, 107, 74, 0.3))',
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
                    boxShadow: '0 0 15px rgba(255, 107, 74, 0.5)',
                    '&:hover': {
                      background: 'rgba(255,255,255,1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 25px rgba(255, 107, 74, 0.8)',
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
                    boxShadow: '0 0 15px rgba(255, 107, 74, 0.5)',
                    '&:hover': {
                      background: 'rgba(255,255,255,1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 25px rgba(255, 107, 74, 0.8)',
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

      {/* Scrollable Content Below */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 6, md: 10 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Everything You Need - Features Grid */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ mb: { xs: 10, md: 16 } }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              textAlign: 'center',
              mb: 1.5,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #AAA 50%, #FF6B4A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Comprehensive tools to manage your entire business
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              maxWidth: '1400px',
              mx: 'auto',
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Box
                  key={index}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      height: '100%',
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 1,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                        borderColor: 'rgba(0,0,0,0.2)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Icon
                        sx={{
                          fontSize: { xs: '2rem', md: '2.25rem' },
                          color: 'black',
                          mb: { xs: 1.5, md: 2 },
                          transition: 'transform 0.4s ease',
                          '.MuiPaper-root:hover &': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          mb: 0.5,
                          lineHeight: 1.3,
                          background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #FF6B4A 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(0,0,0,0.6)',
                          fontSize: { xs: '0.65rem', md: '0.7rem' },
                          lineHeight: 1.5,
                        }}
                      >
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Key Features Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ mb: { xs: 10, md: 16 } }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              textAlign: 'center',
              mb: 1.5,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #AAA 50%, #FF6B4A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful Features
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Advanced capabilities that set us apart
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              gap: { xs: 3, md: 4 },
              maxWidth: '1200px',
              mx: 'auto',
            }}
          >
            {[
              { 
                title: 'Visual Kanban Pipeline', 
                desc: 'Drag-and-drop lead management with customizable stages. Track deals from prospect to closed with visual clarity.',
                icon: ViewKanbanIcon
              },
              { 
                title: 'Smart Automation Engine', 
                desc: 'Create trigger-based workflows that send emails, update statuses, and notify teams automatically.',
                icon: AutoAwesomeIcon
              },
              { 
                title: 'Dynamic Form Builder', 
                desc: 'Build custom forms with conditional logic and auto-send to leads. Collect data seamlessly.',
                icon: DescriptionIcon
              },
              { 
                title: 'Unified Communication Hub', 
                desc: 'Manage all conversations in one inbox. Gmail sync, attachments, and threaded conversations.',
                icon: InboxIcon
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Paper
                  key={idx}
                  elevation={0}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 1,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.03), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      borderColor: 'rgba(0,0,0,0.2)',
                      '&::after': {
                        left: '100%',
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, md: 3 } }}>
                    <Icon
                      sx={{
                        fontSize: { xs: '2.5rem', md: '3rem' },
                        color: 'black',
                        flexShrink: 0,
                        transition: 'transform 0.4s ease',
                        '.MuiPaper-root:hover &': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          mb: 1,
                          lineHeight: 1.3,
                          background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #FF6B4A 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(0,0,0,0.65)',
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          lineHeight: 1.7,
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* Why Choose Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ mb: { xs: 8, md: 12 } }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              textAlign: 'center',
              mb: 1.5,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #AAA 50%, #FF6B4A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose Veltro?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Built for modern businesses
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 3, md: 4 },
              maxWidth: '1100px',
              mx: 'auto',
            }}
          >
            {[
              { 
                title: 'All-in-One Platform', 
                desc: 'Everything from bookings to analytics in one place'
              },
              { 
                title: 'Easy to Use', 
                desc: 'Intuitive interface with voice-guided onboarding'
              },
              { 
                title: 'Seamless Integration', 
                desc: 'Connect Gmail, Calendar, and your favorite tools'
              },
            ].map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                sx={{
                  p: { xs: 3, md: 4 },
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 1,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '0',
                    background: 'rgba(0,0,0,0.02)',
                    transition: 'height 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    borderColor: 'rgba(0,0,0,0.2)',
                    '&::before': {
                      height: '100%',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      mb: 1,
                      lineHeight: 1.3,
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #FF6B4A 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(0,0,0,0.65)',
                      fontSize: { xs: '0.8rem', md: '0.875rem' },
                      lineHeight: 1.7,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            textAlign: 'center',
            py: 6,
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1.5rem',
              mb: 2,
            }}
          >
            Ready to Transform Your Business?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              mb: 3,
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            Join thousands of businesses already using Veltro to streamline operations
          </Typography>
          <Link href="/register" passHref>
            <Button
              variant="contained"
              size="medium"
              sx={{
                px: 5,
                py: 1,
                borderRadius: 1.5,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                background: '#FF6B4A',
                color: 'white',
                boxShadow: '0 0 20px rgba(255, 107, 74, 0.4)',
                '&:hover': {
                  background: '#FF5A39',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 30px rgba(255, 107, 74, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Free Trial
            </Button>
          </Link>
        </Box>

        {/* Footer */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{
            textAlign: 'center',
            pb: 4,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.7rem',
            }}
          >
            © 2026 Veltro. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

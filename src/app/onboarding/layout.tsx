'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import SplineBackground from '@/components/SplineBackground';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
                {/* Left Sidebar */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '380px' },
                        height: '100vh',
                        bgcolor: 'rgba(5, 5, 5, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        p: 6,
                        position: 'fixed',
                        zIndex: 10
                    }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Typography 
                            variant="h4" 
                            fontWeight="700" 
                            sx={{ 
                                background: 'linear-gradient(to right, #FFFFFF, #FF6B4A 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-1px',
                                fontSize: '2rem'
                            }}
                        >
                            VELTRO
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', mt: 1.5, fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Set up your business workspace in just a few steps
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <OnboardingStepper />
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: '#444' }}>
                            © 2026 Veltro Technologies
                        </Typography>
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        flexGrow: 1,
                        ml: { md: '380px' },
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        bgcolor: '#F5F5F5',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ maxWidth: '650px', width: '100%', px: 6, py: 8, position: 'relative', zIndex: 1 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </OnboardingProvider>
    );
}

function OnboardingStepper() {
    const { activeStep, steps } = useOnboarding();

    return (
        <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
                '& .MuiStep-root': { 
                    mb: 0,
                },
                '& .MuiStepLabel-root': {
                    padding: 0,
                },
                '& .MuiStepLabel-iconContainer': {
                    paddingRight: 2,
                },
                '& .MuiStepLabel-label': { 
                    color: '#666', 
                    fontWeight: '500', 
                    fontSize: '1rem', 
                    ml: 0
                },
                '& .MuiStepLabel-label.Mui-active': { 
                    color: 'white', 
                    fontWeight: '700',
                    fontSize: '1.05rem'
                },
                '& .MuiStepLabel-label.Mui-completed': { 
                    color: '#FF6B4A',
                    fontWeight: '600'
                },
                '& .MuiStepIcon-root': {
                    width: 32,
                    height: 32,
                    color: '#050505',
                    border: '2px solid #222',
                    borderRadius: '50%',
                    '&.Mui-active': { 
                        color: '#FF6B4A', 
                        border: 'none',
                        boxShadow: '0 0 16px rgba(255, 107, 74, 0.5)'
                    },
                    '&.Mui-completed': { 
                        color: '#FF6B4A', 
                        border: 'none' 
                    },
                    '& text': { 
                        fill: 'white',
                        fontWeight: '700',
                        fontSize: '0.8rem'
                    }
                },
                '& .MuiStepConnector-root': {
                    marginLeft: '15px',
                    marginTop: 0,
                    marginBottom: 0,
                },
                '& .MuiStepConnector-line': {
                    borderColor: '#222',
                    borderLeftWidth: 2,
                    minHeight: 32,
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                    borderColor: '#FF6B4A'
                },
                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                    borderColor: '#FF6B4A'
                }
            }}
        >
            {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
            ))}
        </Stepper>
    );
}

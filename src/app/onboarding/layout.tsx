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
                        bgcolor: '#051821',
                        backgroundImage: 'radial-gradient(circle at 100% 0%, #082a3a 0%, #051821 50%, #000000 100%)',
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        p: 6,
                        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'fixed',
                        zIndex: 10
                    }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h4" fontWeight="900" sx={{ color: 'white', letterSpacing: '-1px' }}>
                            VELTRO
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                            Set up your business workspace
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <OnboardingStepper />
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.2)' }}>
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
                        bgcolor: '#000000',
                        overflow: 'hidden'
                    }}
                >
                    {/* Spline Background for Content Area */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.4 }}>
                        <SplineBackground scale="150%" />
                    </Box>

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
                '& .MuiStep-root': { mb: 4 },
                '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.3)', fontWeight: '500', fontSize: '0.95rem', ml: 1 },
                '& .MuiStepLabel-label.Mui-active': { color: 'white', fontWeight: '700' },
                '& .MuiStepLabel-label.Mui-completed': { color: '#00D2FF' },
                '& .MuiStepIcon-root': {
                    width: 28,
                    height: 28,
                    color: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    '&.Mui-active': { color: 'white', border: 'none' },
                    '&.Mui-completed': { color: 'white', border: 'none' },
                    '& text': { display: 'none' }
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

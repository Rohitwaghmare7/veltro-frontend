'use client';

import { createTheme, PaletteMode } from '@mui/material/styles';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin', 'devanagari'],
    display: 'swap',
});

export const getTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode - Clean and professional
                primary: {
                    main: '#667eea',
                    light: '#8b9ef5',
                    dark: '#4c5fd4',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#764ba2',
                    light: '#9b6ec7',
                    dark: '#5a3880',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f5f7fa',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1a1d29',
                    secondary: '#667eea',
                },
                divider: '#e5e7eb',
                success: {
                    main: '#22c55e',
                },
                warning: {
                    main: '#f59e0b',
                },
                error: {
                    main: '#ef4444',
                },
                info: {
                    main: '#3b82f6',
                },
            }
            : {
                // Dark mode - Modern and sleek
                primary: {
                    main: '#667eea',
                    light: '#8b9ef5',
                    dark: '#4c5fd4',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#764ba2',
                    light: '#9b6ec7',
                    dark: '#5a3880',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#0f1117',
                    paper: '#1a1d29',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#667eea',
                },
                divider: 'rgba(255, 255, 255, 0.08)',
                success: {
                    main: '#22c55e',
                },
                warning: {
                    main: '#f59e0b',
                },
                error: {
                    main: '#ef4444',
                },
                info: {
                    main: '#3b82f6',
                },
            }),
    },
    typography: {
        fontFamily: poppins.style.fontFamily,
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    boxShadow: 'none',
                    padding: '8px 20px',
                    fontWeight: 500,
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: mode === 'light'
                        ? '0 1px 3px rgba(0, 0, 0, 0.05)'
                        : '0 1px 3px rgba(0, 0, 0, 0.3)',
                },
            },
        },
    },
});

const theme = getTheme('dark'); // Default to dark theme

export default theme;

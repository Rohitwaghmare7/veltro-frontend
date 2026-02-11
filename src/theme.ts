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
                // Light mode - Custom color palette
                primary: {
                    main: '#1D546D', // Medium teal
                    light: '#5F9598', // Light teal
                    dark: '#061E29', // Dark navy
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#5F9598', // Light teal
                    light: '#8AB5B8',
                    dark: '#4A7A7D',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f8fafc', // Very light gray
                    paper: '#ffffff',
                },
                text: {
                    primary: '#061E29', // Dark navy for text
                    secondary: '#1D546D', // Medium teal for secondary text
                },
                divider: '#e2e8f0',
            }
            : {
                // Dark mode - Custom color palette
                primary: {
                    main: '#5F9598', // Light teal
                    light: '#8AB5B8',
                    dark: '#4A7A7D',
                    contrastText: '#061E29',
                },
                secondary: {
                    main: '#1D546D', // Medium teal
                    light: '#5F9598',
                    dark: '#061E29',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#061E29', // Dark navy
                    paper: '#0a2a3a', // Slightly lighter navy
                },
                text: {
                    primary: '#ffffff', // White for text
                    secondary: '#8AB5B8', // Light teal for secondary text
                },
                divider: '#1D546D',
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
        borderRadius: 8,
    },
    spacing: 8, // 8px spacing grid
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    padding: '8px 16px',
                    fontWeight: 500,
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px 0 rgba(6, 30, 41, 0.15)',
                    },
                },
                containedPrimary: {
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, #1D546D 0%, #5F9598 100%)'
                        : '#5F9598',
                    '&:hover': {
                        background: mode === 'light'
                            ? 'linear-gradient(135deg, #061E29 0%, #1D546D 100%)'
                            : '#8AB5B8',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: mode === 'light' 
                        ? '0 4px 6px -1px rgba(6, 30, 41, 0.1), 0 2px 4px -2px rgba(6, 30, 41, 0.06)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
                    border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #1D546D',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? '#5F9598' : '#8AB5B8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? '#1D546D' : '#5F9598',
                        },
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: mode === 'light'
                        ? '0 1px 3px 0 rgba(6, 30, 41, 0.1), 0 1px 2px -1px rgba(6, 30, 41, 0.06)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
                colorPrimary: {
                    backgroundColor: mode === 'light' ? '#5F9598' : '#1D546D',
                    color: '#ffffff',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: mode === 'light'
                        ? '0 1px 3px 0 rgba(6, 30, 41, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: mode === 'light' ? '#ffffff' : '#061E29',
                    borderRight: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #1D546D',
                },
            },
        },
    },
});

// Default light theme
const theme = getTheme('light');

export default theme;


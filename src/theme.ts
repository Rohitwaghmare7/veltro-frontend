'use client';

import { createTheme, PaletteMode } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export const getTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode
                primary: {
                    main: '#4f46e5', // Indigo 600
                    light: '#818cf8', // Indigo 400
                    dark: '#3730a3', // Indigo 800
                },
                background: {
                    default: '#f8fafc', // Slate 50
                    paper: '#ffffff',
                },
                text: {
                    primary: '#0f172a', // Slate 900
                    secondary: '#64748b', // Slate 500
                },
            }
            : {
                // Dark mode
                primary: {
                    main: '#818cf8', // Indigo 400
                    light: '#a5b4fc', // Indigo 300
                    dark: '#6366f1', // Indigo 500
                },
                background: {
                    default: '#0f172a', // Slate 900
                    paper: '#1e293b', // Slate 800
                },
                text: {
                    primary: '#f1f5f9', // Slate 100
                    secondary: '#94a3b8', // Slate 400
                },
            }),
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        button: {
            textTransform: 'none',
            fontWeight: 500,
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
                    padding: '8px 16px', // 8px grid
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: mode === 'light' 
                        ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
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
    },
});

// Default light theme
const theme = getTheme('light');

export default theme;


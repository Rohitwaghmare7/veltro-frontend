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
                // Light mode
                primary: {
                    main: '#00F3FF', // Neon Cyan
                    light: '#5FF9FF',
                    dark: '#00A6AE',
                    contrastText: '#000000',
                },
                secondary: {
                    main: '#BC13FE', // Neon Purple
                    light: '#E282FF',
                    dark: '#7A00A8',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#f8fafc',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#061E29',
                    secondary: '#00F3FF',
                },
                divider: '#e2e8f0',
            }
            : {
                // Dark mode
                primary: {
                    main: '#00F3FF', // Neon Cyan
                    light: '#5FF9FF',
                    dark: '#00A6AE',
                    contrastText: '#000000',
                },
                secondary: {
                    main: '#BC13FE', // Neon Purple
                    light: '#E282FF',
                    dark: '#7A00A8',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#000000', // Deep Black
                    paper: '#0A0A0A',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#00F3FF',
                },
                divider: '#333333',
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
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    padding: '8px 16px',
                    fontWeight: 500,
                },
            },
        },
    },
});

const theme = getTheme('dark'); // Default to dark theme for neon look

export default theme;

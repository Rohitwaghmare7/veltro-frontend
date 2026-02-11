'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { getTheme } from '@/theme';

interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<PaletteMode>('light');

    useEffect(() => {
        // Load theme preference from localStorage
        const savedMode = localStorage.getItem('themeMode') as PaletteMode;
        if (savedMode) {
            setMode(savedMode);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const theme = getTheme(mode);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

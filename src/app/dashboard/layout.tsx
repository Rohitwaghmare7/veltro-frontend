'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NewSidebar from '@/components/dashboard/NewSidebar';
import PageTransition from '@/components/PageTransition';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '@/theme';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Load theme preference from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }

        // Load sidebar state from localStorage
        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState) {
            setIsCollapsed(savedSidebarState === 'true');
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const theme = getTheme(darkMode ? 'dark' : 'light');
    const sidebarWidth = isCollapsed ? 80 : 280;

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: darkMode ? '#0f1117' : '#f5f7fa' }}>
                {/* Mobile Menu Button */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1300,
                        display: { sm: 'none' },
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        }
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <NewSidebar
                    mobileOpen={mobileOpen}
                    onDrawerToggle={handleDrawerToggle}
                    darkMode={darkMode}
                    onThemeToggle={handleThemeToggle}
                    isCollapsed={isCollapsed}
                    onCollapseToggle={handleCollapseToggle}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        // padding removed to prevent double padding with pages
                        // width and ml removed to rely on flexbox
                        transition: 'margin 0.3s ease', // Simplified transition
                        backgroundColor: darkMode ? '#0f1117' : '#f5f7fa',
                        minHeight: '100vh',
                    }}
                >
                    <PageTransition>
                        {children}
                    </PageTransition>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

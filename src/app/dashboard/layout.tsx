'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import PageTransition from '@/components/PageTransition';

const drawerWidth = 240;

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Header onDrawerToggle={handleDrawerToggle} />
            <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Toolbar /> {/* Spacer for fixed AppBar */}
                <PageTransition>
                    {children}
                </PageTransition>
            </Box>
        </Box>
    );
}

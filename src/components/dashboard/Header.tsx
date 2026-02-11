'use client';

import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '@/contexts/ThemeContext';
import BusinessSelector from './BusinessSelector';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';

const drawerWidth = 240;

interface HeaderProps {
    onDrawerToggle: () => void;
}

export default function Header({ onDrawerToggle }: HeaderProps) {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <BusinessSelector />

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                        <IconButton size="large" color="inherit" onClick={toggleTheme}>
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>

                    <NotificationMenu />

                    <ProfileMenu />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

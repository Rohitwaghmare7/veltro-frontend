'use client';

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeMode } from '@/contexts/ThemeContext';
import BusinessSelector from './BusinessSelector';

const drawerWidth = 240;

interface HeaderProps {
    onDrawerToggle: () => void;
}

export default function Header({ onDrawerToggle }: HeaderProps) {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const router = useRouter();
    const { mode, toggleTheme } = useThemeMode();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBusinessId');
        router.push('/login');
    };

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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                        <IconButton size="large" color="inherit" onClick={toggleTheme}>
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>

                    <IconButton size="large" color="inherit">
                        <NotificationsIcon />
                    </IconButton>

                    <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt="User" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
                        <MenuItem onClick={handleCloseUserMenu}>Account</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

'use client';

import { useState, useEffect } from 'react';
import {
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Typography,
    Box,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { useRouter } from 'next/navigation';

interface User {
    name: string;
    email: string;
    role?: string;
}

export default function ProfileMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const open = Boolean(anchorEl);

    useEffect(() => {
        // Load user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        router.push('/dashboard/profile');
    };

    const handleSettings = () => {
        handleClose();
        router.push('/dashboard/settings');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBusinessId');
        router.push('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <IconButton onClick={handleClick} sx={{ p: 0 }}>
                <Avatar
                    sx={{
                        bgcolor: 'transparent',
                        color: 'white',
                        border: '1px solid #00D2FF', // Neon border
                        width: 30, // Smaller size
                        height: 30,
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}
                >
                    {user ? getInitials(user.name) : <PersonIcon sx={{ fontSize: 18 }} />}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 220, // Reduced width
                        mt: 1,
                        bgcolor: '#0A0A0A',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        p: 0.5, // Reduced container padding
                        '& .MuiMenuItem-root': {
                            borderRadius: 1,
                            mb: 0.25,
                            py: 1, // Reduced item padding
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {user && (
                    <Box sx={{ px: 1.5, py: 1.5, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'white', lineHeight: 1.2 }}>
                            {user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.25, display: 'block' }}>
                            {user.email}
                        </Typography>
                        {user.role && (
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'inline-block',
                                    mt: 0.5,
                                    px: 0.75,
                                    py: 0.1,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    borderRadius: 0.5,
                                    textTransform: 'capitalize',
                                    fontSize: '0.6rem',
                                    fontWeight: 600
                                }}
                            >
                                {user.role}
                            </Typography>
                        )}
                    </Box>
                )}

                <Divider sx={{ my: 0.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <MenuItem onClick={handleProfile}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <PersonIcon fontSize="small" sx={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem' }}>Profile</Typography>
                </MenuItem>

                <MenuItem onClick={handleSettings}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <SettingsIcon fontSize="small" sx={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem' }}>Settings</Typography>
                </MenuItem>

                <Divider sx={{ my: 0.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <MenuItem onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'rgba(255, 50, 50, 0.1) !important' } }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <LogoutIcon fontSize="small" sx={{ fontSize: '1.1rem', color: 'rgba(255, 50, 50, 0.8)' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: '#ff6b6b', fontSize: '0.85rem' }}>Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    );
}

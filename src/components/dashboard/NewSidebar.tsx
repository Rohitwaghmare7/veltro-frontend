'use client';

import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    Theme,
    IconButton,
    Tooltip,
    Typography,
    Avatar,
    Badge,
    Menu,
    MenuItem,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContactsIcon from '@mui/icons-material/Contacts';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { staffService } from '@/lib/services/staff.service';
import { notificationService } from '@/lib/services/notification.service';

interface SidebarProps {
    mobileOpen: boolean;
    onDrawerToggle: () => void;
    darkMode: boolean; // Kept for interface compatibility but ignored for styling
    onThemeToggle: () => void; // Kept for compatibility
    isCollapsed: boolean;
    onCollapseToggle: () => void;
}

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Inbox', icon: <MessageIcon />, path: '/dashboard/inbox' },
    { text: 'Bookings', icon: <CalendarTodayIcon />, path: '/dashboard/bookings' },
    { text: 'Leads', icon: <ContactsIcon />, path: '/dashboard/leads' },
    { text: 'Forms', icon: <DescriptionIcon />, path: '/dashboard/forms' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/dashboard/inventory' },
    { text: 'Team', icon: <PeopleIcon />, path: '/dashboard/team' },
    { text: 'Automations', icon: <AutoModeIcon />, path: '/dashboard/automations' },
];

const secondaryItems = [
    { text: 'Integrations', icon: <IntegrationInstructionsIcon />, path: '/dashboard/integrations' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

export default function NewSidebar({ mobileOpen, onDrawerToggle, darkMode, onThemeToggle, isCollapsed, onCollapseToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const [profile, setProfile] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

    // Constant Styles for Dark Sidebar
    const sidebarBg = '#0f1117'; // Deep dark background
    const sidebarTextColor = '#ffffff';
    const sidebarSubTextColor = 'rgba(255, 255, 255, 0.6)';
    const activeItemBg = 'rgba(255, 255, 255, 0.15)'; // Pill shape background
    const hoverItemBg = 'rgba(255, 255, 255, 0.05)';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await staffService.getMe();
                if (res.success && res.data) {
                    setProfile(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }

        fetchProfile();
        loadUnreadCount();

        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        if (!profile) return item.text === 'Dashboard';
        if (profile.role === 'owner') return true;
        const permissions = profile.permissions;

        switch (item.text) {
            case 'Dashboard': return true;
            case 'Bookings': return permissions.canViewBookings;
            case 'Leads': return permissions.canViewLeads;
            case 'Inbox': return permissions.canViewInbox;
            case 'Forms': return permissions.canEditBookings || permissions.canEditLeads;
            case 'Inventory': return permissions.canManageInventory;
            case 'Team': return false;
            case 'Automations': return permissions.canManageAutomations;
            default: return true;
        }
    });

    const filteredSecondaryItems = secondaryItems.filter(item => {
        if (!profile) return false;
        if (profile.role === 'owner') return true;
        return false;
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setProfileAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedBusinessId');
        router.push('/login');
    };

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: sidebarBg,
            color: sidebarTextColor,
            borderRight: 'none',
            transition: 'width 0.3s ease',
            width: '100%',
            alignItems: 'center',
            py: 4
        }}>
            {/* Logo */}
            <Box
                onClick={onCollapseToggle}
                sx={{
                    mb: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    width: '100%',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.8 }
                }}>
                <Box sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <img src="/Group 341.svg" alt="Veltro" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
                {!isCollapsed && (
                    <Typography variant="h6" sx={{
                        fontWeight: 700, // Bolder weight
                        fontSize: '1.25rem',
                        color: sidebarTextColor,
                        whiteSpace: 'nowrap',
                        fontFamily: '"Nunito", "Quicksand", "Comfortaa", sans-serif', // Rounded geometric fonts
                        letterSpacing: '-0.01em', // Tighter letter spacing
                        opacity: isCollapsed ? 0 : 1,
                        transition: 'opacity 0.2s'
                    }}>
                        Veltro
                    </Typography>
                )}
            </Box>

            {/* Main Navigation */}
            <Box sx={{ flexGrow: 1, width: '100%', px: 2 }}>
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[...filteredMenuItems, ...filteredSecondaryItems].map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow>
                                    <ListItemButton
                                        component={Link}
                                        href={item.path}
                                        selected={isActive}
                                        onClick={isMobile ? onDrawerToggle : undefined}
                                        sx={{
                                            minHeight: 48,
                                            width: '100%',
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            borderRadius: '12px',
                                            px: isCollapsed ? 0 : 2.5,
                                            transition: 'all 0.2s ease',
                                            bgcolor: isActive ? activeItemBg : 'transparent',
                                            position: 'relative',
                                            gap: isCollapsed ? 0 : 2, // Added gap for spacing
                                            '&:hover': {
                                                bgcolor: isActive ? activeItemBg : hoverItemBg,
                                            }
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: isCollapsed ? 0 : 40,
                                                justifyContent: 'center',
                                                color: sidebarTextColor,
                                                opacity: isActive ? 1 : 0.7,
                                                transition: 'opacity 0.2s ease',
                                            }}
                                        >
                                            {/* @ts-ignore */}
                                            {React.cloneElement(item.icon as React.ReactElement<any>, {
                                                sx: {
                                                    fontSize: '1.25rem',
                                                    color: 'inherit'
                                                }
                                            })}
                                        </ListItemIcon>
                                        {!isCollapsed && (
                                            <ListItemText
                                                primary={item.text}
                                                sx={{
                                                    opacity: isCollapsed ? 0 : 1,
                                                    '& .MuiTypography-root': {
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        color: sidebarTextColor,
                                                        fontFamily: 'var(--font-poppins)',
                                                        letterSpacing: '0.01em',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                }}
                                            />
                                        )}
                                        {/* Active Dot */}
                                        {isActive && !isCollapsed && (
                                            <Box sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: '#fff',
                                                position: 'absolute',
                                                right: 16,
                                                opacity: 0.8
                                            }} />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Bottom Section - Profile & Actions */}
            <Box sx={{ width: '100%', px: 2, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                {/* Profile Avatar */}
                <Tooltip title="Profile" placement="right">
                    <Box
                        onClick={handleProfileClick}
                        sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 1.5,
                            width: '100%'
                        }}
                    >
                        <Avatar
                            src={user?.avatar}
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: '#000000', // Black background
                                color: '#ffffff', // White text
                                borderRadius: '12px', // Rounded square
                                border: '2px solid #ffffff', // White border stroke
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            {user ? getInitials(user.name) : <PersonIcon />}
                        </Avatar>

                        {!isCollapsed && (
                            <Box>
                                <Typography variant="body2" sx={{
                                    fontWeight: 400, // Light weight
                                    fontSize: '0.95rem',
                                    color: sidebarTextColor,
                                    fontFamily: 'var(--font-poppins)',
                                    letterSpacing: '0.02em'
                                }}>
                                    {user?.name || 'User Name'}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    fontSize: '0.75rem',
                                    color: sidebarSubTextColor,
                                    fontFamily: 'var(--font-poppins)'
                                }}>
                                    {profile?.role || 'Role'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Tooltip>

                {/* Bottom Icons Row */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-evenly',
                    width: '100%',
                    gap: isCollapsed ? 0 : 0
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: isCollapsed ? 'column' : 'row',
                        gap: isCollapsed ? 2 : 4,
                        alignItems: 'center'
                    }}>
                        {/* Theme Toggle */}
                        <IconButton
                            onClick={onThemeToggle}
                            sx={{ color: sidebarSubTextColor, '&:hover': { color: sidebarTextColor } }}
                        >
                            {darkMode ? <Brightness7Icon sx={{ fontSize: 20 }} /> : <Brightness4Icon sx={{ fontSize: 20 }} />}
                        </IconButton>

                        {/* Logout */}
                        <IconButton
                            onClick={handleLogout}
                            sx={{ color: sidebarSubTextColor, '&:hover': { color: '#ef4444' } }}
                        >
                            <LogoutIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Profile Menu */}
            <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                PaperProps={{
                    sx: {
                        width: 200,
                        ml: isCollapsed ? 7 : 2,
                        bgcolor: sidebarBg,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    },
                }}
            >
                <MenuItem onClick={() => { handleProfileClose(); router.push('/dashboard/profile'); }}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" sx={{ color: sidebarSubTextColor }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: sidebarTextColor, fontFamily: 'var(--font-poppins)' }}>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleProfileClose(); router.push('/dashboard/settings'); }}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" sx={{ color: sidebarSubTextColor }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: sidebarTextColor, fontFamily: 'var(--font-poppins)' }}>Settings</Typography>
                </MenuItem>
                <Divider sx={{ my: 0.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <MenuItem onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'rgba(255, 50, 50, 0.1)' } }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: '#ef4444', fontFamily: 'var(--font-poppins)' }}>Logout</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: isCollapsed ? 100 : 280 }, flexShrink: { sm: 0 }, transition: 'width 0.3s ease' }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: sidebarBg },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: isCollapsed ? 100 : 280,
                        borderRight: 'none',
                        bgcolor: sidebarBg,
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}

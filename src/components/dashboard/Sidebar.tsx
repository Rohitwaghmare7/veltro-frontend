'use client';

import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    useMediaQuery,
    Theme
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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staffService } from '@/lib/services/staff.service';

const drawerWidth = 240;

interface SidebarProps {
    mobileOpen: boolean;
    onDrawerToggle: () => void;
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

export default function Sidebar({ mobileOpen, onDrawerToggle }: SidebarProps) {
    const pathname = usePathname();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const [profile, setProfile] = useState<any>(null);

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

        fetchProfile();
    }, []);

    const filteredMenuItems = menuItems.filter(item => {
        if (!profile) return item.text === 'Dashboard'; // Basics until loaded

        if (profile.role === 'owner') return true;
        const permissions = profile.permissions;

        switch (item.text) {
            case 'Dashboard': return true;
            case 'Bookings': return permissions.canViewBookings;
            case 'Leads': return permissions.canViewLeads;
            case 'Inbox': return permissions.canViewInbox;
            case 'Forms': return permissions.canEditBookings || permissions.canEditLeads; // Require some edit privs for forms? Or separate?
            case 'Inventory': return permissions.canManageInventory;
            case 'Team': return false; // Only owners manage team for now
            case 'Automations': return permissions.canManageAutomations;
            default: return true;
        }
    });

    const filteredSecondaryItems = secondaryItems.filter(item => {
        if (!profile) return false;
        if (profile.role === 'owner') return true;
        // Both Integrations and Settings are owner-only
        return false;
    });

    const drawerContent = (
        <div>
            <Toolbar>
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}
                >
                    Veltro
                </Box>
            </Toolbar>
            <Divider />
            <List>
                <AnimatePresence>
                    {filteredMenuItems.map((item, index) => {
                        const isActive = pathname === item.path;
                        return (
                            <motion.div
                                key={item.text}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ListItem disablePadding sx={{ position: 'relative' }}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                                borderRadius: '8px',
                                                margin: '4px 8px',
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <ListItemButton
                                        component={Link}
                                        href={item.path}
                                        selected={isActive}
                                        onClick={isMobile ? onDrawerToggle : undefined}
                                        sx={{
                                            position: 'relative',
                                            zIndex: 1,
                                            mx: 1,
                                            borderRadius: '8px',
                                            '&.Mui-selected': {
                                                backgroundColor: 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                                                },
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.text}
                                            sx={{ 
                                                '& .MuiTypography-root': { 
                                                    fontWeight: isActive ? 600 : 400 
                                                } 
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </List>
            <Divider />
            <List>
                <AnimatePresence>
                    {filteredSecondaryItems.map((item, index) => {
                        const isActive = pathname === item.path;
                        return (
                            <motion.div
                                key={item.text}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: (filteredMenuItems.length + index) * 0.05 }}
                            >
                                <ListItem disablePadding sx={{ position: 'relative' }}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                                                borderRadius: '8px',
                                                margin: '4px 8px',
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <ListItemButton
                                        component={Link}
                                        href={item.path}
                                        selected={isActive}
                                        onClick={isMobile ? onDrawerToggle : undefined}
                                        sx={{
                                            position: 'relative',
                                            zIndex: 1,
                                            mx: 1,
                                            borderRadius: '8px',
                                            '&.Mui-selected': {
                                                backgroundColor: 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(79, 70, 229, 0.12)',
                                                },
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.text}
                                            sx={{ 
                                                '& .MuiTypography-root': { 
                                                    fontWeight: isActive ? 600 : 400 
                                                } 
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}

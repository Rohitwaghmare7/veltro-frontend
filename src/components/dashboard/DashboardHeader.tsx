'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Badge,
    Menu,
    MenuItem,
    useTheme
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BusinessIcon from '@mui/icons-material/Business';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '@/lib/api';

interface BusinessContext {
    _id: string;
    name: string;
    role: 'owner' | 'staff';
    bookingSlug?: string;
}

function BookingLinkPill({ bookingSlug }: { bookingSlug?: string }) {
    const [copied, setCopied] = useState(false);
    const theme = useTheme();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!bookingSlug) return;

        const link = `${window.location.origin}/book/${bookingSlug}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!bookingSlug) return null;

    return (
        <Paper
            elevation={0}
            onClick={handleCopy}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pl: 2,
                pr: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: copied ? 'rgba(34, 197, 94, 0.1)' : (theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.1)'),
                color: copied ? '#22c55e' : '#ff6b6b',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: copied ? 'rgba(34, 197, 94, 0.3)' : (theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 107, 107, 0.2)'),
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: copied ? 'rgba(34, 197, 94, 0.2)' : (theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.25)' : 'rgba(255, 107, 107, 0.15)'),
                    transform: 'translateY(-1px)'
                }
            }}
        >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                {copied ? 'Copied!' : 'Copy Booking Link'}
            </Typography>
        </Paper>
    );
}

export default function DashboardHeader() {
    const theme = useTheme();
    const [businesses, setBusinesses] = useState<BusinessContext[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<BusinessContext | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await api.get('/staff/businesses');
                if (res.data.success) {
                    setBusinesses(res.data.data);

                    const stored = localStorage.getItem('selectedBusinessId');
                    if (stored) {
                        const found = res.data.data.find((b: any) => b._id === stored);
                        if (found) {
                            setSelectedBusiness(found);
                            // Fetch business details to get booking slug
                            fetchBusinessDetails(found._id);
                        } else {
                            // Stored business ID is invalid, clear it and use first available
                            localStorage.removeItem('selectedBusinessId');
                            if (res.data.data.length > 0) {
                                setSelectedBusiness(res.data.data[0]);
                                localStorage.setItem('selectedBusinessId', res.data.data[0]._id);
                                fetchBusinessDetails(res.data.data[0]._id);
                            }
                        }
                    } else if (res.data.data.length > 0) {
                        setSelectedBusiness(res.data.data[0]);
                        localStorage.setItem('selectedBusinessId', res.data.data[0]._id);
                        fetchBusinessDetails(res.data.data[0]._id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch businesses', err);
            }
        };

        const fetchBusinessDetails = async (businessId: string) => {
            try {
                const res = await api.get('/onboarding/progress');
                if (res.data.success && res.data.data.business) {
                    setSelectedBusiness(prev => prev ? { ...prev, bookingSlug: res.data.data.business.bookingSlug } : null);
                }
            } catch (err) {
                console.error('Failed to fetch business details', err);
            }
        };

        fetchBusinesses();
    }, []);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications?limit=10');
                if (res.data) {
                    setNotifications(res.data.notifications || []);
                    setUnreadCount(res.data.unreadCount || 0);
                }
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };

        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleBusinessSelect = (business: BusinessContext) => {
        setSelectedBusiness(business);
        localStorage.setItem('selectedBusinessId', business._id);
        handleMenuClose();
        window.location.reload();
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            gap: 2,
            flexWrap: 'wrap'
        }}>
            {/* Title */}
            <Typography variant="h4" sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
                Dashboard
            </Typography>

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>

                {/* Booking Link Pill */}
                <BookingLinkPill bookingSlug={selectedBusiness?.bookingSlug} />

                {/* Company/Workspace Selector - Only show if multiple businesses */}
                {businesses.length > 1 && (
                    <Box>
                        <Paper
                            onClick={handleMenuOpen}
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                pl: 2,
                                pr: 1.5,
                                py: 1,
                                borderRadius: '12px',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: theme.palette.text.primary,
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        >
                            <BusinessIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                {selectedBusiness?.name || 'Select Company'}
                            </Typography>
                            <KeyboardArrowDownIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                        </Paper>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2,
                                    minWidth: 240,
                                    bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                                    color: theme.palette.text.primary,
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                }
                            }}
                        >
                            {businesses.map((biz) => (
                                <MenuItem
                                    key={biz._id}
                                    onClick={() => handleBusinessSelect(biz)}
                                    sx={{
                                        gap: 1.5,
                                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }
                                    }}
                                >
                                    <BusinessIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                                    {biz.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                )}

                {/* Notification Icon */}
                <IconButton
                    onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                    sx={{
                        p: 1,
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '12px',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'
                    }}
                >
                    <Badge 
                        badgeContent={unreadCount} 
                        color="error" 
                        overlap="circular"
                        invisible={unreadCount === 0}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{
                            '& .MuiBadge-badge': {
                                top: 4,
                                right: 4,
                                minWidth: 18,
                                height: 18,
                                fontSize: '0.65rem',
                                padding: '0 4px'
                            }
                        }}
                    >
                        <NotificationsIcon sx={{ fontSize: 20 }} />
                    </Badge>
                </IconButton>
                <Menu
                    anchorEl={notifAnchorEl}
                    open={Boolean(notifAnchorEl)}
                    onClose={() => setNotifAnchorEl(null)}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            width: 360,
                            maxWidth: 'calc(100vw - 32px)',
                            maxHeight: 500,
                            borderRadius: 2,
                            bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }
                    }}
                >
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </Typography>
                        {unreadCount > 0 && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'primary.main', 
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all read
                            </Typography>
                        )}
                    </Box>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No notifications yet
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {notifications.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        if (!notif.read) handleMarkAsRead(notif._id);
                                        if (notif.link) window.location.href = notif.link;
                                        setNotifAnchorEl(null);
                                    }}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: notif.read ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)'),
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                                        },
                                        whiteSpace: 'normal',
                                        wordWrap: 'break-word'
                                    }}
                                >
                                    <Box sx={{ width: '100%', overflow: 'hidden' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={notif.read ? 400 : 600} sx={{ wordBreak: 'break-word' }}>
                                                {notif.title}
                                            </Typography>
                                            {!notif.read && (
                                                <Box sx={{ 
                                                    width: 6, 
                                                    height: 6, 
                                                    borderRadius: '50%', 
                                                    bgcolor: 'error.main',
                                                    flexShrink: 0
                                                }} />
                                            )}
                                        </Box>
                                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#9ca3af', wordBreak: 'break-word' }}>
                                            {notif.message}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Box>
                    )}
                </Menu>
            </Box>
        </Box>
    );
}

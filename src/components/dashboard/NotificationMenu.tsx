'use client';

import { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BookingIcon from '@mui/icons-material/EventAvailable';
import MessageIcon from '@mui/icons-material/Message';
import FormIcon from '@mui/icons-material/Assignment';
import AutomationIcon from '@mui/icons-material/AutoMode';
import SystemIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { notificationService, Notification } from '@/lib/services/notification.service';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
    const iconProps = { sx: { fontSize: 18 } };
    switch (type) {
        case 'booking':
            return <BookingIcon {...iconProps} />;
        case 'message':
            return <MessageIcon {...iconProps} />;
        case 'form':
            return <FormIcon {...iconProps} />;
        case 'automation':
            return <AutomationIcon {...iconProps} />;
        case 'staff':
            return <PeopleIcon {...iconProps} />;
        default:
            return <SystemIcon {...iconProps} />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type) {
        case 'booking':
            return 'primary';
        case 'message':
            return 'success';
        case 'form':
            return 'info';
        case 'automation':
            return 'warning';
        case 'staff':
            return 'secondary';
        default:
            return 'default';
    }
};

export default function NotificationMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const open = Boolean(anchorEl);

    useEffect(() => {
        loadUnreadCount();
        // Poll for new notifications every 30 seconds
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

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(1, 10);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        if (notifications.length === 0) {
            loadNotifications();
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.read) {
                await notificationService.markAsRead(notification._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                );
            }

            if (notification.link) {
                router.push(notification.link);
            }

            handleClose();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <>
            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }} onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                    <NotificationsIcon fontSize="small" />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 340, // Reduced from 400
                        maxHeight: 500,
                        bgcolor: '#0A0A0A',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        p: 0,
                        mt: 1,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'white' }}>Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAllRead}
                            sx={{
                                fontSize: '0.7rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                minWidth: 'auto',
                                p: 0.5,
                                '&:hover': { color: 'white', bgcolor: 'transparent' }
                            }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.1)', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>No notifications</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0, maxHeight: 360, overflow: 'auto' }}>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    bgcolor: notification.read ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Avatar sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        width: 32,
                                        height: 32,
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        {getNotificationIcon(notification.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem', fontWeight: notification.read ? 400 : 600 }}>
                                                {notification.title}
                                            </Typography>
                                            {!notification.read && (
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        bgcolor: '#00D2FF', // Keep neon only for status dot
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', lineHeight: 1.3 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.7rem' }}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {notifications.length > 0 && (
                    <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <Button
                            size="small"
                            onClick={() => { handleClose(); router.push('/dashboard/notifications'); }}
                            sx={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                textTransform: 'none',
                                '&:hover': { color: 'white', bgcolor: 'transparent' }
                            }}
                        >
                            View all notifications
                        </Button>
                    </Box>
                )}
            </Menu>
        </>
    );
}

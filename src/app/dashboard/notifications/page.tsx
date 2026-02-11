'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Button,
    Chip,
    IconButton,
    Tabs,
    Tab,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BookingIcon from '@mui/icons-material/EventAvailable';
import MessageIcon from '@mui/icons-material/Message';
import FormIcon from '@mui/icons-material/Assignment';
import AutomationIcon from '@mui/icons-material/AutoMode';
import SystemIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import { notificationService, Notification } from '@/lib/services/notification.service';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'booking':
            return <BookingIcon />;
        case 'message':
            return <MessageIcon />;
        case 'form':
            return <FormIcon />;
        case 'automation':
            return <AutomationIcon />;
        case 'staff':
            return <PeopleIcon />;
        default:
            return <SystemIcon />;
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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const router = useRouter();

    useEffect(() => {
        loadNotifications();
    }, [tab]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const unreadOnly = tab === 1;
            const data = await notificationService.getNotifications(1, 50, unreadOnly);
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.read) {
                await notificationService.markAsRead(notification._id);
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                );
            }

            if (notification.link) {
                router.push(notification.link);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Notifications
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Stay updated with your business activities
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={handleMarkAllRead}>
                    Mark all as read
                </Button>
            </Box>

            <Paper>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="All" />
                    <Tab label="Unread" />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <SystemIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You're all caught up!
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.selected',
                                    },
                                }}
                                secondaryAction={
                                    <IconButton edge="end" onClick={(e) => handleDelete(notification._id, e)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                                        {getNotificationIcon(notification.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body1" fontWeight={notification.read ? 'normal' : 'bold'}>
                                                {notification.title}
                                            </Typography>
                                            {!notification.read && (
                                                <Chip label="New" size="small" color="primary" />
                                            )}
                                            <Chip
                                                label={notification.type}
                                                size="small"
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}

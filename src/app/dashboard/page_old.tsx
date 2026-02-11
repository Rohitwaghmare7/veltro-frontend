'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Button,
    Paper,
    Divider,
    IconButton,
    Snackbar,
    Alert as MuiAlert,
    TextField,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContactsIcon from '@mui/icons-material/Contacts';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import WarningIcon from '@mui/icons-material/Warning';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InventoryIcon from '@mui/icons-material/Inventory';
import api from '@/lib/api';
import { dashboardService, DashboardStats, Alert } from '@/lib/services/dashboard.service';
import RBACGuard from '@/components/dashboard/RBACGuard';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [bookingUrl, setBookingUrl] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data.user;

                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);

                if (!userData.isOnboarded) {
                    router.push('/onboarding');
                    return;
                }

                // Fetch business details for booking link
                const bizRes = await api.get('/onboarding/progress');
                if (bizRes.data.success) {
                    const biz = bizRes.data.data.business;
                    setBusiness(biz);
                    if (biz && biz.bookingSlug) {
                        setBookingUrl(`${window.location.origin}/book/${biz.bookingSlug}`);
                    }
                }

                setLoading(false);
                
                // Fetch dashboard stats
                fetchDashboardData();
            } catch (e) {
                console.error('Auth verification failed', e);
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('user');
                    router.push('/login');
                } else {
                    setLoading(false);
                }
            }
        };

        checkAuth();
    }, [router]);

    const fetchDashboardData = async () => {
        try {
            // Fetch stats and alerts in parallel
            const [statsRes, alertsRes] = await Promise.all([
                dashboardService.getOverview(),
                dashboardService.getAlerts()
            ]);

            if (statsRes.success) {
                setStats(statsRes.data);
            }

            if (alertsRes.success) {
                setAlerts(alertsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        setSnackbar({ open: true, message: 'Link copied to clipboard!' });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const StatCard = ({ title, value, icon, color, loading }: any) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                        {title}
                    </Typography>
                    <Box sx={{ color: color, display: 'flex' }}>
                        {icon}
                    </Box>
                </Box>
                {loading ? (
                    <CircularProgress size={32} />
                ) : (
                    <Typography variant="h4" fontWeight="bold">
                        {value}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageIcon />;
            case 'booking': return <CalendarTodayIcon />;
            case 'form': return <AssignmentIcon />;
            case 'inventory': return <InventoryIcon />;
            default: return <WarningIcon />;
        }
    };

    const getAlertColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    return (
        <RBACGuard>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
                        <Typography color="textSecondary">
                            Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening today.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={Link}
                        href="/dashboard/bookings"
                    >
                        New Booking
                    </Button>
                </Box>

                {/* Booking Link Banner */}
                {bookingUrl && (
                    <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="h6" fontWeight="bold">🚀 Start accepting bookings!</Typography>
                                <Typography variant="body2">
                                    Share your public booking link with clients to fill your schedule.
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper sx={{ display: 'flex', alignItems: 'center', p: '2px 4px' }}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        value={bookingUrl}
                                        InputProps={{ disableUnderline: true, readOnly: true, sx: { px: 1, fontSize: '0.875rem' } }}
                                    />
                                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                    <IconButton color="primary" sx={{ p: '10px' }} onClick={copyToClipboard} aria-label="copy">
                                        <ContentCopyIcon />
                                    </IconButton>
                                    <IconButton color="primary" sx={{ p: '10px' }} component="a" href={bookingUrl} target="_blank" aria-label="open">
                                        <LaunchIcon />
                                    </IconButton>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* Stats Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Today's Bookings"
                            value={stats?.bookings.today || 0}
                            icon={<CalendarTodayIcon />}
                            color="primary.main"
                            loading={statsLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Upcoming Bookings"
                            value={stats?.bookings.upcoming || 0}
                            icon={<CalendarTodayIcon />}
                            color="info.main"
                            loading={statsLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="New Leads (24h)"
                            value={stats?.leads.new24h || 0}
                            icon={<ContactsIcon />}
                            color="success.main"
                            loading={statsLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Open Conversations"
                            value={stats?.leads.openConversations || 0}
                            icon={<MessageIcon />}
                            color="secondary.main"
                            loading={statsLoading}
                        />
                    </Grid>
                </Grid>

                {/* Forms & Inventory Stats */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Pending Forms
                                </Typography>
                                {statsLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Typography variant="h5" fontWeight="bold">
                                        {stats?.forms.pending || 0}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Overdue Forms
                                </Typography>
                                {statsLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Typography variant="h5" fontWeight="bold" color="error.main">
                                        {stats?.forms.overdue || 0}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Completed Forms
                                </Typography>
                                {statsLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        {stats?.forms.completed || 0}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Low Stock Items
                                </Typography>
                                {statsLoading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                                        {stats?.inventory.lowStock.length || 0}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Alerts Panel */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">⚠️ Key Alerts</Typography>
                                <Chip
                                    label={`${alerts.length} alerts`}
                                    color={alerts.length > 0 ? 'error' : 'default'}
                                    size="small"
                                />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {alerts.length === 0 ? (
                                <Typography color="textSecondary" align="center" py={4}>
                                    ✅ No alerts! Everything is running smoothly.
                                </Typography>
                            ) : (
                                <List>
                                    {alerts.map((alert) => (
                                        <ListItem
                                            key={alert.id}
                                            component={Link}
                                            href={alert.link}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                mb: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Chip
                                                    icon={getAlertIcon(alert.type)}
                                                    label={alert.severity}
                                                    color={getAlertColor(alert.severity) as any}
                                                    size="small"
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={alert.title}
                                                secondary={alert.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>

                    {/* Low Stock Items */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>📦 Low Stock Items</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {statsLoading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress size={32} />
                                </Box>
                            ) : stats?.inventory.lowStock.length === 0 ? (
                                <Typography color="textSecondary" align="center" py={4}>
                                    All items are well stocked!
                                </Typography>
                            ) : (
                                <List>
                                    {stats?.inventory.lowStock.map((item) => (
                                        <ListItem
                                            key={item._id}
                                            sx={{
                                                border: 1,
                                                borderColor: 'warning.main',
                                                borderRadius: 1,
                                                mb: 1,
                                                bgcolor: 'warning.light',
                                                color: 'warning.contrastText'
                                            }}
                                        >
                                            <ListItemText
                                                primary={item.name}
                                                secondary={`${item.quantity} ${item.unit} (threshold: ${item.threshold})`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                                component={Link}
                                href="/dashboard/inventory"
                            >
                                Manage Inventory
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <MuiAlert severity="success" sx={{ width: '100%' }}>
                        {snackbar.message}
                    </MuiAlert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

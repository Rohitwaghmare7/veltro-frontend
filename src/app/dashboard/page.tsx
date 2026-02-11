'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Alert,
    InputAdornment,
    TextField
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContactsIcon from '@mui/icons-material/Contacts';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import api from '@/lib/api';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [bookingUrl, setBookingUrl] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // Verify with backend using established api instance
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
            } catch (e) {
                console.error('Auth verification failed', e);
                // If it's a 401 and we are not logged in, only then wipe and redirect
                // If we JUST registered, maybe the user state is still propagating
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('user');
                    router.push('/login');
                } else {
                    // It's some other error, let's not instantly kick the user out
                    setLoading(false);
                }
            }
        };

        checkAuth();
    }, [router]);

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

    const StatCard = ({ title, value, icon, color }: any) => (
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
                <Typography variant="h4" fontWeight="bold">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

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
                    <Button variant="contained" startIcon={<AddIcon />}>
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

                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="Today's Bookings"
                            value="3"
                            icon={<CalendarTodayIcon />}
                            color="primary.main"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="New Leads"
                            value="12"
                            icon={<ContactsIcon />}
                            color="success.main"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            title="Revenue (Month)"
                            value="$1,250"
                            icon={<TrendingUpIcon />}
                            color="secondary.main"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Recent Activity</Typography>
                                <Button size="small">View All</Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography color="textSecondary" align="center" py={4}>
                                No recent activity to show.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Quick Actions</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                    Add New Client
                                </Button>
                                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                    Create Invoice
                                </Button>
                                <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                                    Update Inventory
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

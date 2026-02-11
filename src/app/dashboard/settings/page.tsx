'use client';

import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Grid,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    Divider
} from '@mui/material';
import { useState, useEffect } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import api from '@/lib/api';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function SettingsPage() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [bookingUrl, setBookingUrl] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // We can use the onboarding progress endpoint to get business details for now
                const response = await api.get('/onboarding/progress');
                if (response.data.success) {
                    const biz = response.data.data.business;
                    setBusiness(biz);
                    if (biz.bookingSlug) {
                        const url = `${window.location.origin}/book/${biz.bookingSlug}`;
                        setBookingUrl(url);
                    }
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        setSnackbar({ open: true, message: 'Link copied to clipboard!' });
    };

    return (
        <RBACGuard requireOwner>
            <Box>
                <Typography variant="h4" fontWeight="bold" mb={4}>Settings</Typography>

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="Profile" />
                        <Tab label="Business" />
                        <Tab label="Billing" />
                        <Tab label="Notifications" />
                    </Tabs>
                </Paper>

                <Paper sx={{ p: 4, maxWidth: '800px' }}>
                    {loading ? (
                        <Typography>Loading settings...</Typography>
                    ) : (
                        <>
                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="h6" mb={3}>Profile Settings</Typography>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="Full Name" defaultValue="Alice Smith" disabled helperText="Managed via Auth Provider" />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField fullWidth label="Email" defaultValue="alice@veltro.com" disabled />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {tabValue === 1 && business && (
                                <Box>
                                    <Typography variant="h6" mb={3}>Business Details</Typography>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="Public Booking Link"
                                                value={bookingUrl}
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={copyToClipboard} title="Copy Link">
                                                                    <ContentCopyIcon />
                                                                </IconButton>
                                                                <IconButton component="a" href={bookingUrl} target="_blank" title="Open Page">
                                                                    <LaunchIcon />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                                helperText="Share this link with your customers to accept bookings."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Divider />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth label="Business Name" defaultValue={business.name} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth multiline rows={3} label="Address" defaultValue={business.address?.street || ''} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button variant="contained">Update Business</Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {(tabValue === 2 || tabValue === 3) && (
                                <Box py={4} textAlign="center">
                                    <Typography color="textSecondary">Coming soon...</Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>

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

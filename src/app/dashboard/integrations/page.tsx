'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemText,
    Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RBACGuard from '@/components/dashboard/RBACGuard';
import { integrationService, FailedConnection } from '@/lib/services/integration.service';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: any;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastSync?: string;
    error?: string;
    configurable: boolean;
}

const integrationDefinitions: Integration[] = [
    {
        id: 'email',
        name: 'Email (SMTP)',
        description: 'Send automated emails and notifications',
        icon: EmailIcon,
        status: 'disconnected',
        configurable: false,
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync bookings with Google Calendar',
        icon: CalendarTodayIcon,
        status: 'disconnected',
        configurable: true,
    },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>(integrationDefinitions);
    const [failedConnections, setFailedConnections] = useState<FailedConnection[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Load integration statuses on mount
    useEffect(() => {
        loadIntegrationStatus();
        loadFailedConnections();
    }, []);

    const loadIntegrationStatus = async () => {
        try {
            const statuses = await integrationService.getStatus();
            
            setIntegrations(integrationDefinitions.map(def => ({
                ...def,
                status: statuses[def.id]?.status || 'disconnected',
                lastSync: statuses[def.id]?.lastSync,
                error: statuses[def.id]?.error,
            })));
        } catch (error) {
            console.error('Failed to load integration status', error);
            showSnackbar('Failed to load integration status', 'error');
        }
    };

    const loadFailedConnections = async () => {
        try {
            const failed = await integrationService.getFailedConnections();
            setFailedConnections(failed);
        } catch (error) {
            console.error('Failed to load failed connections', error);
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'connected':
                return <Chip icon={<CheckCircleIcon />} label="Connected" color="success" size="small" />;
            case 'disconnected':
                return <Chip label="Not Connected" color="default" size="small" />;
            case 'error':
                return <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />;
            case 'pending':
                return <Chip icon={<WarningIcon />} label="Pending" color="warning" size="small" />;
            default:
                return <Chip label="Unknown" size="small" />;
        }
    };

    const handleConnect = async (integrationId: string) => {
        if (integrationId === 'google-calendar') {
            try {
                setLoading(true);
                const url = await integrationService.getGoogleCalendarUrl();
                window.location.href = url;
            } catch (error) {
                console.error('Failed to get Google Calendar URL', error);
                showSnackbar('Failed to connect to Google Calendar', 'error');
                setLoading(false);
            }
        }
    };

    const handleDisconnect = async (integrationId: string) => {
        if (!confirm('Are you sure you want to disconnect this integration?')) return;

        try {
            setLoading(true);
            await integrationService.disconnect(integrationId);
            
            showSnackbar('Integration disconnected successfully', 'success');
            await loadIntegrationStatus();
        } catch (error) {
            console.error('Failed to disconnect', error);
            showSnackbar('Failed to disconnect integration', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (integrationId: string) => {
        try {
            setLoading(true);
            const result = await integrationService.testConnection(integrationId);
            
            if (result.success) {
                showSnackbar(result.message, 'success');
            } else {
                showSnackbar(result.message, 'error');
            }
        } catch (error) {
            console.error('Connection test failed', error);
            showSnackbar('Connection test failed. Please check your configuration.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <RBACGuard requireOwner>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Integrations
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Connect external services to enhance your workflow
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadIntegrationStatus}
                        disabled={loading}
                    >
                        Refresh Status
                    </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Integrations allow you to connect Veltro with external services like Google Calendar, Twilio SMS, and Cloudinary for enhanced functionality.
                </Alert>

                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                    {integrations.map((integration) => {
                        const Icon = integration.icon;
                        return (
                            <Card key={integration.id} variant="outlined">
                                <CardContent>
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                bgcolor: integration.status === 'connected' ? 'success.light' : 'grey.200',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Icon sx={{ color: integration.status === 'connected' ? 'success.main' : 'grey.500' }} />
                                        </Box>
                                        <Box flex={1}>
                                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                <Typography variant="h6">{integration.name}</Typography>
                                                {getStatusChip(integration.status)}
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" mb={2}>
                                                {integration.description}
                                            </Typography>

                                            {integration.lastSync && (
                                                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                                                    Last synced: {new Date(integration.lastSync).toLocaleString()}
                                                </Typography>
                                            )}

                                            {integration.error && (
                                                <Alert severity="error" sx={{ mb: 2, py: 0 }}>
                                                    <Typography variant="caption">{integration.error}</Typography>
                                                </Alert>
                                            )}

                                            <Box display="flex" gap={1}>
                                                {integration.status === 'connected' ? (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleTestConnection(integration.id)}
                                                            disabled={loading}
                                                        >
                                                            Test
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleDisconnect(integration.id)}
                                                            disabled={loading}
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => handleConnect(integration.id)}
                                                        disabled={loading}
                                                    >
                                                        Connect
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>

                {/* Failed Connections Log */}
                <Paper sx={{ mt: 4, p: 3 }} variant="outlined">
                    <Typography variant="h6" gutterBottom>
                        Connection Log
                    </Typography>
                    <List>
                        {failedConnections.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary="No failed connections"
                                    secondary="All integrations are working properly"
                                />
                            </ListItem>
                        ) : (
                            failedConnections.map((failed, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${failed.integration} - ${failed.error}`}
                                        secondary={new Date(failed.timestamp).toLocaleString()}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

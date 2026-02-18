'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Backdrop,
    CircularProgress,
    useTheme,
    Snackbar,
    Alert,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import { useIntegrationsStore } from '@/store/integrationsStore';
import { integrationService } from '@/lib/services/integration.service';
import RBACGuard from '@/components/dashboard/RBACGuard';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import ConfirmActionDialog from '@/components/team/ConfirmActionDialog';

export default function IntegrationsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const {
        integrations,
        failedConnections,
        loading,
        processing,
        fetchStatus,
        fetchFailedConnections,
        testConnection,
        disconnect,
        syncGmail,
    } = useIntegrationsStore();

    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<string>('');

    useEffect(() => {
        fetchStatus();
        fetchFailedConnections();

        // Check for callback status in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail') === 'connected') {
            setToast({ open: true, message: 'Gmail connected successfully!', severity: 'success' });
            window.history.replaceState({}, '', '/dashboard/integrations');
            fetchStatus();
        } else if (params.get('gmail') === 'error') {
            setToast({ open: true, message: 'Failed to connect Gmail. Please try again.', severity: 'error' });
            window.history.replaceState({}, '', '/dashboard/integrations');
        }
    }, [fetchStatus, fetchFailedConnections]);

    const handleConnect = async (integrationId: string) => {
        try {
            let url: string;
            if (integrationId === 'google-calendar') {
                url = await integrationService.getGoogleCalendarUrl();
            } else if (integrationId === 'gmail') {
                url = await integrationService.getGmailUrl();
            } else {
                setToast({ open: true, message: 'This integration is not yet configurable', severity: 'info' });
                return;
            }
            window.location.href = url;
        } catch (error) {
            console.error('Failed to connect', error);
            setToast({ open: true, message: 'Failed to connect integration', severity: 'error' });
        }
    };

    const handleDisconnectClick = (integrationId: string) => {
        setSelectedIntegration(integrationId);
        setOpenConfirm(true);
    };

    const handleDisconnectConfirm = async () => {
        const result = await disconnect(selectedIntegration);
        if (result.success) {
            setToast({ open: true, message: 'Integration disconnected successfully', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to disconnect', severity: 'error' });
        }
        setOpenConfirm(false);
        setSelectedIntegration('');
    };

    const handleTest = async (integrationId: string) => {
        const result = await testConnection(integrationId);
        setToast({
            open: true,
            message: result.message,
            severity: result.success ? 'success' : 'error',
        });
    };

    const handleSync = async (integrationId: string) => {
        if (integrationId === 'gmail') {
            const result = await syncGmail();
            if (result.success) {
                setToast({ open: true, message: 'Gmail synced successfully! Check your inbox for new messages.', severity: 'success' });
            } else {
                setToast({ open: true, message: result.error || 'Failed to sync Gmail', severity: 'error' });
            }
        }
    };

    const handleRefresh = () => {
        fetchStatus();
        fetchFailedConnections();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading && Object.keys(integrations).length === 0) {
        return (
            <Backdrop
                open={true}
                sx={{
                    color: '#8b5cf6',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                }}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress size={48} thickness={4} sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body1" sx={{ color: textPrimary, fontWeight: 600 }}>
                        Loading integrations...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

    const integrationsList = Object.values(integrations);
    const selectedIntegrationData = integrations[selectedIntegration];

    return (
        <RBACGuard requireOwner>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: pageBgColor,
                    p: { xs: 2, sm: 3, md: 4 },
                }}
            >
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                            Integrations
                        </Typography>
                        <Typography variant="body2" color={textSecondary} fontWeight={500}>
                            Connect external services to enhance your workflow
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                            color: '#ff6b6b',
                            '&:hover': {
                                borderColor: '#ff6b6b',
                                bgcolor: isDark ? 'rgba(255, 107, 107, 0.1)' : '#fee2e2',
                            }
                        }}
                    >
                        Refresh Status
                    </Button>
                </Box>

                {/* Info Alert */}
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
                        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#93c5fd'}`,
                    }}
                >
                    <Typography variant="body2">
                        Integrations allow you to connect with external services like Google Calendar and Gmail for enhanced functionality.
                    </Typography>
                </Alert>

                {/* Integration Cards Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                        },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    {integrationsList.map((integration) => (
                        <IntegrationCard
                            key={integration.id}
                            integration={integration}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnectClick}
                            onTest={handleTest}
                            onSync={handleSync}
                            disabled={processing}
                        />
                    ))}
                </Box>

                {/* Connection Log */}
                <Paper
                    sx={{
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <HistoryIcon sx={{ color: textSecondary, fontSize: 24 }} />
                            <Typography variant="h6" fontWeight={700} color={textPrimary}>
                                Connection Log
                            </Typography>
                        </Box>
                    </Box>

                    {failedConnections.length === 0 ? (
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            py={6}
                        >
                            <Typography variant="h6" color={textSecondary} sx={{ mb: 1 }}>
                                No failed connections
                            </Typography>
                            <Typography variant="body2" color={textSecondary}>
                                All integrations are working properly
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Integration</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Error</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Timestamp</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {failedConnections.map((failed, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ color: textPrimary, fontWeight: 600 }}>
                                                {failed.integration}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {failed.error}
                                            </TableCell>
                                            <TableCell sx={{ color: textSecondary }}>
                                                {formatDate(failed.timestamp)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Confirm Disconnect Dialog */}
                {selectedIntegrationData && (
                    <ConfirmActionDialog
                        open={openConfirm}
                        onClose={() => setOpenConfirm(false)}
                        onConfirm={handleDisconnectConfirm}
                        title="Disconnect Integration"
                        message={`Are you sure you want to disconnect ${selectedIntegrationData.name}? You can reconnect it anytime.`}
                        confirmText="Disconnect"
                        type="warning"
                        processing={processing}
                    />
                )}

                {/* Toast Notifications */}
                <Snackbar
                    open={toast.open}
                    autoHideDuration={6000}
                    onClose={() => setToast({ ...toast, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setToast({ ...toast, open: false })}
                        severity={toast.severity}
                        sx={{
                            borderRadius: '12px',
                            boxShadow: isDark ? '0px 8px 24px rgba(0,0,0,0.4)' : '0px 8px 24px rgba(0,0,0,0.1)',
                        }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

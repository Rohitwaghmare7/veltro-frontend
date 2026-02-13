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
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Card,
    CardContent,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAutomationsStore } from '@/store/automationsStore';
import RBACGuard from '@/components/dashboard/RBACGuard';
import AutomationCard from '@/components/automations/AutomationCard';
import TemplateEditorDialog from '@/components/automations/TemplateEditorDialog';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AutomationsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const { 
        settings, 
        logs, 
        stats, 
        loading, 
        logsLoading, 
        statsLoading, 
        processing,
        fetchSettings, 
        updateAutomation,
        updateTemplate,
        fetchLogs, 
        fetchStats 
    } = useAutomationsStore();

    const [tabValue, setTabValue] = useState(0);
    const [openTemplateEditor, setOpenTemplateEditor] = useState(false);
    const [selectedAutomationKey, setSelectedAutomationKey] = useState<string>('');
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Log filters
    const [triggerFilter, setTriggerFilter] = useState<string>('');
    const [successFilter, setSuccessFilter] = useState<string>('');
    const [limitFilter, setLimitFilter] = useState<number>(50);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (tabValue === 1) {
            fetchLogs({ trigger: triggerFilter, success: successFilter ? successFilter === 'true' : undefined, limit: limitFilter });
        } else if (tabValue === 2) {
            fetchStats();
        }
    }, [tabValue]);

    const handleToggle = async (automationKey: string, enabled: boolean) => {
        const result = await updateAutomation(automationKey, enabled);
        if (result.success) {
            const automationName = settings?.automations[automationKey as keyof typeof settings.automations]?.name;
            setToast({ 
                open: true, 
                message: `${automationName} ${enabled ? 'enabled' : 'disabled'}`, 
                severity: 'success' 
            });
        } else {
            setToast({ open: true, message: result.error || 'Failed to update automation', severity: 'error' });
        }
    };

    const handleCardClick = (automationKey: string) => {
        setSelectedAutomationKey(automationKey);
        setOpenTemplateEditor(true);
    };

    const handleSaveTemplate = async (key: string, subject: string, template: string) => {
        const result = await updateTemplate(key, subject, template);
        if (result.success) {
            setToast({ open: true, message: 'Template saved successfully', severity: 'success' });
            setOpenTemplateEditor(false);
        } else {
            setToast({ open: true, message: result.error || 'Failed to save template', severity: 'error' });
        }
    };

    const handleRefreshLogs = () => {
        fetchLogs({ 
            trigger: triggerFilter, 
            success: successFilter ? successFilter === 'true' : undefined, 
            limit: limitFilter 
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (loading && !settings) {
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
                        Loading automations...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

    const automationEntries = settings ? Object.entries(settings.automations) : [];

    return (
        <RBACGuard permission="canManageAutomations">
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: pageBgColor,
                    p: { xs: 2, sm: 3, md: 4 },
                }}
            >
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                        Automations
                    </Typography>
                    <Typography variant="body2" color={textSecondary} fontWeight={500}>
                        Manage automated actions, view execution logs, and track performance
                    </Typography>
                </Box>

                {/* Tabs */}
                <Paper
                    sx={{
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        overflow: 'hidden',
                    }}
                >
                    <Tabs
                        value={tabValue}
                        onChange={(_, newValue) => setTabValue(newValue)}
                        sx={{
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                            px: 2,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                minHeight: 56,
                            },
                            '& .Mui-selected': {
                                color: '#8b5cf6',
                            },
                            '& .MuiTabs-indicator': {
                                bgcolor: '#8b5cf6',
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
                        <Tab label="Execution Logs" />
                        <Tab icon={<BarChartIcon />} iconPosition="start" label="Statistics" />
                    </Tabs>

                    {/* Settings Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <Box p={3}>
                            <Alert
                                severity="info"
                                sx={{
                                    mb: 3,
                                    borderRadius: '12px',
                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
                                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#93c5fd'}`,
                                }}
                            >
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    How Automations Work
                                </Typography>
                                <Typography variant="body2">
                                    Automations run automatically when specific events occur. Toggle them on/off anytime. Click a card to edit email templates.
                                </Typography>
                            </Alert>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        lg: 'repeat(3, 1fr)',
                                    },
                                    gap: 3,
                                }}
                            >
                                {automationEntries.map(([key, automation]) => (
                                    <AutomationCard
                                        key={key}
                                        automationKey={key}
                                        automation={automation}
                                        onToggle={handleToggle}
                                        onCardClick={handleCardClick}
                                        disabled={processing}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </TabPanel>

                    {/* Logs Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box p={3}>
                            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Trigger Type</InputLabel>
                                    <Select
                                        value={triggerFilter}
                                        label="Trigger Type"
                                        onChange={(e) => setTriggerFilter(e.target.value)}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        <MenuItem value="">All Triggers</MenuItem>
                                        <MenuItem value="NEW_CONTACT">New Contact</MenuItem>
                                        <MenuItem value="BOOKING_CREATED">Booking Created</MenuItem>
                                        <MenuItem value="BOOKING_REMINDER">Booking Reminder</MenuItem>
                                        <MenuItem value="FORM_PENDING">Form Pending</MenuItem>
                                        <MenuItem value="INVENTORY_LOW">Inventory Low</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={successFilter}
                                        label="Status"
                                        onChange={(e) => setSuccessFilter(e.target.value)}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="true">Success</MenuItem>
                                        <MenuItem value="false">Failed</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    size="small"
                                    type="number"
                                    label="Limit"
                                    value={limitFilter}
                                    onChange={(e) => setLimitFilter(Number(e.target.value))}
                                    sx={{ 
                                        width: 100,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                        }
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefreshLogs}
                                    disabled={logsLoading}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        bgcolor: '#8b5cf6',
                                        '&:hover': {
                                            bgcolor: '#7c3aed',
                                        }
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Box>

                            {logsLoading ? (
                                <Box display="flex" justifyContent="center" py={8}>
                                    <CircularProgress sx={{ color: '#8b5cf6' }} />
                                </Box>
                            ) : logs.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={8}
                                >
                                    <Typography variant="h6" color={textSecondary} sx={{ mb: 1 }}>
                                        No logs found
                                    </Typography>
                                    <Typography variant="body2" color={textSecondary}>
                                        Automation logs will appear here once they run
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer
                                    sx={{
                                        borderRadius: '12px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                                <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Date & Time</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Trigger</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Contact</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {logs.map((log) => (
                                                <TableRow 
                                                    key={log._id || Math.random()} 
                                                    hover
                                                    sx={{
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ color: textPrimary }}>
                                                        {formatDate(log.executedAt || log.createdAt || log.timestamp)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={(log.trigger || 'UNKNOWN').replace(/_/g, ' ')}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                                                                color: '#8b5cf6',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ color: textPrimary }}>
                                                        {log.contactId?.name || log.contactId?.email || log.contact?.name || log.contact?.email || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.success ? (
                                                            <Chip
                                                                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                                                label="Success"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                                                                    color: '#10b981',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                                                                label="Failed"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                                                                    color: '#ef4444',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color={textSecondary}>
                                                            {log.error || log.details || 'Executed successfully'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Statistics Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Box p={3}>
                            {statsLoading ? (
                                <Box display="flex" justifyContent="center" py={8}>
                                    <CircularProgress sx={{ color: '#8b5cf6' }} />
                                </Box>
                            ) : !stats ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    py={8}
                                >
                                    <Typography variant="h6" color={textSecondary} sx={{ mb: 1 }}>
                                        No statistics available
                                    </Typography>
                                    <Typography variant="body2" color={textSecondary}>
                                        Statistics will appear once automations start running
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                                        gap={3}
                                        mb={4}
                                    >
                                        <Card
                                            sx={{
                                                borderRadius: '16px',
                                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="caption" color={textSecondary} fontWeight={600} gutterBottom>
                                                    Total Executions
                                                </Typography>
                                                <Typography variant="h4" fontWeight={700} color={textPrimary}>
                                                    {stats.totalExecutions || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card
                                            sx={{
                                                borderRadius: '16px',
                                                bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
                                                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0'}`,
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="caption" color={textSecondary} fontWeight={600} gutterBottom>
                                                    Successful
                                                </Typography>
                                                <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>
                                                    {stats.successCount || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card
                                            sx={{
                                                borderRadius: '16px',
                                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                                                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}`,
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="caption" color={textSecondary} fontWeight={600} gutterBottom>
                                                    Failed
                                                </Typography>
                                                <Typography variant="h4" fontWeight={700} sx={{ color: '#ef4444' }}>
                                                    {stats.failureCount || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card
                                            sx={{
                                                borderRadius: '16px',
                                                bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#ede9fe',
                                                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#ddd6fe'}`,
                                            }}
                                        >
                                            <CardContent>
                                                <Typography variant="caption" color={textSecondary} fontWeight={600} gutterBottom>
                                                    Success Rate
                                                </Typography>
                                                <Typography variant="h4" fontWeight={700} sx={{ color: '#8b5cf6' }}>
                                                    {stats.totalExecutions > 0
                                                        ? Math.round((stats.successCount / stats.totalExecutions) * 100)
                                                        : 0}%
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>

                                    <Typography variant="h6" fontWeight={700} color={textPrimary} gutterBottom>
                                        Executions by Trigger Type
                                    </Typography>
                                    <TableContainer
                                        sx={{
                                            borderRadius: '12px',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: textPrimary }}>Trigger</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: textPrimary }}>Count</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stats.byTrigger && Object.entries(stats.byTrigger).map(([trigger, count]: [string, any]) => (
                                                    <TableRow 
                                                        key={trigger}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                            }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Chip
                                                                label={trigger.replace(/_/g, ' ')}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                                                                    color: '#8b5cf6',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="h6" fontWeight={700} color={textPrimary}>
                                                                {count}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    </TabPanel>
                </Paper>

                {/* Template Editor Dialog */}
                {settings && selectedAutomationKey && (
                    <TemplateEditorDialog
                        open={openTemplateEditor}
                        onClose={() => setOpenTemplateEditor(false)}
                        automationKey={selectedAutomationKey}
                        automation={settings.automations[selectedAutomationKey as keyof typeof settings.automations]}
                        onSave={handleSaveTemplate}
                        processing={processing}
                    />
                )}

                {/* Toast Notifications */}
                <Snackbar
                    open={toast.open}
                    autoHideDuration={4000}
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

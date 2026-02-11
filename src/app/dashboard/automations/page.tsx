'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import { automationService, AutomationSettings } from '@/lib/services/automation.service';
import RBACGuard from '@/components/dashboard/RBACGuard';

const automationIcons: Record<string, any> = {
    NEW_CONTACT: EmailIcon,
    BOOKING_CREATED: CheckCircleIcon,
    BOOKING_REMINDER: EventIcon,
    FORM_PENDING: NotificationsIcon,
    INVENTORY_LOW: InventoryIcon,
};

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
    const [tabValue, setTabValue] = useState(0);
    const [settings, setSettings] = useState<AutomationSettings | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Log filters
    const [triggerFilter, setTriggerFilter] = useState<string>('');
    const [successFilter, setSuccessFilter] = useState<string>('');
    const [limitFilter, setLimitFilter] = useState<number>(50);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (tabValue === 2) {
            fetchLogs();
        } else if (tabValue === 3) {
            fetchStats();
        }
    }, [tabValue]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await automationService.getSettings();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load automation settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            setLogsLoading(true);
            const filters: any = { limit: limitFilter };
            if (triggerFilter) filters.trigger = triggerFilter;
            if (successFilter) filters.success = successFilter === 'true';
            
            const data = await automationService.getLogs(filters);
            if (data.success) {
                setLogs(data.data);
            }
        } catch (err: any) {
            console.error('Failed to load logs', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const data = await automationService.getStats();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err: any) {
            console.error('Failed to load stats', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleToggle = async (automationKey: string, currentValue: boolean) => {
        if (!settings) return;

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updatedAutomations = {
                ...settings.automations,
                [automationKey]: {
                    ...settings.automations[automationKey as keyof typeof settings.automations],
                    enabled: !currentValue,
                },
            };

            const data = await automationService.updateSettings(updatedAutomations);
            
            if (data.success) {
                setSettings(data.data);
                setSuccessMessage(`${settings.automations[automationKey as keyof typeof settings.automations].name} ${!currentValue ? 'enabled' : 'disabled'}`);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update automation');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!settings) {
        return (
            <Alert severity="error">Failed to load automation settings</Alert>
        );
    }

    const automationEntries = Object.entries(settings.automations);

    return (
        <RBACGuard permission="canManageAutomations">
            <Box>
                <Box mb={3}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Automations
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Manage automated actions, view execution logs, and track performance.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                        {successMessage}
                    </Alert>
                )}

                <Paper>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                        <Tab label="Settings" />
                        <Tab label="Templates" />
                        <Tab label="Logs" />
                        <Tab label="Statistics" />
                    </Tabs>

                    {/* Settings Tab */}
                    <TabPanel value={tabValue} index={0}>
                        <List>
                            {automationEntries.map(([key, automation], index) => {
                                const Icon = automationIcons[key] || NotificationsIcon;
                                
                                return (
                                    <div key={key}>
                                        <ListItem sx={{ py: 2.5 }}>
                                            <Box
                                                sx={{
                                                    mr: 2,
                                                    p: 1.5,
                                                    bgcolor: automation.enabled ? 'primary.light' : 'grey.200',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Icon sx={{ color: automation.enabled ? 'primary.main' : 'grey.500' }} />
                                            </Box>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="h6">{automation.name}</Typography>
                                                        {automation.enabled && (
                                                            <Chip label="Active" size="small" color="success" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                                        {automation.description}
                                                    </Typography>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Switch
                                                    checked={automation.enabled}
                                                    onChange={() => handleToggle(key, automation.enabled)}
                                                    color="primary"
                                                    disabled={saving}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < automationEntries.length - 1 && <Divider />}
                                    </div>
                                );
                            })}
                        </List>

                        <Box p={3} bgcolor="grey.50">
                            <Alert severity="info">
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    How Automations Work
                                </Typography>
                                <Typography variant="body2" component="div">
                                    • Automations run automatically when specific events occur<br />
                                    • You can enable or disable any automation at any time<br />
                                    • When staff manually replies to a contact, automation is paused for that conversation<br />
                                    • View logs and statistics to monitor automation performance
                                </Typography>
                            </Alert>
                        </Box>
                    </TabPanel>

                    {/* Templates Tab */}
                    <TabPanel value={tabValue} index={1}>
                        <Box p={3}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                    Available Variables
                                </Typography>
                                <Typography variant="body2" component="div">
                                    Use these placeholders in your templates:<br />
                                    • <code>{'{{contactName}}'}</code> - Contact's name<br />
                                    • <code>{'{{businessName}}'}</code> - Your business name<br />
                                    • <code>{'{{serviceType}}'}</code> - Service/booking type<br />
                                    • <code>{'{{date}}'}</code> - Booking date<br />
                                    • <code>{'{{timeSlot}}'}</code> - Booking time<br />
                                    • <code>{'{{formName}}'}</code> - Form title<br />
                                    • <code>{'{{formLink}}'}</code> - Link to form<br />
                                    • <code>{'{{itemName}}'}</code> - Inventory item name<br />
                                    • <code>{'{{currentStock}}'}</code> - Current stock level<br />
                                    • <code>{'{{threshold}}'}</code> - Stock threshold
                                </Typography>
                            </Alert>

                            {automationEntries.map(([key, automation]) => {
                                // Sample data for preview
                                const previewData: Record<string, string> = {
                                    contactName: 'John Doe',
                                    businessName: 'Acme Business',
                                    serviceType: 'Consultation',
                                    date: 'Monday, February 12, 2026',
                                    timeSlot: '10:00 AM',
                                    duration: '60',
                                    location: '123 Main St',
                                    formName: 'Client Intake Form',
                                    formLink: 'https://example.com/form/123',
                                    itemName: 'Office Supplies',
                                    currentStock: '5',
                                    threshold: '10',
                                };

                                // Replace variables in preview
                                const replaceVars = (text: string) => {
                                    let result = text;
                                    Object.entries(previewData).forEach(([varKey, value]) => {
                                        result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), value);
                                    });
                                    return result;
                                };

                                const previewSubject = replaceVars(settings.automations[key as keyof typeof settings.automations].emailSubject || '');
                                const previewBody = replaceVars(settings.automations[key as keyof typeof settings.automations].emailTemplate || '');

                                return (
                                    <Paper key={key} variant="outlined" sx={{ mb: 3, p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            {automation.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                            {automation.description}
                                        </Typography>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mt={2}>
                                            {/* Editor */}
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                                    Template Editor
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    label="Email Subject"
                                                    value={settings.automations[key as keyof typeof settings.automations].emailSubject || ''}
                                                    onChange={(e) => {
                                                        const updated = {
                                                            ...settings,
                                                            automations: {
                                                                ...settings.automations,
                                                                [key]: {
                                                                    ...settings.automations[key as keyof typeof settings.automations],
                                                                    emailSubject: e.target.value,
                                                                },
                                                            },
                                                        };
                                                        setSettings(updated);
                                                    }}
                                                    sx={{ mb: 2 }}
                                                    helperText="Use {{variables}} for dynamic content"
                                                />

                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={8}
                                                    label="Email Template"
                                                    value={settings.automations[key as keyof typeof settings.automations].emailTemplate || ''}
                                                    onChange={(e) => {
                                                        const updated = {
                                                            ...settings,
                                                            automations: {
                                                                ...settings.automations,
                                                                [key]: {
                                                                    ...settings.automations[key as keyof typeof settings.automations],
                                                                    emailTemplate: e.target.value,
                                                                },
                                                            },
                                                        };
                                                        setSettings(updated);
                                                    }}
                                                    helperText="HTML supported. Use {{variables}} for dynamic content"
                                                />

                                                <Box mt={2} display="flex" gap={2}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={async () => {
                                                            try {
                                                                setSaving(true);
                                                                const data = await automationService.updateSettings(settings.automations);
                                                                if (data.success) {
                                                                    setSuccessMessage(`${automation.name} template saved`);
                                                                    setTimeout(() => setSuccessMessage(null), 3000);
                                                                }
                                                            } catch (err: any) {
                                                                setError(err.response?.data?.message || 'Failed to save template');
                                                            } finally {
                                                                setSaving(false);
                                                            }
                                                        }}
                                                        disabled={saving}
                                                    >
                                                        Save Template
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => {
                                                            // Reset to default
                                                            fetchSettings();
                                                        }}
                                                    >
                                                        Reset to Default
                                                    </Button>
                                                </Box>
                                            </Box>

                                            {/* Live Preview */}
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                                    Live Preview
                                                </Typography>
                                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', minHeight: 400 }}>
                                                    <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Subject:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold">
                                                            {previewSubject || '(No subject)'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        bgcolor: 'white', 
                                                        p: 2, 
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        minHeight: 300,
                                                        '& p': { margin: '8px 0' },
                                                        '& h2': { margin: '12px 0 8px' },
                                                        '& strong': { fontWeight: 'bold' },
                                                        '& a': { color: 'primary.main', textDecoration: 'underline' }
                                                    }}>
                                                        <div dangerouslySetInnerHTML={{ __html: previewBody || '<p style="color: #999;">(No content)</p>' }} />
                                                    </Box>
                                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                                        <Typography variant="caption" color="textSecondary" fontStyle="italic">
                                                            Preview uses sample data. Actual emails will use real contact information.
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Box>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </TabPanel>

                    {/* Logs Tab */}
                    <TabPanel value={tabValue} index={2}>
                        <Box p={3}>
                            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Trigger Type</InputLabel>
                                    <Select
                                        value={triggerFilter}
                                        label="Trigger Type"
                                        onChange={(e) => setTriggerFilter(e.target.value)}
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
                                    sx={{ width: 100 }}
                                />

                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchLogs}
                                    disabled={logsLoading}
                                >
                                    Refresh
                                </Button>
                            </Box>

                            {logsLoading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : logs.length === 0 ? (
                                <Alert severity="info">No automation logs found. Automations will appear here once they run.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell><strong>Date & Time</strong></TableCell>
                                                <TableCell><strong>Trigger</strong></TableCell>
                                                <TableCell><strong>Contact</strong></TableCell>
                                                <TableCell><strong>Status</strong></TableCell>
                                                <TableCell><strong>Details</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {logs.map((log) => (
                                                <TableRow key={log._id} hover>
                                                    <TableCell>{formatDate(log.executedAt)}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={log.trigger.replace(/_/g, ' ')} 
                                                            size="small" 
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.contactId?.name || log.contactId?.email || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.success ? (
                                                            <Chip 
                                                                icon={<CheckCircleIcon />}
                                                                label="Success" 
                                                                color="success" 
                                                                size="small" 
                                                            />
                                                        ) : (
                                                            <Chip 
                                                                icon={<ErrorIcon />}
                                                                label="Failed" 
                                                                color="error" 
                                                                size="small" 
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="textSecondary">
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
                    <TabPanel value={tabValue} index={3}>
                        <Box p={3}>
                            {statsLoading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : !stats ? (
                                <Alert severity="info">No statistics available yet.</Alert>
                            ) : (
                                <>
                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={4}>
                                        <Card>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Total Executions
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold">
                                                    {stats.totalExecutions || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Successful
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                                    {stats.successCount || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Failed
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                                    {stats.failureCount || 0}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent>
                                                <Typography color="textSecondary" gutterBottom>
                                                    Success Rate
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold">
                                                    {stats.totalExecutions > 0 
                                                        ? Math.round((stats.successCount / stats.totalExecutions) * 100)
                                                        : 0}%
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>

                                    <Typography variant="h6" gutterBottom>
                                        Executions by Trigger Type
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                    <TableCell><strong>Trigger</strong></TableCell>
                                                    <TableCell align="right"><strong>Count</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {stats.byTrigger && Object.entries(stats.byTrigger).map(([trigger, count]: [string, any]) => (
                                                    <TableRow key={trigger}>
                                                        <TableCell>
                                                            <Chip label={trigger.replace(/_/g, ' ')} size="small" variant="outlined" />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="h6">{count}</Typography>
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
            </Box>
        </RBACGuard>
    );
}

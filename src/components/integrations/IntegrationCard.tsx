'use client';

import {
    Box,
    Typography,
    Button,
    Chip,
    useTheme,
    Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

interface IntegrationCardProps {
    integration: {
        id: string;
        name: string;
        description: string;
        icon: string;
        status: 'connected' | 'disconnected' | 'error' | 'pending';
        lastSync?: string;
        error?: string;
        configurable: boolean;
    };
    onConnect: (id: string) => void;
    onDisconnect: (id: string) => void;
    onTest: (id: string) => void;
    onSync?: (id: string) => void;
    disabled?: boolean;
}

const iconMap: Record<string, any> = {
    email: EmailIcon,
    gmail: EmailIcon,
    calendar: CalendarTodayIcon,
};

export default function IntegrationCard({
    integration,
    onConnect,
    onDisconnect,
    onTest,
    onSync,
    disabled = false,
}: IntegrationCardProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const Icon = iconMap[integration.icon] || EmailIcon;

    const getStatusChip = () => {
        switch (integration.status) {
            case 'connected':
                return (
                    <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        label="Connected"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                            color: '#10b981',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                );
            case 'error':
                return (
                    <Chip
                        icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                        label="Error"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                            color: '#ef4444',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                );
            case 'pending':
                return (
                    <Chip
                        icon={<WarningIcon sx={{ fontSize: 16 }} />}
                        label="Pending"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                            color: '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                );
            default:
                return (
                    <Chip
                        label="Not Connected"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                );
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Never';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <Box
            sx={{
                bgcolor: bgColor,
                borderRadius: '16px',
                p: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: integration.status === 'connected'
                        ? (isDark ? 'rgba(255, 107, 107, 0.3)' : '#fecaca')
                        : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                }
            }}
        >
            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: integration.status === 'connected'
                            ? (isDark ? 'rgba(255, 107, 107, 0.15)' : '#fee2e2')
                            : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Icon
                        sx={{
                            fontSize: 28,
                            color: integration.status === 'connected' ? '#ff6b6b' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
                        }}
                    />
                </Box>
                <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ fontSize: '0.95rem' }}>
                            {integration.name}
                        </Typography>
                        {getStatusChip()}
                    </Box>
                    <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.8rem' }}>
                        {integration.description}
                    </Typography>
                </Box>
            </Box>

            {integration.lastSync && (
                <Box
                    sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                        borderRadius: '8px',
                        p: 1.25,
                        mb: 1.5,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                    }}
                >
                    <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                        Last Synced
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={textPrimary} sx={{ fontSize: '0.8rem' }}>
                        {formatDate(integration.lastSync)}
                    </Typography>
                </Box>
            )}

            {integration.error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 1.5,
                        borderRadius: '8px',
                        py: 0.5,
                        bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}`,
                    }}
                >
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{integration.error}</Typography>
                </Alert>
            )}

            <Box display="flex" gap={1} flexWrap="wrap">
                {integration.status === 'connected' ? (
                    <>
                        {integration.id === 'gmail' && onSync && (
                            <Box
                                onClick={disabled ? undefined : () => onSync(integration.id)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.625,
                                    borderRadius: '8px',
                                    bgcolor: '#ffffff',
                                    color: '#1e293b',
                                    border: '1px solid #e2e8f0',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    opacity: disabled ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': disabled ? {} : {
                                        bgcolor: '#f8fafc',
                                    }
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                                Sync Now
                            </Box>
                        )}
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onTest(integration.id)}
                            disabled={disabled}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                color: textPrimary,
                                '&:hover': {
                                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                }
                            }}
                        >
                            Test
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onDisconnect(integration.id)}
                            disabled={disabled}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                                color: '#ef4444',
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                                }
                            }}
                        >
                            Disconnect
                        </Button>
                    </>
                ) : (
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => onConnect(integration.id)}
                        disabled={disabled}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#8b5cf6',
                            '&:hover': {
                                bgcolor: '#7c3aed',
                            }
                        }}
                    >
                        Connect
                    </Button>
                )}
            </Box>
        </Box>
    );
}

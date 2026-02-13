'use client';

import {
    Box,
    Typography,
    Switch,
    Chip,
    useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';
import { AutomationSetting } from '@/lib/services/automation.service';

interface AutomationCardProps {
    automationKey: string;
    automation: AutomationSetting;
    onToggle: (key: string, enabled: boolean) => void;
    onCardClick: (key: string) => void;
    disabled?: boolean;
}

const automationIcons: Record<string, any> = {
    NEW_CONTACT: EmailIcon,
    BOOKING_CREATED: CheckCircleIcon,
    BOOKING_REMINDER: EventIcon,
    FORM_PENDING: NotificationsIcon,
    INVENTORY_LOW: InventoryIcon,
};

export default function AutomationCard({ 
    automationKey, 
    automation, 
    onToggle, 
    onCardClick,
    disabled = false 
}: AutomationCardProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const Icon = automationIcons[automationKey] || NotificationsIcon;

    return (
        <Box
            onClick={() => onCardClick(automationKey)}
            sx={{
                bgcolor: bgColor,
                borderRadius: '16px',
                p: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: automation.enabled 
                        ? (isDark ? 'rgba(139, 92, 246, 0.3)' : '#c4b5fd')
                        : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                }
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: automation.enabled 
                            ? (isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe')
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
                            color: automation.enabled ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
                        }} 
                    />
                </Box>
                <Switch
                    checked={automation.enabled}
                    onChange={(e) => {
                        e.stopPropagation();
                        onToggle(automationKey, e.target.checked);
                    }}
                    disabled={disabled}
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: '#8b5cf6',
                        },
                    }}
                />
            </Box>

            <Box mb={2}>
                <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.5 }}>
                    {automation.name}
                </Typography>
                <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.875rem' }}>
                    {automation.description}
                </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
                {automation.enabled ? (
                    <Chip
                        label="Active"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                            color: '#10b981',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                ) : (
                    <Chip
                        label="Inactive"
                        size="small"
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}

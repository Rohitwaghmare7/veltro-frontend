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
                p: 2,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                        ? '0 8px 24px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: automation.enabled 
                        ? (isDark ? 'rgba(255, 107, 107, 0.3)' : '#fecaca')
                        : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                }
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        bgcolor: automation.enabled 
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
                            fontSize: 24,
                            color: automation.enabled ? '#ff6b6b' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
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
                    size="small"
                    sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#ff6b6b',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            bgcolor: '#ff6b6b',
                        },
                    }}
                />
            </Box>

            <Box mb={1.5}>
                <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.25, fontSize: '0.95rem' }}>
                    {automation.name}
                </Typography>
                <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.8rem' }}>
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
                            fontSize: '0.7rem',
                            height: 22,
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
                            fontSize: '0.7rem',
                            height: 22,
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}

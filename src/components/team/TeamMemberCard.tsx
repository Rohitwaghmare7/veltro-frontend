'use client';

import {
    Box,
    Typography,
    Avatar,
    Chip,
    IconButton,
    useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import ErrorIcon from '@mui/icons-material/Error';
import { StaffMember } from '@/lib/services/staff.service';

interface TeamMemberCardProps {
    member: StaffMember;
    onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
    onCardClick: () => void;
}

export default function TeamMemberCard({ member, onMenuClick, onCardClick }: TeamMemberCardProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusChip = () => {
        if (member.status === 'deactivated') {
            return (
                <Chip
                    icon={<BlockIcon sx={{ fontSize: 16 }} />}
                    label="Deactivated"
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
        }
        if (member.inviteStatus === 'expired') {
            return (
                <Chip
                    icon={<ErrorIcon sx={{ fontSize: 16 }} />}
                    label="Invite Expired"
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
        }
        if (member.inviteStatus === 'pending') {
            return (
                <Chip
                    icon={<PendingIcon sx={{ fontSize: 16 }} />}
                    label="Invite Pending"
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
        }
        if (member.status === 'active') {
            return (
                <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
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
            );
        }
        return null;
    };

    const getPermissionSummary = () => {
        const active = Object.entries(member.permissions).filter(([_, value]) => value).length;
        const total = Object.keys(member.permissions).length;
        return `${active}/${total} permissions`;
    };

    return (
        <Box
            onClick={onCardClick}
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
                    borderColor: isDark ? 'rgba(255, 107, 107, 0.3)' : '#fecaca',
                }
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#ff6b6b',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                        }}
                    >
                        {getInitials(member.name)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.25, fontSize: '0.95rem' }}>
                            {member.name}
                        </Typography>
                        <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.75rem' }}>
                            {member.email}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMenuClick(e);
                    }}
                    sx={{
                        color: textSecondary,
                        p: 0.5,
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                        }
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                {getStatusChip()}
            </Box>

            <Box
                sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    borderRadius: '12px',
                    p: 1.25,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                }}
            >
                <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mb: 0.25, fontSize: '0.7rem' }}>
                    Permissions
                </Typography>
                <Typography variant="body2" fontWeight={600} color={textPrimary} sx={{ fontSize: '0.85rem' }}>
                    {getPermissionSummary()}
                </Typography>
            </Box>
        </Box>
    );
}

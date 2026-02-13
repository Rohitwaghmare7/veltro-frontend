'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Switch,
    useTheme,
    CircularProgress,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useState, useEffect } from 'react';
import { StaffMember, StaffPermissions } from '@/lib/services/staff.service';

interface PermissionsDialogProps {
    open: boolean;
    onClose: () => void;
    member: StaffMember | null;
    onUpdate: (memberId: string, permissions: StaffPermissions) => Promise<void>;
    processing: boolean;
}

export default function PermissionsDialog({ open, onClose, member, onUpdate, processing }: PermissionsDialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [permissions, setPermissions] = useState<StaffPermissions | null>(null);

    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    useEffect(() => {
        if (member) {
            setPermissions(member.permissions);
        }
    }, [member]);

    const handleSubmit = async () => {
        if (member && permissions) {
            await onUpdate(member._id, permissions);
            onClose();
        }
    };

    const permissionGroups = [
        {
            title: 'Bookings',
            permissions: [
                { key: 'canViewBookings', label: 'View Bookings', description: 'Can view all bookings' },
                { key: 'canEditBookings', label: 'Edit Bookings', description: 'Can create and modify bookings' },
            ]
        },
        {
            title: 'Leads',
            permissions: [
                { key: 'canViewLeads', label: 'View Leads', description: 'Can view all leads' },
                { key: 'canEditLeads', label: 'Edit Leads', description: 'Can create and modify leads' },
            ]
        },
        {
            title: 'Communication',
            permissions: [
                { key: 'canViewInbox', label: 'View Inbox', description: 'Can access inbox messages' },
                { key: 'canSendEmails', label: 'Send Emails', description: 'Can send emails to clients' },
            ]
        },
        {
            title: 'System',
            permissions: [
                { key: 'canManageInventory', label: 'Manage Inventory', description: 'Can manage inventory items' },
                { key: 'canViewReports', label: 'View Reports', description: 'Can access reports and analytics' },
                { key: 'canManageAutomations', label: 'Manage Automations', description: 'Can configure automations' },
            ]
        },
    ];

    if (!member || !permissions) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '24px',
                        bgcolor: bgColor,
                        boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <SecurityIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary}>
                            Edit Permissions
                        </Typography>
                        <Typography variant="caption" color={textSecondary}>
                            {member.name} • {member.email}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3} mt={1}>
                    {permissionGroups.map((group) => (
                        <Box key={group.title}>
                            <Typography variant="subtitle2" fontWeight={600} color={textPrimary} sx={{ mb: 1.5 }}>
                                {group.title}
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {group.permissions.map((perm) => (
                                    <Box
                                        key={perm.key}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{
                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                            borderRadius: '12px',
                                            p: 2,
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} color={textPrimary}>
                                                {perm.label}
                                            </Typography>
                                            <Typography variant="caption" color={textSecondary}>
                                                {perm.description}
                                            </Typography>
                                        </Box>
                                        <Switch
                                            checked={permissions[perm.key as keyof StaffPermissions]}
                                            onChange={(e) =>
                                                setPermissions({
                                                    ...permissions,
                                                    [perm.key]: e.target.checked,
                                                })
                                            }
                                            disabled={member.status === 'deactivated'}
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
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: textPrimary,
                        '&:hover': {
                            borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        bgcolor: '#8b5cf6',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                        '&:hover': {
                            bgcolor: '#7c3aed',
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                        }
                    }}
                >
                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

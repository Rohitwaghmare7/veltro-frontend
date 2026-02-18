'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Switch,
    useTheme,
    Alert,
    CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from 'react';
import { StaffPermissions } from '@/lib/services/staff.service';

interface InviteStaffDialogProps {
    open: boolean;
    onClose: () => void;
    onInvite: (data: { name: string; email: string; permissions: StaffPermissions }) => Promise<void>;
    processing: boolean;
}

const defaultPermissions: StaffPermissions = {
    canViewBookings: true,
    canEditBookings: false,
    canViewLeads: true,
    canEditLeads: false,
    canViewInbox: true,
    canSendEmails: false,
    canManageInventory: false,
    canViewReports: false,
    canManageAutomations: false,
};

export default function InviteStaffDialog({ open, onClose, onInvite, processing }: InviteStaffDialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [permissions, setPermissions] = useState<StaffPermissions>(defaultPermissions);

    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const handleClose = () => {
        setName('');
        setEmail('');
        setPermissions(defaultPermissions);
        onClose();
    };

    const handleSubmit = async () => {
        await onInvite({ name, email, permissions });
        handleClose();
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

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
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
            <DialogTitle sx={{ pb: 1.5, pt: 2, px: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255, 107, 107, 0.15)' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <PersonAddIcon sx={{ color: '#ff6b6b', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary} fontSize="1.1rem">
                            Invite New Staff Member
                        </Typography>
                        <Typography variant="caption" color={textSecondary} fontSize="0.75rem">
                            Send an invitation to join your team
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 2, }}>
                <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1}}>
                    <TextField
                        label="Full Name"
                        fullWidth
                        size="small"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        InputLabelProps={{
                            sx: {
                                color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                '&.Mui-focused': {
                                    color: isDark ? 'rgba(255,255,255,0.7)' : '#374151'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '& input': {
                                    color: textPrimary,
                                    py: 1.25
                                }
                            }
                        }}
                    />
                    <TextField
                        label="Email Address"
                        type="email"
                        fullWidth
                        size="small"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputLabelProps={{
                            sx: {
                                color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                '&.Mui-focused': {
                                    color: isDark ? 'rgba(255,255,255,0.7)' : '#374151'
                                }
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '& input': {
                                    color: textPrimary,
                                    py: 1.25
                                }
                            }
                        }}
                    />

                    <Alert
                        severity="info"
                        sx={{
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
                            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#93c5fd'}`,
                        }}
                    >
                        Invite link will expire in 48 hours. You can adjust permissions anytime after they join.
                    </Alert>

                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} color={textPrimary} sx={{ mb: 1.5 }} fontSize="0.95rem">
                            Initial Permissions
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {permissionGroups.map((group) => (
                                <Box key={group.title}>
                                    <Typography variant="subtitle2" fontWeight={600} color={textPrimary} sx={{ mb: 1 }} fontSize="0.85rem">
                                        {group.title}
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        {group.permissions.map((perm) => (
                                            <Box
                                                key={perm.key}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                sx={{
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                    borderRadius: '12px',
                                                    p: 1.5,
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color={textPrimary} fontSize="0.85rem">
                                                        {perm.label}
                                                    </Typography>
                                                    <Typography variant="caption" color={textSecondary} fontSize="0.7rem">
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
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 1.5, gap: 1 }}>
                <Button
                    onClick={handleClose}
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
                    disabled={!name || !email || processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #ff5252 0%, #ff7043 100%)',
                            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)'
                        },
                        '&:disabled': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8',
                            background: 'none'
                        }
                    }}
                >
                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Send Invite'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

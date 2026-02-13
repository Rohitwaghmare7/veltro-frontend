'use client';

import {
    Box,
    Typography,
    Button,
    Backdrop,
    CircularProgress,
    Menu,
    MenuItem,
    useTheme,
    Snackbar,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useState, useEffect } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { StaffMember } from '@/lib/services/staff.service';
import RBACGuard from '@/components/dashboard/RBACGuard';
import TeamMemberCard from '@/components/team/TeamMemberCard';
import InviteStaffDialog from '@/components/team/InviteStaffDialog';
import PermissionsDialog from '@/components/team/PermissionsDialog';
import ConfirmActionDialog from '@/components/team/ConfirmActionDialog';

export default function TeamPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const { staff, loading, processing, fetchStaff, inviteStaff, updatePermissions, deactivateStaff, reactivateStaff, removeStaff } = useTeamStore();

    const [openInvite, setOpenInvite] = useState(false);
    const [openPermissions, setOpenPermissions] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'deactivate' | 'reactivate' | 'remove' | null>(null);
    const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: StaffMember) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCardClick = (member: StaffMember) => {
        setSelectedMember(member);
        setOpenPermissions(true);
    };

    const handleInvite = async (data: { name: string; email: string; permissions: any }) => {
        const result = await inviteStaff(data);
        if (result.success) {
            setToast({ open: true, message: 'Invitation sent successfully!', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to send invitation', severity: 'error' });
        }
    };

    const handleUpdatePermissions = async (memberId: string, permissions: any) => {
        const result = await updatePermissions(memberId, permissions);
        if (result.success) {
            setToast({ open: true, message: 'Permissions updated successfully!', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to update permissions', severity: 'error' });
        }
    };

    const handleConfirmAction = async () => {
        if (!selectedMember || !confirmAction) return;

        let result;
        if (confirmAction === 'deactivate') {
            result = await deactivateStaff(selectedMember._id);
            if (result.success) {
                setToast({ open: true, message: `${selectedMember.name} has been deactivated`, severity: 'success' });
            }
        } else if (confirmAction === 'reactivate') {
            result = await reactivateStaff(selectedMember._id);
            if (result.success) {
                setToast({ open: true, message: `${selectedMember.name} has been reactivated`, severity: 'success' });
            }
        } else if (confirmAction === 'remove') {
            result = await removeStaff(selectedMember._id);
            if (result.success) {
                setToast({ open: true, message: `${selectedMember.name} has been removed`, severity: 'success' });
            }
        }

        if (result && !result.success) {
            setToast({ open: true, message: result.error || 'Action failed', severity: 'error' });
        }

        setOpenConfirm(false);
        setConfirmAction(null);
        handleMenuClose();
    };

    const openConfirmDialog = (action: 'deactivate' | 'reactivate' | 'remove') => {
        setConfirmAction(action);
        setOpenConfirm(true);
        handleMenuClose();
    };

    const getConfirmDialogProps = () => {
        if (!selectedMember || !confirmAction) return null;

        const configs = {
            deactivate: {
                title: 'Deactivate Staff Member',
                message: `Are you sure you want to deactivate ${selectedMember.name}? They will lose access to the system but can be reactivated later.`,
                confirmText: 'Deactivate',
                type: 'warning' as const,
            },
            reactivate: {
                title: 'Reactivate Staff Member',
                message: `Are you sure you want to reactivate ${selectedMember.name}? They will regain access to the system with their previous permissions.`,
                confirmText: 'Reactivate',
                type: 'warning' as const,
            },
            remove: {
                title: 'Remove Staff Member',
                message: `Are you sure you want to permanently remove ${selectedMember.name}? This action cannot be undone and all their data will be deleted.`,
                confirmText: 'Remove Permanently',
                type: 'danger' as const,
            },
        };

        return configs[confirmAction];
    };

    const confirmDialogProps = getConfirmDialogProps();

    if (loading && staff.length === 0) {
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
                        Loading team members...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                            Team Members
                        </Typography>
                        <Typography variant="body2" color={textSecondary} fontWeight={500}>
                            Manage your team and their permissions
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenInvite(true)}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1.5,
                            bgcolor: '#8b5cf6',
                            color: 'white',
                            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                            '&:hover': {
                                bgcolor: '#7c3aed',
                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                            }
                        }}
                    >
                        Invite Staff
                    </Button>
                </Box>

                {/* Empty State */}
                {staff.length === 0 ? (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            minHeight: '60vh',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                            }}
                        >
                            <GroupIcon sx={{ fontSize: 64, color: '#8b5cf6' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                            No Team Members Yet
                        </Typography>
                        <Typography variant="body1" color={textSecondary} sx={{ mb: 3, maxWidth: 400 }}>
                            Start building your team by inviting staff members. They'll receive an email with instructions to join.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenInvite(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                bgcolor: '#8b5cf6',
                                color: 'white',
                                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                                '&:hover': {
                                    bgcolor: '#7c3aed',
                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                                }
                            }}
                        >
                            Invite Your First Staff Member
                        </Button>
                    </Box>
                ) : (
                    /* Team Grid */
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(4, 1fr)',
                            },
                            gap: 3,
                        }}
                    >
                        {staff.map((member) => (
                            <TeamMemberCard
                                key={member._id}
                                member={member}
                                onMenuClick={(e) => handleMenuOpen(e, member)}
                                onCardClick={() => handleCardClick(member)}
                            />
                        ))}
                    </Box>
                )}

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: '12px',
                                bgcolor: isDark ? '#1a1d29' : '#ffffff',
                                boxShadow: isDark ? '0px 8px 24px rgba(0,0,0,0.4)' : '0px 8px 24px rgba(0,0,0,0.1)',
                                minWidth: 200,
                            }
                        }
                    }}
                >
                    {selectedMember?.status === 'deactivated' ? (
                        <MenuItem
                            onClick={() => openConfirmDialog('reactivate')}
                            sx={{
                                py: 1.5,
                                px: 2,
                                color: textPrimary,
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                }
                            }}
                        >
                            <CheckCircleIcon fontSize="small" sx={{ mr: 1.5, color: '#10b981' }} />
                            Reactivate
                        </MenuItem>
                    ) : (
                        <MenuItem
                            onClick={() => openConfirmDialog('deactivate')}
                            sx={{
                                py: 1.5,
                                px: 2,
                                color: textPrimary,
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                }
                            }}
                        >
                            <BlockIcon fontSize="small" sx={{ mr: 1.5, color: '#f59e0b' }} />
                            Deactivate
                        </MenuItem>
                    )}
                    <MenuItem
                        onClick={() => openConfirmDialog('remove')}
                        sx={{
                            py: 1.5,
                            px: 2,
                            color: '#ef4444',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                            }
                        }}
                    >
                        <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                        Remove Permanently
                    </MenuItem>
                </Menu>

                {/* Dialogs */}
                <InviteStaffDialog
                    open={openInvite}
                    onClose={() => setOpenInvite(false)}
                    onInvite={handleInvite}
                    processing={processing}
                />

                <PermissionsDialog
                    open={openPermissions}
                    onClose={() => setOpenPermissions(false)}
                    member={selectedMember}
                    onUpdate={handleUpdatePermissions}
                    processing={processing}
                />

                {confirmDialogProps && (
                    <ConfirmActionDialog
                        open={openConfirm}
                        onClose={() => setOpenConfirm(false)}
                        onConfirm={handleConfirmAction}
                        processing={processing}
                        {...confirmDialogProps}
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

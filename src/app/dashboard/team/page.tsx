'use client';

import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Switch,
    Tooltip,
    Menu,
    MenuItem,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import ErrorIcon from '@mui/icons-material/Error';
import { useState, useEffect } from 'react';
import { staffService, StaffMember, StaffPermissions } from '@/lib/services/staff.service';
import RBACGuard from '@/components/dashboard/RBACGuard';

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

export default function TeamPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [openInvite, setOpenInvite] = useState(false);
    const [inviteData, setInviteData] = useState({ name: '', email: '' });
    const [permissionData, setPermissionData] = useState<StaffPermissions>(defaultPermissions);
    const [processing, setProcessing] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const fetchStaff = async () => {
        try {
            const data = await staffService.getStaff();
            if (data.success) {
                setStaff(data.data);
            }
        } catch (error) {
            console.error('Failed to load staff', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleInvite = async () => {
        if (!inviteData.name || !inviteData.email) {
            alert('Please fill in all fields');
            return;
        }

        setProcessing(true);
        try {
            await staffService.inviteStaff({
                ...inviteData,
                permissions: permissionData
            });
            setOpenInvite(false);
            setInviteData({ name: '', email: '' });
            setPermissionData(defaultPermissions);
            fetchStaff();
        } catch (error: any) {
            console.error('Failed to invite staff', error);
            alert(error.response?.data?.message || 'Failed to invite staff member');
        } finally {
            setProcessing(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: StaffMember) => {
        setAnchorEl(event.currentTarget);
        setSelectedStaff(member);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedStaff(null);
    };

    const handleDeactivate = async () => {
        if (!selectedStaff) return;
        if (!confirm(`Deactivate ${selectedStaff.name}? They will lose access to the system.`)) return;

        try {
            await staffService.deactivateStaff(selectedStaff._id);
            fetchStaff();
        } catch (error) {
            console.error('Failed to deactivate staff', error);
        }
        handleMenuClose();
    };

    const handleReactivate = async () => {
        if (!selectedStaff) return;

        try {
            await staffService.reactivateStaff(selectedStaff._id);
            fetchStaff();
        } catch (error) {
            console.error('Failed to reactivate staff', error);
        }
        handleMenuClose();
    };

    const handleRemove = async () => {
        if (!selectedStaff) return;
        if (!confirm(`Permanently remove ${selectedStaff.name}? This cannot be undone.`)) return;

        try {
            await staffService.removeStaff(selectedStaff._id);
            fetchStaff();
        } catch (error) {
            console.error('Failed to remove staff', error);
        }
        handleMenuClose();
    };

    const handlePermissionToggle = async (memberId: string, permission: keyof StaffPermissions, currentValue: boolean) => {
        try {
            const updatedPermissions = staff.find(s => s._id === memberId)?.permissions;
            if (!updatedPermissions) return;

            await staffService.updateStaff(memberId, {
                ...updatedPermissions,
                [permission]: !currentValue
            });
            
            // Update local state
            setStaff(staff.map(s => 
                s._id === memberId 
                    ? { ...s, permissions: { ...s.permissions, [permission]: !currentValue } }
                    : s
            ));
        } catch (error) {
            console.error('Failed to update permission', error);
        }
    };

    const getStatusChip = (member: StaffMember) => {
        if (member.status === 'deactivated') {
            return <Chip icon={<BlockIcon />} label="Deactivated" color="error" size="small" />;
        }
        if (member.inviteStatus === 'expired') {
            return <Chip icon={<ErrorIcon />} label="Invite Expired" color="warning" size="small" />;
        }
        if (member.inviteStatus === 'pending') {
            return <Chip icon={<PendingIcon />} label="Invite Pending" color="warning" size="small" />;
        }
        if (member.status === 'active') {
            return <Chip icon={<CheckCircleIcon />} label="Active" color="success" size="small" />;
        }
        return <Chip label="Inactive" size="small" />;
    };

    const getPermissionSummary = (permissions: StaffPermissions) => {
        const active = Object.entries(permissions).filter(([_, value]) => value).length;
        const total = Object.keys(permissions).length;
        return `${active}/${total}`;
    };

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <RBACGuard requireOwner>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold">Team Members</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenInvite(true)}>
                        Invite Staff
                    </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    Invite tokens expire after 48 hours. Toggle permissions inline for quick updates.
                </Alert>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                                <TableCell align="center"><strong>Permissions</strong></TableCell>
                                <TableCell align="center"><strong>View Bookings</strong></TableCell>
                                <TableCell align="center"><strong>Edit Bookings</strong></TableCell>
                                <TableCell align="center"><strong>View Leads</strong></TableCell>
                                <TableCell align="center"><strong>Edit Leads</strong></TableCell>
                                <TableCell align="center"><strong>Inbox</strong></TableCell>
                                <TableCell align="center"><strong>Inventory</strong></TableCell>
                                <TableCell align="center"><strong>Reports</strong></TableCell>
                                <TableCell align="center"><strong>Automations</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                                        <Typography color="textSecondary">
                                            No staff members yet. Click "Invite Staff" to get started.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staff.map((member) => (
                                    <TableRow key={member._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {member.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {member.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusChip(member)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={getPermissionSummary(member.permissions)} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canViewBookings}
                                                onChange={() => handlePermissionToggle(member._id, 'canViewBookings', member.permissions.canViewBookings)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canEditBookings}
                                                onChange={() => handlePermissionToggle(member._id, 'canEditBookings', member.permissions.canEditBookings)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canViewLeads}
                                                onChange={() => handlePermissionToggle(member._id, 'canViewLeads', member.permissions.canViewLeads)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canEditLeads}
                                                onChange={() => handlePermissionToggle(member._id, 'canEditLeads', member.permissions.canEditLeads)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canViewInbox}
                                                onChange={() => handlePermissionToggle(member._id, 'canViewInbox', member.permissions.canViewInbox)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canManageInventory}
                                                onChange={() => handlePermissionToggle(member._id, 'canManageInventory', member.permissions.canManageInventory)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canViewReports}
                                                onChange={() => handlePermissionToggle(member._id, 'canViewReports', member.permissions.canViewReports)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={member.permissions.canManageAutomations}
                                                onChange={() => handlePermissionToggle(member._id, 'canManageAutomations', member.permissions.canManageAutomations)}
                                                size="small"
                                                disabled={member.status === 'deactivated'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, member)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {selectedStaff?.status === 'deactivated' ? (
                        <MenuItem onClick={handleReactivate}>
                            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                            Reactivate
                        </MenuItem>
                    ) : (
                        <MenuItem onClick={handleDeactivate}>
                            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                            Deactivate
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
                        <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                        Remove Permanently
                    </MenuItem>
                </Menu>

                {/* Invite Dialog */}
                <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Invite New Staff Member</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={inviteData.name}
                                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                            />
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                value={inviteData.email}
                                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                            />

                            <Alert severity="info" sx={{ mt: 1 }}>
                                Invite link will expire in 48 hours. You can set permissions now or adjust them later.
                            </Alert>

                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Initial Permissions</Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">View Bookings</Typography>
                                    <Switch
                                        checked={permissionData.canViewBookings}
                                        onChange={() => setPermissionData({ ...permissionData, canViewBookings: !permissionData.canViewBookings })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">Edit Bookings</Typography>
                                    <Switch
                                        checked={permissionData.canEditBookings}
                                        onChange={() => setPermissionData({ ...permissionData, canEditBookings: !permissionData.canEditBookings })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">View Leads</Typography>
                                    <Switch
                                        checked={permissionData.canViewLeads}
                                        onChange={() => setPermissionData({ ...permissionData, canViewLeads: !permissionData.canViewLeads })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">Edit Leads</Typography>
                                    <Switch
                                        checked={permissionData.canEditLeads}
                                        onChange={() => setPermissionData({ ...permissionData, canEditLeads: !permissionData.canEditLeads })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">View Inbox</Typography>
                                    <Switch
                                        checked={permissionData.canViewInbox}
                                        onChange={() => setPermissionData({ ...permissionData, canViewInbox: !permissionData.canViewInbox })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">Manage Inventory</Typography>
                                    <Switch
                                        checked={permissionData.canManageInventory}
                                        onChange={() => setPermissionData({ ...permissionData, canManageInventory: !permissionData.canManageInventory })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">View Reports</Typography>
                                    <Switch
                                        checked={permissionData.canViewReports}
                                        onChange={() => setPermissionData({ ...permissionData, canViewReports: !permissionData.canViewReports })}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">Manage Automations</Typography>
                                    <Switch
                                        checked={permissionData.canManageAutomations}
                                        onChange={() => setPermissionData({ ...permissionData, canManageAutomations: !permissionData.canManageAutomations })}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenInvite(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleInvite} disabled={processing}>
                            {processing ? <CircularProgress size={20} /> : 'Send Invite'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

'use client';

import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    FormGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { staffService, StaffMember, StaffPermissions } from '@/lib/services/staff.service';

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

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function TeamPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [openInvite, setOpenInvite] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [inviteData, setInviteData] = useState({ name: '', email: '' });
    const [permissionData, setPermissionData] = useState<StaffPermissions>(defaultPermissions);
    const [processing, setProcessing] = useState(false);

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
        if (!inviteData.name || !inviteData.email) return alert('Please fill in fields');

        setProcessing(true);
        try {
            if (editingStaff) {
                await staffService.updateStaff(editingStaff._id, permissionData);
            } else {
                await staffService.inviteStaff({
                    ...inviteData,
                    permissions: permissionData
                });
            }
            setOpenInvite(false);
            setEditingStaff(null);
            setInviteData({ name: '', email: '' });
            setPermissionData(defaultPermissions);
            fetchStaff();
        } catch (error: any) {
            console.error('Failed to save staff', error);
            alert(error.response?.data?.message || 'Failed to save staff member');
        } finally {
            setProcessing(false);
        }
    };

    const handleEdit = (member: StaffMember) => {
        setEditingStaff(member);
        setInviteData({ name: member.name, email: member.email });
        setPermissionData(member.permissions);
        setOpenInvite(true);
    };

    const handleRemove = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await staffService.removeStaff(id);
            setStaff(staff.filter(s => s._id !== id));
        } catch (error) {
            console.error('Failed to remove staff', error);
        }
    };

    const togglePermission = (key: keyof StaffPermissions) => {
        setPermissionData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <RBACGuard requireOwner>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Team Members</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenInvite(true)}>
                        Invite Staff
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {staff.map((member) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={member._id}>
                            <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            onClick={() => handleEdit(member)}
                                            color="primary"
                                            size="small"
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleRemove(member._id, member.name)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Avatar
                                        src={member.avatar}
                                        sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
                                    >
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <Typography variant="h6" noWrap>{member.name}</Typography>
                                    <Typography variant="body2" color="textSecondary" mb={2} noWrap>
                                        {member.email}
                                    </Typography>
                                    <Chip
                                        label={member.inviteStatus === 'pending' ? 'Invite Pending' : 'Active'}
                                        color={member.inviteStatus === 'accepted' ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                    <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                                        {member.permissions.canManageInventory && <Chip label="Inventory" size="small" variant="outlined" />}
                                        {member.permissions.canEditBookings && <Chip label="Bookings" size="small" variant="outlined" />}
                                        {member.permissions.canViewLeads && <Chip label="Leads" size="small" variant="outlined" />}
                                        {member.permissions.canManageAutomations && <Chip label="Automations" size="small" variant="outlined" />}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Invite/Edit Dialog */}
                <Dialog open={openInvite} onClose={() => { setOpenInvite(false); setEditingStaff(null); }} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Invite New Staff Member'}</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={inviteData.name}
                                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                disabled={!!editingStaff} // Name usually fixed for existing account? Or let them change? Let's fix it if staff is active.
                            />
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                value={inviteData.email}
                                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                disabled={!!editingStaff} // Email should definitely be fixed
                            />

                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Permissions</Typography>
                            <FormGroup row>
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canViewBookings} onChange={() => togglePermission('canViewBookings')} />}
                                    label="View Bookings"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canEditBookings} onChange={() => togglePermission('canEditBookings')} />}
                                    label="Edit Bookings"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canViewLeads} onChange={() => togglePermission('canViewLeads')} />}
                                    label="View Leads"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canEditLeads} onChange={() => togglePermission('canEditLeads')} />}
                                    label="Edit Leads"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canViewInbox} onChange={() => togglePermission('canViewInbox')} />}
                                    label="View Inbox"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canManageInventory} onChange={() => togglePermission('canManageInventory')} />}
                                    label="Manage Inventory"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canViewReports} onChange={() => togglePermission('canViewReports')} />}
                                    label="View Reports"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={permissionData.canManageAutomations} onChange={() => togglePermission('canManageAutomations')} />}
                                    label="Manage Automations"
                                />
                            </FormGroup>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setOpenInvite(false); setEditingStaff(null); }}>Cancel</Button>
                        <Button variant="contained" onClick={handleInvite} disabled={processing}>
                            {editingStaff ? 'Save Changes' : 'Send Invite'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box >
        </RBACGuard>
    );
}

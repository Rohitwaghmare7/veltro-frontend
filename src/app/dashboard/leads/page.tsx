'use client';

import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Chip,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    CircularProgress as Spinner,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState, useEffect } from 'react';
import { leadService, Lead } from '@/lib/services/lead.service';

// Define stages with matching backend status values
const stages = [
    { id: 'new', title: 'New Leads', color: 'info.main' },
    { id: 'contacted', title: 'Contacted', color: 'warning.main' },
    { id: 'qualified', title: 'Qualified', color: 'success.main' },
    { id: 'closed', title: 'Closed', color: 'text.secondary' },
    // 'booked' status might exist but let's stick to these 4 columns for now, or map 'booked' to closed/qualified
];

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    // Menu state (for "Move to" / "Delete")
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'manual',
        notes: ''
    });

    const fetchLeads = async () => {
        try {
            const data = await leadService.getLeads();
            if (data.success) {
                setLeads(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch leads', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeadId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedLeadId(null);
    };

    const handleCreateLead = async () => {
        try {
            await leadService.createLead(formData);
            setOpenDialog(false);
            setFormData({ name: '', email: '', phone: '', source: 'manual', notes: '' });
            fetchLeads(); // Refresh list
        } catch (error) {
            console.error('Failed to create lead', error);
            alert('Failed to create lead');
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedLeadId) return;
        try {
            await leadService.updateStatus(selectedLeadId, status);
            fetchLeads(); // Refresh to update UI (could optimize with local state update)
            handleMenuClose();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLeadId) return;
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            await leadService.deleteLead(selectedLeadId);
            setLeads(prev => prev.filter(l => l._id !== selectedLeadId));
            handleMenuClose();
        } catch (error) {
            console.error('Failed to delete lead', error);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <RBACGuard permission="canViewLeads">
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Leads Pipeline</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                        Add Lead
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)', overflowX: 'auto' }}>
                    {stages.map((stage) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stage.id} sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    bgcolor: 'grey.100',
                                    p: 2,
                                    borderRadius: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {stage.title}
                                    </Typography>
                                    <Chip
                                        label={leads.filter(l => l.status === stage.id).length}
                                        size="small"
                                    />
                                </Box>

                                <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {leads
                                        .filter((lead) => lead.status === stage.id)
                                        .map((lead) => (
                                            <Card key={lead._id} variant="outlined">
                                                <CardContent sx={{ p: '16px !important' }}>
                                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="subtitle2" fontWeight="bold">{lead.name}</Typography>
                                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, lead._id)}>
                                                            <MoreHorizIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    {lead.notes && (
                                                        <Typography variant="body2" color="textSecondary" mb={2} noWrap>
                                                            {lead.notes}
                                                        </Typography>
                                                    )}
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Chip label={lead.source} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                                            {lead.name.charAt(0)}
                                                        </Avatar>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </Stack>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem disabled>Move to...</MenuItem>
                    {stages.map(stage => (
                        <MenuItem key={stage.id} onClick={() => handleUpdateStatus(stage.id)}>
                            {stage.title}
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>Delete</MenuItem>
                </Menu>

                {/* Dropdown for Add Lead */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <TextField
                                label="Phone"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <TextField
                                label="Notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateLead} disabled={!formData.name}>Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

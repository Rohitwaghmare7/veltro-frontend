'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
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
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Autocomplete,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, DragOverEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { leadService, Lead } from '@/lib/services/lead.service';
import api from '@/lib/api';
import RBACGuard from '@/components/dashboard/RBACGuard';

// Kanban stages
const stages = [
    { id: 'new', title: 'New Leads', color: '#2196f3' },
    { id: 'contacted', title: 'Contacted', color: '#ff9800' },
    { id: 'qualified', title: 'Qualified', color: '#4caf50' },
    { id: 'closed', title: 'Closed', color: '#9e9e9e' },
];

// Droppable Column Component
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                width: 320,
                flexShrink: 0,
                bgcolor: isOver ? 'action.hover' : 'grey.100',
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.2s',
            }}
        >
            {children}
        </Box>
    );
}

// Sortable Lead Card Component
function SortableLeadCard({ lead, onMenuOpen }: { lead: Lead; onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            variant="outlined"
            sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                mb: 2,
            }}
        >
            <CardContent sx={{ p: '16px !important' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold">{lead.name}</Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuOpen(e, lead._id);
                        }}
                    >
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Box>

                {lead.email && (
                    <Typography variant="caption" color="textSecondary" display="block" mb={0.5}>
                        {lead.email}
                    </Typography>
                )}

                {lead.notes && (
                    <Typography variant="body2" color="textSecondary" mb={1} noWrap>
                        {lead.notes}
                    </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                    {lead.tags && lead.tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    ))}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip label={lead.source} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    {lead.assignedTo ? (
                        <Tooltip title={`Assigned to ${(lead.assignedTo as any).name || 'Staff'}`}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                {((lead.assignedTo as any).name || 'S').charAt(0)}
                            </Avatar>
                        </Tooltip>
                    ) : (
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {lead.name.charAt(0)}
                        </Avatar>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    // Table sorting
    const [orderBy, setOrderBy] = useState<keyof Lead>('createdAt');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'manual',
        notes: '',
        tags: [] as string[],
        assignedTo: '',
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

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff');
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    useEffect(() => {
        fetchLeads();
        fetchStaff();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeadId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedLeadId(null);
    };

    const handleOpenDialog = (lead?: Lead) => {
        if (lead) {
            setEditingLead(lead);
            setFormData({
                name: lead.name,
                email: lead.email || '',
                phone: lead.phone || '',
                source: lead.source,
                notes: lead.notes || '',
                tags: lead.tags || [],
                assignedTo: (lead.assignedTo as any)?._id || '',
            });
        } else {
            setEditingLead(null);
            setFormData({ name: '', email: '', phone: '', source: 'manual', notes: '', tags: [], assignedTo: '' });
        }
        setOpenDialog(true);
    };

    const handleSaveLead = async () => {
        try {
            if (editingLead) {
                await leadService.updateLead(editingLead._id, formData);
            } else {
                await leadService.createLead(formData);
            }
            setOpenDialog(false);
            setEditingLead(null);
            fetchLeads();
        } catch (error) {
            console.error('Failed to save lead', error);
            alert('Failed to save lead');
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedLeadId) return;
        try {
            await leadService.updateStatus(selectedLeadId, status);
            fetchLeads();
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

    // Drag and drop handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: provide visual feedback during drag
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const leadId = active.id as string;
        const overId = over.id as string;

        // Check if we're dropping on a column (stage id) or another lead
        let newStatus = overId;
        
        // If dropped on another lead, get that lead's status
        const overLead = leads.find(l => l._id === overId);
        if (overLead) {
            newStatus = overLead.status;
        }

        // Check if it's a valid stage
        const validStage = stages.find(s => s.id === newStatus);
        if (!validStage) return;

        // Get the current lead
        const currentLead = leads.find(l => l._id === leadId);
        if (!currentLead || currentLead.status === newStatus) return;

        // Optimistically update UI
        setLeads(prev =>
            prev.map(lead =>
                lead._id === leadId ? { ...lead, status: newStatus as any } : lead
            )
        );

        // Update on server
        try {
            await leadService.updateStatus(leadId, newStatus);
        } catch (error) {
            console.error('Failed to update lead status', error);
            // Revert on error
            fetchLeads();
        }
    };

    // Table sorting
    const handleSort = (property: keyof Lead) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedLeads = [...leads].sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    const activeLead = leads.find(l => l._id === activeDragId);

    return (
        <RBACGuard permission="canViewLeads">
            <Box>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Leads Pipeline</Typography>
                    <Box display="flex" gap={2}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                        >
                            <ToggleButton value="kanban">
                                <ViewKanbanIcon />
                            </ToggleButton>
                            <ToggleButton value="table">
                                <ViewListIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                            Add Lead
                        </Button>
                    </Box>
                </Box>

                {/* Kanban View */}
                {viewMode === 'kanban' && (
                    <DndContext
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <Box display="flex" gap={3} sx={{ height: 'calc(100vh - 200px)', overflowX: 'auto' }}>
                            {stages.map((stage) => {
                                const stageLeads = leads.filter(l => l.status === stage.id);
                                return (
                                    <DroppableColumn key={stage.id} id={stage.id}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        bgcolor: stage.color,
                                                    }}
                                                />
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {stage.title}
                                                </Typography>
                                            </Box>
                                            <Chip label={stageLeads.length} size="small" />
                                        </Box>

                                        <SortableContext
                                            items={stageLeads.map(l => l._id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 100 }}>
                                                {stageLeads.map((lead) => (
                                                    <SortableLeadCard
                                                        key={lead._id}
                                                        lead={lead}
                                                        onMenuOpen={handleMenuOpen}
                                                    />
                                                ))}
                                                {stageLeads.length === 0 && (
                                                    <Box
                                                        sx={{
                                                            p: 3,
                                                            textAlign: 'center',
                                                            color: 'text.secondary',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        Drop leads here
                                                    </Box>
                                                )}
                                            </Box>
                                        </SortableContext>
                                    </DroppableColumn>
                                );
                            })}
                        </Box>

                        <DragOverlay>
                            {activeLead && (
                                <Card variant="outlined" sx={{ width: 300, opacity: 0.9 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {activeLead.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </DragOverlay>
                    </DndContext>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'name'}
                                            direction={orderBy === 'name' ? order : 'asc'}
                                            onClick={() => handleSort('name')}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'status'}
                                            direction={orderBy === 'status' ? order : 'asc'}
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>Tags</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'createdAt'}
                                            direction={orderBy === 'createdAt' ? order : 'asc'}
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            Created
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedLeads.map((lead) => (
                                    <TableRow key={lead._id} hover>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{lead.name}</TableCell>
                                        <TableCell>{lead.email || '-'}</TableCell>
                                        <TableCell>{lead.phone || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={lead.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: stages.find(s => s.id === lead.status)?.color,
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={lead.source} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                {lead.tags && lead.tags.map((tag, idx) => (
                                                    <Chip key={idx} label={tag} size="small" sx={{ height: 20 }} />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {lead.assignedTo ? (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                                        {((lead.assignedTo as any).name || 'S').charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {(lead.assignedTo as any).name || 'Staff'}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, lead._id)}>
                                                <MoreHorizIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Actions Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => {
                        const lead = leads.find(l => l._id === selectedLeadId);
                        if (lead) handleOpenDialog(lead);
                        handleMenuClose();
                    }}>
                        Edit
                    </MenuItem>
                    <MenuItem disabled>Move to...</MenuItem>
                    {stages.map(stage => (
                        <MenuItem key={stage.id} onClick={() => handleUpdateStatus(stage.id)}>
                            {stage.title}
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>Delete</MenuItem>
                </Menu>

                {/* Add/Edit Lead Dialog */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <TextField
                                label="Phone"
                                fullWidth
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Assigned To</InputLabel>
                                <Select
                                    value={formData.assignedTo}
                                    label="Assigned To"
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {staff.map((member) => (
                                        <MenuItem key={member._id} value={member._id}>
                                            {member.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={formData.tags}
                                onChange={(e, newValue) => setFormData({ ...formData, tags: newValue })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Tags" placeholder="Add tags..." />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            key={index}
                                            size="small"
                                        />
                                    ))
                                }
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
                        <Button variant="contained" onClick={handleSaveLead} disabled={!formData.name}>
                            {editingLead ? 'Save' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

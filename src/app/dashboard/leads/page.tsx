'use client';

import { useState, useEffect, useMemo } from 'react';
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
    Autocomplete,
    Tooltip,
    AvatarGroup,
    useTheme,
    Backdrop,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkIcon from '@mui/icons-material/Link';
import FlagIcon from '@mui/icons-material/Flag';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, DragOverEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/lib/services/lead.service';
import api from '@/lib/api';
import RBACGuard from '@/components/dashboard/RBACGuard';
import { useLeadsStore } from '@/store/leadsStore';
import ConfirmMoveDialog from '@/components/leads/ConfirmMoveDialog';

// Helper to generate mock data for UI visualization - REMOVED, now in store

// Kanban stages
const getStages = (isDark: boolean) => [
    { id: 'new', title: 'New Leads', color: '#3b82f6', countColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', countTextColor: '#3b82f6' },
    { id: 'contacted', title: 'Contacted', color: '#f59e0b', countColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', countTextColor: '#f59e0b' },
    { id: 'qualified', title: 'Qualified', color: '#10b981', countColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5', countTextColor: '#10b981' },
    { id: 'closed', title: 'Closed', color: '#6b7280', countColor: isDark ? 'rgba(107, 114, 128, 0.2)' : '#f3f4f6', countTextColor: '#6b7280' },
];

const getPriorityColors = (isDark: boolean) => ({
    High: { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', text: '#ef4444' },
    Medium: { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7', text: '#f59e0b' },
    Low: { bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', text: '#3b82f6' },
});

// Droppable Column Component
function DroppableColumn({ id, title, count, onAddClick, onMenuClick, children }: { id: string; title: string; count: number; onAddClick?: () => void; onMenuClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const stages = getStages(isDark);
    const stage = stages.find(s => s.id === id);

    // Theme colors
    const bgColor = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    return (
        <Box
            ref={setNodeRef}
            sx={{
                flex: 1,
                minWidth: 0,
                bgcolor: isOver ? (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9') : bgColor,
                p: 2,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                maxHeight: '100%',
                border: `1px solid ${borderColor}`,
                transition: 'all 0.2s'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} px={1}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: stage?.color,
                        }}
                    />
                    <Typography variant="subtitle1" fontWeight="700" color={textPrimary}>
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            bgcolor: stage?.countColor,
                            color: stage?.countTextColor,
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {count}
                    </Box>
                </Box>
                <Box display="flex" gap={0.5}>
                    <IconButton size="small" onClick={onAddClick} sx={{ color: textSecondary }}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onMenuClick} sx={{ color: textSecondary }}>
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1, pb: 2, '::-webkit-scrollbar': { display: 'none' } }}>
                {children}
            </Box>
        </Box>
    );
}

// Sortable Lead Card Component
function SortableLeadCard({ lead, onMenuOpen }: { lead: Lead; onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead._id });
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Theme colors
    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#f8fafc';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const priorityColors = getPriorityColors(isDark);
    const priority = lead.priority || 'Low';
    const pColor = priorityColors[priority];

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            elevation={0}
            sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                mb: 2,
                borderRadius: '16px',
                border: `1px solid ${borderColor}`,
                bgcolor: bgColor,
                boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                    boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                }
            }}
        >
            <CardContent sx={{ p: '20px !important' }}>
                {/* Header: Priority & Menu */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: pColor?.text || '#3b82f6',
                            }}
                        />
                        <Typography
                            variant="caption"
                            fontWeight="600"
                            sx={{ color: pColor?.text || '#3b82f6' }}
                        >
                            {priority === 'Medium' ? 'In Research' : priority === 'High' ? 'High Priority' : 'Routine'}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuOpen(e, lead._id);
                        }}
                        sx={{ p: 0.5, color: textSecondary }}
                    >
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Title and Description */}
                <Typography variant="subtitle1" fontWeight="700" color={textPrimary} gutterBottom>
                    {lead.name}
                </Typography>
                <Typography variant="body2" color={textSecondary} sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lead.notes || `Potential client from ${lead.source}. Needs follow-up regarding services.`}
                </Typography>

                {/* Tags if any */}
                {lead.tags && lead.tags.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                        {lead.tags.slice(0, 2).map((tag, idx) => (
                            <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                    color: textSecondary,
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Assignees and Due Date */}
                <Typography variant="caption" color={textSecondary} fontWeight="500" display="block" mb={1}>
                    Assignees :
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', borderColor: bgColor } }}>
                        {lead.assignedTo ? (
                            <Tooltip title={(lead.assignedTo as any).name || 'Staff'}>
                                <Avatar src={(lead.assignedTo as any).avatar}>
                                    {((lead.assignedTo as any).name || 'S').charAt(0)}
                                </Avatar>
                            </Tooltip>
                        ) : (
                            <Avatar>{lead.name.charAt(0)}</Avatar>
                        )}
                        {/* Fake extra assignee for visuals */}
                        <Avatar sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: textSecondary }}>+1</Avatar>
                    </AvatarGroup>

                    {lead.dueDate && (
                        <Chip
                            icon={<FlagIcon sx={{ fontSize: '1rem !important' }} />}
                            label={new Date(lead.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                            size="small"
                            sx={{
                                bgcolor: pColor?.bg,
                                color: pColor?.text,
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: 'none',
                                '& .MuiChip-icon': { color: 'inherit' }
                            }}
                        />
                    )}
                </Box>


            </CardContent>
        </Card>
    );
}

export default function LeadsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const stages = getStages(isDark);

    // Zustand store
    const { 
        leads, 
        loading, 
        movingLeads, 
        fetchLeads: fetchLeadsAction, 
        updateLeadStatus, 
        moveAllLeads: moveAllLeadsAction, 
        createLead: createLeadAction, 
        updateLead: updateLeadAction, 
        deleteLead: deleteLeadAction 
    } = useLeadsStore();

    const [staff, setStaff] = useState<any[]>([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    // Column menu state
    const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

    // Confirm move dialog state
    const [confirmMoveOpen, setConfirmMoveOpen] = useState(false);
    const [moveSource, setMoveSource] = useState<string | null>(null);
    const [moveTarget, setMoveTarget] = useState<string | null>(null);

    // Background color
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';

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
        fetchLeadsAction();
        fetchStaff();
    }, [fetchLeadsAction]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeadId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedLeadId(null);
    };

    const handleColumnMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, columnId: string) => {
        setColumnMenuAnchor(event.currentTarget);
        setSelectedColumn(columnId);
    };

    const handleColumnMenuClose = () => {
        setColumnMenuAnchor(null);
        setSelectedColumn(null);
    };

    const handleSelectAll = async () => {
        if (!selectedColumn) return;
        
        const columnLeads = leads.filter(l => l.status === selectedColumn);
        if (columnLeads.length === 0) {
            handleColumnMenuClose();
            return;
        }

        // For now, just show confirmation
        console.log(`Selected ${columnLeads.length} leads from this column`);
        handleColumnMenuClose();
    };

    const handleMoveAllTo = async (targetStatus: string) => {
        if (!selectedColumn || selectedColumn === targetStatus) {
            handleColumnMenuClose();
            return;
        }

        const columnLeads = leads.filter(l => l.status === selectedColumn);
        if (columnLeads.length === 0) {
            handleColumnMenuClose();
            return;
        }

        // Store source and target for confirmation dialog
        setMoveSource(selectedColumn);
        setMoveTarget(targetStatus);
        setConfirmMoveOpen(true);
        handleColumnMenuClose();
    };

    const handleConfirmMove = async () => {
        if (!moveSource || !moveTarget) return;

        setConfirmMoveOpen(false);

        const result = await moveAllLeadsAction(moveSource, moveTarget);
        
        if (!result.success) {
            console.error('Failed to move leads:', result.error);
        }

        setMoveSource(null);
        setMoveTarget(null);
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
                await updateLeadAction(editingLead._id, formData);
            } else {
                await createLeadAction(formData);
            }
            setOpenDialog(false);
            setEditingLead(null);
        } catch (error) {
            console.error('Failed to save lead', error);
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLeadId) return;

        try {
            await deleteLeadAction(selectedLeadId);
            handleMenuClose();
        } catch (error) {
            console.error('Failed to delete lead', error);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over) return;

        const leadId = active.id as string;
        const overId = over.id as string;

        let newStatus = overId;
        const overLead = leads.find(l => l._id === overId);
        if (overLead) {
            newStatus = overLead.status;
        }

        const validStage = stages.find(s => s.id === newStatus);
        if (!validStage) return;

        const currentLead = leads.find(l => l._id === leadId);
        if (!currentLead || currentLead.status === newStatus) return;

        // Use store action for optimistic update
        await updateLeadStatus(leadId, newStatus);
    };

    const activeLead = useMemo(() => leads.find(l => l._id === activeDragId), [leads, activeDragId]);

    if (loading) {
        return <Box display="flex" justifyContent="center" height="100vh" alignItems="center"><CircularProgress /></Box>;
    }

    return (
        <RBACGuard permission="canViewLeads">
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: pageBgColor }}>
                {/* Centered Loading Spinner */}
                <Backdrop 
                    open={movingLeads} 
                    sx={{ 
                        zIndex: 9999,
                        bgcolor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
                    }}
                >
                    <CircularProgress size={60} sx={{ color: '#8b5cf6' }} />
                </Backdrop>

                {/* Kanban Board Area */}
                <Box sx={{ flexGrow: 1, overflowX: 'auto', overflowY: 'hidden', p: 4, display: 'flex', gap: 3 }}>
                    <DndContext
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {stages.map((stage) => {
                            const stageLeads = leads.filter(l => l.status === stage.id);
                            return (
                                <DroppableColumn
                                    key={stage.id}
                                    id={stage.id}
                                    title={stage.title}
                                    count={stageLeads.length}
                                    onAddClick={() => handleOpenDialog()}
                                    onMenuClick={(e) => handleColumnMenuOpen(e, stage.id)}
                                >
                                    <SortableContext
                                        items={stageLeads.map(l => l._id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {stageLeads.map((lead) => (
                                            <SortableLeadCard
                                                key={lead._id}
                                                lead={lead}
                                                onMenuOpen={handleMenuOpen}
                                            />
                                        ))}
                                    </SortableContext>
                                </DroppableColumn>
                            );
                        })}

                        <DragOverlay>
                            {activeLead ? (
                                <Box sx={{ transform: 'rotate(2deg)' }}>
                                    <SortableLeadCard lead={activeLead} onMenuOpen={() => { }} />
                                </Box>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </Box>

                {/* Confirm Move Dialog */}
                <ConfirmMoveDialog
                    open={confirmMoveOpen}
                    onClose={() => {
                        setConfirmMoveOpen(false);
                        setMoveSource(null);
                        setMoveTarget(null);
                    }}
                    onConfirm={handleConfirmMove}
                    count={moveSource ? leads.filter(l => l.status === moveSource).length : 0}
                    fromColumn={moveSource ? stages.find(s => s.id === moveSource)?.title || '' : ''}
                    toColumn={moveTarget ? stages.find(s => s.id === moveTarget)?.title || '' : ''}
                />

                {/* Column Actions Menu */}
                <Menu 
                    anchorEl={columnMenuAnchor} 
                    open={Boolean(columnMenuAnchor)} 
                    onClose={handleColumnMenuClose}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: '16px',
                                boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
                                minWidth: 220,
                                mt: 1,
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                bgcolor: isDark ? '#1a1d29' : '#ffffff'
                            }
                        }
                    }}
                >
                    <MenuItem onClick={handleSelectAll}>
                        <Typography variant="body2" fontWeight={600}>Select All</Typography>
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                        Move All To:
                    </Typography>
                    {stages
                        .filter(s => s.id !== selectedColumn)
                        .map((stage) => (
                            <MenuItem key={stage.id} onClick={() => handleMoveAllTo(stage.id)}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: stage.color,
                                        }}
                                    />
                                    <Typography variant="body2">{stage.title}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                </Menu>

                {/* Actions Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => {
                        const lead = leads.find(l => l._id === selectedLeadId);
                        if (lead) handleOpenDialog(lead);
                        handleMenuClose();
                    }}>
                        Edit
                    </MenuItem>
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
                                required
                                helperText="Required for conversation and notification generation"
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
                        <Button variant="contained" onClick={handleSaveLead} disabled={!formData.name || !formData.email}>
                            {editingLead ? 'Save' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

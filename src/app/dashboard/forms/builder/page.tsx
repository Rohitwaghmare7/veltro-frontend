'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Chip,
    Autocomplete,
    Divider,
    useTheme,
    Tooltip,
    Stack
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formService, CreateFormData, FormField } from '@/lib/services/form.service';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RBACGuard from '@/components/dashboard/RBACGuard';
import api from '@/lib/api';
import NotificationSnackbar from '@/components/forms/NotificationSnackbar';
import ConfirmDeleteDialog from '@/components/forms/ConfirmDeleteDialog';

const toolBoxItems = [
    { icon: <TextFieldsIcon />, label: 'Short Text', type: 'text' },
    { icon: <TextFieldsIcon />, label: 'Long Text', type: 'textarea' },
    { icon: <TextFieldsIcon />, label: 'Number', type: 'number' },
    { icon: <TextFieldsIcon />, label: 'Email', type: 'email' },
    { icon: <TextFieldsIcon />, label: 'Phone', type: 'phone' },
    { icon: <CheckBoxIcon />, label: 'Checkbox', type: 'checkbox' },
    { icon: <RadioButtonCheckedIcon />, label: 'Select / Dropdown', type: 'select' },
    { icon: <ChecklistIcon />, label: 'Multi-Select', type: 'multiselect' },
    { icon: <DateRangeIcon />, label: 'Date Picker', type: 'date' },
];

// Sortable Field Component
function SortableField({ field, onUpdate, onRemove, onRequestDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMandatory = field.id === 'email-mandatory';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                p: 3,
                position: 'relative',
                mb: 2,
                bgcolor: isMandatory ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : cardBg,
                borderRadius: 1,
                border: `1px solid ${isMandatory ? (isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af') : borderColor}`,
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: isMandatory ? (isDark ? 'rgba(255,255,255,0.4)' : '#6b7280') : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
                    '& .actions': { opacity: 1 }
                }
            }}
        >
            {isMandatory && (
                <Chip
                    label="Required for Lead Capture"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: isDark ? 'rgba(255,255,255,0.2)' : '#374151',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: '24px',
                        zIndex: 3
                    }}
                />
            )}
            {!isMandatory && (
                <Box
                    className="actions"
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: isDark ? '#1f2937' : '#ffffff',
                        borderRadius: '8px',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                        p: 0.5,
                        border: `1px solid ${borderColor}`,
                        zIndex: 2
                    }}
                >
                    <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                        <DragIndicatorIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onRequestDelete(field.id, field.label)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
            {isMandatory && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 44,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: isDark ? '#1f2937' : '#ffffff',
                        borderRadius: '8px',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                        p: 0.5,
                        border: `1px solid ${borderColor}`,
                        zIndex: 2
                    }}
                >
                    <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                        <DragIndicatorIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        fullWidth
                        label="Field Label"
                        variant="standard"
                        value={field.label}
                        onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                        disabled={isMandatory}
                        InputProps={{ 
                            sx: { 
                                fontWeight: 'bold',
                                ...(isMandatory && { color: isDark ? 'rgba(255,255,255,0.9)' : '#111827' })
                            } 
                        }}
                        InputLabelProps={{
                            sx: {
                                color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                '&.Mui-focused': {
                                    color: isDark ? 'rgba(255,255,255,0.7)' : '#374151'
                                }
                            }
                        }}
                        helperText={isMandatory ? "This field is mandatory and cannot be renamed" : ""}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={field.required}
                                onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                                disabled={isMandatory}
                                size="small"
                            />
                        }
                        label={
                            <Typography 
                                variant="body2" 
                                sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}
                            >
                                Required
                            </Typography>
                        }
                    />
                </Grid>

                {/* Placeholder for text inputs */}
                {['text', 'textarea', 'email', 'phone', 'number'].includes(field.type) && (
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Placeholder"
                            value={field.placeholder || ''}
                            onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                            InputLabelProps={{
                                sx: {
                                    color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                    '&.Mui-focused': {
                                        color: isDark ? 'rgba(255,255,255,0.7)' : '#374151'
                                    }
                                }
                            }}
                            sx={{ 
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                                    }
                                },
                                '& input::placeholder': {
                                    color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                    opacity: 0.7
                                }
                            }}
                        />
                    </Grid>
                )}

                {/* Options Editor for Select/Checkbox/Multiselect */}
                {['select', 'checkbox', 'multiselect'].includes(field.type) && (
                    <Grid size={{ xs: 12 }}>
                        <Box mt={2}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                                Options
                            </Typography>
                            {field.options?.map((option: string, optIndex: number) => (
                                <Box key={optIndex} display="flex" alignItems="center" gap={1} mt={1}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={option}
                                        placeholder={`Option ${optIndex + 1}`}
                                        onChange={(e) => {
                                            const newOptions = [...(field.options || [])];
                                            newOptions[optIndex] = e.target.value;
                                            onUpdate(field.id, { options: newOptions });
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                                                }
                                            },
                                            '& input::placeholder': {
                                                color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                                opacity: 0.7
                                            }
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const newOptions = field.options?.filter((_: any, i: number) => i !== optIndex);
                                            onUpdate(field.id, { options: newOptions });
                                        }}
                                        sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ mt: 1.5, textTransform: 'none', borderRadius: 1 }}
                                onClick={() => {
                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                    onUpdate(field.id, { options: newOptions });
                                }}
                            >
                                Add Option
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default function FormBuilderPage() {
    const router = useRouter();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Theme colors
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const panelBg = isDark ? '#1a1d29' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Please fill out this form...');
    const [fields, setFields] = useState<FormField[]>([
        {
            id: 'email-mandatory',
            type: 'email',
            label: 'Email',
            required: true,
            placeholder: 'your@email.com'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    // Notification states
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Delete field confirmation
    const [deleteFieldDialog, setDeleteFieldDialog] = useState<{ open: boolean; fieldId: string | null; fieldLabel: string }>({
        open: false,
        fieldId: null,
        fieldLabel: ''
    });

    // Form settings
    const [linkedServices, setLinkedServices] = useState<string[]>([]);
    const [isRequiredForBooking, setIsRequiredForBooking] = useState(false);
    const [autoSendAfterBooking, setAutoSendAfterBooking] = useState(false);
    const [sendDelay] = useState(0); // Always 0 - immediate sending
    const [services, setServices] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formId, setFormId] = useState<string | null>(null);

    // Load existing form if ID is in URL
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        
        if (id) {
            setFormId(id);
            setIsEditMode(true);
            loadForm(id);
        }
    }, []);

    const loadForm = async (id: string) => {
        try {
            setLoading(true);
            const response = await formService.getForm(id);
            if (response.success) {
                const form = response.data;
                setTitle(form.title);
                setDescription(form.description || 'Please fill out this form...');
                setFields(form.fields);
                setLinkedServices(form.linkedServices || []);
                setIsRequiredForBooking(form.isRequiredForBooking || false);
                setAutoSendAfterBooking(form.autoSendAfterBooking || false);
            }
        } catch (error) {
            console.error('Failed to load form:', error);
            setNotification({
                open: true,
                message: 'Failed to load form',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch services for linking
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/onboarding/progress');
                if (response.data.success && response.data.data.business?.services) {
                    setServices(response.data.data.business.services);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            }
        };
        fetchServices();
    }, []);

    const addField = (type: any) => {
        const newField: FormField = {
            id: Date.now().toString(),
            type: type,
            label: `New ${type} field`,
            required: false,
            placeholder: '',
            options: ['select', 'checkbox', 'multiselect'].includes(type) ? ['Option 1', 'Option 2'] : undefined
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        // Prevent deletion of mandatory email field
        if (id === 'email-mandatory') {
            setNotification({
                open: true,
                message: 'Email field is mandatory and cannot be deleted',
                severity: 'error'
            });
            return;
        }
        setFields(fields.filter(f => f.id !== id));
        setDeleteFieldDialog({ open: false, fieldId: null, fieldLabel: '' });
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        // Prevent changing label and type of mandatory email field
        if (id === 'email-mandatory') {
            // Allow only placeholder and required changes (though required should stay true)
            const allowedUpdates: Partial<FormField> = {};
            if (updates.placeholder !== undefined) {
                allowedUpdates.placeholder = updates.placeholder;
            }
            // Keep required always true for mandatory email
            if (updates.required !== undefined && !updates.required) {
                setNotification({
                    open: true,
                    message: 'Email field must remain required',
                    severity: 'warning'
                });
                return;
            }
            setFields(fields.map(f => f.id === id ? { ...f, ...allowedUpdates } : f));
            return;
        }
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = fields.findIndex(f => f.id === active.id);
        const newIndex = fields.findIndex(f => f.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newFields = [...fields];
            const [movedField] = newFields.splice(oldIndex, 1);
            newFields.splice(newIndex, 0, movedField);
            setFields(newFields);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setNotification({
                open: true,
                message: 'Please enter a form title',
                severity: 'warning'
            });
            return;
        }
        
        if (fields.length === 0) {
            setNotification({
                open: true,
                message: 'Please add at least one field',
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            const formData: CreateFormData = {
                title,
                description,
                fields,
                isActive: true,
                linkedServices,
                isRequiredForBooking,
                autoSendAfterBooking,
                sendDelay,
            };
            
            if (isEditMode && formId) {
                // Update existing form
                await formService.updateForm(formId, formData);
                setNotification({
                    open: true,
                    message: 'Form updated successfully!',
                    severity: 'success'
                });
            } else {
                // Create new form
                await formService.createForm(formData);
                setNotification({
                    open: true,
                    message: 'Form created successfully!',
                    severity: 'success'
                });
            }
            
            setTimeout(() => {
                router.push('/dashboard/forms');
            }, 1000);
        } catch (error) {
            console.error('Failed to save form', error);
            setNotification({
                open: true,
                message: `Failed to ${isEditMode ? 'update' : 'create'} form`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const activeField = fields.find(f => f.id === activeDragId);

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box sx={{ minHeight: '100vh', bgcolor: pageBgColor }}>
                {/* Header */}
                <Box
                    sx={{
                        px: 4,
                        py: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: `1px solid ${borderColor}`,
                        bgcolor: panelBg
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button
                            component={Link}
                            href="/dashboard/forms"
                            startIcon={<ArrowBackIcon />}
                            sx={{ color: textSecondary, textTransform: 'none' }}
                        >
                            Back
                        </Button>
                        <Typography variant="h6" fontWeight="bold" color={textPrimary} sx={{ borderLeft: `1px solid ${borderColor}`, pl: 2 }}>
                            {isEditMode ? 'Edit Form' : 'Form Builder'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                            color: 'white',
                            boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff5252 0%, #ff7043 100%)',
                                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)'
                            },
                            '&:disabled': {
                                background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                color: textSecondary
                            }
                        }}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Form' : 'Save Form')}
                    </Button>
                </Box>

                <Box sx={{ p: 2, pt: 2, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
                    <Grid container spacing={1} sx={{ height: '100%' }}>
                        {/* Toolbox Sidebar */}
                        <Grid size={{ xs: 12, md: 2 }} sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    bgcolor: panelBg,
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box p={1.5} borderBottom={`1px solid ${borderColor}`}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="#ff6b6b" fontSize="0.85rem">
                                        Toolbox
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                                    <List disablePadding>
                                        <Typography variant="caption" fontWeight="bold" color={textSecondary} sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                                            Fields
                                        </Typography>
                                        {toolBoxItems.map((item) => (
                                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                                <ListItemButton
                                                    onClick={() => addField(item.type)}
                                                    sx={{
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`,
                                                        borderRadius: 1,
                                                        transition: 'all 0.2s',
                                                        py: 0.75,
                                                        px: 1,
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                                                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db',
                                                            transform: 'translateX(4px)'
                                                        }
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 28, color: textSecondary, '& svg': { fontSize: 18 } }}>
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: textPrimary, fontSize: '0.8rem' }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}

                                        <Divider sx={{ my: 2, borderColor: borderColor }} />

                                        <Typography variant="caption" fontWeight="bold" color={textSecondary} sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                                            Integrations
                                        </Typography>

                                        <Stack spacing={1.5}>
                                            <Box>
                                                <Typography variant="caption" fontWeight="600" color={textPrimary} sx={{ display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                                    Link to Services
                                                </Typography>
                                                <Autocomplete
                                                    multiple
                                                    options={services.map(s => s.name)}
                                                    value={linkedServices}
                                                    onChange={(e, newValue) => setLinkedServices(newValue)}
                                                    size="small"
                                                    renderInput={(params) => (
                                                        <TextField 
                                                            {...params} 
                                                            placeholder="Select services..." 
                                                            size="small"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 1,
                                                                    fontSize: '0.75rem'
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                    renderTags={(value, getTagProps) =>
                                                        value.map((option, index) => (
                                                            <Chip
                                                                label={option}
                                                                {...getTagProps({ index })}
                                                                key={index}
                                                                size="small"
                                                                sx={{
                                                                    borderRadius: 1,
                                                                    bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                                                                    color: isDark ? 'rgba(255,255,255,0.7)' : '#374151',
                                                                    fontWeight: 600,
                                                                    fontSize: '0.65rem',
                                                                    height: 20
                                                                }}
                                                            />
                                                        ))
                                                    }
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    p: 1.5,
                                                    border: `1px solid ${borderColor}`
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={isRequiredForBooking}
                                                            onChange={(e) => setIsRequiredForBooking(e.target.checked)}
                                                            size="small"
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                                    color: isDark ? 'rgba(255,255,255,0.9)' : '#111827',
                                                                },
                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280',
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Box sx={{ maxWidth: '180px' }}>
                                                            <Typography variant="body2" color={textPrimary} fontWeight="600" fontSize="0.75rem">
                                                                Required for Booking
                                                            </Typography>
                                                            <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem', lineHeight: 1.3 }}>
                                                                Clients must complete this form before booking
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ m: 0, alignItems: 'flex-start' }}
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    p: 1.5,
                                                    border: `1px solid ${borderColor}`
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={autoSendAfterBooking}
                                                            onChange={(e) => setAutoSendAfterBooking(e.target.checked)}
                                                            size="small"
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                                    color: isDark ? 'rgba(255,255,255,0.9)' : '#111827',
                                                                },
                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : '#6b7280',
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Box sx={{ maxWidth: '180px' }}>
                                                            <Typography variant="body2" color={textPrimary} fontWeight="600" fontSize="0.75rem">
                                                                Auto-send after Booking
                                                            </Typography>
                                                            <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem', lineHeight: 1.3 }}>
                                                                Automatically email form to clients immediately after booking
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ m: 0, alignItems: 'flex-start' }}
                                                />
                                            </Box>
                                        </Stack>
                                    </List>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Form Builder Canvas */}
                        <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                                    borderRadius: '24px',
                                    border: `2px dashed ${borderColor}`,
                                    overflowY: 'auto',
                                    p: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        width: '100%',
                                        maxWidth: '100%',
                                        p: 2,
                                        bgcolor: panelBg,
                                        borderRadius: '24px',
                                        boxShadow: 'none',
                                        border: 'none',
                                        height: '100%'
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        placeholder="Form Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        InputProps={{
                                            sx: { fontSize: '1.25rem', fontWeight: '700', color: textPrimary, pb: 0.5 }
                                        }}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        placeholder="Form Description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        InputProps={{
                                            sx: { color: textSecondary, fontSize: '0.85rem' }
                                        }}
                                        sx={{ mb: 2 }}
                                    />

                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={fields.map(f => f.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {fields.length === 0 ? (
                                                <Box
                                                    py={8}
                                                    px={4}
                                                    border={`2px dashed ${borderColor}`}
                                                    borderRadius="16px"
                                                    textAlign="center"
                                                    bgcolor={isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}
                                                >
                                                    <Typography color="textSecondary" variant="body1" fontWeight="500">
                                                        Your form is empty
                                                    </Typography>
                                                    <Typography color="textSecondary" variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                                                        Select fields from the toolbox to start building
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Stack spacing={2}>
                                                    {fields.map((field) => (
                                                        <SortableField
                                                            key={field.id}
                                                            field={field}
                                                            onUpdate={updateField}
                                                            onRemove={removeField}
                                                            onRequestDelete={(id: string, label: string) => {
                                                                setDeleteFieldDialog({ open: true, fieldId: id, fieldLabel: label });
                                                            }}
                                                        />
                                                    ))}
                                                </Stack>
                                            )}
                                        </SortableContext>

                                        <DragOverlay>
                                            {activeField && (
                                                <Paper
                                                    elevation={3}
                                                    sx={{
                                                        p: 3,
                                                        opacity: 0.9,
                                                        bgcolor: panelBg,
                                                        borderRadius: '16px',
                                                        border: `1px solid ${borderColor}`
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" fontWeight="bold">{activeField.label}</Typography>
                                                </Paper>
                                            )}
                                        </DragOverlay>
                                    </DndContext>
                                </Paper>
                            </Box>
                        </Grid>

                        {/* Live Preview Panel */}
                        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    bgcolor: panelBg,
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box p={2.5} borderBottom={`1px solid ${borderColor}`} display="flex" alignItems="center" gap={1}>
                                    <SmartphoneIcon fontSize="small" sx={{ color: '#ff6b6b' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" color="#ff6b6b">
                                        Mobile Preview
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: isDark ? '#111827' : '#f3f4f6' }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            bgcolor: panelBg,
                                            borderRadius: '16px',
                                            minHeight: '100%',
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="bold" mb={0.5} color={textPrimary} fontSize="1rem">
                                            {title || 'Untitled Form'}
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary} mb={3}>
                                            {description}
                                        </Typography>

                                        {fields.length === 0 ? (
                                            <Box textAlign="center" py={4} color="text.secondary">
                                                <Typography variant="body2" fontStyle="italic">
                                                    Form preview
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Stack spacing={3}>
                                                {fields.map((field) => (
                                                    <Box key={field.id}>
                                                        <Typography variant="subtitle2" fontWeight="600" mb={0.5} color={textPrimary}>
                                                            {field.label}
                                                            {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                                                        </Typography>
                                                        {field.type === 'textarea' ? (
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                placeholder={field.placeholder}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        '& textarea::placeholder': {
                                                                            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                                                            opacity: 0.7
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ) : field.type === 'select' ? (
                                                            <FormControl fullWidth size="small">
                                                                <Select displayEmpty defaultValue="" variant="outlined">
                                                                    <MenuItem value="">Select...</MenuItem>
                                                                    {field.options?.map((opt, i) => (
                                                                        <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        ) : field.type === 'multiselect' ? (
                                                            <Autocomplete
                                                                multiple
                                                                options={field.options || []}
                                                                renderInput={(params) => (
                                                                    <TextField {...params} placeholder="Select..." size="small" />
                                                                )}
                                                            />
                                                        ) : field.type === 'checkbox' ? (
                                                            <FormGroup>
                                                                {field.options?.map((opt, i) => (
                                                                    <FormControlLabel
                                                                        key={i}
                                                                        control={<Checkbox size="small" />}
                                                                        label={<Typography variant="body2">{opt}</Typography>}
                                                                    />
                                                                ))}
                                                            </FormGroup>
                                                        ) : (
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                placeholder={field.placeholder}
                                                                type={field.type}
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        '& input::placeholder': {
                                                                            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                                                            opacity: 0.7
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                ))}
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    size="large"
                                                    sx={{
                                                        borderRadius: '8px',
                                                        mt: 2,
                                                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                                        color: 'white',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #ff5252 0%, #ff7043 100%)',
                                                            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)'
                                                        }
                                                    }}
                                                >
                                                    Submit
                                                </Button>
                                            </Stack>
                                        )}
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                
                {/* Delete Field Confirmation Dialog */}
                <ConfirmDeleteDialog
                    open={deleteFieldDialog.open}
                    onClose={() => setDeleteFieldDialog({ open: false, fieldId: null, fieldLabel: '' })}
                    onConfirm={() => {
                        if (deleteFieldDialog.fieldId) {
                            removeField(deleteFieldDialog.fieldId);
                        }
                    }}
                    title="Delete Field"
                    message={`Are you sure you want to delete the field "${deleteFieldDialog.fieldLabel}"?`}
                />
                
                {/* Notification Snackbar */}
                <NotificationSnackbar
                    open={notification.open}
                    onClose={() => setNotification({ ...notification, open: false })}
                    message={notification.message}
                    severity={notification.severity}
                />
            </Box>
        </RBACGuard>
    );
}

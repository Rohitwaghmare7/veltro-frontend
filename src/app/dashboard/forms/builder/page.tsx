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
import { useRouter } from 'next/navigation';
import { formService, CreateFormData, FormField } from '@/lib/services/form.service';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RBACGuard from '@/components/dashboard/RBACGuard';
import api from '@/lib/api';

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
function SortableField({ field, onUpdate, onRemove }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            sx={{
                p: 3,
                position: 'relative',
                mb: 2,
                '&:hover .actions': { opacity: 1 }
            }}
        >
            <Box
                className="actions"
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
                    <DragIndicatorIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onRemove(field.id)} color="error">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>

            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                        fullWidth
                        label="Field Label"
                        variant="standard"
                        value={field.label}
                        onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={field.required}
                                onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                            />
                        }
                        label="Required"
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
                        />
                    </Grid>
                )}

                {/* Options Editor for Select/Checkbox/Multiselect */}
                {['select', 'checkbox', 'multiselect'].includes(field.type) && (
                    <Grid size={{ xs: 12 }}>
                        <Box mt={2}>
                            <Typography variant="caption" fontWeight="bold" color="textSecondary">
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
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                            const newOptions = field.options?.filter((_: any, i: number) => i !== optIndex);
                                            onUpdate(field.id, { options: newOptions });
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ mt: 1 }}
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

                {/* Preview */}
                <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block', mt: 2 }}>
                        Preview ({field.type})
                    </Typography>
                    {field.type === 'textarea' ? (
                        <TextField fullWidth multiline rows={2} disabled placeholder={field.placeholder || "User input area..."} />
                    ) : field.type === 'select' ? (
                        <FormControl fullWidth size="small">
                            <InputLabel>Select Option</InputLabel>
                            <Select label="Select Option" disabled>
                                {field.options?.map((opt: string, i: number) => (
                                    <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : field.type === 'multiselect' ? (
                        <Autocomplete
                            multiple
                            options={field.options || []}
                            disabled
                            renderInput={(params) => <TextField {...params} label="Select multiple" size="small" />}
                        />
                    ) : field.type === 'checkbox' ? (
                        <FormGroup>
                            {field.options?.map((opt: string, i: number) => (
                                <FormControlLabel
                                    key={i}
                                    control={<Checkbox disabled />}
                                    label={opt}
                                />
                            ))}
                        </FormGroup>
                    ) : (
                        <TextField fullWidth size="small" disabled placeholder={field.placeholder || "User input..."} type={field.type} />
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
}

export default function FormBuilderPage() {
    const router = useRouter();
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Please fill out this form...');
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    
    // Form settings
    const [linkedServices, setLinkedServices] = useState<string[]>([]);
    const [isRequiredForBooking, setIsRequiredForBooking] = useState(false);
    const [autoSendAfterBooking, setAutoSendAfterBooking] = useState(false);
    const [sendDelay, setSendDelay] = useState(0);
    const [services, setServices] = useState<any[]>([]);

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
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
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
        if (!title) return alert('Please enter a form title');
        if (fields.length === 0) return alert('Please add at least one field');

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
            await formService.createForm(formData);
            alert('Form saved successfully!');
            router.push('/dashboard/forms');
        } catch (error) {
            console.error('Failed to save form', error);
            alert('Failed to save form');
        } finally {
            setLoading(false);
        }
    };

    const activeField = fields.find(f => f.id === activeDragId);

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box height="calc(100vh - 100px)">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Create New Form</Typography>
                        <Typography variant="body2" color="textSecondary">Drag fields to reorder, click to add</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Form'}
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ height: 'calc(100% - 60px)' }}>
                    {/* Toolbox Sidebar */}
                    <Grid size={{ xs: 12, md: 2.5 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', p: 2, overflowY: 'auto' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Field Types
                            </Typography>
                            <List>
                                {toolBoxItems.map((item) => (
                                    <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                                        <ListItemButton
                                            onClick={() => addField(item.type)}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.label} 
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Form Settings
                            </Typography>

                            <Box mt={2}>
                                <Autocomplete
                                    multiple
                                    options={services.map(s => s.name)}
                                    value={linkedServices}
                                    onChange={(e, newValue) => setLinkedServices(newValue)}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Link to Services" size="small" />
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
                            </Box>

                            <Box mt={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isRequiredForBooking}
                                            onChange={(e) => setIsRequiredForBooking(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="body2">Required for Booking</Typography>}
                                />
                            </Box>

                            <Box mt={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoSendAfterBooking}
                                            onChange={(e) => setAutoSendAfterBooking(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="body2">Auto-send after Booking</Typography>}
                                />
                            </Box>

                            {autoSendAfterBooking && (
                                <Box mt={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Send Delay (minutes)"
                                        value={sendDelay}
                                        onChange={(e) => setSendDelay(parseInt(e.target.value) || 0)}
                                        helperText="0 = send immediately"
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Form Builder Canvas */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%' }}>
                        <Paper
                            sx={{
                                height: '100%',
                                p: 3,
                                bgcolor: 'grey.50',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Paper sx={{ width: '100%', p: 4 }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    placeholder="Form Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{ sx: { fontSize: '1.5rem', fontWeight: 'bold' } }}
                                    sx={{ mb: 1 }}
                                />
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    placeholder="Form Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    sx={{ mb: 4 }}
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
                                                p={4}
                                                border="2px dashed"
                                                borderColor="divider"
                                                borderRadius={2}
                                                textAlign="center"
                                                color="text.secondary"
                                            >
                                                Click field types to add them to your form
                                            </Box>
                                        ) : (
                                            fields.map((field) => (
                                                <SortableField
                                                    key={field.id}
                                                    field={field}
                                                    onUpdate={updateField}
                                                    onRemove={removeField}
                                                />
                                            ))
                                        )}
                                    </SortableContext>

                                    <DragOverlay>
                                        {activeField && (
                                            <Paper variant="outlined" sx={{ p: 2, opacity: 0.9, bgcolor: 'white' }}>
                                                <Typography variant="subtitle2">{activeField.label}</Typography>
                                            </Paper>
                                        )}
                                    </DragOverlay>
                                </DndContext>
                            </Paper>
                        </Paper>
                    </Grid>

                    {/* Live Preview Panel */}
                    <Grid size={{ xs: 12, md: 4.5 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', p: 3, overflowY: 'auto' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Live Preview
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mb={3}>
                                This is how your form will appear to users
                            </Typography>

                            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                                <Typography variant="h5" fontWeight="bold" mb={1}>
                                    {title || 'Untitled Form'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" mb={3}>
                                    {description || 'Please fill out this form...'}
                                </Typography>

                                {fields.length === 0 ? (
                                    <Box textAlign="center" py={4} color="text.secondary">
                                        <Typography variant="body2">
                                            No fields added yet
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        {fields.map((field) => (
                                            <Box key={field.id}>
                                                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                                    {field.label}
                                                    {field.required && <span style={{ color: 'red' }}> *</span>}
                                                </Typography>
                                                {field.type === 'textarea' ? (
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        placeholder={field.placeholder}
                                                        size="small"
                                                    />
                                                ) : field.type === 'select' ? (
                                                    <FormControl fullWidth size="small">
                                                        <Select displayEmpty>
                                                            <MenuItem value="">Select an option</MenuItem>
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
                                                            <TextField {...params} placeholder="Select multiple" size="small" />
                                                        )}
                                                    />
                                                ) : field.type === 'checkbox' ? (
                                                    <FormGroup>
                                                        {field.options?.map((opt, i) => (
                                                            <FormControlLabel
                                                                key={i}
                                                                control={<Checkbox />}
                                                                label={opt}
                                                            />
                                                        ))}
                                                    </FormGroup>
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder={field.placeholder}
                                                        type={field.type}
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                        <Button variant="contained" fullWidth size="large">
                                            Submit Form
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </RBACGuard>
    );
}

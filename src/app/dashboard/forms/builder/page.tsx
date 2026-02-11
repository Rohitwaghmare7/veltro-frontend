'use client';

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
    Divider,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Checkbox,
    FormGroup
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formService, CreateFormData, FormField } from '@/lib/services/form.service';

const toolBoxItems = [
    { icon: <TextFieldsIcon />, label: 'Short Text', type: 'text' },
    { icon: <TextFieldsIcon />, label: 'Long Text', type: 'textarea' },
    { icon: <TextFieldsIcon />, label: 'Number', type: 'number' },
    { icon: <TextFieldsIcon />, label: 'Email', type: 'email' },
    { icon: <TextFieldsIcon />, label: 'Phone', type: 'phone' },
    { icon: <CheckBoxIcon />, label: 'Checkbox', type: 'checkbox' },
    { icon: <RadioButtonCheckedIcon />, label: 'Select / Dropdown', type: 'select' },
    { icon: <DateRangeIcon />, label: 'Date Picker', type: 'date' },
];

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function FormBuilderPage() {
    const router = useRouter();
    const [title, setTitle] = useState('Untitled Form');
    const [description, setDescription] = useState('Please fill out this form...');
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(false);

    const addField = (type: any) => {
        const newField: FormField = {
            id: Date.now().toString(), // Simple ID generation
            type: type,
            label: `New ${type} field`,
            required: false,
            placeholder: '',
            options: type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
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
                isActive: true
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

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box height="calc(100vh - 100px)">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Create New Form</Typography>
                        <Typography variant="body2" color="textSecondary">Click fields to add them to your form</Typography>
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
                    <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Toolbox
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
                                                '&:hover': { bgcolor: 'grey.50' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.label} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Form Canvas */}
                    <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%' }}>
                        <Paper
                            sx={{
                                height: '100%',
                                p: 4,
                                bgcolor: 'grey.50',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Paper sx={{ width: '100%', maxWidth: '800px', p: 4, mb: 4 }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    placeholder="Form Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{ sx: { fontSize: '2rem', fontWeight: 'bold' } }}
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

                                <Box display="flex" flexDirection="column" gap={3}>
                                    {fields.length === 0 && (
                                        <Box
                                            p={4}
                                            border="2px dashed"
                                            borderColor="divider"
                                            borderRadius={2}
                                            textAlign="center"
                                            color="text.secondary"
                                        >
                                            Click item in toolbox to add fields
                                        </Box>
                                    )}

                                    {fields.map((field, index) => (
                                        <Paper
                                            key={field.id}
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                position: 'relative',
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
                                                <IconButton size="small" onClick={() => removeField(field.id)} color="error">
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
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 4 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={field.required}
                                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                            />
                                                        }
                                                        label="Required"
                                                    />
                                                </Grid>

                                                {/* Options Editor for Select/Checkbox */}
                                                {(field.type === 'select' || field.type === 'checkbox') && (
                                                    <Grid size={{ xs: 12 }}>
                                                        <Box mt={2}>
                                                            <Typography variant="caption" fontWeight="bold" color="textSecondary">
                                                                Options
                                                            </Typography>
                                                            {field.options?.map((option, optIndex) => (
                                                                <Box key={optIndex} display="flex" alignItems="center" gap={1} mt={1}>
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        value={option}
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        onChange={(e) => {
                                                                            const newOptions = [...(field.options || [])];
                                                                            newOptions[optIndex] = e.target.value;
                                                                            updateField(field.id, { options: newOptions });
                                                                        }}
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            const newOptions = field.options?.filter((_, i) => i !== optIndex);
                                                                            updateField(field.id, { options: newOptions });
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
                                                                    updateField(field.id, { options: newOptions });
                                                                }}
                                                            >
                                                                Add Option
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                )}

                                                {/* Preview of the field type */}
                                                <Grid size={{ xs: 12 }}>
                                                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block', mt: 2 }}>
                                                        Preview ({field.type})
                                                    </Typography>
                                                    {field.type === 'textarea' ? (
                                                        <TextField fullWidth multiline rows={2} disabled placeholder="User input area..." />
                                                    ) : field.type === 'select' ? (
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Select Option</InputLabel>
                                                            <Select label="Select Option" disabled>
                                                                {field.options?.map((opt, i) => (
                                                                    <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    ) : field.type === 'checkbox' ? (
                                                        <FormGroup>
                                                            {field.options?.map((opt, i) => (
                                                                <FormControlLabel
                                                                    key={i}
                                                                    control={<Checkbox disabled />}
                                                                    label={opt}
                                                                />
                                                            ))}
                                                        </FormGroup>
                                                    ) : (
                                                        <TextField fullWidth size="small" disabled placeholder="User input..." />
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Box>
                            </Paper>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </RBACGuard>
    );
}

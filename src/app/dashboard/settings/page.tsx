'use client';

import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    Divider,
    Card,
    CardContent,
    Stack,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import api from '@/lib/api';
import RBACGuard from '@/components/dashboard/RBACGuard';

interface Service {
    name: string;
    duration: number;
    price: number;
    description: string;
}

interface WorkingHours {
    day: string;
    start: string;
    end: string;
    isOpen: boolean;
}

export default function SettingsPage() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [bookingUrl, setBookingUrl] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    
    // Business profile state
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        category: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    // Services state
    const [services, setServices] = useState<Service[]>([]);

    // Working hours state
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);

    // Deactivate dialog
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [deactivateConfirmText, setDeactivateConfirmText] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/onboarding/progress');
            if (response.data.success) {
                const biz = response.data.data.business;
                setBusiness(biz);
                
                // Set profile data
                setProfileData({
                    name: biz.name || '',
                    phone: biz.phone || '',
                    email: biz.email || '',
                    website: biz.website || '',
                    description: biz.description || '',
                    category: biz.category || 'other',
                    address: {
                        street: biz.address?.street || '',
                        city: biz.address?.city || '',
                        state: biz.address?.state || '',
                        zipCode: biz.address?.zipCode || '',
                        country: biz.address?.country || ''
                    }
                });

                setServices(biz.services || []);
                setWorkingHours(biz.workingHours || []);
                
                if (biz.bookingSlug) {
                    const url = `${window.location.origin}/book/${biz.bookingSlug}`;
                    setBookingUrl(url);
                }
            }
        } catch (error) {
            console.error('Failed to load settings', error);
            showSnackbar('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        showSnackbar('Link copied to clipboard!');
    };

    // Business Profile handlers
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/onboarding/step/1', profileData);
            showSnackbar('Business profile updated successfully!');
            fetchSettings();
        } catch (error) {
            console.error('Failed to save profile', error);
            showSnackbar('Failed to save profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Services handlers
    const handleAddService = () => {
        setServices([...services, { name: '', duration: 60, price: 0, description: '' }]);
    };

    const handleRemoveService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleServiceChange = (index: number, field: string, value: any) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const handleSaveServices = async () => {
        setSaving(true);
        try {
            await api.put('/onboarding/step/4', {
                services,
                workingHours: business.workingHours
            });
            showSnackbar('Services updated successfully!');
            fetchSettings();
        } catch (error) {
            console.error('Failed to save services', error);
            showSnackbar('Failed to save services', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Working hours handlers
    const handleWorkingHoursChange = (index: number, field: string, value: any) => {
        const updated = [...workingHours];
        updated[index] = { ...updated[index], [field]: value };
        setWorkingHours(updated);
    };

    const handleSaveWorkingHours = async () => {
        setSaving(true);
        try {
            await api.put('/onboarding/step/4', {
                services: business.services,
                workingHours
            });
            showSnackbar('Working hours updated successfully!');
            fetchSettings();
        } catch (error) {
            console.error('Failed to save working hours', error);
            showSnackbar('Failed to save working hours', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Deactivate workspace
    const handleDeactivate = async () => {
        if (deactivateConfirmText !== business.name) {
            showSnackbar('Business name does not match', 'error');
            return;
        }

        setSaving(true);
        try {
            await api.put('/onboarding/progress', { isSetupComplete: false });
            showSnackbar('Workspace deactivated successfully!');
            setDeactivateDialogOpen(false);
            fetchSettings();
        } catch (error) {
            console.error('Failed to deactivate workspace', error);
            showSnackbar('Failed to deactivate workspace', 'error');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { value: 'salon', label: 'Salon' },
        { value: 'spa', label: 'Spa' },
        { value: 'barbershop', label: 'Barbershop' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'photography', label: 'Photography' },
        { value: 'coaching', label: 'Coaching' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'other', label: 'Other' }
    ];

    const dayLabels: { [key: string]: string } = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    };

    return (
        <RBACGuard requireOwner>
            <Box>
                <Typography variant="h4" fontWeight="bold" mb={4}>Settings</Typography>

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="Business Profile" />
                        <Tab label="Services" />
                        <Tab label="Working Hours" />
                        <Tab label="Public Links" />
                        <Tab label="Danger Zone" />
                    </Tabs>
                </Paper>

                <Paper sx={{ p: 4, maxWidth: '900px' }}>
                    {loading ? (
                        <Typography>Loading settings...</Typography>
                    ) : (
                        <>
                            {/* Business Profile Tab */}
                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="h6" mb={3}>Business Profile</Typography>
                                    <Box display="flex" flexDirection="column" gap={3}>
                                        <TextField
                                            fullWidth
                                            label="Business Name"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                        
                                        <Box display="flex" gap={2}>
                                            <FormControl fullWidth>
                                                <InputLabel>Category</InputLabel>
                                                <Select
                                                    value={profileData.category}
                                                    label="Category"
                                                    onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}
                                                >
                                                    {categories.map(cat => (
                                                        <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            />
                                        </Box>

                                        <Box display="flex" gap={2}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                            
                                            <TextField
                                                fullWidth
                                                label="Website"
                                                value={profileData.website}
                                                onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                                placeholder="https://example.com"
                                            />
                                        </Box>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Description"
                                            value={profileData.description}
                                            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                                            placeholder="Brief description of your business"
                                            helperText={`${profileData.description.length}/500 characters`}
                                        />

                                        <Divider />
                                        <Typography variant="subtitle1" fontWeight="bold">Address</Typography>

                                        <TextField
                                            fullWidth
                                            label="Street Address"
                                            value={profileData.address.street}
                                            onChange={(e) => setProfileData({ 
                                                ...profileData, 
                                                address: { ...profileData.address, street: e.target.value }
                                            })}
                                        />

                                        <Box display="flex" gap={2}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                value={profileData.address.city}
                                                onChange={(e) => setProfileData({ 
                                                    ...profileData, 
                                                    address: { ...profileData.address, city: e.target.value }
                                                })}
                                            />
                                            
                                            <TextField
                                                fullWidth
                                                label="State"
                                                value={profileData.address.state}
                                                onChange={(e) => setProfileData({ 
                                                    ...profileData, 
                                                    address: { ...profileData.address, state: e.target.value }
                                                })}
                                            />
                                        </Box>

                                        <Box display="flex" gap={2}>
                                            <TextField
                                                fullWidth
                                                label="ZIP Code"
                                                value={profileData.address.zipCode}
                                                onChange={(e) => setProfileData({ 
                                                    ...profileData, 
                                                    address: { ...profileData.address, zipCode: e.target.value }
                                                })}
                                            />
                                            
                                            <TextField
                                                fullWidth
                                                label="Country"
                                                value={profileData.address.country}
                                                onChange={(e) => setProfileData({ 
                                                    ...profileData, 
                                                    address: { ...profileData.address, country: e.target.value }
                                                })}
                                            />
                                        </Box>

                                        <Box display="flex" gap={2} mt={2}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={fetchSettings}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* Services Tab */}
                            {tabValue === 1 && (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Typography variant="h6">Services Management</Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddService}
                                        >
                                            Add Service
                                        </Button>
                                    </Box>

                                    {services.length === 0 ? (
                                        <Box textAlign="center" py={4}>
                                            <Typography color="textSecondary" mb={2}>
                                                No services added yet. Add your first service to start accepting bookings.
                                            </Typography>
                                            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddService}>
                                                Add Your First Service
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Stack spacing={2}>
                                            {services.map((service, index) => (
                                                <Card key={index} variant="outlined">
                                                    <CardContent>
                                                        <Box display="flex" flexDirection="column" gap={2}>
                                                            <Box display="flex" gap={2} alignItems="center">
                                                                <TextField
                                                                    fullWidth
                                                                    label="Service Name"
                                                                    value={service.name}
                                                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                                    placeholder="e.g., Haircut, Massage, Consultation"
                                                                />
                                                                <TextField
                                                                    sx={{ minWidth: 120 }}
                                                                    type="number"
                                                                    label="Duration (min)"
                                                                    value={service.duration}
                                                                    onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value) || 0)}
                                                                />
                                                                <TextField
                                                                    sx={{ minWidth: 100 }}
                                                                    type="number"
                                                                    label="Price ($)"
                                                                    value={service.price}
                                                                    onChange={(e) => handleServiceChange(index, 'price', parseInt(e.target.value) || 0)}
                                                                />
                                                                <IconButton
                                                                    color="error"
                                                                    onClick={() => handleRemoveService(index)}
                                                                    title="Remove Service"
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                label="Description"
                                                                value={service.description}
                                                                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                                placeholder="Brief description of the service"
                                                            />
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            <Box display="flex" gap={2} mt={3}>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSaveServices}
                                                    disabled={saving}
                                                >
                                                    {saving ? 'Saving...' : 'Save Services'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={fetchSettings}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                        </Stack>
                                    )}
                                </Box>
                            )}

                            {/* Working Hours Tab */}
                            {tabValue === 2 && (
                                <Box>
                                    <Typography variant="h6" mb={3}>Working Hours</Typography>
                                    <Stack spacing={2}>
                                        {workingHours.map((hours, index) => (
                                            <Card key={hours.day} variant="outlined">
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={hours.isOpen}
                                                                    onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                                                                />
                                                            }
                                                            label={dayLabels[hours.day]}
                                                            sx={{ minWidth: 150 }}
                                                        />
                                                        
                                                        {hours.isOpen ? (
                                                            <>
                                                                <TextField
                                                                    type="time"
                                                                    label="Start Time"
                                                                    value={hours.start}
                                                                    onChange={(e) => handleWorkingHoursChange(index, 'start', e.target.value)}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                                <Typography>to</Typography>
                                                                <TextField
                                                                    type="time"
                                                                    label="End Time"
                                                                    value={hours.end}
                                                                    onChange={(e) => handleWorkingHoursChange(index, 'end', e.target.value)}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </>
                                                        ) : (
                                                            <Typography color="textSecondary">Closed</Typography>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        <Box display="flex" gap={2} mt={3}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveWorkingHours}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Working Hours'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={fetchSettings}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}

                            {/* Public Links Tab */}
                            {tabValue === 3 && business && (
                                <Box>
                                    <Typography variant="h6" mb={3}>Public Links</Typography>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary" mb={1}>
                                                Public Booking Page
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                value={bookingUrl}
                                                slotProps={{
                                                    input: {
                                                        readOnly: true,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={copyToClipboard} title="Copy Link">
                                                                    <ContentCopyIcon />
                                                                </IconButton>
                                                                <IconButton component="a" href={bookingUrl} target="_blank" title="Open Page">
                                                                    <LaunchIcon />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                                helperText="Share this link with your customers to accept bookings."
                                            />
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary" mb={1}>
                                                Business Slug
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                value={business.bookingSlug}
                                                disabled
                                                helperText="This is your unique business identifier used in public URLs."
                                            />
                                        </Box>
                                    </Stack>
                                </Box>
                            )}

                            {/* Danger Zone Tab */}
                            {tabValue === 4 && (
                                <Box>
                                    <Typography variant="h6" mb={3} color="error">Danger Zone</Typography>
                                    <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Deactivate Workspace
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        This will deactivate your workspace and stop accepting bookings. You can reactivate it later.
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<WarningIcon />}
                                                    onClick={() => setDeactivateDialogOpen(true)}
                                                >
                                                    Deactivate
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            )}
                        </>
                    )}
                </Paper>

                {/* Deactivate Confirmation Dialog */}
                <Dialog open={deactivateDialogOpen} onClose={() => setDeactivateDialogOpen(false)}>
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon color="error" />
                            Deactivate Workspace
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography mb={2}>
                            This will deactivate your workspace and stop accepting new bookings. Your data will be preserved and you can reactivate later.
                        </Typography>
                        <Typography mb={2}>
                            To confirm, please type your business name: <strong>{business?.name}</strong>
                        </Typography>
                        <TextField
                            fullWidth
                            value={deactivateConfirmText}
                            onChange={(e) => setDeactivateConfirmText(e.target.value)}
                            placeholder="Enter business name"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleDeactivate}
                            color="error"
                            variant="contained"
                            disabled={saving || deactivateConfirmText !== business?.name}
                        >
                            {saving ? 'Deactivating...' : 'Deactivate Workspace'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

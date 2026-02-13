'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BusinessData } from '@/types/business';
import { useOnboarding } from './OnboardingContext';
import { integrationService, Integration } from '@/lib/services/integration.service';

export default function OnboardingPage() {
    const { activeStep, setActiveStep, steps } = useOnboarding();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
    const router = useRouter();

    // Business State
    const [businessData, setBusinessData] = useState<BusinessData>({
        name: '',
        category: 'other',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        emailConnected: false,
        contactFormFields: ['name', 'email', 'message'],
        workingHours: [
            { day: 'monday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'tuesday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'wednesday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'thursday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'friday', start: '09:00', end: '17:00', isOpen: true },
            { day: 'saturday', start: '10:00', end: '14:00', isOpen: false },
            { day: 'sunday', start: '10:00', end: '14:00', isOpen: false },
        ],
        services: [
            { name: 'Consultation', duration: 30, price: 0, description: 'Initial meeting' }
        ],
    });

    const fetchProgress = useCallback(async () => {
        try {
            const res = await api.get('/onboarding/progress');
            const { currentStep, business } = res.data.data;

            if (res.data.data.isSetupComplete) {
                router.push('/dashboard');
                return;
            }

            setBusinessData((prev) => ({
                ...prev,
                ...business,
                address: business.address || prev.address,
                workingHours: business.workingHours?.length ? business.workingHours : prev.workingHours,
                contactFormFields: business.contactFormFields?.length ? business.contactFormFields : prev.contactFormFields,
                services: business.services?.length ? business.services : prev.services,
            }));

            setActiveStep(Math.max(0, currentStep - 1));
        } catch (error) {
            console.error('Failed to fetch progress', error);
        } finally {
            setLoading(false);
        }
    }, [router, setActiveStep]);

    useEffect(() => {
        fetchProgress();
        loadIntegrationStatus();
        
        // Check for Gmail callback status
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail') === 'connected') {
            // Show success message (you can add a snackbar here if needed)
            console.log('Gmail connected successfully!');
            // Clean up URL
            window.history.replaceState({}, '', '/onboarding');
            // Reload integration status
            loadIntegrationStatus();
        } else if (params.get('gmail') === 'error') {
            console.error('Failed to connect Gmail');
            window.history.replaceState({}, '', '/onboarding');
        }
    }, [fetchProgress]);

    const loadIntegrationStatus = async () => {
        try {
            const statuses = await integrationService.getStatus();
            setIntegrations(statuses);
        } catch (error) {
            console.error('Failed to load integration status', error);
        }
    };

    const handleConnectGoogleCalendar = async () => {
        try {
            setSaving(true);
            const url = await integrationService.getGoogleUrl();
            window.location.href = url;
        } catch (error) {
            console.error('Failed to get Google URL', error);
            setSaving(false);
        }
    };

    const handleConnectGmail = async () => {
        try {
            setSaving(true);
            // Pass return parameter in query string
            const response = await api.get('/integrations/gmail/connect?return=onboarding', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get Gmail URL', error);
            setSaving(false);
        }
    };

    // Validation Logic
    const isNextDisabled = useMemo(() => {
        switch (activeStep) {
            case 0: // Profile
                return !businessData.name.trim() || !businessData.category.trim() || !businessData.description.trim();
            case 1: // Channels
                return false; // Email connection is optional
            case 2: // Contact Form
                return businessData.contactFormFields.length < 2; // Should at least have name/email
            case 3: // Booking
                const hasService = businessData.services.some(s => s.name.trim() !== '');
                const hasHours = businessData.workingHours.some(h => h.isOpen);
                return !hasService || !hasHours;
            default:
                return false;
        }
    }, [activeStep, businessData]);

    const handleNext = async () => {
        setSaving(true);
        try {
            const stepNum = activeStep + 1;
            let payload = {};

            switch (stepNum) {
                case 1:
                    payload = {
                        name: businessData.name,
                        category: businessData.category,
                        description: businessData.description,
                        phone: businessData.phone,
                        email: businessData.email,
                        website: businessData.website,
                        address: businessData.address,
                    };
                    break;
                case 2:
                    payload = { emailConnected: businessData.emailConnected };
                    break;
                case 3:
                    payload = { contactFormFields: businessData.contactFormFields };
                    break;
                case 4:
                    payload = {
                        workingHours: businessData.workingHours,
                        services: businessData.services
                    };
                    break;
                case 5:
                    await api.post('/onboarding/complete');
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.isOnboarded = true;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    router.push('/dashboard');
                    return;
            }

            if (stepNum < 5) {
                await api.put(`/onboarding/step/${stepNum}`, payload);
                setActiveStep(activeStep + 1);
            }
        } catch (error) {
            console.error('Failed to save step', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    const renderStep1 = () => (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                        background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-1px'
                    }}
                >
                    Business Profile
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                    Tell us about your business to personalize your experience.
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label="Business Name"
                    placeholder="Enter your business name"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                            color: 'white',
                            borderRadius: 1,
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    select
                    label="Category"
                    value={businessData.category}
                    onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                            color: 'white',
                            borderRadius: 1,
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                        '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.4)' }
                    }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    bgcolor: '#0A0A0A',
                                    backgroundImage: 'none',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 1,
                                    mt: 1,
                                    '& .MuiMenuItem-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        py: 1.5,
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' },
                                        '&.Mui-selected': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' },
                                        '&.Mui-selected:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' }
                                    }
                                }
                            }
                        }
                    }}
                >
                    {['salon', 'spa', 'consulting', 'health', 'other'].map((opt) => (
                        <MenuItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    placeholder="Briefly describe what your business does..."
                    value={businessData.description}
                    onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.02)',
                            color: 'white',
                            borderRadius: 1,
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                            '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                    }}
                />
            </Grid>
        </Grid>
    );

    const renderStep2 = () => (
        <Stack spacing={4}>
            <Box>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                        background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-1px'
                    }}
                >
                    Connect Channels
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Automate lead notifications and booking summaries via email.
                </Typography>
            </Box>

            <Box
                sx={{
                    p: 4,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 1, display: 'flex' }}>
                            <EmailIcon sx={{ color: integrations['gmail']?.status === 'connected' ? 'white' : 'rgba(255, 255, 255, 0.3)' }} />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: '700' }}>Connect Gmail</Typography>
                                {integrations['gmail']?.status === 'connected' && (
                                    <CheckCircleIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>View inbox and send emails from dashboard</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleConnectGmail}
                        disabled={saving}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                            textTransform: 'none',
                            fontWeight: '600',
                            borderRadius: 1
                        }}
                    >
                        {integrations['gmail']?.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                </Stack>
            </Box>
            <Box
                sx={{
                    p: 4,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 1, display: 'flex' }}>
                            <CalendarTodayIcon sx={{ color: integrations['google-calendar']?.status === 'connected' ? 'white' : 'rgba(255, 255, 255, 0.3)' }} />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: '700' }}>Google Calendar</Typography>
                                {integrations['google-calendar']?.status === 'connected' && (
                                    <CheckCircleIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>Sync your business bookings and availability</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleConnectGoogleCalendar}
                        disabled={saving}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.3)', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                            textTransform: 'none',
                            fontWeight: '600',
                            borderRadius: 1
                        }}
                    >
                        {integrations['google-calendar']?.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );

    const renderStep3 = () => (
        <Stack spacing={4}>
            <Box>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                        background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-1px'
                    }}
                >
                    Lead Capture
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Configure the fields for your automated lead capture forms.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {['name', 'email', 'phone', 'message'].map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' }
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={businessData.contactFormFields.includes(field)}
                                        onChange={(e) => {
                                            const fields = businessData.contactFormFields;
                                            const newFields = e.target.checked
                                                ? [...fields, field]
                                                : fields.filter((f) => f !== field);
                                            setBusinessData({ ...businessData, contactFormFields: newFields });
                                        }}
                                        disabled={field === 'name' || field === 'email'}
                                        sx={{ color: 'rgba(255, 255, 255, 0.1)', '&.Mui-checked': { color: 'white' } }}
                                    />
                                }
                                label={<Typography sx={{ color: 'white', fontWeight: '600' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>}
                                sx={{ m: 0, width: '100%' }}
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );

    const renderStep4 = () => (
        <Stack spacing={5}>
            <Box>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                        background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-1px'
                    }}
                >
                    Services & Hours
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Define your offerings and availability for client bookings.
                </Typography>
            </Box>

            <Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: '700' }}>Service Menu</Typography>
                <Stack spacing={2}>
                    {businessData.services.map((service, index) => (
                        <Box key={index} sx={{ p: 3, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <TextField
                                        fullWidth
                                        label="Service Name"
                                        size="small"
                                        value={service.name}
                                        onChange={(e) => {
                                            const newServices = [...businessData.services];
                                            newServices[index].name = e.target.value;
                                            setBusinessData({ ...businessData, services: newServices });
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.01)' }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 5, sm: 3 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Min"
                                        size="small"
                                        value={service.duration}
                                        onChange={(e) => {
                                            const newServices = [...businessData.services];
                                            newServices[index].duration = parseInt(e.target.value) || 0;
                                            setBusinessData({ ...businessData, services: newServices });
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                bgcolor: 'rgba(255, 255, 255, 0.01)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                            },
                                            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' }
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 5, sm: 3 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Price"
                                        size="small"
                                        value={service.price}
                                        onChange={(e) => {
                                            const newServices = [...businessData.services];
                                            newServices[index].price = parseInt(e.target.value) || 0;
                                            setBusinessData({ ...businessData, services: newServices });
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                bgcolor: 'rgba(255, 255, 255, 0.01)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                            },
                                            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' }
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'right' }}>
                                    <IconButton size="small" sx={{ color: 'rgba(255, 25, 25, 0.5)', '&:hover': { color: '#ff4d4d' } }} onClick={() => {
                                        const newServices = businessData.services.filter((_, i) => i !== index);
                                        setBusinessData({ ...businessData, services: newServices });
                                    }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setBusinessData({
                            ...businessData,
                            services: [...businessData.services, { name: '', duration: 30, price: 0, description: '' }]
                        })}
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', alignSelf: 'flex-start', textTransform: 'none', fontWeight: '700', '&:hover': { color: 'white' } }}
                    >
                        Add another service
                    </Button>
                </Stack>
            </Box>

            <Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: '700' }}>Operating Hours</Typography>
                <Stack spacing={1.5}>
                    {businessData.workingHours.map((wh, index) => (
                        <Grid container spacing={2} key={wh.day} alignItems="center">
                            <Grid size={{ xs: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={wh.isOpen}
                                            onChange={(e) => {
                                                const newHours = [...businessData.workingHours];
                                                newHours[index].isOpen = e.target.checked;
                                                setBusinessData({ ...businessData, workingHours: newHours });
                                            }}
                                            sx={{ color: 'rgba(255, 255, 255, 0.05)', '&.Mui-checked': { color: 'white' } }}
                                        />
                                    }
                                    label={<Typography sx={{ color: wh.isOpen ? 'white' : 'rgba(255, 255, 255, 0.2)', fontWeight: wh.isOpen ? '700' : '400', fontSize: '0.95rem' }}>{wh.day.charAt(0).toUpperCase() + wh.day.slice(1)}</Typography>}
                                />
                            </Grid>
                            {wh.isOpen && (
                                <>
                                    <Grid size={{ xs: 3.5 }}>
                                        <TextField
                                            type="time"
                                            size="small"
                                            fullWidth
                                            value={wh.start}
                                            onChange={(e) => {
                                                const newHours = [...businessData.workingHours];
                                                newHours[index].start = e.target.value;
                                                setBusinessData({ ...businessData, workingHours: newHours });
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.01)' } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 1 }}>
                                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>-</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 3.5 }}>
                                        <TextField
                                            type="time"
                                            size="small"
                                            fullWidth
                                            value={wh.end}
                                            onChange={(e) => {
                                                const newHours = [...businessData.workingHours];
                                                newHours[index].end = e.target.value;
                                                setBusinessData({ ...businessData, workingHours: newHours });
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.01)' } }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );

    const renderStep5 = () => (
        <Box py={4}>
            <Typography
                variant="h2"
                fontWeight="900"
                sx={{
                    background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    letterSpacing: '-3px'
                }}
            >
                Launch.
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 8, lineHeight: 1.6, fontWeight: '400' }}>
                Your business ecosystem is ready. Start driving growth from your first automated dashboard.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={saving}
                sx={{
                    background: 'white',
                    color: 'black',
                    fontWeight: '900',
                    px: 8,
                    py: 2.5,
                    borderRadius: 1,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    '&:hover': {
                        background: '#f0f0f0',
                        transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': { background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.2)' }
                }}
            >
                {saving ? 'Finalizing...' : 'Enter Dashboard'}
            </Button>
        </Box>
    );

    const renderContent = () => {
        switch (activeStep) {
            case 0: return renderStep1();
            case 1: return renderStep2();
            case 2: return renderStep3();
            case 3: return renderStep4();
            case 4: return renderStep5();
            default: return null;
        }
    };

    return (
        <Box sx={{ width: '100%', py: { xs: 4, md: 0 } }}>
            {renderContent()}

            {activeStep < 4 && (
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 8, borderTop: '1px solid rgba(255, 255, 255, 0.05)', mt: 8 }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontWeight: '700',
                            '&:hover': { color: 'white', bgcolor: 'transparent' },
                            textTransform: 'none',
                            fontSize: '1rem',
                            visibility: activeStep === 0 ? 'hidden' : 'visible'
                        }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={saving || isNextDisabled}
                        sx={{
                            background: 'white',
                            color: 'black',
                            fontWeight: '900',
                            px: 6,
                            py: 1.8,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: isNextDisabled ? 'none' : '0 10px 30px rgba(255,255,255,0.1)',
                            '&:hover': { background: '#f8f8f8', transform: 'translateY(-1px)' },
                            '&.Mui-disabled': { background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.2)' }
                        }}
                    >
                        {saving ? <CircularProgress size={24} sx={{ color: 'black' }} /> : (activeStep === steps.length - 2 ? 'Complete Setup' : 'Next Step')}
                    </Button>
                </Box>
            )}
        </Box>
    );
}

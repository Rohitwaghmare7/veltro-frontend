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
import MicIcon from '@mui/icons-material/Mic';
import { BusinessData } from '@/types/business';
import { useOnboarding } from './OnboardingContext';
import { integrationService, Integration } from '@/lib/services/integration.service';
import OnboardingModeSelector from '@/components/onboarding/OnboardingModeSelector';
import LiveKitVoiceFlow from '@/components/onboarding/LiveKitVoiceFlow';

export default function OnboardingPage() {
    const { activeStep, setActiveStep, steps } = useOnboarding();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingGmail, setSavingGmail] = useState(false);
    const [savingCalendar, setSavingCalendar] = useState(false);
    const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
    const [onboardingMode, setOnboardingMode] = useState<'select' | 'manual' | 'voice'>('select');
    const router = useRouter();

    // Business State
    const [businessData, setBusinessData] = useState<BusinessData>({
        name: '',
        category: 'other',
        customCategory: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        emailConnected: false,
        contactFormFields: ['name', 'email'],
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
        // Check if returning from OAuth - restore mode from localStorage
        const params = new URLSearchParams(window.location.search);
        const isReturningFromOAuth = params.get('gmail') === 'connected' || params.get('calendar') === 'connected';
        
        if (isReturningFromOAuth) {
            // Check if we were in voice mode
            const savedMode = localStorage.getItem('onboardingMode');
            if (savedMode === 'voice') {
                setOnboardingMode('voice');
                setLoading(false);
                localStorage.removeItem('onboardingMode'); // Clean up
                return;
            } else {
                // We were in manual mode, stay in manual mode
                setOnboardingMode('manual');
                localStorage.removeItem('onboardingMode'); // Clean up
            }
        }
        
        // Normal flow - only fetch progress in manual mode
        if (onboardingMode === 'manual') {
            fetchProgress();
        } else if (onboardingMode === 'select') {
            setLoading(false);
        }
        
        loadIntegrationStatus();
        
        // Check for Gmail callback status
        if (params.get('gmail') === 'connected') {
            console.log('Gmail connected successfully!');
            loadIntegrationStatus();
        } else if (params.get('gmail') === 'error') {
            console.error('Failed to connect Gmail');
        }
    }, [fetchProgress, onboardingMode]);

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
            setSavingCalendar(true);
            // Save current mode to localStorage before OAuth redirect
            localStorage.setItem('onboardingMode', 'manual');
            // Pass return=onboarding parameter
            const response = await api.get('/integrations/google/connect?return=onboarding', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get Google URL', error);
            setSavingCalendar(false);
        }
    };

    const handleConnectGmail = async () => {
        try {
            setSavingGmail(true);
            // Save current mode to localStorage before OAuth redirect
            localStorage.setItem('onboardingMode', 'manual');
            // Pass return parameter in query string
            const response = await api.get('/integrations/gmail/connect?return=onboarding', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Failed to get Gmail URL', error);
            setSavingGmail(false);
        }
    };

    // Validation Logic
    const isNextDisabled = useMemo(() => {
        switch (activeStep) {
            case 0: // Profile
                return !businessData.name.trim() || !businessData.customCategory?.trim() || !businessData.description.trim();
            case 1: // Channels
                return false; // Email connection is optional
            case 2: // Contact Form
                return businessData.contactFormFields.length < 2; // Should at least have name/email
            case 3: // Services
                // All services must be valid (name, duration >= 15, price >= 1)
                const allServicesValid = businessData.services.every(s => 
                    s.name.trim() !== '' && s.duration >= 15 && s.price >= 1
                );
                // Must have at least one service
                const hasServices = businessData.services.length > 0;
                return !hasServices || !allServicesValid;
            case 4: // Operating Hours
                const hasHours = businessData.workingHours.some(h => h.isOpen);
                return !hasHours;
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
                    payload = { services: businessData.services };
                    break;
                case 5:
                    payload = { workingHours: businessData.workingHours };
                    break;
                case 6:
                    const response = await api.post('/onboarding/complete');
                    if (response.data.success) {
                        const { token, refreshToken, user, business } = response.data.data;
                        // Update tokens and user in localStorage
                        localStorage.setItem('token', token);
                        localStorage.setItem('refreshToken', refreshToken);
                        localStorage.setItem('user', JSON.stringify(user));
                        // Set the business ID for API calls
                        if (user.businessId) {
                            localStorage.setItem('selectedBusinessId', user.businessId);
                        } else if (business?._id) {
                            localStorage.setItem('selectedBusinessId', business._id);
                        }
                        
                        // Force page reload to ensure all API calls use new token
                        window.location.href = '/dashboard';
                        return;
                    }
                    router.push('/dashboard');
                    return;
            }

            if (stepNum < 6) {
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

    const getStepTitle = () => {
        switch (activeStep) {
            case 0: return 'Welcome to Veltro';
            case 1: return 'Connect Your Tools';
            case 2: return 'Set Up Lead Capture';
            case 3: return 'Define Your Services';
            case 4: return 'Set Your Availability';
            case 5: return 'Ready to Launch!';
            default: return '';
        }
    };

    const getStepDescription = () => {
        switch (activeStep) {
            case 0: return 'Let\'s start by setting up your business profile. This helps us personalize your workspace and get you started quickly.';
            case 1: return 'Connect Gmail and Google Calendar to automate your workflow. Manage emails, sync bookings, and never miss an appointment.';
            case 2: return 'Configure the fields for your contact forms. We\'ll automatically capture leads and notify you when someone reaches out.';
            case 3: return 'Add the services you offer to your clients. Include pricing and duration so customers can book appointments easily.';
            case 4: return 'Set your business hours so clients know when you\'re available. You can always adjust these later in settings.';
            case 5: return 'You\'re all set! Your workspace is ready. Click below to enter your dashboard and start managing your business.';
            default: return '';
        }
    };

    // Show mode selector if not selected yet
    if (onboardingMode === 'select') {
        return (
            <OnboardingModeSelector
                onSelectMode={(mode) => {
                    setOnboardingMode(mode);
                    if (mode === 'manual') {
                        fetchProgress();
                    }
                }}
            />
        );
    }

    // Show LiveKit voice conversation flow if voice mode selected
    if (onboardingMode === 'voice') {
        return (
            <Box 
                sx={{ 
                    position: 'fixed',
                    top: 0,
                    left: { xs: 0, md: '380px' },
                    right: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                <LiveKitVoiceFlow
                    onComplete={async (voiceData) => {
                        setBusinessData((prev) => ({ ...prev, ...voiceData }));
                        
                        try {
                            // Save all the data collected from voice
                            // Step 1: Business profile
                            setActiveStep(0);
                            await api.put('/onboarding/step/1', {
                                name: voiceData.name,
                                category: voiceData.category || 'other',
                                customCategory: voiceData.customCategory,
                                description: voiceData.description,
                                phone: voiceData.phone || '',
                                email: voiceData.email || '',
                                website: voiceData.website || '',
                                address: voiceData.address || { street: '', city: '', state: '', zipCode: '', country: '' },
                            });
                            
                            // Step 2: Email connection (skip - optional)
                            setActiveStep(1);
                            await api.put('/onboarding/step/2', { emailConnected: false });
                            
                            // Step 3: Contact form fields (use defaults)
                            setActiveStep(2);
                            await api.put('/onboarding/step/3', { contactFormFields: ['name', 'email'] });
                            
                            // Step 4: Services
                            setActiveStep(3);
                            if (voiceData.services && voiceData.services.length > 0) {
                                await api.put('/onboarding/step/4', { services: voiceData.services });
                            } else {
                                // Default service if none provided
                                await api.put('/onboarding/step/4', { 
                                    services: [{ name: 'Consultation', duration: 30, price: 0, description: 'Initial meeting' }] 
                                });
                            }
                            
                            // Step 5: Working hours
                            setActiveStep(4);
                            if (voiceData.workingHours && voiceData.workingHours.length > 0) {
                                await api.put('/onboarding/step/5', { workingHours: voiceData.workingHours });
                            } else {
                                // Default working hours if none provided
                                await api.put('/onboarding/step/5', { 
                                    workingHours: [
                                        { day: 'monday', start: '09:00', end: '17:00', isOpen: true },
                                        { day: 'tuesday', start: '09:00', end: '17:00', isOpen: true },
                                        { day: 'wednesday', start: '09:00', end: '17:00', isOpen: true },
                                        { day: 'thursday', start: '09:00', end: '17:00', isOpen: true },
                                        { day: 'friday', start: '09:00', end: '17:00', isOpen: true },
                                        { day: 'saturday', start: '10:00', end: '14:00', isOpen: false },
                                        { day: 'sunday', start: '10:00', end: '14:00', isOpen: false },
                                    ]
                                });
                            }
                            
                            // Step 6: Complete onboarding
                            setActiveStep(5);
                            await api.post('/onboarding/complete');
                            window.location.href = '/dashboard';
                        } catch (error) {
                            console.error('Failed to save voice onboarding data', error);
                        }
                    }}
                />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    const labelStyle = {
    mb: 1,
    display: 'block',
    color: '#888',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
};

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        bgcolor: 'white',
        color: '#1A1A1A',
        borderRadius: 2,
        fontSize: '0.95rem',
        fontWeight: 500,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        '& fieldset': { borderColor: '#ECECEC', borderWidth: 1.5 },
        '&:hover fieldset': { borderColor: '#D0D0D0' },
        '&.Mui-focused fieldset': { borderColor: '#FF6B4A', borderWidth: 2 },
    },
    '& .MuiInputBase-input': { py: 1.75, px: 2 },
    '& .MuiInputBase-input::placeholder': { color: '#BDBDBD', opacity: 1 },
};

const renderStep1 = () => (
    <Stack spacing={3.5}>
        {/* Row: Name + Category */}
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelStyle}>Business Name</Typography>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g., Veltro Studio"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    sx={inputStyle}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelStyle}>Category</Typography>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="e.g., Salon, Consulting"
                    value={businessData.customCategory || ''}
                    onChange={(e) => setBusinessData({ ...businessData, category: 'other', customCategory: e.target.value })}
                    sx={inputStyle}
                />
            </Grid>
        </Grid>

        {/* Description */}
        <Box>
            <Typography variant="body2" sx={labelStyle}>Description</Typography>
            <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Briefly describe what your business does..."
                value={businessData.description}
                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                sx={inputStyle}
            />
            <Typography variant="caption" sx={{ color: '#BDBDBD', mt: 0.75, display: 'block', textAlign: 'right', fontSize: '0.75rem' }}>
                {businessData.description.length} / 500
            </Typography>
        </Box>

        {/* Row: Phone + Email */}
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelStyle}>Phone <Typography component="span" sx={{ color: '#BDBDBD', fontWeight: 400, fontSize: '0.7rem', ml: 0.5 }}>optional</Typography></Typography>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="+1 (555) 000-0000"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    sx={inputStyle}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelStyle}>Email <Typography component="span" sx={{ color: '#BDBDBD', fontWeight: 400, fontSize: '0.7rem', ml: 0.5 }}>optional</Typography></Typography>
                <TextField
                    fullWidth
                    size="medium"
                    placeholder="hello@yourbusiness.com"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    sx={inputStyle}
                />
            </Grid>
        </Grid>

        {/* Website */}
        <Box>
            <Typography variant="body2" sx={labelStyle}>Website <Typography component="span" sx={{ color: '#BDBDBD', fontWeight: 400, fontSize: '0.7rem', ml: 0.5 }}>optional</Typography></Typography>
            <TextField
                fullWidth
                size="medium"
                placeholder="https://yourbusiness.com"
                value={businessData.website}
                onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                sx={inputStyle}
            />
        </Box>
    </Stack>
);

    const renderStep2 = () => (
        <Stack spacing={4}>
            <Box
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: '#FAFAFA',
                    border: '1px solid #E0E0E0',
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#BDBDBD', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems:"center", gap: 2.5 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1.5, display: 'flex', border: '1px solid #E0E0E0' }}>
                            <EmailIcon sx={{ color: integrations['gmail']?.status === 'connected' ? '#FF6B4A' : '#999', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h6" sx={{ color: '#1A1A1A', fontWeight: '700', fontSize: '1.15rem' }}>Connect Gmail</Typography>
                                {integrations['gmail']?.status === 'connected' && (
                                    <CheckCircleIcon sx={{ color: '#FF6B4A', fontSize: '1.2rem' }} />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem', mt: 0.5 }}>View inbox and send emails from dashboard</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={handleConnectGmail}
                        disabled={savingGmail}
                        sx={{
                            background: integrations['gmail']?.status === 'connected' 
                                ? '#E8F5E9' 
                                : 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                            color: integrations['gmail']?.status === 'connected' ? '#2E7D32' : 'white',
                            border: integrations['gmail']?.status === 'connected' ? '1px solid #C8E6C9' : 'none',
                            '&:hover': { 
                                background: integrations['gmail']?.status === 'connected'
                                    ? '#C8E6C9'
                                    : 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                                boxShadow: integrations['gmail']?.status === 'connected' 
                                    ? 'none' 
                                    : '0 0 15px rgba(255, 107, 74, 0.5)',
                            },
                            '&.Mui-disabled': {
                                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                                color: 'white',
                                opacity: 0.7,
                            },
                            textTransform: 'none',
                            fontWeight: '600',
                            borderRadius: 1.5,
                            px: 4,
                            py: 1.2,
                            fontSize: '0.95rem',
                            boxShadow: integrations['gmail']?.status === 'connected' 
                                ? 'none' 
                                : '0 4px 12px rgba(255, 107, 74, 0.3)',
                        }}
                    >
                        {savingGmail ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (integrations['gmail']?.status === 'connected' ? 'Connected' : 'Connect')}
                    </Button>
                </Stack>
            </Box>
            <Box
                sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: '#FAFAFA',
                    border: '1px solid #E0E0E0',
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: '#BDBDBD', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1.5, display: 'flex', border: '1px solid #E0E0E0' }}>
                            <CalendarTodayIcon sx={{ color: integrations['google-calendar']?.status === 'connected' ? '#FF6B4A' : '#999', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h6" sx={{ color: '#1A1A1A', fontWeight: '700', fontSize: '1.15rem' }}>Google Calendar</Typography>
                                {integrations['google-calendar']?.status === 'connected' && (
                                    <CheckCircleIcon sx={{ color: '#FF6B4A', fontSize: '1.2rem' }} />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem', mt: 0.5 }}>Sync your business bookings and availability</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={handleConnectGoogleCalendar}
                        disabled={savingCalendar}
                        sx={{
                            background: integrations['google-calendar']?.status === 'connected' 
                                ? '#E8F5E9' 
                                : 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                            color: integrations['google-calendar']?.status === 'connected' ? '#2E7D32' : 'white',
                            border: integrations['google-calendar']?.status === 'connected' ? '1px solid #C8E6C9' : 'none',
                            '&:hover': { 
                                background: integrations['google-calendar']?.status === 'connected'
                                    ? '#C8E6C9'
                                    : 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                                boxShadow: integrations['google-calendar']?.status === 'connected' 
                                    ? 'none' 
                                    : '0 0 15px rgba(255, 107, 74, 0.5)',
                            },
                            '&.Mui-disabled': {
                                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                                color: 'white',
                                opacity: 0.7,
                            },
                            textTransform: 'none',
                            fontWeight: '600',
                            borderRadius: 1.5,
                            px: 4,
                            py: 1.2,
                            fontSize: '0.95rem',
                            boxShadow: integrations['google-calendar']?.status === 'connected' 
                                ? 'none' 
                                : '0 4px 12px rgba(255, 107, 74, 0.3)',
                        }}
                    >
                        {savingCalendar ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (integrations['google-calendar']?.status === 'connected' ? 'Connected' : 'Connect')}
                    </Button>
                </Stack>
            </Box>
        </Stack>
    );

    const renderStep3 = () => (
        <Stack spacing={4}>
            <Grid container spacing={2.5}>
                {['name', 'email'].map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: 'white',
                                border: '2px solid #E0E0E0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: '#BDBDBD', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
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
                                        sx={{ 
                                            color: '#D0D0D0', 
                                            '&.Mui-checked': { color: '#FF6B4A' },
                                            '&.Mui-disabled': { color: '#E0E0E0' },
                                            '&.Mui-checked.Mui-disabled': { color: '#FF6B4A' }
                                        }}
                                    />
                                }
                                label={<Typography sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '1rem' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>}
                                sx={{ m: 0, width: '100%' }}
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );

    const renderStep4 = () => (
        <Stack spacing={3}>
            {businessData.services.map((service, index) => (
                <Box 
                    key={index} 
                    sx={{ 
                        p: 3.5, 
                        borderRadius: 2, 
                        bgcolor: 'white', 
                        border: '2px solid #E0E0E0',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#BDBDBD', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
                    }}
                >
                    <Grid container spacing={2.5} alignItems="flex-end">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={labelStyle}>
                                Service Name
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g., Haircut, Consultation"
                                size="medium"
                                value={service.name}
                                onChange={(e) => {
                                    const newServices = [...businessData.services];
                                    newServices[index].name = e.target.value;
                                    setBusinessData({ ...businessData, services: newServices });
                                }}
                                sx={inputStyle}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2.5 }}>
                            <Typography variant="body2" sx={labelStyle}>
                                Duration
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="30"
                                size="medium"
                                value={service.duration || ''}
                                onChange={(e) => {
                                    const newServices = [...businessData.services];
                                    newServices[index].duration = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    setBusinessData({ ...businessData, services: newServices });
                                }}
                                inputProps={{ min: 0 }}
                                sx={inputStyle}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2.5 }}>
                            <Typography variant="body2" sx={labelStyle}>
                                Price ($)
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                placeholder="50"
                                size="medium"
                                value={service.price || ''}
                                onChange={(e) => {
                                    const newServices = [...businessData.services];
                                    newServices[index].price = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    setBusinessData({ ...businessData, services: newServices });
                                }}
                                inputProps={{ min: 0 }}
                                sx={inputStyle}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                            <IconButton 
                                size="medium" 
                                sx={{ 
                                    color: '#999', 
                                    '&:hover': { color: '#ff4d4d', bgcolor: 'rgba(255, 77, 77, 0.08)' } 
                                }} 
                                onClick={() => {
                                    const newServices = businessData.services.filter((_, i) => i !== index);
                                    setBusinessData({ ...businessData, services: newServices });
                                }}
                            >
                                <DeleteIcon fontSize="medium" />
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
                sx={{ 
                    color: '#999', 
                    alignSelf: 'flex-start', 
                    textTransform: 'none', 
                    fontWeight: '700', 
                    fontSize: '0.95rem',
                    '&:hover': { color: '#1A1A1A', bgcolor: 'rgba(0, 0, 0, 0.04)' } 
                }}
            >
                Add another service
            </Button>
        </Stack>
    );

    const renderStep5 = () => (
        <Stack spacing={2.5}>
            {businessData.workingHours.map((wh, index) => (
                <Box
                    key={wh.day}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'white',
                        border: '2px solid #E0E0E0',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#BDBDBD', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }
                    }}
                >
                    <Grid container spacing={2.5} alignItems="center">
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="medium"
                                        checked={wh.isOpen}
                                        onChange={(e) => {
                                            const newHours = [...businessData.workingHours];
                                            newHours[index].isOpen = e.target.checked;
                                            setBusinessData({ ...businessData, workingHours: newHours });
                                        }}
                                        sx={{ 
                                            color: '#D0D0D0', 
                                            '&.Mui-checked': { color: '#FF6B4A' }
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ 
                                        color: wh.isOpen ? '#1A1A1A' : '#999', 
                                        fontWeight: wh.isOpen ? '700' : '500', 
                                        fontSize: '1rem' 
                                    }}>
                                        {wh.day.charAt(0).toUpperCase() + wh.day.slice(1)}
                                    </Typography>
                                }
                            />
                        </Grid>
                        {wh.isOpen && (
                            <>
                                <Grid size={{ xs: 5, sm: 4 }}>
                                    <TextField
                                        type="time"
                                        size="medium"
                                        fullWidth
                                        value={wh.start}
                                        onChange={(e) => {
                                            const newHours = [...businessData.workingHours];
                                            newHours[index].start = e.target.value;
                                            setBusinessData({ ...businessData, workingHours: newHours });
                                        }}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography sx={{ color: '#999', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}>-</Typography>
                                </Grid>
                                <Grid size={{ xs: 5, sm: 4 }}>
                                    <TextField
                                        type="time"
                                        size="medium"
                                        fullWidth
                                        value={wh.end}
                                        onChange={(e) => {
                                            const newHours = [...businessData.workingHours];
                                            newHours[index].end = e.target.value;
                                            setBusinessData({ ...businessData, workingHours: newHours });
                                        }}
                                        sx={inputStyle}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            ))}
        </Stack>
    );

    const renderStep6 = () => (
        <Box py={6}>
            <Typography
                variant="h2"
                fontWeight="700"
                sx={{
                    color: '#1A1A1A',
                    mb: 2.5,
                    letterSpacing: '-1px',
                    fontSize: '3rem'
                }}
            >
                You're All Set!
            </Typography>
            <Typography variant="h5" sx={{ color: '#666', mb: 10, lineHeight: 1.7, fontWeight: '400', fontSize: '1.2rem' }}>
                Your business workspace is ready. Start managing leads, bookings, and automations from your personalized dashboard.
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={saving}
                sx={{
                    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                    color: 'white',
                    fontWeight: '700',
                    px: 10,
                    py: 3,
                    borderRadius: 1.5,
                    fontSize: '1.3rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(255, 107, 74, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                        boxShadow: '0 8px 30px rgba(255, 107, 74, 0.6)',
                        transform: 'translateY(-2px)',
                    },
                    '&.Mui-disabled': { 
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                        color: 'white',
                        opacity: 0.7,
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                {saving ? 'Launching...' : 'Enter Dashboard'}
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
            case 5: return renderStep6();
            default: return null;
        }
    };

    return (
        <Box sx={{ width: '100%', py: { xs: 4, md: 0 } }}>
            {/* Onboarding Header - Shows for all steps */}
       <Box sx={{ mb: 5, textAlign: 'left' }}>
    {/* Pill badge */}
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: 'rgba(255, 107, 74, 0.08)',
            border: '1px solid rgba(255, 107, 74, 0.2)',
            borderRadius: 10,
            px: 1.75,
            py: 0.5,
            mb: 2,
        }}
    >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF6B4A' }} />
        <Typography sx={{ color: '#FF6B4A', fontWeight: '700', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Step {activeStep + 1} of {steps.length}
        </Typography>
    </Box>

    <Typography
        variant="h4"
        fontWeight="800"
        sx={{
            color: '#111',
            mb: 1,
            fontSize: '1.65rem',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
        }}
    >
        {getStepTitle()}
    </Typography>
    <Typography variant="body2" sx={{ color: '#999', lineHeight: 1.7, fontSize: '0.9rem', maxWidth: '480px' }}>
        {getStepDescription()}
    </Typography>
</Box>

            {renderContent()}

            {activeStep < 5 && (
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 5, mt: 5 }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{
                            color: '#999',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            '&:hover': { color: '#1A1A1A', bgcolor: 'transparent' },
                            textTransform: 'none',
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
                            background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                            color: 'white',
                            fontWeight: '700',
                            px: 6,
                            py: 1.5,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            boxShadow: isNextDisabled ? 'none' : '0 2px 8px rgba(255, 107, 74, 0.3)',
                            '&:hover': { 
                                background: 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                                boxShadow: '0 4px 12px rgba(255, 107, 74, 0.4)',
                                transform: 'translateY(-1px)' 
                            },
                            '&.Mui-disabled': { background: '#E0E0E0', color: '#999' },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (activeStep === steps.length - 2 ? 'Complete Setup' : 'Next Step')}
                    </Button>
                </Box>
            )}
        </Box>
    );
}

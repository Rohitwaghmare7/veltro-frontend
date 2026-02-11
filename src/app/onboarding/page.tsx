'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BusinessData, Service, WorkingHours } from '@/types/business';

const steps = [
    'Create Workspace',
    'Connect Channels',
    'Contact Form',
    'Booking Setup',
    'Activation',
];

export default function OnboardingPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

            // Allow user to continue from their last saved step
            // But if they are completed (step 5), redirect to dashboard
            if (res.data.data.isSetupComplete) {
                router.push('/dashboard');
                return;
            }

            // Sync state with fetched data
            setBusinessData((prev) => ({
                ...prev,
                ...business,
                // Ensure nested objects are merged correctly if missing
                address: business.address || prev.address,
                workingHours: business.workingHours?.length ? business.workingHours : prev.workingHours,
                contactFormFields: business.contactFormFields?.length ? business.contactFormFields : prev.contactFormFields,
                services: business.services?.length ? business.services : prev.services,
            }));

            // Set active step (0-indexed in UI, 1-indexed in DB)
            setActiveStep(Math.max(0, currentStep - 1));
        } catch (error) {
            console.error('Failed to fetch progress', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const handleNext = async () => {
        setSaving(true);
        try {
            const stepNum = activeStep + 1;
            let payload = {};

            // Construct payload based on current step
            switch (stepNum) {
                case 1: // Profile
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
                case 2: // Channels
                    payload = { emailConnected: businessData.emailConnected };
                    break;
                case 3: // Contact Form
                    payload = { contactFormFields: businessData.contactFormFields };
                    break;
                case 4: // Booking
                    payload = {
                        workingHours: businessData.workingHours,
                        services: businessData.services
                    };
                    break;
                case 5: // Activation
                    await api.post('/onboarding/complete');

                    // Update local user state
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
                setActiveStep((prev) => prev + 1);
            }
        } catch (error) {
            console.error('Failed to save step', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Step Content Renderers
    const renderStep1 = () => (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>Business Profile</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Tell us about your business. This info will appear on your public booking page.
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Business Name" value={businessData.name} onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Category" value={businessData.category} onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })}>
                    {['salon', 'spa', 'consulting', 'health', 'other'].map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={3} label="Description" value={businessData.description} onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Contact Phone" value={businessData.phone} onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Contact Email" value={businessData.email} onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })} />
            </Grid>
        </Grid>
    );

    const renderStep2 = () => (
        <Stack spacing={3}>
            <Typography variant="h6">Connect Communication Channels</Typography>
            <Typography variant="body2" color="textSecondary">
                Connect your email to send automated booking confirmations and reminders.
            </Typography>

            <Card variant="outlined">
                <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">Email Integration</Typography>
                            <Typography variant="body2" color="textSecondary">Sync with Gmail or SMTP</Typography>
                        </Box>
                        <Switch
                            checked={businessData.emailConnected}
                            onChange={(e) => setBusinessData({ ...businessData, emailConnected: e.target.checked })}
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );

    const renderStep3 = () => (
        <Stack spacing={3}>
            <Typography variant="h6">Customize Contact Form</Typography>
            <Typography variant="body2" color="textSecondary">
                Choose which fields to show on your public contact form.
            </Typography>

            <Box>
                {['name', 'email', 'phone', 'message'].map((field) => (
                    <FormControlLabel
                        key={field}
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
                                disabled={field === 'name' || field === 'email'} // Mandatory fields
                            />
                        }
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                    />
                ))}
            </Box>
        </Stack>
    );

    const renderStep4 = () => (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6" gutterBottom>Services</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Define the services clients can book.
                </Typography>
                <Stack spacing={2}>
                    {businessData.services.map((service, index) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, sm: 5 }}>
                                        <TextField fullWidth label="Service Name" size="small" value={service.name}
                                            onChange={(e) => {
                                                const newServices = [...businessData.services];
                                                newServices[index].name = e.target.value;
                                                setBusinessData({ ...businessData, services: newServices });
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <TextField fullWidth type="number" label="Duration (min)" size="small" value={service.duration}
                                            onChange={(e) => {
                                                const newServices = [...businessData.services];
                                                newServices[index].duration = parseInt(e.target.value) || 0;
                                                setBusinessData({ ...businessData, services: newServices });
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <TextField fullWidth type="number" label="Price" size="small" value={service.price}
                                            onChange={(e) => {
                                                const newServices = [...businessData.services];
                                                newServices[index].price = parseInt(e.target.value) || 0;
                                                setBusinessData({ ...businessData, services: newServices });
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 1 }}>
                                        <IconButton size="small" color="error" onClick={() => {
                                            const newServices = businessData.services.filter((_, i) => i !== index);
                                            setBusinessData({ ...businessData, services: newServices });
                                        }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={() => setBusinessData({
                        ...businessData,
                        services: [...businessData.services, { name: '', duration: 30, price: 0 }]
                    })}>
                        Add Service
                    </Button>
                </Stack>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Working Hours</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Set your weekly availability.
                </Typography>
                <Stack spacing={1}>
                    {businessData.workingHours.map((wh, index) => (
                        <Grid container spacing={2} key={wh.day} alignItems="center">
                            <Grid size={{ xs: 3 }}>
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
                                        />
                                    }
                                    label={wh.day.charAt(0).toUpperCase() + wh.day.slice(1)}
                                />
                            </Grid>
                            {wh.isOpen && (
                                <>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField type="time" size="small" fullWidth value={wh.start}
                                            onChange={(e) => {
                                                const newHours = [...businessData.workingHours];
                                                newHours[index].start = e.target.value;
                                                setBusinessData({ ...businessData, workingHours: newHours });
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 1 }}>
                                        <Typography textAlign="center">-</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField type="time" size="small" fullWidth value={wh.end}
                                            onChange={(e) => {
                                                const newHours = [...businessData.workingHours];
                                                newHours[index].end = e.target.value;
                                                setBusinessData({ ...businessData, workingHours: newHours });
                                            }}
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
        <Box textAlign="center" py={4}>
            <Typography variant="h5" gutterBottom>🎉 You&apos;re All Set!</Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
                Your business workspace is ready. You can now start managing bookings, leads, and forms.
            </Typography>
            <Button variant="contained" size="large" onClick={handleNext} disabled={saving}>
                {saving ? 'Activating...' : 'Go to Dashboard'}
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
        <Box maxWidth="600px" width="100%" mx="auto">
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card sx={{ p: 2 }}>
                <CardContent>
                    {renderContent()}

                    {activeStep < 4 && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button onClick={handleNext} variant="contained" disabled={saving}>
                                {saving ? <CircularProgress size={24} /> : (activeStep === steps.length - 2 ? 'Finish' : 'Next')}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

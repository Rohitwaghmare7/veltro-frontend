'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { bookingService } from '@/lib/services/booking.service';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardActionArea,
    Container,
    Step,
    Stepper,
    StepLabel,
    TextField,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const steps = ['Select Service', 'Select Date & Time', 'Your Details'];

interface Service {
    _id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
}

interface Business {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    services?: Service[];
    operatingHours?: {
        [key: string]: {
            isOpen: boolean;
            start: string;
            end: string;
        };
    };
    workingHours?: {
        [key: string]: {
            isOpen: boolean;
            start: string;
            end: string;
        };
    };
}

// Helper function to generate time slots based on operating hours
const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    
    // Parse start and end times (format: "HH:MM")
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        // Format time as 12-hour with AM/PM
        const period = currentHour >= 12 ? 'PM' : 'AM';
        const displayHour = currentHour > 12 ? currentHour - 12 : (currentHour === 0 ? 12 : currentHour);
        const displayMin = currentMin.toString().padStart(2, '0');
        
        slots.push(`${displayHour}:${displayMin} ${period}`);
        
        // Increment by 1 hour
        currentMin += 60;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }
    
    return slots;
};

export default function PublicBookingPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    // Form State
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        if (!slug) return;

        const fetchBusiness = async () => {
            try {
                const data = await bookingService.getPublicBusinessInfo(slug);
                if (data.success) {
                    setBusiness(data.data);
                    setServices(data.data.services || []);
                }
            } catch (error) {
                console.error('Failed to load business info', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [slug]);

    // Generate time slots when date is selected (only if no service selected yet)
    useEffect(() => {
        if (!selectedDate || selectedServiceId) return; // Don't generate if service is selected (API will provide slots)

        // Check for operating hours (try both field names for compatibility)
        const hours = business?.operatingHours || business?.workingHours;

        if (hours) {
            // Get day of week from selected date
            const date = new Date(selectedDate + 'T00:00:00');
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[date.getDay()];

            const dayHours = hours[dayName];
            
            console.log('Day:', dayName, 'Hours:', dayHours);
            
            if (dayHours && dayHours.isOpen) {
                const slots = generateTimeSlots(dayHours.start, dayHours.end);
                console.log('Generated slots:', slots);
                setTimeSlots(slots);
            } else {
                console.log('Business closed on', dayName);
                setTimeSlots([]);
            }
        } else {
            // Fallback: Generate default time slots (9 AM to 5 PM)
            console.log('No operating hours found, using default slots');
            const defaultSlots = generateTimeSlots('09:00', '17:00');
            setTimeSlots(defaultSlots);
        }
    }, [selectedDate, business, selectedServiceId]);

    // Fetch booked slots when date or service changes
    useEffect(() => {
        if (!selectedDate || !selectedServiceId || !slug) return;

        const fetchBookedSlots = async () => {
            try {
                const service = services.find(s => s._id === selectedServiceId);
                const response = await bookingService.getPublicAvailableSlots(
                    slug,
                    selectedDate,
                    service?.name,
                    service?.duration
                );
                
                console.log('Available slots response:', response);
                
                if (response.success && response.slots) {
                    // Extract available and booked slots from the response
                    const available = response.slots
                        .filter((slot: any) => slot.available)
                        .map((slot: any) => slot.time);
                    
                    const booked = response.slots
                        .filter((slot: any) => !slot.available)
                        .map((slot: any) => slot.time);
                    
                    console.log('Available:', available);
                    console.log('Booked:', booked);
                    
                    // Update time slots to show all slots from API
                    const allSlots = response.slots.map((slot: any) => slot.time);
                    setTimeSlots(allSlots);
                    setBookedSlots(booked);
                }
            } catch (error) {
                console.error('Failed to fetch booked slots:', error);
                setBookedSlots([]);
            }
        };

        fetchBookedSlots();
    }, [selectedDate, selectedServiceId, slug, services]);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleBookingSubmit = async () => {
        if (!selectedServiceId || !selectedDate || !selectedTime) return;

        const service = services.find(s => s._id === selectedServiceId);

        setSubmitting(true);
        try {
            await bookingService.createPublicBooking(slug, {
                clientName: formData.name,
                clientEmail: formData.email,
                clientPhone: formData.phone,
                serviceType: service?.name || 'Standard',
                date: selectedDate,
                timeSlot: selectedTime,
                duration: service?.duration || 60,
                notes: formData.notes
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                }}
            >
                <CircularProgress sx={{ color: '#667eea' }} size={40} />
            </Box>
        );
    }

    if (submitted) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: '16px',
                            bgcolor: 'white',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: '#d1fae5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="700" color="#111827" gutterBottom>
                            Booking Confirmed!
                        </Typography>
                        <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
                            Your booking has been confirmed. Check your email for details.
                        </Typography>
                        <Typography variant="caption" color="#9CA3AF" sx={{ fontSize: '0.75rem' }}>
                            {business?.name} will contact you shortly.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (!business) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: '16px',
                            bgcolor: 'white',
                            border: '1px solid #E5E7EB',
                        }}
                    >
                        <Typography variant="h6" color="#6B7280">
                            Business not found or no longer available.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const selectedService = services.find(s => s._id === selectedServiceId);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F3F4F6',
                py: 6,
                px: 2,
            }}
        >
            <Container maxWidth="md">
                {/* Business Header Card */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="700" color="#111827" gutterBottom>
                        {business.name}
                    </Typography>
                    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={3} mt={1}>
                        {business.email && (
                            <Typography variant="body2" color="#6B7280" sx={{ fontSize: '0.875rem' }}>
                                {business.email}
                            </Typography>
                        )}
                        {business.phone && (
                            <Typography variant="body2" color="#6B7280" sx={{ fontSize: '0.875rem' }}>
                                {business.phone}
                            </Typography>
                        )}
                        {business.website && (
                            <Typography
                                component="a"
                                href={business.website}
                                target="_blank"
                                variant="body2"
                                sx={{
                                    fontSize: '0.875rem',
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {business.website.replace(/^https?:\/\//, '')}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Booking Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: '16px',
                        bgcolor: 'white',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    {/* Header */}
                    <Box mb={4}>
                        <Typography
                            variant="h4"
                            fontWeight="800"
                            color="#111827"
                            gutterBottom
                            sx={{ letterSpacing: '-0.5px', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}
                        >
                            Book an Appointment
                        </Typography>
                        <Typography variant="body1" color="#6B7280" sx={{ fontSize: '0.95rem' }}>
                            Choose a service and select your preferred date and time
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper
                        activeStep={activeStep}
                        sx={{
                            mb: 4,
                            '& .MuiStepLabel-label': {
                                color: '#9CA3AF',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                '&.Mui-active': {
                                    color: '#667eea',
                                    fontWeight: 700,
                                },
                                '&.Mui-completed': {
                                    color: '#10b981',
                                },
                            },
                            '& .MuiStepIcon-root': {
                                color: '#E5E7EB',
                                '&.Mui-active': {
                                    color: '#667eea',
                                },
                                '&.Mui-completed': {
                                    color: '#10b981',
                                },
                            },
                        }}
                    >
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Divider sx={{ mb: 4, borderColor: '#E5E7EB' }} />

                    <Box minHeight="300px">
                        {/* Step 1: Select Service */}
                        {activeStep === 0 && (
                            <Box>
                                <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom sx={{ mb: 2, fontSize: '1rem' }}>
                                    Choose a Service
                                </Typography>
                                <Grid container spacing={2}>
                                    {services.length === 0 ? (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography color="#6B7280" sx={{ p: 2 }}>
                                                No services available at the moment.
                                            </Typography>
                                        </Grid>
                                    ) : (
                                        services.map((service) => (
                                            <Grid size={{ xs: 12 }} key={service._id}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: selectedServiceId === service._id ? '#667eea' : '#E5E7EB',
                                                        borderWidth: selectedServiceId === service._id ? 2 : 1,
                                                        borderRadius: '12px',
                                                        bgcolor: selectedServiceId === service._id ? '#F5F3FF' : 'white',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            borderColor: '#667eea',
                                                        },
                                                    }}
                                                >
                                                    <CardActionArea onClick={() => setSelectedServiceId(service._id)} sx={{ p: 2.5 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                            <Box flex={1}>
                                                                <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom sx={{ fontSize: '1rem' }}>
                                                                    {service.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="#6B7280" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                                                                    {service.description}
                                                                </Typography>
                                                                <Box display="flex" gap={1.5} flexWrap="wrap">
                                                                    <Chip
                                                                        icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                                                        label={`${service.duration} min`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: '#F3F4F6',
                                                                            color: '#4B5563',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            height: '24px'
                                                                        }}
                                                                    />
                                                                    <Chip
                                                                        icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
                                                                        label={`$${service.price}`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: '#D1FAE5',
                                                                            color: '#059669',
                                                                            fontWeight: 700,
                                                                            fontSize: '0.75rem',
                                                                            height: '24px'
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            {selectedServiceId === service._id && (
                                                                <CheckCircleIcon sx={{ color: '#667eea', fontSize: 24 }} />
                                                            )}
                                                        </Box>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Step 2: Select Date & Time */}
                        {activeStep === 1 && (
                            <Box>
                                <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom sx={{ mb: 2, fontSize: '1rem' }}>
                                    Select Date
                                </Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    sx={{
                                        mb: 4,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: 'white',
                                            '& fieldset': {
                                                borderColor: '#E5E7EB',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#D1D5DB',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '1px',
                                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                            },
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            color: '#111827',
                                        },
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    value={selectedDate}
                                />

                                <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom sx={{ mb: 2, fontSize: '1rem' }}>
                                    Available Times
                                </Typography>
                                {timeSlots.length === 0 ? (
                                    <Box
                                        py={4}
                                        px={2}
                                        textAlign="center"
                                        bgcolor="#F9FAFB"
                                        borderRadius="12px"
                                        border="1px solid #E5E7EB"
                                    >
                                        <Typography color="#6B7280" variant="body2">
                                            {selectedDate ? 'No available times for this date. The business may be closed.' : 'Please select a date first.'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={1.5}>
                                        {timeSlots.map((time) => {
                                            const isBooked = bookedSlots.includes(time);
                                            return (
                                                <Grid size={{ xs: 6, sm: 4 }} key={time}>
                                                    <Button
                                                        variant={selectedTime === time ? 'contained' : 'outlined'}
                                                        fullWidth
                                                        onClick={() => !isBooked && setSelectedTime(time)}
                                                        disabled={isBooked}
                                                        sx={{
                                                            py: 1,
                                                            borderRadius: '8px',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            borderColor: isBooked ? '#FCA5A5' : '#E5E7EB',
                                                            color: isBooked ? '#DC2626' : (selectedTime === time ? 'white' : '#4B5563'),
                                                            bgcolor: isBooked ? '#FEE2E2' : (selectedTime === time ? '#667eea' : 'white'),
                                                            boxShadow: 'none',
                                                            textDecoration: isBooked ? 'line-through' : 'none',
                                                            cursor: isBooked ? 'not-allowed' : 'pointer',
                                                            '&:hover': {
                                                                borderColor: isBooked ? '#FCA5A5' : '#667eea',
                                                                bgcolor: isBooked ? '#FEE2E2' : (selectedTime === time ? '#5568d3' : '#F9FAFB'),
                                                                boxShadow: 'none',
                                                            },
                                                            '&.Mui-disabled': {
                                                                borderColor: '#FCA5A5',
                                                                bgcolor: '#FEE2E2',
                                                                color: '#DC2626',
                                                            }
                                                        }}
                                                    >
                                                        {time}
                                                    </Button>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                )}
                            </Box>
                        )}

                        {/* Step 3: Your Details */}
                        {activeStep === 2 && (
                            <Box>
                                <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom sx={{ mb: 2, fontSize: '1rem' }}>
                                    Enter Your Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)' },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6B7280',
                                                    fontSize: '0.875rem',
                                                    '&.Mui-focused': { color: '#667eea' },
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#111827',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)' },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6B7280',
                                                    fontSize: '0.875rem',
                                                    '&.Mui-focused': { color: '#667eea' },
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#111827',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)' },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6B7280',
                                                    fontSize: '0.875rem',
                                                    '&.Mui-focused': { color: '#667eea' },
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#111827',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Notes (Optional)"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': { borderColor: '#E5E7EB' },
                                                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '1px', boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)' },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6B7280',
                                                    fontSize: '0.875rem',
                                                    '&.Mui-focused': { color: '#667eea' },
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    color: '#111827',
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Booking Summary */}
                                <Box
                                    mt={4}
                                    p={3}
                                    bgcolor="#f8fafc"
                                    borderRadius="16px"
                                    border="1px solid #e2e8f0"
                                >
                                    <Typography variant="subtitle1" fontWeight="700" color="#1e293b" gutterBottom>
                                        Booking Summary
                                    </Typography>
                                    <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="#64748b">Service:</Typography>
                                            <Typography variant="body2" fontWeight="600" color="#1e293b">
                                                {selectedService?.name}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="#64748b">Date:</Typography>
                                            <Typography variant="body2" fontWeight="600" color="#1e293b">
                                                {selectedDate}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="#64748b">Time:</Typography>
                                            <Typography variant="body2" fontWeight="600" color="#1e293b">
                                                {selectedTime}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="#64748b">Duration:</Typography>
                                            <Typography variant="body2" fontWeight="600" color="#1e293b">
                                                {selectedService?.duration} minutes
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body1" fontWeight="700" color="#1e293b">Total:</Typography>
                                            <Typography variant="body1" fontWeight="700" color="#10b981">
                                                ${selectedService?.price}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box display="flex" justifyContent="space-between" mt={4} pt={3} borderTop="1px solid #E5E7EB">
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="text"
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                color: '#6B7280',
                                '&:hover': {
                                    bgcolor: '#F3F4F6',
                                    color: '#111827',
                                },
                            }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={activeStep === steps.length - 1 ? handleBookingSubmit : handleNext}
                            disabled={
                                (activeStep === 0 && !selectedServiceId) ||
                                (activeStep === 1 && (!selectedDate || !selectedTime)) ||
                                (activeStep === 2 && (!formData.name || !formData.email || !formData.phone)) ||
                                submitting
                            }
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 4,
                                py: 1.2,
                                bgcolor: '#7C3AED',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#6D28D9',
                                    boxShadow: 'none',
                                },
                                '&:disabled': {
                                    bgcolor: '#E5E7EB',
                                    color: '#9CA3AF'
                                },
                            }}
                        >
                            {submitting ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : activeStep === steps.length - 1 ? (
                                'Confirm Booking'
                            ) : (
                                'Next'
                            )}
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Box mt={3} textAlign="center">
                        <Typography variant="caption" color="#9CA3AF" sx={{ fontSize: '0.75rem' }}>
                            Powered by Veltro
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

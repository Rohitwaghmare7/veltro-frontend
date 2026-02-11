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
    CardContent,
    CardActionArea,
    Container,
    Step,
    Stepper,
    StepLabel,
    TextField,
    Divider
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const steps = ['Select Service', 'Select Date & Time', 'Your Details'];

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];

export default function PublicBookingPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);

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

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleBookingSubmit = async () => {
        if (!selectedServiceId || !selectedDate || !selectedTime) return;

        const service = services.find(s => s._id === selectedServiceId);

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
            alert('Booking Confirmed! Check your email.');
            // Reset or redirect
            setActiveStep(0);
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to create booking. Please try again.');
        }
    };

    if (loading) return <Container sx={{ py: 8 }}><Typography>Loading...</Typography></Container>;
    if (!business) return <Container sx={{ py: 8 }}><Typography>Business not found.</Typography></Container>;

    const selectedService = services.find(s => s._id === selectedServiceId);

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    Book with {business.name}
                </Typography>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box minHeight="300px">
                    {activeStep === 0 && (
                        <Grid container spacing={3}>
                            {services.length === 0 ? (
                                <Typography sx={{ p: 2 }}>No services available.</Typography>
                            ) : (
                                services.map((service) => (
                                    <Grid size={{ xs: 12 }} key={service._id}>
                                        <Card variant="outlined" sx={{ borderColor: selectedServiceId === service._id ? 'primary.main' : 'divider' }}>
                                            <CardActionArea onClick={() => setSelectedServiceId(service._id)} sx={{ p: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="h6">{service.name}</Typography>
                                                        <Typography variant="body2" color="textSecondary">{service.description}</Typography>
                                                        <Box display="flex" gap={2} mt={1}>
                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <AccessTimeIcon fontSize="small" color="action" />
                                                                <Typography variant="caption">{service.duration} min</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="h6" color="primary">${service.price}</Typography>
                                                </Box>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>Select a Date</Typography>
                            <TextField
                                type="date"
                                fullWidth
                                sx={{ mb: 4 }}
                                InputLabelProps={{ shrink: true }}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                value={selectedDate}
                            />

                            <Typography variant="h6" gutterBottom>Available Times</Typography>
                            <Grid container spacing={2}>
                                {timeSlots.map((time) => (
                                    <Grid size={{ xs: 6, sm: 4 }} key={time}>
                                        <Button
                                            variant={selectedTime === time ? 'contained' : 'outlined'}
                                            fullWidth
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>Enter Your Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    />
                                </Grid>
                            </Grid>

                            <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
                                <Typography variant="subtitle2">Booking Summary</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2">Service: {selectedService?.name}</Typography>
                                <Typography variant="body2">Date: {selectedDate}</Typography>
                                <Typography variant="body2">Time: {selectedTime}</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={activeStep === steps.length - 1 ? handleBookingSubmit : handleNext}
                        disabled={
                            (activeStep === 0 && !selectedServiceId) ||
                            (activeStep === 1 && (!selectedDate || !selectedTime))
                        }
                    >
                        {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

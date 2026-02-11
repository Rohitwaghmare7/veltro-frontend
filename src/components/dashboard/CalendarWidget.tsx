'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress,
    Divider
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import api from '@/lib/api';

interface Booking {
    _id: string;
    serviceType: string;
    date: string;
    timeSlot: string;
    status: string;
    contactId: {
        name: string;
    };
}

export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        fetchBookings();
    }, [currentDate]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            // Get bookings for current month
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const response = await api.get('/bookings', {
                params: {
                    startDate: startOfMonth.toISOString(),
                    endDate: endOfMonth.toISOString()
                }
            });

            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const getBookingsForDate = (day: number) => {
        const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        ).toISOString().split('T')[0];

        return bookings.filter(booking => {
            const bookingDate = new Date(booking.date).toISOString().split('T')[0];
            return bookingDate === dateStr;
        });
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const selectedDateBookings = selectedDate
        ? getBookingsForDate(selectedDate.getDate())
        : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'cancelled': return 'error';
            case 'no-show': return 'default';
            default: return 'default';
        }
    };

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">📅 Calendar</Typography>
                <Box display="flex" gap={1}>
                    <IconButton size="small" onClick={handleToday}>
                        <TodayIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handlePreviousMonth}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleNextMonth}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            </Box>

            <Typography variant="subtitle2" align="center" mb={2} fontWeight="bold">
                {monthName}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={32} />
                </Box>
            ) : (
                <>
                    {/* Calendar Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 0.5,
                            mb: 2
                        }}
                    >
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <Box
                                key={day}
                                sx={{
                                    textAlign: 'center',
                                    py: 0.5,
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'text.secondary'
                                }}
                            >
                                {day}
                            </Box>
                        ))}

                        {/* Calendar days */}
                        {days.map((day, index) => {
                            if (day === null) {
                                return <Box key={`empty-${index}`} />;
                            }

                            const dayBookings = getBookingsForDate(day);
                            const hasBookings = dayBookings.length > 0;

                            return (
                                <Box
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    sx={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 1,
                                        borderColor: isSelected(day) ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        bgcolor: isToday(day) ? 'primary.light' : 'background.paper',
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        },
                                        position: 'relative'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={isToday(day) ? 'bold' : 'normal'}
                                        color={isToday(day) ? 'primary.main' : 'text.primary'}
                                    >
                                        {day}
                                    </Typography>
                                    {hasBookings && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 2,
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main'
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Selected Date Bookings */}
                    {selectedDate && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                            {selectedDateBookings.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" py={2}>
                                    No bookings for this date
                                </Typography>
                            ) : (
                                <List dense>
                                    {selectedDateBookings.map(booking => (
                                        <ListItem
                                            key={booking._id}
                                            sx={{
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                mb: 1
                                            }}
                                        >
                                            <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {booking.timeSlot}
                                                        </Typography>
                                                        <Chip
                                                            label={booking.status}
                                                            size="small"
                                                            color={getStatusColor(booking.status) as any}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        {booking.serviceType}
                                                        {booking.contactId && ` • ${booking.contactId.name}`}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </>
                    )}
                </>
            )}
        </Paper>
    );
}

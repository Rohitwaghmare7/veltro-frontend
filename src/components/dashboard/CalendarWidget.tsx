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
        <Paper sx={{
            p: 1.5,
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 500, color: 'white' }}>
                    📅 Calendar
                </Typography>
                <Box display="flex" gap={0.25}>
                    <IconButton 
                        size="small" 
                        onClick={handleToday} 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)', 
                            p: 0.5,
                            '&:hover': { color: '#00F3FF', bgcolor: 'rgba(0, 243, 255, 0.1)' } 
                        }}
                    >
                        <TodayIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={handlePreviousMonth} 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)', 
                            p: 0.5,
                            '&:hover': { color: '#00F3FF', bgcolor: 'rgba(0, 243, 255, 0.1)' } 
                        }}
                    >
                        <ChevronLeftIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={handleNextMonth} 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.5)', 
                            p: 0.5,
                            '&:hover': { color: '#00F3FF', bgcolor: 'rgba(0, 243, 255, 0.1)' } 
                        }}
                    >
                        <ChevronRightIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            </Box>

            <Typography variant="subtitle2" align="center" mb={1} sx={{ fontWeight: 500, color: 'white', fontSize: '0.85rem' }}>
                {monthName}
            </Typography>

            <Divider sx={{ mb: 1, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

            {loading ? (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={6} flexGrow={1} gap={1.5}>
                    <CircularProgress 
                        size={28} 
                        thickness={4}
                        sx={{ 
                            color: '#00F3FF',
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            }
                        }} 
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                        Loading calendar...
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Calendar Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 0.4,
                            mb: 1.5
                        }}
                    >
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <Box
                                key={day}
                                sx={{
                                    textAlign: 'center',
                                    py: 0.4,
                                    fontSize: '0.65rem',
                                    fontWeight: 500,
                                    color: 'rgba(255, 255, 255, 0.4)'
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
                            const isSelectedDay = isSelected(day);
                            const isTodayDay = isToday(day);

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
                                        border: '1px solid',
                                        borderColor: isSelectedDay ? '#00F3FF' : 'rgba(255, 255, 255, 0.04)',
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        bgcolor: isTodayDay ? 'rgba(0, 243, 255, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.04)',
                                            borderColor: 'rgba(255, 255, 255, 0.15)'
                                        },
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: isTodayDay ? 600 : 400,
                                            color: isTodayDay ? '#00F3FF' : 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {day}
                                    </Typography>
                                    {hasBookings && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 2,
                                                width: 3,
                                                height: 3,
                                                borderRadius: '50%',
                                                bgcolor: isTodayDay ? '#00F3FF' : '#5F9598'
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Selected Date Bookings */}
                    {selectedDate && (
                        <Box sx={{ flexGrow: 1, overflow: 'auto', mt: 0.5 }}>
                            <Divider sx={{ mb: 1, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 0.75, fontSize: '0.85rem' }}>
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Typography>
                            {selectedDateBookings.length === 0 ? (
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', display: 'block', textAlign: 'center', py: 2, fontSize: '0.75rem' }}>
                                    No bookings
                                </Typography>
                            ) : (
                                <List dense disablePadding>
                                    {selectedDateBookings.map(booking => (
                                        <ListItem
                                            key={booking._id}
                                            sx={{
                                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                                borderRadius: 1,
                                                mb: 0.5,
                                                p: 0.75,
                                                bgcolor: 'rgba(255, 255, 255, 0.01)'
                                            }}
                                        >
                                            <EventIcon sx={{ mr: 0.75, color: '#00F3FF', fontSize: 14 }} />
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={0.75}>
                                                        <Typography variant="body2" fontWeight="400" sx={{ color: 'white', fontSize: '0.75rem' }}>
                                                            {booking.timeSlot}
                                                        </Typography>
                                                        <Chip
                                                            label={booking.status}
                                                            size="small"
                                                            sx={{
                                                                height: 14,
                                                                fontSize: '0.55rem',
                                                                bgcolor: booking.status === 'confirmed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                                                color: booking.status === 'confirmed' ? '#22C55E' : 'rgba(255, 255, 255, 0.5)'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.65rem' }}>
                                                        {booking.serviceType} • {booking.contactId?.name}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </>
            )}
        </Paper>
    );
}

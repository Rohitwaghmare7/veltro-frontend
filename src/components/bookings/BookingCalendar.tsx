'use client';

import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import { Booking } from '@/lib/services/booking.service';
import { useRouter } from 'next/navigation';

interface BookingCalendarProps {
    bookings: Booking[];
}

type ViewMode = 'month' | 'week' | 'day';

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getHeaderText = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (viewMode === 'week') {
            const weekStart = getWeekStart(currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        }
    };

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    const getBookingsForDate = (date: Date) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return (
                bookingDate.getFullYear() === date.getFullYear() &&
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getDate() === date.getDate()
            );
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'cancelled': return '#f44336';
            case 'completed': return '#9e9e9e';
            case 'no-show': return '#e91e63';
            default: return '#9e9e9e';
        }
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDay = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return (
            <Box>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <Box key={day} flex="1 1 calc(14.28% - 8px)" minWidth={80}>
                            <Typography variant="caption" fontWeight="bold" textAlign="center" display="block">
                                {day}
                            </Typography>
                        </Box>
                    ))}
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                    {days.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === month;
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayBookings = getBookingsForDate(day);

                        return (
                            <Box key={index} flex="1 1 calc(14.28% - 8px)" minWidth={80}>
                                <Paper
                                    sx={{
                                        p: 1,
                                        minHeight: 80,
                                        bgcolor: isCurrentMonth ? 'background.paper' : 'action.hover',
                                        border: isToday ? '2px solid' : '1px solid',
                                        borderColor: isToday ? 'primary.main' : 'divider',
                                        cursor: dayBookings.length > 0 ? 'pointer' : 'default',
                                        '&:hover': dayBookings.length > 0 ? { bgcolor: 'action.hover' } : {},
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={isToday ? 'bold' : 'normal'}
                                        color={isCurrentMonth ? 'text.primary' : 'text.secondary'}
                                    >
                                        {day.getDate()}
                                    </Typography>
                                    <Box mt={0.5}>
                                        {dayBookings.slice(0, 3).map(booking => (
                                            <Tooltip key={booking._id} title={`${booking.timeSlot} - ${booking.clientName}`}>
                                                <Box
                                                    onClick={() => router.push(`/dashboard/bookings/${booking._id}`)}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        p: 0.25,
                                                        mb: 0.25,
                                                        bgcolor: getStatusColor(booking.status),
                                                        color: 'white',
                                                        borderRadius: 0.5,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {booking.timeSlot}
                                                </Box>
                                            </Tooltip>
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <Typography variant="caption" color="text.secondary">
                                                +{dayBookings.length - 3} more
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    const renderWeekView = () => {
        const weekStart = getWeekStart(currentDate);
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            days.push(day);
        }

        const timeSlots = [];
        for (let hour = 8; hour <= 18; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }

        return (
            <Box>
                <Box display="flex" gap={1} mb={2}>
                    <Box flex="0 0 60px">
                        <Typography variant="caption" fontWeight="bold">Time</Typography>
                    </Box>
                    {days.map((day, index) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <Box key={index} flex={1} textAlign="center">
                                <Typography variant="caption" fontWeight="bold">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={isToday ? 'bold' : 'normal'}
                                    color={isToday ? 'primary' : 'text.primary'}
                                >
                                    {day.getDate()}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
                    {timeSlots.map(slot => (
                        <Box key={slot} display="flex" gap={1} mb={1}>
                            <Box flex="0 0 60px">
                                <Typography variant="caption">{slot}</Typography>
                            </Box>
                            {days.map((day, index) => {
                                const dayBookings = getBookingsForDate(day).filter(b => b.timeSlot === slot);
                                return (
                                    <Box key={index} flex={1}>
                                        <Paper
                                            sx={{
                                                p: 0.5,
                                                minHeight: 40,
                                                bgcolor: dayBookings.length > 0 ? 'action.hover' : 'background.paper',
                                            }}
                                        >
                                            {dayBookings.map(booking => (
                                                <Chip
                                                    key={booking._id}
                                                    label={booking.clientName}
                                                    size="small"
                                                    onClick={() => router.push(`/dashboard/bookings/${booking._id}`)}
                                                    sx={{
                                                        bgcolor: getStatusColor(booking.status),
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            ))}
                                        </Paper>
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    };

    const renderDayView = () => {
        const dayBookings = getBookingsForDate(currentDate).sort((a, b) => 
            a.timeSlot.localeCompare(b.timeSlot)
        );

        return (
            <Box>
                {dayBookings.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No bookings for this day</Typography>
                    </Paper>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {dayBookings.map(booking => (
                            <Paper
                                key={booking._id}
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    borderLeft: `4px solid ${getStatusColor(booking.status)}`,
                                }}
                                onClick={() => router.push(`/dashboard/bookings/${booking._id}`)}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="h6">{booking.clientName}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {booking.serviceType}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.timeSlot} ({booking.duration} min)
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={booking.status}
                                        size="small"
                                        sx={{
                                            bgcolor: getStatusColor(booking.status),
                                            color: 'white',
                                        }}
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Paper sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={goToPrevious} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" minWidth={250} textAlign="center">
                        {getHeaderText()}
                    </Typography>
                    <IconButton onClick={goToNext} size="small">
                        <ChevronRightIcon />
                    </IconButton>
                    <IconButton onClick={goToToday} size="small" color="primary">
                        <TodayIcon />
                    </IconButton>
                </Box>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                >
                    <ToggleButton value="month">
                        <CalendarViewMonthIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="week">
                        <ViewWeekIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="day">
                        <ViewDayIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Calendar View */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
        </Paper>
    );
}

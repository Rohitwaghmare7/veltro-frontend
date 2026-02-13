'use client';

import { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Avatar,
    AvatarGroup,
    Paper,
    Button,
    useTheme,
    Dialog,
    CircularProgress,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    CalendarToday,
    AccessTime,
    LocationOnOutlined,
    Close,
    EventOutlined,
} from '@mui/icons-material';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, getHours, getMinutes, parseISO } from 'date-fns';
import { Booking } from '@/lib/services/booking.service';
import BookingList from './BookingList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useBookingsStore } from '@/store/bookingsStore';

const HOUR_HEIGHT = 120; // Height of one hour in pixels

// Status color mapping
const getStatusColor = (status: string, isDark: boolean) => {
    const colors = {
        confirmed: { bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#bbf7d0', text: isDark ? '#10b981' : '#14532d', border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : 'none' },
        pending: { bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fed7aa', text: isDark ? '#f59e0b' : '#7c2d12', border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : 'none' },
        cancelled: { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca', text: isDark ? '#ef4444' : '#7f1d1d', border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : 'none' },
        completed: { bg: isDark ? 'rgba(139, 92, 246, 0.2)' : '#ddd6fe', text: isDark ? '#8b5cf6' : '#5b21b6', border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : 'none' },
        'no-show': { bg: isDark ? 'rgba(236, 72, 153, 0.2)' : '#fbcfe8', text: isDark ? '#ec4899' : '#831843', border: isDark ? '1px solid rgba(236, 72, 153, 0.3)' : 'none' },
    };
    return colors[status as keyof typeof colors] || colors.pending;
};

export default function BookingCalendar({ bookings }: { bookings: Booking[] }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { creating, createBooking: createBookingAction } = useBookingsStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [newBookingDialog, setNewBookingDialog] = useState(false);
    const [newBookingData, setNewBookingData] = useState({
        date: new Date(),
        timeSlot: '09:00',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        serviceType: '',
        duration: 60,
        notes: ''
    });

    // Week start logic (Monday)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handlePrev = () => setCurrentDate(addDays(currentDate, -7));
    const handleNext = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    const openBookingDialog = (booking: Booking) => {
        setSelectedBooking(booking);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedBooking(null);
    };

    const handleTimeSlotClick = (day: Date, hour: number) => {
        const clickedDateTime = setHours(setMinutes(day, 0), hour);
        setNewBookingData({
            ...newBookingData,
            date: clickedDateTime,
            timeSlot: format(clickedDateTime, 'HH:mm')
        });
        setNewBookingDialog(true);
    };

    const handleCreateBooking = async () => {
        const result = await createBookingAction({
            clientName: newBookingData.clientName,
            clientEmail: newBookingData.clientEmail,
            clientPhone: newBookingData.clientPhone,
            serviceType: newBookingData.serviceType,
            date: newBookingData.date.toISOString(),
            timeSlot: newBookingData.timeSlot,
            duration: newBookingData.duration,
            notes: newBookingData.notes
        });

        if (result.success) {
            setNewBookingDialog(false);
            // Reset form
            setNewBookingData({
                date: new Date(),
                timeSlot: '09:00',
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                serviceType: '',
                duration: 60,
                notes: ''
            });
        } else {
            alert(result.error || 'Failed to create booking. Please try again.');
        }
    };

    // Calculate event position and style from booking
    const getBookingStyle = (booking: Booking) => {
        // Parse time slot (e.g., "09:00" or "9:00 AM")
        const timeMatch = booking.timeSlot.match(/(\d+):(\d+)/);
        if (!timeMatch) return { top: '0px', height: '60px' };
        
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        
        // Handle AM/PM
        if (booking.timeSlot.toLowerCase().includes('pm') && hours !== 12) {
            hours += 12;
        } else if (booking.timeSlot.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
        }
        
        const startHour = hours + minutes / 60;
        const duration = (booking.duration || 60) / 60; // Convert minutes to hours
        
        return {
            top: `${startHour * HOUR_HEIGHT}px`,
            height: `${duration * HOUR_HEIGHT}px`,
        };
    };

    // Background colors
    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const headerBgColor = isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#111827';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#6B7280';
    const todayBg = isDark ? '#667eea' : '#111827';
    const todayText = '#ffffff';
    const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
                bgcolor: bgColor,
                borderRadius: '30px',
                p: 3,
                boxShadow: isDark ? '0px 4px 20px rgba(0,0,0,0.3)' : '0px 4px 20px rgba(0,0,0,0.05)',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* --- Header --- */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h4" fontWeight={700} sx={{ fontSize: '2rem', letterSpacing: '-0.02em', color: textPrimary }}>
                            {format(currentDate, 'MMMM, yyyy')}
                        </Typography>
                        <IconButton 
                            onClick={() => setDatePickerOpen(true)}
                            sx={{ 
                                bgcolor: headerBgColor, 
                                borderRadius: '12px',
                                color: textPrimary,
                                '&:hover': { bgcolor: hoverBg }
                            }}
                        >
                            <EventOutlined />
                        </IconButton>
                    </Box>

                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                        {/* View Switcher */}
                        <Box sx={{
                            bgcolor: headerBgColor,
                            p: 0.5,
                            borderRadius: '12px',
                            display: 'flex',
                            gap: 0.5
                        }}>
                            <Button
                                onClick={() => setViewMode('list')}
                                startIcon={<ViewListIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2,
                                    py: 0.75,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: viewMode === 'list' ? textPrimary : textSecondary,
                                    bgcolor: viewMode === 'list' ? (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff') : 'transparent',
                                    boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    '&:hover': { bgcolor: viewMode === 'list' ? (isDark ? 'rgba(255,255,255,0.12)' : '#ffffff') : hoverBg }
                                }}
                            >
                                List
                            </Button>
                            <Button
                                onClick={() => setViewMode('calendar')}
                                startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
                                sx={{
                                    borderRadius: '10px',
                                    px: 2,
                                    py: 0.75,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: viewMode === 'calendar' ? textPrimary : textSecondary,
                                    bgcolor: viewMode === 'calendar' ? (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff') : 'transparent',
                                    boxShadow: viewMode === 'calendar' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    '&:hover': { bgcolor: viewMode === 'calendar' ? (isDark ? 'rgba(255,255,255,0.12)' : '#ffffff') : hoverBg }
                                }}
                            >
                                Calendar
                            </Button>
                        </Box>

                        {/* Navigation */}
                        <Box display="flex" gap={1}>
                            <IconButton 
                                onClick={handlePrev} 
                                sx={{ 
                                    bgcolor: headerBgColor, 
                                    borderRadius: '12px',
                                    color: textPrimary,
                                    '&:hover': { bgcolor: hoverBg }
                                }}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <Button
                                onClick={handleToday}
                                sx={{
                                    bgcolor: headerBgColor,
                                    color: textPrimary,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: '12px',
                                    px: 3,
                                    '&:hover': { bgcolor: hoverBg }
                                }}
                            >
                                Today
                            </Button>
                            <IconButton 
                                onClick={handleNext} 
                                sx={{ 
                                    bgcolor: headerBgColor, 
                                    borderRadius: '12px',
                                    color: textPrimary,
                                    '&:hover': { bgcolor: hoverBg }
                                }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {viewMode === 'list' ? (
                    <BookingList bookings={bookings} />
                ) : (
                    <Box display="flex" flexDirection="column" height="100%" sx={{ overflow: 'hidden' }}>

                        {/* --- Days Header --- */}
                        <Box display="flex" justifyContent="space-between" mb={2} pr="16px">
                            <Box width="60px" /> {/* Time column spacer */}
                            {weekDays.map((day, i) => {
                                const isToday = isSameDay(day, new Date());
                                const isSelected = isSameDay(day, currentDate);

                                return (
                                    <Box
                                        key={i}
                                        flex={1}
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            height: '100px',
                                            background: isToday ? todayBg : (isSelected ? headerBgColor : 'transparent'),
                                            borderRadius: '20px',
                                            mx: 0.5,
                                            color: isToday ? todayText : textPrimary,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            border: isSelected ? `3px solid ${todayBg}` : '3px solid transparent',
                                            '&:hover': { bgcolor: isToday ? (isDark ? '#7c8ef0' : '#1F2937') : hoverBg }
                                        }}
                                        onClick={() => setCurrentDate(day)}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 500, mb: 0.5 }}>
                                            {format(day, 'EEEE')}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700}>
                                            {format(day, 'd')}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* --- Calendar Grid --- */}
                        <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                            <Box display="flex" height={`${24 * HOUR_HEIGHT}px`}>
                                {/* Time Column */}
                                <Box sx={{ width: '60px', flexShrink: 0, position: 'relative' }}>
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}>
                                            <Typography
                                                variant="caption"
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 0,
                                                    left: 10,
                                                    color: textSecondary,
                                                    fontWeight: 600,
                                                    transform: 'translateY(-50%)'
                                                }}
                                            >
                                                {format(setHours(new Date(), i), 'h aaa')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Grid Body */}
                                <Box sx={{ flex: 1, position: 'relative' }}>
                                    {/* Horizontal Lines */}
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                position: 'absolute',
                                                top: i * HOUR_HEIGHT,
                                                left: 0,
                                                right: 0,
                                                borderTop: `1px solid ${borderColor}`,
                                                zIndex: 0,
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    ))}

                                    {/* Day Columns */}
                                    {weekDays.map((day, dayIndex) => {
                                        const isSelectedDay = isSameDay(day, currentDate);
                                        
                                        return (
                                            <Box
                                                key={dayIndex}
                                                sx={{
                                                    position: 'absolute',
                                                    left: `${(dayIndex / 7) * 100}%`,
                                                    width: `${100 / 7}%`,
                                                    height: '100%',
                                                    borderLeft: '1px solid transparent',
                                                    bgcolor: isSelectedDay ? (isDark ? 'rgba(102, 126, 234, 0.03)' : 'rgba(102, 126, 234, 0.02)') : 'transparent',
                                                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }
                                                }}
                                            >
                                                {/* Clickable Time Slots */}
                                                {Array.from({ length: 24 }).map((_, hour) => (
                                                    <Box
                                                        key={`slot-${dayIndex}-${hour}`}
                                                        onClick={() => handleTimeSlotClick(day, hour)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: hour * HOUR_HEIGHT,
                                                            left: 0,
                                                            right: 0,
                                                            height: `${HOUR_HEIGHT}px`,
                                                            zIndex: 1,
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                bgcolor: isDark ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.05)',
                                                                '&::after': {
                                                                    content: '"+"',
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    fontSize: '2rem',
                                                                    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                                                    fontWeight: 300
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ))}

                                                {/* Render Bookings */}
                                                {bookings
                                                    .filter(booking => {
                                                        const bookingDate = new Date(booking.date);
                                                        return isSameDay(bookingDate, day);
                                                    })
                                                    .map((booking) => {
                                                        const styles = getBookingStyle(booking);
                                                        const color = getStatusColor(booking.status, isDark);

                                                        return (
                                                            <Paper
                                                                key={booking._id}
                                                                elevation={0}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: styles.top,
                                                                    height: styles.height,
                                                                    left: '5%',
                                                                    width: '90%',
                                                                    bgcolor: color.bg,
                                                                    borderRadius: '16px',
                                                                    p: 2,
                                                                    overflow: 'hidden',
                                                                    cursor: 'pointer',
                                                                    transition: 'transform 0.2s',
                                                                    zIndex: 10,
                                                                    border: color.border,
                                                                    '&:hover': { 
                                                                        transform: 'scale(1.02)', 
                                                                        zIndex: 20, 
                                                                        boxShadow: isDark ? '0 10px 20px rgba(0,0,0,0.5)' : '0 10px 20px rgba(0,0,0,0.1)' 
                                                                    }
                                                                }}
                                                                onClick={() => openBookingDialog(booking)}
                                                            >
                                                                <Box position="relative" zIndex={1}>
                                                                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: color.text, fontSize: '0.85rem', lineHeight: 1.2, mb: 0.5 }}>
                                                                        {booking.clientName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: color.text, opacity: 0.8, fontWeight: 500, fontSize: '0.7rem', display: 'block' }}>
                                                                        {booking.timeSlot}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ color: color.text, opacity: 0.7, fontWeight: 500, fontSize: '0.7rem', display: 'block' }}>
                                                                        {booking.serviceType}
                                                                    </Typography>
                                                                </Box>
                                                            </Paper>
                                                        );
                                                    })}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>

                    </Box>
                )}

                {/* --- Booking Details Dialog --- */}
                <Dialog
                    open={dialogOpen}
                    onClose={closeDialog}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: '24px',
                                width: '400px',
                                maxWidth: '90vw',
                                boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                                overflow: 'visible',
                                p: 0,
                                bgcolor: bgColor
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 3, position: 'relative' }}>
                        <IconButton
                            onClick={closeDialog}
                            sx={{ position: 'absolute', right: 10, top: 10, color: textSecondary }}
                        >
                            <Close />
                        </IconButton>

                        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, pr: 4, color: textPrimary }}>
                            {selectedBooking?.clientName}
                        </Typography>

                        <Box sx={{ bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CalendarToday sx={{ color: textSecondary }} />
                            <Typography fontWeight={600} color={textPrimary}>
                                {selectedBooking && format(new Date(selectedBooking.date), 'EEEE, d MMMM yyyy')}
                            </Typography>
                        </Box>

                        <Box display="flex" gap={2} mb={2}>
                            <Box sx={{ flex: 1, bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AccessTime sx={{ color: textSecondary }} />
                                <Typography fontWeight={600} color={textPrimary}>
                                    {selectedBooking?.timeSlot}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography fontWeight={600} color={textPrimary}>
                                    {selectedBooking?.duration} min
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocationOnOutlined sx={{ color: textSecondary }} />
                            <Typography fontWeight={600} color={textPrimary}>{selectedBooking?.serviceType}</Typography>
                        </Box>

                        <Box sx={{ bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, mb: 3 }}>
                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block' }}>Status</Typography>
                            <Typography fontWeight={600} color={textPrimary} sx={{ textTransform: 'capitalize' }}>
                                {selectedBooking?.status}
                            </Typography>
                        </Box>

                        {selectedBooking?.notes && (
                            <Box sx={{ bgcolor: headerBgColor, borderRadius: '12px', p: 1.5, mb: 3 }}>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block' }}>Notes</Typography>
                                <Typography fontWeight={500} color={textPrimary} sx={{ fontSize: '0.875rem' }}>
                                    {selectedBooking.notes}
                                </Typography>
                            </Box>
                        )}

                        <Box display="flex" justifyContent="flex-end" mt={4}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: isDark ? '#667eea' : '#111827',
                                    color: 'white',
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    px: 4,
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    boxShadow: isDark ? '0 4px 14px 0 rgba(102, 126, 234, 0.39)' : '0 4px 14px 0 rgba(17, 24, 39, 0.39)',
                                    '&:hover': {
                                        bgcolor: isDark ? '#7c8ef0' : '#000000',
                                        boxShadow: isDark ? '0 6px 20px rgba(102, 126, 234, 0.5)' : '0 6px 20px rgba(0,0,0,0.23)'
                                    }
                                }}
                                onClick={closeDialog}
                            >
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Dialog>

                {/* Date Picker Dialog */}
                <Dialog
                    open={datePickerOpen}
                    onClose={() => setDatePickerOpen(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: '24px',
                                bgcolor: bgColor,
                                boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: textPrimary }}>
                            Select Date
                        </Typography>
                        <DatePicker
                            value={currentDate}
                            onChange={(newDate) => {
                                if (newDate) {
                                    setCurrentDate(newDate);
                                    setDatePickerOpen(false);
                                }
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: {
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            color: textPrimary,
                                            '& fieldset': {
                                                borderColor: borderColor,
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: textSecondary,
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </Dialog>

                {/* New Booking Dialog */}
                <Dialog
                    open={newBookingDialog}
                    onClose={() => setNewBookingDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: '24px',
                                bgcolor: bgColor,
                                boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" fontWeight={700} color={textPrimary}>
                                New Booking
                            </Typography>
                            <IconButton onClick={() => setNewBookingDialog(false)} sx={{ color: textSecondary }}>
                                <Close />
                            </IconButton>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={2.5}>
                            {/* Date and Time */}
                            <Box sx={{ bgcolor: headerBgColor, borderRadius: '12px', p: 2 }}>
                                <Box display="flex" alignItems="center" gap={2} mb={1}>
                                    <CalendarToday sx={{ color: textSecondary, fontSize: 20 }} />
                                    <Typography fontWeight={600} color={textPrimary}>
                                        {format(newBookingData.date, 'EEEE, MMMM d, yyyy')}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AccessTime sx={{ color: textSecondary, fontSize: 20 }} />
                                    <Typography fontWeight={600} color={textPrimary}>
                                        {newBookingData.timeSlot}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Client Name */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Client Name *
                                </Typography>
                                <Box
                                    component="input"
                                    value={newBookingData.clientName}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, clientName: e.target.value })}
                                    placeholder="Enter client name"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>

                            {/* Client Email */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Client Email *
                                </Typography>
                                <Box
                                    component="input"
                                    type="email"
                                    value={newBookingData.clientEmail}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, clientEmail: e.target.value })}
                                    placeholder="client@example.com"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>

                            {/* Client Phone */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Client Phone
                                </Typography>
                                <Box
                                    component="input"
                                    type="tel"
                                    value={newBookingData.clientPhone}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, clientPhone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>

                            {/* Service Type */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Service Type *
                                </Typography>
                                <Box
                                    component="input"
                                    value={newBookingData.serviceType}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, serviceType: e.target.value })}
                                    placeholder="e.g., Consultation, Training"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>  

                            {/* Duration */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Duration (minutes)
                                </Typography>
                                <Box
                                    component="select"
                                    value={newBookingData.duration}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, duration: parseInt(e.target.value) })}
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </Box>
                            </Box>

                            {/* Notes */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Notes
                                </Typography>
                                <Box
                                    component="textarea"
                                    value={newBookingData.notes}
                                    onChange={(e: any) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: headerBgColor,
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        resize: 'vertical',
                                        '&:focus': {
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                />
                            </Box>

                            {/* Action Buttons */}
                            <Box display="flex" gap={2} mt={2}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => setNewBookingDialog(false)}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: borderColor,
                                        color: textPrimary,
                                        '&:hover': {
                                            borderColor: textPrimary,
                                            bgcolor: headerBgColor
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleCreateBooking}
                                    disabled={!newBookingData.clientName || !newBookingData.clientEmail || !newBookingData.serviceType || creating}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        bgcolor: isDark ? '#667eea' : '#111827',
                                        color: 'white',
                                        boxShadow: isDark ? '0 4px 14px 0 rgba(102, 126, 234, 0.39)' : '0 4px 14px 0 rgba(17, 24, 39, 0.39)',
                                        '&:hover': {
                                            bgcolor: isDark ? '#7c8ef0' : '#000000',
                                            boxShadow: isDark ? '0 6px 20px rgba(102, 126, 234, 0.5)' : '0 6px 20px rgba(0,0,0,0.23)'
                                        },
                                        '&:disabled': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                        }
                                    }}
                                >
                                    {creating ? (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CircularProgress size={20} sx={{ color: 'white' }} />
                                            <span>Creating...</span>
                                        </Box>
                                    ) : (
                                        'Create Booking'
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
}

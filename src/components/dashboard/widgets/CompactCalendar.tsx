'use client';

import { Box, Paper, Typography, IconButton, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useBookingsStore } from '@/store/bookingsStore';

export default function CompactCalendar() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    
    // Get bookings from Zustand store
    const { bookings, fetchBookings, loading } = useBookingsStore();

    // Fetch bookings on mount
    useEffect(() => {
        console.log('📅 CompactCalendar mounted, fetching bookings...');
        fetchBookings();
    }, [fetchBookings]);

    // Log bookings when they change
    useEffect(() => {
        console.log('📅 Bookings updated in CompactCalendar:', bookings.length, 'bookings');
        if (bookings.length > 0) {
            console.log('📅 Sample booking:', bookings[0]);
        }
    }, [bookings]);

    // Calculate booking counts per day from the bookings array
    const bookingCounts = useMemo(() => {
        const counts: { [date: string]: number } = {};
        
        bookings.forEach((booking) => {
            if (booking.date) {
                // Convert booking date to YYYY-MM-DD format
                const dateStr = new Date(booking.date).toISOString().split('T')[0];
                counts[dateStr] = (counts[dateStr] || 0) + 1;
            }
        });
        
        console.log('📅 Calendar - Total bookings:', bookings.length);
        console.log('📅 Calendar - Booking counts by date:', counts);
        
        return counts;
    }, [bookings]);

    const getDaysInWeek = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
        
        const days = [];
        for (let i = 0; i < 14; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getBookingCount = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const count = bookingCounts[dateStr] || 0;
        if (count > 0) {
            console.log(`📅 Date ${dateStr} has ${count} bookings`);
        }
        return count;
    };

    const getBookingColor = (count: number) => {
        if (count === 0) return 'transparent';
        if (count <= 2) return '#fbbf24'; // Yellow
        if (count <= 4) return isDark ? 'rgba(255,255,255,0.7)' : '#60a5fa'; // White in dark mode, Blue in light mode
        return '#f87171'; // Red
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInWeek();

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 14);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 14);
        setCurrentDate(newDate);
    };

    const getDateRange = () => {
        const start = days[0];
        const end = days[13];
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    return (
        <Paper sx={{
            p: 2.5,
            borderRadius: '24px',
            bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            position: 'relative'
        }}>
            {/* Loading Overlay */}
            {loading && bookings.length === 0 && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: '24px',
                    zIndex: 10
                }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Loading bookings...
                    </Typography>
                </Box>
            )}
            
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {getDateRange()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                        size="small" 
                        onClick={handlePrevWeek}
                        sx={{ 
                            bgcolor: '#ff6b6b',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: '#ff5252' }
                        }}
                    >
                        <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={handleNextWeek}
                        sx={{ 
                            bgcolor: '#ff6b6b',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: '#ff5252' }
                        }}
                    >
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 1.5 }}>
                {days.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const count = getBookingCount(date);
                    const today = isToday(date);
                    const isHovered = hoveredDate === dateStr;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                        <Box key={dateStr} sx={{ textAlign: 'center', position: 'relative' }}>
                            <Typography variant="caption" sx={{ 
                                color: theme.palette.mode === 'dark' ? 'text.secondary' : '#000000',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                display: 'block',
                                mb: 1
                            }}>
                                {dayName}
                            </Typography>
                            <Box
                                component={Link}
                                href="/dashboard/bookings"
                                onMouseEnter={() => setHoveredDate(dateStr)}
                                onMouseLeave={() => setHoveredDate(null)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: '16px',
                                    bgcolor: today ? '#ff6b6b' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                    color: today ? 'white' : 'text.primary',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        bgcolor: today ? '#ff5252' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                    {date.getDate()}
                                </Typography>
                                {count > 0 && (
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 4,
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        bgcolor: today ? 'rgba(255,255,255,0.8)' : getBookingColor(count)
                                    }} />
                                )}
                            </Box>
                            
                            {/* Booking Count Tooltip */}
                            {isHovered && count > 0 && (
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -28,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
                                    color: 'white',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: -4,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '4px solid transparent',
                                        borderRight: '4px solid transparent',
                                        borderBottom: `4px solid ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)'}`,
                                    }
                                }}>
                                    {count} booking{count !== 1 ? 's' : ''}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}

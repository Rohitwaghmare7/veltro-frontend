'use client';

import { Box, Paper, Typography, IconButton, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useState } from 'react';
import Link from 'next/link';

interface CompactCalendarProps {
    bookings?: Array<{
        date: string;
        count: number;
    }>;
}

export default function CompactCalendar({ bookings = [] }: CompactCalendarProps) {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInWeek = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getBookingCount = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const booking = bookings.find(b => b.date === dateStr);
        return booking?.count || 0;
    };

    const getBookingColor = (count: number) => {
        if (count === 0) return 'transparent';
        if (count <= 2) return '#fbbf24'; // Yellow
        if (count <= 4) return '#60a5fa'; // Blue
        return '#f87171'; // Red
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = getDaysInWeek();

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const getDateRange = () => {
        const start = days[0];
        const end = days[6];
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    return (
        <Paper sx={{
            p: 2.5,
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%'
        }}>
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {weekDays.map((day, index) => {
                    const date = days[index];
                    const count = getBookingCount(date);
                    const today = isToday(date);

                    return (
                        <Box key={day} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ 
                                color: 'text.secondary', 
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                display: 'block',
                                mb: 1
                            }}>
                                {day}
                            </Typography>
                            <Box
                                component={Link}
                                href="/dashboard/bookings"
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
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                                        bgcolor: getBookingColor(count)
                                    }} />
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* View Month Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                    component={Link}
                    href="/dashboard/bookings"
                    size="small"
                    sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                        }
                    }}
                >
                    <CalendarMonthIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>
        </Paper>
    );
}

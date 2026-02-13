'use client';

import { useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    useTheme,
} from '@mui/material';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import RBACGuard from '@/components/dashboard/RBACGuard';
import { useBookingsStore } from '@/store/bookingsStore';

export default function BookingsPage() {
    const theme = useTheme();
    const { bookings, loading, fetchBookings } = useBookingsStore();

    const pageBgColor = theme.palette.mode === 'light' ? '#F2F1EB' : '#0f1117';

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    if (loading && bookings.length === 0) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="calc(100vh - 100px)" gap={2}>
                <CircularProgress size={32} thickness={5} sx={{ color: 'primary.main' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Refreshing Bookings...</Typography>
            </Box>
        );
    }

    return (
        <RBACGuard permission="canViewBookings">
            <Box sx={{
                p: { xs: 2, sm: 3 },
                height: '100vh',
                bgcolor: pageBgColor,
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}>
                <BookingCalendar bookings={bookings} />
            </Box>
        </RBACGuard>
    );
}

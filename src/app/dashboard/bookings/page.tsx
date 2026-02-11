'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { bookingService, Booking } from '@/lib/services/booking.service';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function BookingsPage() {
    const [tabValue, setTabValue] = useState(0);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAllBookings();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBooking(null);
    };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedBooking) return;

        try {
            await bookingService.updateStatus(selectedBooking._id, status);
            handleMenuClose();
            fetchBookings(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update booking status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    // Filter bookings based on tab
    const filteredBookings = bookings.filter(booking => {
        if (tabValue === 0) return booking.status === 'confirmed' || booking.status === 'pending';
        if (tabValue === 1) return booking.status === 'completed';
        if (tabValue === 2) return booking.status === 'cancelled';
        return true;
    });

    return (
        <RBACGuard permission="canViewBookings">
            <Box>
                <Typography variant="h4" fontWeight="bold" mb={4}>Bookings</Typography>

                <Paper sx={{ mb: 4 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Upcoming" />
                        <Tab label="Completed" />
                        <Tab label="Cancelled" />
                    </Tabs>
                </Paper>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : filteredBookings.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography>No bookings found.</Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBookings.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{row.clientName}</TableCell>
                                        <TableCell>{row.serviceType}</TableCell>
                                        <TableCell>
                                            {new Date(row.date).toLocaleDateString()} at {row.timeSlot}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                color={getStatusColor(row.status) as any}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Status Update Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleStatusUpdate('confirmed')} disabled={selectedBooking?.status === 'confirmed'}>
                        <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Mark as Confirmed</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusUpdate('completed')} disabled={selectedBooking?.status === 'completed'}>
                        <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Mark as Completed</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusUpdate('cancelled')} disabled={selectedBooking?.status === 'cancelled'}>
                        <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Cancel Booking</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </RBACGuard>
    );
}

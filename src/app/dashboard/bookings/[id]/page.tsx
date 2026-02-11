'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { bookingService, Booking } from '@/lib/services/booking.service';
import RBACGuard from '@/components/dashboard/RBACGuard';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Edit form state
    const [editData, setEditData] = useState<{
        date: string;
        timeSlot: string;
        duration: number;
        serviceType: string;
        location: string;
        notes: string;
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    }>({
        date: '',
        timeSlot: '',
        duration: 60,
        serviceType: '',
        location: '',
        notes: '',
        status: 'pending',
    });

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        setLoading(true);
        try {
            const response = await bookingService.getBookingById(bookingId);
            if (response.success) {
                setBooking(response.data);
                setEditData({
                    date: response.data.date.split('T')[0],
                    timeSlot: response.data.timeSlot,
                    duration: response.data.duration,
                    serviceType: response.data.serviceType,
                    location: response.data.location || '',
                    notes: response.data.notes || '',
                    status: response.data.status,
                });
            }
        } catch (error) {
            console.error('Failed to fetch booking', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await bookingService.updateBooking(bookingId, editData);
            setEditMode(false);
            fetchBooking();
        } catch (error) {
            console.error('Failed to update booking', error);
            alert('Failed to update booking');
        }
    };

    const handleDelete = async () => {
        try {
            await bookingService.deleteBooking(bookingId);
            router.push('/dashboard/bookings');
        } catch (error) {
            console.error('Failed to delete booking', error);
            alert('Failed to delete booking');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'default';
            case 'no-show': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!booking) {
        return (
            <Box>
                <Typography>Booking not found</Typography>
            </Box>
        );
    }

    return (
        <RBACGuard permission="canViewBookings">
            <Box>
                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton onClick={() => router.push('/dashboard/bookings')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold">
                            Booking Details
                        </Typography>
                        <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status) as any}
                            size="small"
                        />
                    </Box>
                    <Box display="flex" gap={2}>
                        {!editMode && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                        {editMode && (
                            <>
                                <Button variant="outlined" onClick={() => setEditMode(false)}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                    {/* Client Information */}
                    <Box flex={1}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Client Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Name
                                    </Typography>
                                    <Typography variant="body1">{booking.clientName}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">{booking.clientEmail}</Typography>
                                </Box>
                                {booking.clientPhone && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">{booking.clientPhone}</Typography>
                                    </Box>
                                )}
                                {booking.contactId && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Contact Status
                                        </Typography>
                                        <Typography variant="body1">
                                            {booking.contactId.status} • Source: {booking.contactId.source}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>

                    {/* Booking Details */}
                    <Box flex={1}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Booking Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {!editMode ? (
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Service Type
                                        </Typography>
                                        <Typography variant="body1">{booking.serviceType}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Date & Time
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Duration
                                        </Typography>
                                        <Typography variant="body1">{booking.duration} minutes</Typography>
                                    </Box>
                                    {booking.location && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body1">{booking.location}</Typography>
                                        </Box>
                                    )}
                                    {booking.assignedTo && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Assigned To
                                            </Typography>
                                            <Typography variant="body1">
                                                {booking.assignedTo.name} ({booking.assignedTo.email})
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <TextField
                                        label="Service Type"
                                        value={editData.serviceType}
                                        onChange={(e) => setEditData({ ...editData, serviceType: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Date"
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        label="Time Slot"
                                        value={editData.timeSlot}
                                        onChange={(e) => setEditData({ ...editData, timeSlot: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Duration (minutes)"
                                        type="number"
                                        value={editData.duration}
                                        onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Location"
                                        value={editData.location}
                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Status"
                                        select
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                                        fullWidth
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="confirmed">Confirmed</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                        <MenuItem value="no-show">No Show</MenuItem>
                                    </TextField>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>

                {/* Notes */}
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {!editMode ? (
                        <Typography variant="body1" color={booking.notes ? 'text.primary' : 'text.secondary'}>
                            {booking.notes || 'No notes added'}
                        </Typography>
                    ) : (
                        <TextField
                            multiline
                            rows={4}
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            fullWidth
                            placeholder="Add notes about this booking..."
                        />
                    )}
                </Paper>

                {/* Metadata */}
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Metadata
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                        <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                                Created At
                            </Typography>
                            <Typography variant="body2">
                                {new Date(booking.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                        <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                                Last Updated
                            </Typography>
                            <Typography variant="body2">
                                {new Date(booking.updatedAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Delete Booking</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this booking? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

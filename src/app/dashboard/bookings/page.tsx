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
    ListItemText,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import { bookingService, Booking } from '@/lib/services/booking.service';
import { useRouter } from 'next/navigation';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import RBACGuard from '@/components/dashboard/RBACGuard';

export default function BookingsPage() {
    const router = useRouter();
    const [tabValue, setTabValue] = useState(0);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        serviceType: '',
        from: '',
        to: '',
        assignedTo: '',
    });

    // Menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const activeFilters: any = {};
            if (filters.status) activeFilters.status = filters.status;
            if (filters.serviceType) activeFilters.serviceType = filters.serviceType;
            if (filters.from) activeFilters.from = filters.from;
            if (filters.to) activeFilters.to = filters.to;
            if (filters.assignedTo) activeFilters.assignedTo = filters.assignedTo;

            const data = await bookingService.getAllBookings(activeFilters);
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
    }, [filters]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        // Update status filter based on tab
        if (newValue === 0) {
            setFilters({ ...filters, status: '' });
        } else if (newValue === 1) {
            setFilters({ ...filters, status: 'completed' });
        } else if (newValue === 2) {
            setFilters({ ...filters, status: 'cancelled' });
        }
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
            fetchBookings();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update booking status');
        }
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            serviceType: '',
            from: '',
            to: '',
            assignedTo: '',
        });
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

    // Filter bookings based on tab (only for list view)
    const filteredBookings = bookings.filter(booking => {
        if (tabValue === 0) return booking.status === 'confirmed' || booking.status === 'pending';
        if (tabValue === 1) return booking.status === 'completed';
        if (tabValue === 2) return booking.status === 'cancelled';
        return true;
    });

    return (
        <RBACGuard permission="canViewBookings">
            <Box>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Bookings</Typography>
                    <Box display="flex" gap={2}>
                        <Button
                            variant={showFilters ? 'contained' : 'outlined'}
                            startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filters
                        </Button>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                        >
                            <ToggleButton value="list">
                                <ViewListIcon />
                            </ToggleButton>
                            <ToggleButton value="calendar">
                                <CalendarMonthIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                {/* Filters */}
                {showFilters && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Filters
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            <TextField
                                label="Service Type"
                                value={filters.serviceType}
                                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                                sx={{ minWidth: 200, flex: 1 }}
                                size="small"
                            />
                            <TextField
                                label="From Date"
                                type="date"
                                value={filters.from}
                                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                                sx={{ minWidth: 200, flex: 1 }}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="To Date"
                                type="date"
                                value={filters.to}
                                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                                sx={{ minWidth: 200, flex: 1 }}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleClearFilters}
                                sx={{ minWidth: 150 }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    </Paper>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <BookingCalendar bookings={bookings} />
                        )}
                    </>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <>
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
                                            <TableCell>Assigned To</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredBookings.map((row) => (
                                            <TableRow
                                                key={row._id}
                                                hover
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => router.push(`/dashboard/bookings/${row._id}`)}
                                            >
                                                <TableCell sx={{ fontWeight: 'bold' }}>{row.clientName}</TableCell>
                                                <TableCell>{row.serviceType}</TableCell>
                                                <TableCell>
                                                    {new Date(row.date).toLocaleDateString()} at {row.timeSlot}
                                                </TableCell>
                                                <TableCell>
                                                    {row.assignedTo ? row.assignedTo.name : '-'}
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
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMenuOpen(e, row);
                                                        }}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
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

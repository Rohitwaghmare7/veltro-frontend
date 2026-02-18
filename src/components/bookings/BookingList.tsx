'use client';

import { useState } from 'react';
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    Avatar,
    useTheme,
    Divider,
    Button,
} from '@mui/material';
import {
    MoreVert,
    CheckCircleOutline,
    CancelOutlined,
    DoneAll,
    SearchOutlined,
    FilterListOutlined,
    EventAvailableOutlined,
} from '@mui/icons-material';
import { Booking } from '@/lib/services/booking.service';
import { useRouter } from 'next/navigation';
import { useBookingsStore } from '@/store/bookingsStore';

interface BookingListProps {
    bookings: Booking[];
}

export default function BookingList({ bookings }: BookingListProps) {
    const router = useRouter();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { updateBookingStatus } = useBookingsStore();
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

    // Theme-aware colors
    const bgColor = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#111827';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#6B7280';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#F9FAFB';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';

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

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterSelect = (filter: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
        setStatusFilter(filter);
        handleFilterClose();
    };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedBooking) return;
        await updateBookingStatus(selectedBooking._id, status);
        handleMenuClose();
    };

    const getStatusColor = (status: string) => {
        if (isDark) {
            switch (status) {
                case 'confirmed': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
                case 'pending': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
                case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
                case 'completed': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
                default: return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
            }
        } else {
            switch (status) {
                case 'confirmed': return { bg: '#ECFDF5', text: '#059669' };
                case 'pending': return { bg: '#FFFBEB', text: '#D97706' };
                case 'cancelled': return { bg: '#FEF2F2', text: '#DC2626' };
                case 'completed': return { bg: '#EFF6FF', text: '#2563EB' };
                default: return { bg: '#F3F4F6', text: '#4B5563' };
            }
        }
    };

    // Advanced Local Filtering
    const filteredBookings = bookings.filter(booking => {
        // Status Filter
        const statusMatch = statusFilter === 'all' 
            ? true
            : statusFilter === 'upcoming'
                ? (booking.status === 'confirmed' || booking.status === 'pending')
                : statusFilter === 'completed'
                    ? booking.status === 'completed'
                    : booking.status === 'cancelled';

        if (!statusMatch) return false;

        // Search Filter
        const searchStr = searchQuery.toLowerCase();
        const matchesSearch =
            booking.clientName.toLowerCase().includes(searchStr) ||
            booking.serviceType.toLowerCase().includes(searchStr) ||
            (booking.assignedTo?.name || '').toLowerCase().includes(searchStr);

        return matchesSearch;
    });

    const getFilterLabel = () => {
        switch (statusFilter) {
            case 'all': return 'All Bookings';
            case 'upcoming': return 'Upcoming';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return 'Filter';
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Control Bar: Search and Filter */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
                {/* Search Bar and Filter - Left Aligned */}
                <Box display="flex" gap={1.5} alignItems="center" sx={{ flex: 1, maxWidth: '500px' }}>
                    <TextField
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: inputBg,
                                fontSize: '0.9rem',
                                boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                                color: textPrimary,
                                border: isDark ? 'none' : `1px solid ${borderColor}`,
                                '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : borderColor },
                                '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB' },
                                '&.Mui-focused fieldset': { borderColor: '#ff6b6b' },
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlined sx={{ fontSize: 20, color: textSecondary, opacity: 0.7 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        onClick={handleFilterClick}
                        startIcon={<FilterListOutlined sx={{ fontSize: 20 }} />}
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : inputBg,
                            borderRadius: '12px',
                            boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                            border: isDark ? 'none' : `1px solid ${borderColor}`,
                            minWidth: 180,
                            height: 40,
                            color: textPrimary,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            px: 2,
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.15)' : hoverBg,
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'
                            }
                        }}
                    >
                        {getFilterLabel()}
                    </Button>
                </Box>
            </Box>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '16px',
                            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
                            minWidth: 220,
                            mt: 1,
                            border: `1px solid ${borderColor}`,
                            bgcolor: isDark ? '#1a1d29' : bgColor
                        }
                    }
                }}
            >
                <MenuItem
                    onClick={() => handleFilterSelect('all')}
                    selected={statusFilter === 'all'}
                    sx={{ 
                        py: 1.5, 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: textPrimary,
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                            bgcolor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'
                            }
                        }
                    }}
                >
                    All Bookings
                </MenuItem>
                <MenuItem
                    onClick={() => handleFilterSelect('upcoming')}
                    selected={statusFilter === 'upcoming'}
                    sx={{ 
                        py: 1.5, 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: textPrimary,
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                            bgcolor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'
                            }
                        }
                    }}
                >
                    Upcoming
                </MenuItem>
                <MenuItem
                    onClick={() => handleFilterSelect('completed')}
                    selected={statusFilter === 'completed'}
                    sx={{ 
                        py: 1.5, 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: textPrimary,
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                            bgcolor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'
                            }
                        }
                    }}
                >
                    Completed
                </MenuItem>
                <MenuItem
                    onClick={() => handleFilterSelect('cancelled')}
                    selected={statusFilter === 'cancelled'}
                    sx={{ 
                        py: 1.5, 
                        fontSize: '0.9rem', 
                        fontWeight: 500, 
                        color: textPrimary,
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                            bgcolor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'
                            }
                        }
                    }}
                >
                    Cancelled
                </MenuItem>
            </Menu>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: '24px',
                    overflow: 'auto',
                    bgcolor: bgColor,
                    flex: 1,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)',
                    border: `1px solid ${borderColor}`,
                    maxHeight: 'calc(100vh - 240px)' // Reduced empty space below table
                }}
            >
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: bgColor, borderBottom: `1px solid ${borderColor}` }}>
                            <TableCell sx={{ py: 2.5, pl: 4, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>CUSTOMER</TableCell>
                            <TableCell sx={{ py: 2.5, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>SERVICE</TableCell>
                            <TableCell sx={{ py: 2.5, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>DATE / TIME</TableCell>
                            <TableCell sx={{ py: 2.5, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>ASSIGNED TO</TableCell>
                            <TableCell sx={{ py: 2.5, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>STATUS</TableCell>
                            <TableCell align="right" sx={{ py: 2.5, pr: 4, fontWeight: 600, color: textSecondary, fontSize: '0.8rem' }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ py: 10, textAlign: 'center', borderBottom: 'none' }}>
                                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                        <EventAvailableOutlined sx={{ fontSize: 48, color: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB', mb: 1 }} />
                                        <Typography variant="h6" fontWeight={700} color={textPrimary}>No Bookings Found</Typography>
                                        <Typography variant="body2" color={textSecondary}>Try adjusting your filters or search query</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((row) => (
                                <TableRow
                                    key={row._id}
                                    hover
                                    onClick={() => router.push(`/dashboard/bookings/${row._id}`)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: hoverBg
                                        },
                                        borderBottom: `1px solid ${borderColor}`
                                    }}
                                >
                                    <TableCell sx={{ py: 2.5, pl: 4 }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                {row.clientName.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: textPrimary, fontSize: '0.95rem' }}>
                                                    {row.clientName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: textSecondary }}>
                                                    @{row.clientName.toLowerCase().replace(/\s/g, '')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.serviceType}
                                            size="small"
                                            sx={{
                                                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
                                                color: textPrimary,
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                height: 28
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>
                                                {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: textSecondary }}>
                                                {row.timeSlot}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {row.assignedTo ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar
                                                    sx={{ 
                                                        width: 28, 
                                                        height: 28, 
                                                        fontSize: '0.75rem', 
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB', 
                                                        color: textPrimary 
                                                    }}
                                                >
                                                    {row.assignedTo.name.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500} color={textPrimary}>{row.assignedTo.name}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color={textSecondary} sx={{ fontStyle: 'italic' }}>Unassigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusColor(row.status).bg,
                                                color: getStatusColor(row.status).text,
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                borderRadius: '8px',
                                                height: 28,
                                                px: 1,
                                                border: '1px solid',
                                                borderColor: 'transparent'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuOpen(e, row);
                                            }}
                                            sx={{
                                                color: textSecondary,
                                                '&:hover': { color: textPrimary, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' },
                                                borderRadius: '8px',
                                                p: 1
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Status Update Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '16px',
                            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
                            minWidth: 320,
                            mt: 1,
                            border: `1px solid ${borderColor}`,
                            bgcolor: bgColor
                        }
                    }
                }}
            >
                <MenuItem
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={selectedBooking?.status === 'confirmed'}
                    sx={{ py: 1.5, fontSize: '0.9rem', fontWeight: 500, color: textPrimary }}
                >
                    <ListItemIcon>
                        <CheckCircleOutline fontSize="small" sx={{ color: '#10B981', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText>Mark as Confirmed</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={selectedBooking?.status === 'completed'}
                    sx={{ py: 1.5, fontSize: '0.9rem', fontWeight: 500, color: textPrimary }}
                >
                    <ListItemIcon>
                        <DoneAll fontSize="small" sx={{ color: '#3B82F6', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText>Mark as Completed</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 0.5, borderColor: borderColor }} />
                <MenuItem
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={selectedBooking?.status === 'cancelled'}
                    sx={{ py: 1.5, fontSize: '0.9rem', fontWeight: 500, color: '#EF4444' }}
                >
                    <ListItemIcon>
                        <CancelOutlined fontSize="small" sx={{ color: '#EF4444', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText>Cancel Booking</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}

'use client';

import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    CircularProgress,
    Chip,
    Tooltip,
    keyframes,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { inventoryService, InventoryItem } from '@/lib/services/inventory.service';
import RBACGuard from '@/components/dashboard/RBACGuard';
import ConfirmDeleteDialog from '@/components/forms/ConfirmDeleteDialog';
import NotificationSnackbar from '@/components/forms/NotificationSnackbar';

// Pulsing animation for low stock badge
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(211, 47, 47, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
  }
`;

export default function InventoryPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Theme colors
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const cardBg = isDark ? '#1a1d29' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'General',
        stock: 0,
        unit: 'Units',
        threshold: 5,
        vendorEmail: '',
    });

    const [processing, setProcessing] = useState(false);

    // Dialog & Notification State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Restock State
    const [restockDialog, setRestockDialog] = useState<{ open: boolean; itemId: string | null; currentStock: number; name: string }>({
        open: false,
        itemId: null,
        currentStock: 0,
        name: ''
    });
    const [restockQty, setRestockQty] = useState<string>('10');

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getInventory();
            if (data.success) {
                setInventory(data.data);
            }
        } catch (error) {
            console.error('Failed to load inventory', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAddItem = async () => {
        if (!formData.name) {
            setNotification({ open: true, message: 'Name is required', severity: 'warning' });
            return;
        }

        setProcessing(true);
        try {
            await inventoryService.addItem(formData);
            setOpenAdd(false);
            setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5, vendorEmail: '' });
            fetchInventory();
            setNotification({ open: true, message: 'Item added successfully', severity: 'success' });
        } catch (error) {
            console.error('Failed to add item', error);
            setNotification({ open: true, message: 'Failed to add item', severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateItem = async () => {
        if (!selectedItem || !formData.name) return;

        setProcessing(true);
        try {
            await inventoryService.updateItem(selectedItem._id, formData);
            setOpenEdit(false);
            setSelectedItem(null);
            fetchInventory();
            setNotification({ open: true, message: 'Item updated successfully', severity: 'success' });
        } catch (error) {
            console.error('Failed to update item', error);
            setNotification({ open: true, message: 'Failed to update item', severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            stock: item.stock,
            unit: item.unit,
            threshold: item.threshold,
            vendorEmail: item.vendorEmail || '',
        });
        setOpenEdit(true);
    };

    const handleDelete = (item: InventoryItem) => {
        setItemToDelete({ id: item._id, name: item.name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await inventoryService.deleteItem(itemToDelete.id);
            setInventory(inventory.filter(i => i._id !== itemToDelete.id));
            setNotification({ open: true, message: 'Item deleted successfully', severity: 'success' });
        } catch (error) {
            console.error('Failed to delete item', error);
            setNotification({ open: true, message: 'Failed to delete item', severity: 'error' });
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleRestockClick = (item: InventoryItem) => {
        setRestockDialog({
            open: true,
            itemId: item._id,
            currentStock: item.stock,
            name: item.name
        });
        setRestockQty('10');
    };

    const submitRestock = async () => {
        if (!restockDialog.itemId) return;

        const qty = parseInt(restockQty, 10);
        if (isNaN(qty) || qty <= 0) {
            setNotification({ open: true, message: 'Please enter a valid positive quantity', severity: 'warning' });
            return;
        }

        try {
            const res = await inventoryService.restockItem(restockDialog.itemId, qty, 'add');
            if (res.success) {
                setInventory(inventory.map(i => i._id === restockDialog.itemId ? res.data : i));
                setNotification({ open: true, message: 'Stock updated successfully', severity: 'success' });
                setRestockDialog({ ...restockDialog, open: false });
            }
        } catch (error) {
            console.error('Failed to restock', error);
            setNotification({ open: true, message: 'Restock failed', severity: 'error' });
        }
    };

    const lowStockItems = inventory.filter(i => i.stock <= i.threshold);
    const atThresholdItems = inventory.filter(i => i.stock === i.threshold);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading && inventory.length === 0) return <Box p={4} display="flex" justifyContent="center" height="100vh" alignItems="center"><CircularProgress /></Box>;

    return (
        <RBACGuard permission="canManageInventory">
            <Box sx={{ minHeight: '100vh', bgcolor: pageBgColor, p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" color={textPrimary} letterSpacing="-0.5px">
                            Inventory
                        </Typography>
                        <Typography variant="body2" color={textSecondary} mt={1}>
                            Manage stock levels, suppliers, and restock alerts
                        </Typography>
                    </Box>
                    <Box>
                        <Tooltip title="Refresh Data">
                            <IconButton onClick={fetchInventory} sx={{ mr: 1, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5, vendorEmail: '' });
                                setOpenAdd(true);
                            }}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                bgcolor: isDark ? '#667eea' : '#111827',
                                '&:hover': {
                                    bgcolor: isDark ? '#7c8ef0' : '#000000',
                                }
                            }}
                        >
                            Add Item
                        </Button>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={3} mb={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="600" color={textSecondary} textTransform="uppercase">Total Items</Typography>
                            <Typography variant="h4" fontWeight="bold" color={textPrimary} mt={0.5}>{inventory.length}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', color: '#3b82f6' }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid currentColor' }} />
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="600" color={textSecondary} textTransform="uppercase">Low Stock</Typography>
                            <Typography variant="h4" fontWeight="bold" color={textPrimary} mt={0.5}>{lowStockItems.length}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', color: '#ef4444' }}>
                            <WarningIcon />
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="600" color={textSecondary} textTransform="uppercase">Restocks Needed</Typography>
                            <Typography variant="h4" fontWeight="bold" color={textPrimary} mt={0.5}>
                                {inventory.filter(i => i.stock === 0).length}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', color: '#f59e0b' }}>
                            <AddIcon />
                        </Box>
                    </Paper>
                </Box>

                {lowStockItems.length > 0 && (
                    <Alert
                        severity="warning"
                        sx={{
                            mb: 4,
                            borderRadius: '12px',
                            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca'}`,
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2',
                            color: isDark ? '#fca5a5' : '#991b1b',
                            '& .MuiAlert-icon': { color: isDark ? '#fca5a5' : '#991b1b' }
                        }}
                        icon={<WarningIcon />}
                    >
                        <strong>Attention Needed:</strong> {lowStockItems.length} item{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.
                        {atThresholdItems.length > 0 && (
                            <> {atThresholdItems.length} item{atThresholdItems.length > 1 ? 's have' : ' has'} reached the threshold.</>
                        )}
                    </Alert>
                )}

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '20px',
                        border: `1px solid ${borderColor}`,
                        bgcolor: cardBg,
                        overflow: 'hidden',
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Item Name</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Level</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Restocked</TableCell>
                                    <TableCell align="right" sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <Typography color={textSecondary}>No inventory items found.</Typography>
                                            <Button
                                                variant="text"
                                                startIcon={<AddIcon />}
                                                onClick={() => setOpenAdd(true)}
                                                sx={{ mt: 1 }}
                                            >
                                                Add your first item
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inventory.map((row) => {
                                        const isLowStock = row.stock <= row.threshold;
                                        const isAtThreshold = row.stock === row.threshold;

                                        return (
                                            <TableRow
                                                key={row._id}
                                                sx={{
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb'
                                                    }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: '600', color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        {row.name}
                                                        {isAtThreshold && (
                                                            <Chip
                                                                label="AT THRESHOLD"
                                                                size="small"
                                                                sx={{
                                                                    animation: `${pulse} 2s infinite`,
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.65rem',
                                                                    height: 20,
                                                                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                                                    color: '#ef4444'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                    <Chip
                                                        label={row.category}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                                            color: textSecondary,
                                                            fontWeight: 500,
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            height: 24
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ width: 250, borderBottom: `1px solid ${borderColor}` }}>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <Box flex={1}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(100, (row.stock / (Math.max(row.threshold * 3, row.stock, 10))) * 100)}
                                                                sx={{
                                                                    height: 6,
                                                                    borderRadius: 4,
                                                                    bgcolor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: isLowStock ? '#ef4444' : '#10b981',
                                                                        borderRadius: 4
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ minWidth: 30, fontWeight: '700', color: textPrimary }}>
                                                            {row.stock}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" color={textSecondary} sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                                        Threshold: {row.threshold}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                    {isAtThreshold ? (
                                                        <Chip
                                                            label="CRITICAL"
                                                            size="small"
                                                            sx={{
                                                                animation: `${pulse} 2s infinite`,
                                                                fontWeight: 'bold',
                                                                height: 22,
                                                                bgcolor: '#ef4444',
                                                                color: 'white',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    ) : isLowStock ? (
                                                        <Chip
                                                            label="Low Stock"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
                                                                color: '#f59e0b',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                                height: 22
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="In Stock"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
                                                                color: '#10b981',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                                height: 22
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>{row.unit}</TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                    {row.vendorEmail ? (
                                                        <Tooltip title={`Email: ${row.vendorEmail}`}>
                                                            <Typography variant="body2" sx={{ cursor: 'pointer', color: textPrimary, '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                                                                {row.vendorEmail.split('@')[0]}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="body2" color={textSecondary}>-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                    <Typography variant="body2" color={textSecondary}>
                                                        {formatDate(row.lastRestocked)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleRestockClick(row)}
                                                        variant="outlined"
                                                        sx={{
                                                            mr: 1,
                                                            borderRadius: '6px',
                                                            textTransform: 'none',
                                                            borderColor: borderColor,
                                                            color: textSecondary,
                                                            '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                                                        }}
                                                    >
                                                        Restock
                                                    </Button>
                                                    <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: textSecondary, '&:hover': { color: 'primary.main' } }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: textSecondary, '&:hover': { color: 'error.main' } }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Add/Edit Item Dialog */}
                <Dialog
                    open={openAdd || openEdit}
                    onClose={() => { setOpenAdd(false); setOpenEdit(false); }}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '24px',
                            bgcolor: cardBg,
                            backgroundImage: 'none',
                            boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                            p: 0,
                            overflow: 'visible'
                        }
                    }}
                >
                    <Box sx={{ p: 4, position: 'relative' }}>
                        <IconButton
                            onClick={() => { setOpenAdd(false); setOpenEdit(false); }}
                            sx={{ position: 'absolute', right: 16, top: 16, color: textSecondary }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography variant="h5" fontWeight={700} sx={{ mb: 4, color: textPrimary }}>
                            {openEdit ? 'Edit Item' : 'New Inventory Item'}
                        </Typography>

                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Item Name */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Item Name *
                                </Typography>
                                <Box
                                    component="input"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter item name"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: isDark ? '#ffffff' : '#000000',
                                            borderWidth: '1px'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Category */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Category
                                </Typography>
                                <Box
                                    component="input"
                                    value={formData.category}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Supplies, Equipment"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: isDark ? '#ffffff' : '#000000',
                                            borderWidth: '1px'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Stock & Unit Row */}
                            <Box display="flex" gap={2}>
                                <Box flex={1}>
                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                        Stock Level
                                    </Typography>
                                    <Box
                                        component="input"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                        sx={{
                                            width: '100%',
                                            p: 1.5,
                                            borderRadius: '12px',
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                            color: textPrimary,
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            outline: 'none',
                                            '&:focus': {
                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                borderWidth: '1px'
                                            }
                                        }}
                                    />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                        Unit
                                    </Typography>
                                    <Box
                                        component="input"
                                        value={formData.unit}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="e.g., Units"
                                        sx={{
                                            width: '100%',
                                            p: 1.5,
                                            borderRadius: '12px',
                                            border: `1px solid ${borderColor}`,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                            color: textPrimary,
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            outline: 'none',
                                            '&:focus': {
                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                borderWidth: '1px'
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Low Stock Threshold */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Low Stock Alert At
                                </Typography>
                                <Box
                                    component="input"
                                    type="number"
                                    value={formData.threshold}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: isDark ? '#ffffff' : '#000000',
                                            borderWidth: '1px'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Vendor Email */}
                            <Box>
                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                    Vendor Email (Optional)
                                </Typography>
                                <Box
                                    component="input"
                                    type="email"
                                    value={formData.vendorEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, vendorEmail: e.target.value })}
                                    placeholder="vendor@example.com"
                                    sx={{
                                        width: '100%',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                        color: textPrimary,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        '&:focus': {
                                            borderColor: isDark ? '#ffffff' : '#000000',
                                            borderWidth: '1px'
                                        }
                                    }}
                                />
                            </Box>

                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button
                                    onClick={() => { setOpenAdd(false); setOpenEdit(false); }}
                                    sx={{
                                        borderRadius: '12px',
                                        color: textSecondary,
                                        fontWeight: 600,
                                        textTransform: 'none'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={openEdit ? handleUpdateItem : handleAddItem}
                                    disabled={processing}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        boxShadow: 'none',
                                        bgcolor: isDark ? '#667eea' : '#111827',
                                        '&:hover': {
                                            bgcolor: isDark ? '#7c8ef0' : '#000000',
                                            boxShadow: isDark ? '0 10px 20px rgba(102, 126, 234, 0.2)' : '0 10px 20px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    {openEdit ? 'Update Item' : 'Add Item'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <ConfirmDeleteDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Inventory Item"
                    message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                />

                {/* Restock Dialog */}
                <Dialog
                    open={restockDialog.open}
                    onClose={() => setRestockDialog({ ...restockDialog, open: false })}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Restock {restockDialog.name}</DialogTitle>
                    <DialogContent>
                        <Box mt={1}>
                            <Typography variant="body2" color="textSecondary" mb={2}>
                                Current Stock: {restockDialog.currentStock}
                            </Typography>
                            <TextField
                                autoFocus
                                label="Quantity to Add"
                                type="number"
                                fullWidth
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRestockDialog({ ...restockDialog, open: false })}>Cancel</Button>
                        <Button variant="contained" onClick={submitRestock}>Add Stock</Button>
                    </DialogActions>
                </Dialog>

                {/* Notification Snackbar */}
                <NotificationSnackbar
                    open={notification.open}
                    onClose={() => setNotification({ ...notification, open: false })}
                    message={notification.message}
                    severity={notification.severity}
                />
            </Box>
        </RBACGuard>
    );
}

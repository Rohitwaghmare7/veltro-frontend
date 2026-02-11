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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import { useState, useEffect } from 'react';
import { inventoryService, InventoryItem } from '@/lib/services/inventory.service';
import RBACGuard from '@/components/dashboard/RBACGuard';

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
        if (!formData.name) return alert('Name is required');

        setProcessing(true);
        try {
            await inventoryService.addItem(formData);
            setOpenAdd(false);
            setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5, vendorEmail: '' });
            fetchInventory();
        } catch (error) {
            console.error('Failed to add item', error);
            alert('Failed to add item');
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
        } catch (error) {
            console.error('Failed to update item', error);
            alert('Failed to update item');
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await inventoryService.deleteItem(id);
            setInventory(inventory.filter(i => i._id !== id));
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const handleRestock = async (id: string) => {
        const qtyStr = prompt('Enter quantity to ADD:', '10');
        if (!qtyStr) return;
        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty)) return alert('Invalid number');

        try {
            const res = await inventoryService.restockItem(id, qty, 'add');
            if (res.success) {
                setInventory(inventory.map(i => i._id === id ? res.data : i));
            }
        } catch (error) {
            console.error('Failed to restock', error);
            alert('Restock failed');
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

    if (loading && inventory.length === 0) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <RBACGuard permission="canManageInventory">
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold">Inventory</Typography>
                    <Box>
                        <IconButton onClick={fetchInventory} sx={{ mr: 1 }}><RefreshIcon /></IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5, vendorEmail: '' });
                                setOpenAdd(true);
                            }}
                        >
                            Add Item
                        </Button>
                    </Box>
                </Box>

                {lowStockItems.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
                        <strong>Warning:</strong> {lowStockItems.length} item{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.
                        {atThresholdItems.length > 0 && (
                            <> {atThresholdItems.length} item{atThresholdItems.length > 1 ? 's have' : ' has'} reached the threshold.</>
                        )}
                    </Alert>
                )}

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Stock Level</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Vendor</TableCell>
                                <TableCell>Last Restocked</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No inventory items found.</TableCell>
                                </TableRow>
                            ) : (
                                inventory.map((row) => {
                                    const isLowStock = row.stock <= row.threshold;
                                    const isAtThreshold = row.stock === row.threshold;
                                    
                                    return (
                                        <TableRow
                                            key={row._id}
                                            sx={{
                                                bgcolor: isLowStock ? 'rgba(211, 47, 47, 0.04)' : 'inherit'
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {row.name}
                                                    {isAtThreshold && (
                                                        <Chip
                                                            label="AT THRESHOLD"
                                                            size="small"
                                                            color="error"
                                                            sx={{
                                                                animation: `${pulse} 2s infinite`,
                                                                fontWeight: 'bold',
                                                                fontSize: '0.65rem',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.category} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell sx={{ width: 250 }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min(100, (row.stock / (Math.max(row.threshold * 3, row.stock, 10))) * 100)}
                                                        color={isLowStock ? 'error' : 'success'}
                                                        sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                                                    />
                                                    <Typography variant="body2" sx={{ minWidth: 30, fontWeight: 'bold' }}>
                                                        {row.stock}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="textSecondary">
                                                    Threshold: {row.threshold}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {isAtThreshold ? (
                                                    <Chip
                                                        label="CRITICAL"
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            animation: `${pulse} 2s infinite`,
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                ) : isLowStock ? (
                                                    <Chip label="Low Stock" size="small" color="warning" />
                                                ) : (
                                                    <Chip label="In Stock" size="small" color="success" />
                                                )}
                                            </TableCell>
                                            <TableCell>{row.unit}</TableCell>
                                            <TableCell>
                                                {row.vendorEmail ? (
                                                    <Tooltip title={`Email: ${row.vendorEmail}`}>
                                                        <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                                                            {row.vendorEmail.split('@')[0]}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(row.lastRestocked)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button size="small" onClick={() => handleRestock(row._id)} variant="outlined">
                                                    Restock
                                                </Button>
                                                <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
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

                {/* Add/Edit Item Dialog */}
                <Dialog open={openAdd || openEdit} onClose={() => { setOpenAdd(false); setOpenEdit(false); }} maxWidth="sm" fullWidth>
                    <DialogTitle>{openEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Item Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <TextField
                                label="Category"
                                fullWidth
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g., Supplies, Equipment, Products"
                            />
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Stock Level"
                                    type="number"
                                    fullWidth
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                />
                                <TextField
                                    label="Unit"
                                    fullWidth
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="e.g., Bottles, Boxes, Units"
                                />
                            </Box>
                            <TextField
                                label="Low Stock Threshold"
                                type="number"
                                fullWidth
                                helperText="Alert fires when stock reaches this exact number"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                            />
                            <TextField
                                label="Vendor Email"
                                type="email"
                                fullWidth
                                value={formData.vendorEmail}
                                onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                                placeholder="vendor@example.com"
                                helperText="Optional: Email address of the supplier"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setOpenAdd(false); setOpenEdit(false); }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={openEdit ? handleUpdateItem : handleAddItem}
                            disabled={processing}
                        >
                            {openEdit ? 'Update Item' : 'Add Item'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

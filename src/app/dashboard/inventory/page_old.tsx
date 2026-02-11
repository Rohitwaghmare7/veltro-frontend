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
    MenuItem,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState, useEffect } from 'react';
import { inventoryService, InventoryItem } from '@/lib/services/inventory.service';

import RBACGuard from '@/components/dashboard/RBACGuard';

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
        threshold: 5
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
            setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5 });
            fetchInventory(); // Refresh list
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
            threshold: item.threshold
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
        // Simple prompt for now, could be a better UI
        const qtyStr = prompt('Enter quantity to ADD:', '10');
        if (!qtyStr) return;
        const qty = parseInt(qtyStr, 10);
        if (isNaN(qty)) return alert('Invalid number');

        try {
            const res = await inventoryService.restockItem(id, qty, 'add');
            if (res.success) {
                // Update local state without full refetch
                setInventory(inventory.map(i => i._id === id ? res.data : i));
            }
        } catch (error) {
            console.error('Failed to restock', error);
            alert('Restock failed');
        }
    };

    const lowStockItems = inventory.filter(i => i.stock <= i.threshold);

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
                                setFormData({ name: '', category: 'General', stock: 0, unit: 'Units', threshold: 5 });
                                setOpenAdd(true);
                            }}
                        >
                            Add Item
                        </Button>
                    </Box>
                </Box>

                {lowStockItems.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Warning: {lowStockItems.length} items are running low on stock.
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
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No inventory items found.</TableCell>
                                </TableRow>
                            ) : (
                                inventory.map((row) => (
                                    <TableRow
                                        key={row._id}
                                        sx={{
                                            bgcolor: row.stock <= row.threshold ? 'rgba(211, 47, 47, 0.04)' : 'inherit'
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                                        <TableCell>{row.category}</TableCell>
                                        <TableCell sx={{ width: 250 }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(100, (row.stock / (Math.max(row.threshold * 3, row.stock, 10))) * 100)}
                                                    color={row.stock <= row.threshold ? 'error' : 'success'}
                                                    sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                                                />
                                                <Typography variant="body2" sx={{ minWidth: 20 }}>{row.stock}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color={row.stock <= row.threshold ? 'error.main' : 'success.main'}
                                                fontWeight="bold"
                                            >
                                                {row.stock <= row.threshold ? 'Low Stock' : 'In Stock'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{row.unit}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" onClick={() => handleRestock(row._id)}>Restock</Button>
                                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Add/Edit Item Dialog */}
                <Dialog open={openAdd || openEdit} onClose={() => { setOpenAdd(false); setOpenEdit(false); }}>
                    <DialogTitle>{openEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1} minWidth={300}>
                            <TextField
                                label="Item Name"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                label="Category"
                                fullWidth
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                                    label="Unit (e.g., Bottles)"
                                    fullWidth
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </Box>
                            <TextField
                                label="Low Stock Threshold"
                                type="number"
                                fullWidth
                                helperText="Alert when stock falls below this number"
                                value={formData.threshold}
                                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
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

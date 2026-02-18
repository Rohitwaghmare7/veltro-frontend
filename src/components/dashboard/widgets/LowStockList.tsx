'use client';

import { Box, Paper, Typography, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface LowStockItem {
    _id: string;
    name: string;
    quantity: number;
    threshold: number;
    unit: string;
}

interface LowStockListProps {
    items: LowStockItem[];
}

export default function LowStockList({ items = [] }: LowStockListProps) {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            height: '100%',
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    Low Stock Items
                    {items.length > 0 && (
                        <Chip
                            label={items.length}
                            size="small"
                            color="error"
                            sx={{ height: 20, minWidth: 20, fontSize: '0.75rem', fontWeight: 700 }}
                        />
                    )}
                </Typography>
            </Box>

            {items.length === 0 ? (
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    opacity: 0.6,
                    py: 4
                }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} />
                    <Typography variant="body2">All items well stocked</Typography>
                </Box>
            ) : (
                <List disablePadding sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                    {items.map((item) => (
                        <ListItem
                            key={item._id}
                            disableGutters
                            sx={{
                                py: 1,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 'none' }
                            }}
                        >
                            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: item.quantity === 0 ? 'error.main' : 'warning.main'
                                }} />
                            </Box>
                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                secondary={`${item.quantity} / ${item.threshold} ${item.unit}`}
                                secondaryTypographyProps={{ variant: 'caption', sx: { color: '#9ca3af' } }}
                            />
                            <Chip
                                label={item.quantity === 0 ? 'Out of Stock' : 'Low'}
                                size="small"
                                sx={{
                                    height: 24,
                                    bgcolor: item.quantity === 0 ? 'error.main' : 'warning.main',
                                    color: '#fff',
                                    fontSize: '0.7rem'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
}

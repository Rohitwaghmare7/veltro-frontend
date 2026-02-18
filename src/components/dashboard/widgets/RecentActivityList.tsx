'use client';

import { Box, Paper, Typography, IconButton, Avatar, Chip, useTheme } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import EventIcon from '@mui/icons-material/Event';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    severity?: string;
    link?: string;
    date?: string;
}

interface RecentActivityListProps {
    title?: string;
    items: ActivityItem[];
}

const getIcon = (type: string) => {
    switch (type) {
        case 'message': return <MessageIcon fontSize="small" />;
        case 'booking': return <EventIcon fontSize="small" />;
        case 'inventory': return <InventoryIcon fontSize="small" />;
        case 'form': return <AssignmentIcon fontSize="small" />;
        default: return <WarningIcon fontSize="small" />;
    }
};

const getColor = (type: string, isDark: boolean) => {
    switch (type) {
        case 'message': return isDark ? 'rgba(255,255,255,0.9)' : '#3b82f6';
        case 'booking': return '#22c55e';
        case 'inventory': return '#f59e0b';
        case 'form': return '#8b5cf6';
        default: return '#ef4444';
    }
};

export default function RecentActivityList({ title = "Recent Updates", items = [] }: RecentActivityListProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    
    return (
        <Paper sx={{
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            height: '100%',
            overflowY: 'auto',
            maxHeight: 500
        }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: '2px solid', borderColor: '#ff6b6b', pb: 1, mb: -1.1 }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {items.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        No recent activity.
                    </Typography>
                ) : items.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Left: Icon & Text */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflow: 'hidden' }}>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    bgcolor: `${getColor(item.type, isDark)}20`, // 20% opacity
                                    color: getColor(item.type, isDark)
                                }}
                            >
                                {getIcon(item.type)}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Typography variant="body1" noWrap sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: '#9ca3af', display: 'block' }}>
                                    {item.description}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Right: Action/Link */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.link && (
                                <Chip
                                    label="View"
                                    size="small"
                                    component={Link}
                                    href={item.link}
                                    sx={{ cursor: 'pointer', bgcolor: 'rgba(255,107,107,0.1)', color: '#ff6b6b', fontWeight: 500 }}
                                />
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}

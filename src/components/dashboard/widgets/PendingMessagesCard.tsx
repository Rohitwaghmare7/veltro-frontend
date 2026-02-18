'use client';

import { Box, Paper, Typography, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PendingMessagesCardProps {
    title?: string;
    total?: string | number;
    data?: { name: string; value: number; color: string }[];
}

const defaultData = [
    { name: 'Female', value: 80, color: '#FF6B4A' }, // Red/Orange
    { name: 'Male', value: 20, color: '#FCD34D' },   // Yellow
    { name: 'Other', value: 10, color: '#1a1d29' },  // Dark Blue/Black
];

export default function PendingMessagesCard({
    title = "Pending Messages",
    total = "20.k",
    data = defaultData
}: PendingMessagesCardProps) {
    return (
        <Paper sx={{
            height: '100%',
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header Section */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '1rem', color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#000000' }}>
                        {title}
                    </Typography>
                    <IconButton size="small">

                    </IconButton>
                </Box>
            </Box>

            {/* Chart and Legend Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
                {/* Chart */}
                <Box sx={{ width: 140, height: 140, position: 'relative', flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={4}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Element */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: data[0]?.color || '#FF6B4A'
                    }}>
                        <Box sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'currentColor',
                            borderRadius: '4px',
                            transform: 'rotate(45deg)'
                        }} />
                    </Box>
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {data.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.9rem' }}>
                                    {entry.name}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {entry.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

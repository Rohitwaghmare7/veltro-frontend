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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    {title}
                </Typography>
                <IconButton size="small">

                </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                        {total}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {data.map((entry, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: entry.color }} />
                                <Typography variant="caption" color="text.secondary">
                                    {entry.name} <b>{entry.value}</b>
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ width: 120, height: 120, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={40}
                                outerRadius={55}
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
            </Box>
        </Paper>
    );
}

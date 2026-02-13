'use client';

import { Box, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface GroupedBarChartProps {
    title?: string;
    data?: any[];
}

// Default to "Bookings Breakdown"
const defaultData = [
    { name: 'Today', value: 5, fill: '#8b5cf6' },
    { name: 'Upcoming', value: 12, fill: '#3b82f6' },
    { name: 'Completed', value: 25, fill: '#10b981' },
    { name: 'No Show', value: 3, fill: '#ef4444' },
];

export default function GroupedBarChart({ title = "Bookings Breakdown", data = defaultData }: GroupedBarChartProps) {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                            {
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || '#8884d8'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}

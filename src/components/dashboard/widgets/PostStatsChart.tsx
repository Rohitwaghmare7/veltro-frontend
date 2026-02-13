'use client';

import { Box, Paper, Typography, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts';

const data = [
    { day: 'M', value: 30 },
    { day: 'T', value: 45 },
    { day: 'W', value: 35 },
    { day: 'T', value: 80, active: true }, // The highlighted bar
    { day: 'F', value: 50 },
    { day: 'S', value: 40 },
    { day: 'S', value: 60 },
];

export default function PostStatsChart() {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Post Stats
                </Typography>
                <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, minHeight: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={12}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#aaa', fontSize: 12 }}
                            dy={10}
                        />
                        <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.active ? '#FF6B4A' : '#E5E7EB'} // Orange for active, Gray for others
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}

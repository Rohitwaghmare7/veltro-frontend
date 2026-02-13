'use client';

import { Box, Paper, Typography, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface WaveStatCardProps {
    title: string;
    value: string | number;
    data?: any[];
    color?: string;
    bgColor?: string;
}

const defaultData = [
    { value: 400 }, { value: 300 }, { value: 500 }, { value: 200 }, { value: 600 }, { value: 400 }, { value: 700 }
];

export default function WaveStatCard({
    title = "Total Patients",
    value = "3,256",
    data = defaultData,
    color = "#fff",
    bgColor = "#7c3aed", // Violet/Purple
    textColor = "#fff"
}: WaveStatCardProps & { textColor?: string }) {
    return (
        <Paper sx={{
            height: '100%',
            p: 3,
            borderRadius: '24px',
            bgcolor: bgColor,
            color: textColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.5rem', mb: 0.5 }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                        {title}
                    </Typography>
                </Box>

            </Box>

            <Box sx={{ height: 100, width: '120%', position: 'absolute', bottom: 0, left: -20, zIndex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip content={<></>} cursor={false} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fill={`url(#colorValue-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}

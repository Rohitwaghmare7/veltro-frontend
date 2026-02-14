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
    textColor?: string;
}

const defaultData = [
    { value: 20 }, { value: 15 }, { value: 25 }, { value: 18 }, { value: 30 }, { value: 22 }, { value: 28 }
];

export default function WaveStatCard({
    title = "Total Patients",
    value = "3,256",
    data,
    color = "#fff",
    bgColor = "#7c3aed",
    textColor = "#fff"
}: WaveStatCardProps) {
    // Generate realistic wave data based on the actual value if no data provided
    const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/,/g, '')) || 0;
    
    const waveData = data || Array.from({ length: 7 }, (_, i) => {
        // Generate values that fluctuate around the actual value
        const variance = numericValue * 0.3; // 30% variance
        const randomValue = numericValue + (Math.random() - 0.5) * variance;
        return { value: Math.max(0, Math.round(randomValue)) };
    });

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
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.5rem', mb: 0.5, color: textColor }}>
                        {value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem', color: textColor }}>
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ height: 100, width: '120%', position: 'absolute', bottom: 0, left: -20, zIndex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waveData}>
                        <defs>
                            <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            cursor={{ stroke: color, strokeWidth: 2 }}
                            contentStyle={{
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                color: '#fff',
                                fontSize: '0.75rem'
                            }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number | undefined) => [value || 0, '']}
                        />
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

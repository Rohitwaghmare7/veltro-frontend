'use client';

import { Box, Paper, Typography, useTheme } from '@mui/material';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';

interface MonthlyTrendCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    data?: Array<{ value: number; label?: string }>;
    color?: string;
    link?: string;
}

const defaultData = [
    { value: 400, label: '14' },
    { value: 300, label: '15' },
    { value: 500, label: '16' },
    { value: 200, label: '17' },
    { value: 600, label: '18' },
    { value: 400, label: '19' }
];

export default function MonthlyTrendCard({
    title = "Patients this month",
    value = "3,240",
    subtitle,
    data = defaultData,
    color = "#a78bfa",
    link
}: MonthlyTrendCardProps) {
    const theme = useTheme();

    const Component = link ? Link : Box;
    const componentProps = link ? { href: link } : {};

    return (
        <Paper
            component={Component}
            {...componentProps}
            sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: color,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                minHeight: 280,
                boxShadow: `0 10px 30px ${color}4D`,
                cursor: link ? 'pointer' : 'default',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': link ? {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 15px 40px ${color}66`
                } : {}
            }}
        >
            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" sx={{ 
                    fontWeight: 700, 
                    fontSize: '3rem',
                    mb: 1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    {value}
                </Typography>
                <Typography variant="body1" sx={{ 
                    opacity: 0.9, 
                    fontSize: '1.1rem',
                    fontWeight: 500
                }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ 
                        opacity: 0.7, 
                        fontSize: '0.85rem',
                        display: 'block',
                        mt: 0.5
                    }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {/* Wave Chart Background */}
            <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '60%',
                zIndex: 1
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <Box sx={{
                                            bgcolor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            p: 1,
                                            borderRadius: 1,
                                            fontSize: '0.85rem'
                                        }}>
                                            <Typography variant="caption">
                                                {payload[0].payload.label}: {payload[0].value}
                                            </Typography>
                                        </Box>
                                    );
                                }
                                return null;
                            }}
                            cursor={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={3}
                            fill={`url(#gradient-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            {/* Day Labels */}
            <Box sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: 24, 
                right: 24,
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 2
            }}>
                {data.map((item, index) => (
                    <Typography 
                        key={index} 
                        variant="caption" 
                        sx={{ 
                            opacity: 0.6, 
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}
                    >
                        {item.label}
                    </Typography>
                ))}
            </Box>

            {/* Current Value Indicator */}
            {data.length > 0 && (
                <Box sx={{
                    position: 'absolute',
                    right: 80,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    px: 2,
                    py: 1,
                    zIndex: 2
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                        {data[data.length - 1].value}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

'use client';

import { Box, Paper, Typography, IconButton, useTheme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Link from 'next/link';

interface StatItem {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: number; // Percentage change
    color: string;
    link?: string;
}

interface QuickStatsRowProps {
    stats: StatItem[];
}

export default function QuickStatsRow({ stats }: QuickStatsRowProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((stat, index) => (
                <Paper
                    key={index}
                    component={stat.link ? Link : 'div'}
                    href={stat.link || ''}
                    sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                        boxShadow: theme.palette.mode === 'dark' ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: stat.link ? 'pointer' : 'default',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        '&:hover': stat.link ? {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)'
                        } : {}
                    }}
                >
                    {/* Icon */}
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                        flexShrink: 0
                    }}>
                        {stat.icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ 
                            color: 'text.secondary', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5
                        }}>
                            {stat.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                                {stat.value}
                            </Typography>
                            {stat.trend !== undefined && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    {stat.trend >= 0 ? (
                                        <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                                    ) : (
                                        <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                                    )}
                                    <Typography variant="caption" sx={{ 
                                        color: stat.trend >= 0 ? '#22c55e' : '#ef4444',
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                    }}>
                                        {Math.abs(stat.trend)}%
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* More Button */}
                    <IconButton size="small" sx={{ opacity: 0.5 }}>
                        <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Paper>
            ))}
        </Box>
    );
}

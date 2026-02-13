'use client';

import { Box, Paper, Typography, IconButton, MenuItem, Select, useTheme } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useState } from 'react';

interface WeeklyActivityChartProps {
    title?: string;
    metric?: string;
    value?: string | number;
    dateRange?: string;
    data?: Array<{
        day: string;
        value: number;
        highlight?: boolean;
    }>;
    color?: string;
    icon?: React.ReactNode;
}

const defaultData = [
    { day: 'Mon', value: 150, highlight: false },
    { day: 'Tue', value: 120, highlight: false },
    { day: 'Wed', value: 90, highlight: false },
    { day: 'Thu', value: 180, highlight: true },
    { day: 'Fri', value: 70, highlight: false },
    { day: 'Sat', value: 200, highlight: false },
    { day: 'Sun', value: 140, highlight: false }
];

export default function WeeklyActivityChart({
    title = "Heart rate",
    metric = "BPM",
    value = "88",
    dateRange = "12 - 19 Jul 2023",
    data = defaultData,
    color = "#ff6b6b",
    icon = <FavoriteIcon sx={{ fontSize: 20 }} />
}: WeeklyActivityChartProps) {
    const theme = useTheme();
    const [period, setPeriod] = useState('Weekly');

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <Paper sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {title}
                        </Typography>
                        <Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            size="small"
                            variant="standard"
                            disableUnderline
                            sx={{
                                fontSize: '0.85rem',
                                color: 'text.secondary',
                                '& .MuiSelect-icon': {
                                    fontSize: 16
                                }
                            }}
                        >
                            <MenuItem value="Daily">Daily</MenuItem>
                            <MenuItem value="Weekly">Weekly</MenuItem>
                            <MenuItem value="Monthly">Monthly</MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                            {value}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {metric}
                        </Typography>
                        <Box sx={{ color: color }}>
                            {icon}
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {dateRange}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                            }
                        }}
                    >
                        <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Chart */}
            <Box sx={{ height: 200, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={32}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                        <YAxis
                            hide
                            domain={[0, maxValue + 50]}
                        />
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                backgroundColor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[16, 16, 16, 16]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.highlight ? color : `${color}40`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Max Value Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {maxValue}+
                </Typography>
            </Box>
        </Paper>
    );
}

'use client';

import { Box, Paper, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useState, useMemo, useEffect, ReactNode } from 'react';
import { useBookingsStore } from '@/store/bookingsStore';
import { Booking } from '@/lib/services/booking.service';

interface WeeklyActivityChartProps {
    title?: string;
    metric?: string;
    color?: string;
    icon?: ReactNode;
}

type PeriodType = 'Day' | 'Week' | 'Month';

export default function WeeklyActivityChart({
    title = "Booking Activity",
    metric = "Bookings",
    color = "#667eea",
    icon = <FavoriteIcon sx={{ fontSize: 20 }} />
}: WeeklyActivityChartProps) {
    const theme = useTheme();
    const period: PeriodType = 'Week'; // Fixed to weekly view
    const [mounted, setMounted] = useState(false);

    // Get bookings from Zustand store
    const { bookings, fetchBookings } = useBookingsStore();

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch bookings on mount
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Calculate chart data based on selected period
    const chartData = useMemo(() => {
        if (!mounted) return [];

        const now = new Date();

        if (period === 'Day') {
            // Show last 24 hours by hour
            const data = [];
            for (let i = 23; i >= 0; i--) {
                const hour = new Date(now);
                hour.setHours(now.getHours() - i, 0, 0, 0);

                const count = bookings.filter((b: Booking) => {
                    if (!b.date) return false;
                    const bookingDate = new Date(b.date);
                    if (isNaN(bookingDate.getTime())) return false;

                    return bookingDate.toISOString().split('T')[0] === hour.toISOString().split('T')[0] &&
                        bookingDate.getHours() === hour.getHours();
                }).length;

                data.push({
                    day: `${hour.getHours()}:00`,
                    value: count,
                    highlight: i === 0 // Highlight current hour
                });
            }
            return data.filter((_, i) => i % 4 === 0); // Show every 4 hours for readability
        } else if (period === 'Week') {
            // Show last 7 days
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                date.setHours(0, 0, 0, 0);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                const count = bookings.filter((b: Booking) => {
                    if (!b.date) return false;
                    const bookingDate = new Date(b.date);
                    if (isNaN(bookingDate.getTime())) return false;

                    return bookingDate.toISOString().split('T')[0] === dateStr;
                }).length;

                data.push({
                    day: dayName,
                    value: count,
                    highlight: i === 0 // Highlight today
                });
            }
            return data;
        } else {
            // Show last 30 days grouped by week
            const data = [];
            for (let i = 4; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (i * 7) - 6);
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const count = bookings.filter((b: Booking) => {
                    if (!b.date) return false;
                    const bookingDate = new Date(b.date);
                    if (isNaN(bookingDate.getTime())) return false;

                    return bookingDate >= weekStart && bookingDate <= weekEnd;
                }).length;

                const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;

                data.push({
                    day: label,
                    value: count,
                    highlight: i === 0 // Highlight current week
                });
            }
            return data;
        }
    }, [bookings, period, mounted]);

    // Calculate date range
    const dateRange = useMemo(() => {
        if (!mounted) return '';

        const now = new Date();

        if (period === 'Day') {
            return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (period === 'Week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 6);
            return `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            const monthAgo = new Date(now);
            monthAgo.setDate(now.getDate() - 30);
            return `${monthAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
    }, [period, mounted]);

    // Calculate total value for the period
    const totalValue = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    // Calculate max value for dynamic scaling
    const maxValue = useMemo(() => {
        const max = Math.max(...chartData.map(d => d.value));
        return max > 0 ? max : 10; // Minimum of 10 for better visualization
    }, [chartData]);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <Paper sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Simple skeleton or loader could go here */}
            </Paper>
        );
    }

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
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {title}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                            {totalValue}
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
            </Box>

            {/* Chart */}
            <Box sx={{ height: 200, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={32}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                        <YAxis
                            hide
                            domain={[0, maxValue * 1.2]} // Add 20% padding at top
                        />
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                backgroundColor: theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}
                            formatter={(value: number | undefined) => [`${value ?? 0} bookings`, '']}
                        />
                        <Bar
                            dataKey="value"
                            radius={[16, 16, 16, 16]}
                        >
                            {chartData.map((entry, index) => {
                                // Highlight the bar with the highest value in orange
                                const isHighest = entry.value === maxValue && entry.value > 0;
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isHighest ? '#FF6B4A' : (entry.highlight ? color : `${color}60`)}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            {/* Max Value Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    Peak: {maxValue}
                </Typography>
            </Box>
        </Paper>
    );
}

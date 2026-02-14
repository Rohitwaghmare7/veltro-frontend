'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, CircularProgress, Typography, useTheme } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import api from '@/lib/api';
import RBACGuard from '@/components/dashboard/RBACGuard';
import { dashboardService } from '@/lib/services/dashboard.service';
import { useDashboardStore } from '@/store/dashboardStore';
import { useLeadsStore } from '@/store/leadsStore';

// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TotalLikesCard from '@/components/dashboard/widgets/TotalLikesCard';
import PendingMessagesCard from '@/components/dashboard/widgets/PendingMessagesCard';
import RecentActivityList from '@/components/dashboard/widgets/RecentActivityList';
import WaveStatCard from '@/components/dashboard/widgets/WaveStatCard';
import LowStockList from '@/components/dashboard/widgets/LowStockList';
import CompactCalendar from '@/components/dashboard/widgets/CompactCalendar';
import QuickStatsRow from '@/components/dashboard/widgets/QuickStatsRow';
import WeeklyActivityChart from '@/components/dashboard/widgets/WeeklyActivityChart';

export default function DashboardPage() {
    const router = useRouter();
    const theme = useTheme();

    // Zustand stores
    const {
        stats,
        alerts,
        loading,
        setStats,
        setAlerts,
        setLoading,
        setError
    } = useDashboardStore();

    const { leads, fetchLeads } = useLeadsStore();

    // State for weekly activity data (not used anymore, can be removed)
    // const [weeklyActivity, setWeeklyActivity] = useState<any>(null);

    useEffect(() => {
        const initDashboard = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 1. Auth Check
                const authRes = await api.get('/auth/me');
                if (authRes.data.data) {
                    localStorage.setItem('user', JSON.stringify(authRes.data.data.user));
                    if (!authRes.data.data.user.isOnboarded) {
                        router.push('/onboarding');
                        return;
                    }
                }

                // 2. Fetch Dashboard Data
                const [statsRes, alertsRes] = await Promise.all([
                    dashboardService.getOverview(),
                    dashboardService.getAlerts()
                ]);

                if (statsRes.success) setStats(statsRes.data);
                if (alertsRes.success) setAlerts(alertsRes.data);

                // 3. Fetch Leads Data
                await fetchLeads();

                setLoading(false);
            } catch (error) {
                console.error('Dashboard initialization failed', error);
                // Fallback or redirect could happen here, but allowing page to load with empty data for now
                setLoading(false);
            }
        };

        initDashboard();
    }, [router]);

    // Transform alerts to ActivityItem format
    const activityItems = useMemo(() => {
        return (alerts || []).map((alert: any) => ({
            id: alert._id || alert.id || String(Math.random()),
            type: alert.type || 'default',
            title: alert.title || alert.message || 'Alert',
            description: alert.description || alert.message || '',
            severity: alert.severity,
            link: alert.link,
            date: alert.date || alert.createdAt
        }));
    }, [alerts]);

    // Transform low stock items to match LowStockItem interface
    const lowStockItems = useMemo(() => {
        console.log('📦 Low Stock Data from API:', stats?.inventory?.lowStock);
        return (stats?.inventory?.lowStock || []).map((item: any) => ({
            _id: item._id,
            name: item.name,
            quantity: item.quantity || 0,
            threshold: item.threshold || 0,
            unit: item.unit || 'units'
        }));
    }, [stats?.inventory?.lowStock]);

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" gap={2}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#FF6B4A' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading Dashboard...</Typography>
            </Box>
        );
    }

    const pageBgColor = theme.palette.mode === 'light' ? '#F2F1EB' : '#0f1117';

    // Calculate leads stats from leads data
    const leadsStats = useMemo(() => {
        const total = leads.length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const contacted = leads.filter(l => l.status === 'contacted').length;
        const qualified = leads.filter(l => l.status === 'qualified').length;
        const closed = leads.filter(l => l.status === 'closed').length;
        
        return { total, new: newLeads, contacted, qualified, closed };
    }, [leads]);

    // Prepare quick stats data
    const quickStats = [
        {
            icon: <HotelIcon sx={{ fontSize: 24 }} />,
            label: 'Total Bookings',
            value: (stats?.bookings?.today || 0) + (stats?.bookings?.upcoming || 0),
            trend: 12,
            color: '#667eea',
            link: '/dashboard/bookings'
        },
        {
            icon: <PeopleIcon sx={{ fontSize: 24 }} />,
            label: 'Total Leads',
            value: leadsStats.total,
            trend: stats?.leads?.new24h || 0,
            color: '#22c55e',
            link: '/dashboard/leads'
        },
        {
            icon: <AttachMoneyIcon sx={{ fontSize: 24 }} />,
            label: 'Revenue',
            value: '$2,536',
            trend: -3,
            color: '#f59e0b',
            link: '/dashboard/bookings'
        },
        {
            icon: <LocalHospitalIcon sx={{ fontSize: 24 }} />,
            label: 'Services',
            value: stats?.services?.count?.toString() || '0',
            color: '#ef4444',
            link: '/dashboard/settings'
        }
    ];

    return (
        <RBACGuard>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: pageBgColor,
                p: { xs: 2, sm: 3 },
                transition: 'background-color 0.3s ease'
            }}>
                <DashboardHeader />

                {/* Quick Stats Row */}
                <Box mb={3}>
                    <QuickStatsRow stats={quickStats} />
                </Box>

                {/* ROW 1: Orange Breakdown Card + Donut */}
                <Grid container spacing={2} mb={2}>
                    {/* Bookings Breakdown (Orange Card) */}
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <TotalLikesCard
                            title="Total Bookings"
                            total={(stats?.bookings?.today || 0) + (stats?.bookings?.upcoming || 0)}
                            color="#FF6B4A"
                            breakdown={[
                                { label: 'Today', value: stats?.bookings?.today || 0, color: '#FCD34D' },
                                { label: 'Upcoming', value: stats?.bookings?.upcoming || 0, color: '#FFB84D' },
                                { label: 'Completed', value: stats?.bookings?.completed || 0, color: '#FF8A4D' }
                            ]}
                        />
                    </Grid>

                    {/* Leads Overview (Donut) */}
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <PendingMessagesCard
                            title="Leads Overview"
                            total={leadsStats.total}
                            data={[
                                { name: 'New', value: leadsStats.new, color: '#3b82f6' },
                                { name: 'Contacted', value: leadsStats.contacted, color: '#f59e0b' },
                                { name: 'Qualified', value: leadsStats.qualified, color: '#10b981' },
                                { name: 'Closed', value: leadsStats.closed, color: '#6b7280' }
                            ]}
                        />
                    </Grid>
                </Grid>

                {/* ROW 2: Calendar & Wave Stat */}
                <Grid container spacing={2} mb={2}>
                    {/* Compact Calendar */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <CompactCalendar />
                    </Grid>

                    {/* Wave Chart */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <WaveStatCard
                            title="Total Interactions"
                            value={stats?.leads?.openConversations || 0}
                            color="#7c3aed"
                            bgColor="#7c3aed"
                        />
                    </Grid>
                </Grid>

                {/* ROW 3: Weekly Activity Chart */}
                <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12 }}>
                        <WeeklyActivityChart />
                    </Grid>
                </Grid>

                {/* ROW 4: Activity & Details */}
                <Grid container spacing={2}>
                    {/* Recent Alerts List */}
                    <Grid size={{ xs: 12, lg: 7 }}>
                        <RecentActivityList items={activityItems} title="Recent Alerts" />
                    </Grid>

                    {/* Low Stock Items List */}
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <LowStockList items={lowStockItems} />
                    </Grid>
                </Grid>
            </Box>
        </RBACGuard>
    );
}
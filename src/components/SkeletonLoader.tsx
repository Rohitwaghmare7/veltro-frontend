'use client';

import { Box, Card, Skeleton, Stack } from '@mui/material';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
                {/* Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="rectangular" width={40} height={40} />
                    <Skeleton variant="text" width="30%" height={40} />
                    <Box sx={{ flexGrow: 1 }} />
                    <Skeleton variant="rectangular" width={120} height={40} />
                </Box>
                
                {/* Rows */}
                {Array.from({ length: rows }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" width="25%" />
                        <Skeleton variant="text" width="20%" />
                        <Skeleton variant="text" width="15%" />
                        <Box sx={{ flexGrow: 1 }} />
                        <Skeleton variant="rectangular" width={80} height={32} />
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}

export function CardSkeleton() {
    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" height={120} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Skeleton variant="rectangular" width={100} height={36} />
                    <Skeleton variant="rectangular" width={100} height={36} />
                </Box>
            </Stack>
        </Card>
    );
}

export function StatCardSkeleton() {
    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={48} />
                <Skeleton variant="text" width="50%" height={20} />
            </Stack>
        </Card>
    );
}

export function FormSkeleton() {
    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
                <Skeleton variant="text" width="30%" height={32} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={120} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width={120} height={40} />
                    <Skeleton variant="rectangular" width={120} height={40} />
                </Box>
            </Stack>
        </Card>
    );
}

export function CalendarSkeleton() {
    return (
        <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton variant="text" width="30%" height={40} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={40} height={40} />
                        <Skeleton variant="rectangular" width={40} height={40} />
                    </Box>
                </Box>
                
                {/* Calendar Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {Array.from({ length: 35 }).map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={80} />
                    ))}
                </Box>
            </Stack>
        </Card>
    );
}

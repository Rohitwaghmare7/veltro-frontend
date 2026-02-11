'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { staffService, StaffPermissions } from '@/lib/services/staff.service';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';

interface RBACGuardProps {
    children: ReactNode;
    permission?: keyof StaffPermissions | (keyof StaffPermissions)[];
    requireOwner?: boolean;
}

export default function RBACGuard({ children, permission, requireOwner = false }: RBACGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    router.push('/login');
                    return;
                }

                const user = JSON.parse(userData);

                // Check staff permissions / profile
                try {
                    const res = await staffService.getMe();
                    if (!res.success || !res.data) {
                        setError(res.message || 'Failed to verify permissions.');
                        setAuthorized(false);
                        return;
                    }

                    const profile = res.data;
                    const staffPermissions = profile.permissions;

                    // 1. Check if owner-only page
                    if (requireOwner && profile.role !== 'owner') {
                        setError('This page is restricted to business owners only.');
                        setAuthorized(false);
                        return;
                    }

                    // 2. Owners have full access to everything in their business context (already handled by backend returning all perms, but owner check is still useful for requireOwner)
                    if (profile.role === 'owner') {
                        setAuthorized(true);
                        return;
                    }

                    // 3. Check staff permissions
                    if (permission) {
                        const permsToCheck = Array.isArray(permission) ? permission : [permission];
                        const hasAccess = permsToCheck.some(p => staffPermissions[p] === true);

                        if (!hasAccess) {
                            setError(`Forbidden — Missing permissions: ${permsToCheck.join(', ')}`);
                            setAuthorized(false);
                            return;
                        }
                    }

                    setAuthorized(true);
                } catch (staffErr: any) {
                    const errorMsg = staffErr.response?.data?.message || staffErr.message || 'Failed to verify permissions.';
                    setError(errorMsg);
                    setAuthorized(false);
                }
            } catch (err: any) {
                console.error('RBAC Check failed', err);
                setError(err.response?.data?.message || 'An error occurred while verifying access.');
                setAuthorized(false);
            }
        };

        checkAccess();
    }, [permission, requireOwner, router]);

    if (authorized === null) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!authorized) {
        // We could redirect immediately, but showing an alert first is nicer
        // For now, let's redirect after a short delay or just show error
        setTimeout(() => router.push('/dashboard'), 3000);
        return (
            <Box p={4}>
                <Alert severity="error">
                    {error || 'Access Denied'}
                </Alert>
                <Typography variant="body2" color="textSecondary" mt={2}>
                    Redirecting you to the dashboard...
                </Typography>
            </Box>
        );
    }

    return <>{children}</>;
}

import { Typography } from '@mui/material';

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Container
} from '@mui/material';
import { staffService } from '@/lib/services/staff.service';
import Link from 'next/link';

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;

        const handleAccept = async () => {
            try {
                const res = await staffService.acceptInvite(token);
                if (res.success) {
                    setSuccess(true);
                } else {
                    setError(res.message || 'Failed to accept invitation');
                }
            } catch (err: any) {
                console.error('Error accepting invite', err);
                if (err.response?.status === 401) {
                    // User not logged in, redirect to register with return URL
                    router.push(`/register?returnUrl=/invite/${token}`);
                    return; // Don't setLoading(false) here to avoid flashing error state
                } else {
                    setError(err.response?.data?.message || 'Something went wrong. The link might be invalid or already used.');
                }
            } finally {
                // If we didn't redirect (no return early), set loading to false
                setLoading(false);
            }
        };

        handleAccept();
    }, [token, router]);

    return (
        <Container maxWidth="sm">
            <Box py={10} textAlign="center">
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Team Invitation
                    </Typography>

                    {loading ? (
                        <Box py={4}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>Processing your invitation...</Typography>
                        </Box>
                    ) : success ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Invitation accepted successfully! You are now part of the team.
                            </Alert>
                            <Typography mb={4}>
                                You can now access the dashboard and manage features based on your permissions.
                            </Typography>
                            <Button
                                variant="contained"
                                component={Link}
                                href="/dashboard"
                                fullWidth
                                size="large"
                            >
                                Go to Dashboard
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                            <Typography mb={4}>
                                Please contact the business owner if you believe this is an error.
                            </Typography>
                            <Button variant="outlined" component={Link} href="/" fullWidth>
                                Back to Home
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

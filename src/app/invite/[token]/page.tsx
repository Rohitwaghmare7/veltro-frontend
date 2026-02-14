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
                    if (res.userExists) {
                        // User already exists - just show success message
                        setSuccess(true);
                    } else {
                        // User doesn't exist - redirect to register with invite token
                        window.location.href = `/register?inviteToken=${token}`;
                    }
                } else {
                    setError(res.message || 'Failed to accept invitation');
                }
            } catch (err: any) {
                console.error('Error accepting invite', err);
                setError(err.response?.data?.message || 'Something went wrong. The link might be invalid or already used.');
            } finally {
                setLoading(false);
            }
        };

        handleAccept();
    }, [token]);

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
                            <Typography>
                                You can now access the team dashboard and collaborate with your team members.
                            </Typography>
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

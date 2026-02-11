'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import api from '@/lib/api';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing integration...');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            console.log('Callback params:', { code: code?.substring(0, 20), state, error });

            if (error) {
                setStatus('error');
                setMessage(`Authorization failed: ${error}`);
                setTimeout(() => router.push('/dashboard/integrations'), 3000);
                return;
            }

            if (!code) {
                setStatus('error');
                setMessage('Missing authorization code');
                setTimeout(() => router.push('/dashboard/integrations'), 3000);
                return;
            }

            try {
                // Call backend with just the code - backend will get businessId from authenticated user
                await api.get(`/integrations/google-calendar/callback?code=${encodeURIComponent(code)}`);
                setStatus('success');
                setMessage('Google Calendar connected successfully!');
                setTimeout(() => router.push('/dashboard/integrations'), 2000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to connect Google Calendar');
                setTimeout(() => router.push('/dashboard/integrations'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={3}
        >
            {status === 'loading' && (
                <>
                    <CircularProgress size={60} />
                    <Typography variant="h6">{message}</Typography>
                </>
            )}

            {status === 'success' && (
                <Alert severity="success" sx={{ fontSize: '1.1rem' }}>
                    {message}
                </Alert>
            )}

            {status === 'error' && (
                <Alert severity="error" sx={{ fontSize: '1.1rem' }}>
                    {message}
                </Alert>
            )}

            <Typography variant="body2" color="textSecondary">
                Redirecting to integrations page...
            </Typography>
        </Box>
    );
}

export default function IntegrationCallbackPage() {
    return (
        <Suspense fallback={
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                gap={3}
            >
                <CircularProgress size={60} />
                <Typography variant="h6">Loading...</Typography>
            </Box>
        }>
            <CallbackContent />
        </Suspense>
    );
}

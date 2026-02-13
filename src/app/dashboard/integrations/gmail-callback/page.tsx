'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import api from '@/lib/api';

export default function GmailCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            // Parse state to get return location
            let returnTo = 'dashboard';
            try {
                if (state) {
                    const stateData = JSON.parse(state);
                    returnTo = stateData.return || 'dashboard';
                }
            } catch (e) {
                console.log('Could not parse state, defaulting to dashboard');
            }

            if (!code) {
                setError('Authorization code not received');
                return;
            }

            try {
                // Send code to backend
                await api.get(`/integrations/gmail/callback?code=${code}&state=${state}`);

                // Redirect based on where user came from
                if (returnTo === 'onboarding') {
                    router.push('/onboarding?gmail=connected');
                } else {
                    router.push('/dashboard/integrations?gmail=connected');
                }
            } catch (err: any) {
                console.error('Gmail callback error:', err);
                const errorMessage = err.response?.data?.message || 'Failed to connect Gmail';
                setError(errorMessage);

                // Redirect with error after 3 seconds
                setTimeout(() => {
                    if (returnTo === 'onboarding') {
                        router.push('/onboarding?gmail=error');
                    } else {
                        router.push('/dashboard/integrations?gmail=error');
                    }
                }, 3000);
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
            {error ? (
                <>
                    <Alert severity="error" sx={{ maxWidth: 500 }}>
                        {error}
                    </Alert>
                    <Typography variant="body2" color="textSecondary">
                        Redirecting back...
                    </Typography>
                </>
            ) : (
                <>
                    <CircularProgress size={60} />
                    <Typography variant="h6">Connecting Gmail...</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Please wait while we complete the connection
                    </Typography>
                </>
            )}
        </Box>
    );
}

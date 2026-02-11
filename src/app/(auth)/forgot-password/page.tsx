'use client';

import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Container } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container maxWidth="sm">
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100vh"
                >
                    <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'success.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}
                        >
                            <EmailIcon sx={{ fontSize: 40, color: 'success.main' }} />
                        </Box>

                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Check Your Email
                        </Typography>

                        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                            If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                        </Typography>

                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            The link will expire in 1 hour for security reasons.
                        </Typography>

                        <Button
                            variant="outlined"
                            fullWidth
                            component={Link}
                            href="/login"
                            startIcon={<ArrowBackIcon />}
                        >
                            Back to Login
                        </Button>
                    </Paper>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Forgot Password?
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Enter your email address and we'll send you a link to reset your password.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            sx={{ mb: 3 }}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || !email}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <Button
                            variant="text"
                            fullWidth
                            component={Link}
                            href="/login"
                            startIcon={<ArrowBackIcon />}
                            disabled={loading}
                        >
                            Back to Login
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

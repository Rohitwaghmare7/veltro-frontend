'use client';

import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Container, InputAdornment, IconButton } from '@mui/material';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params?.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/auth/reset-password/${token}`, { password });
            
            if (response.data.success) {
                // Store tokens
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                
                setSuccess(true);
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
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
                            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                        </Box>

                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Password Reset Successful!
                        </Typography>

                        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                            Your password has been reset successfully. Redirecting you to the dashboard...
                        </Typography>
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
                        <LockResetIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Reset Your Password
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Enter your new password below.
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
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            sx={{ mb: 2 }}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            helperText="Must be at least 6 characters"
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || !password || !confirmPassword}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>

                        <Button
                            variant="text"
                            fullWidth
                            component={Link}
                            href="/login"
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

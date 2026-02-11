'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';
import api from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            router.push(returnUrl || '/dashboard');
        } catch (err: unknown) {
            let message = 'Login failed';
            if (err instanceof AxiosError) {
                message = err.response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ width: '100%', maxWidth: 450, mx: 'auto', p: 2 }}>
            <CardContent>
                <Stack spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                            Welcome back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your email below to login to your account
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GitHubIcon />}
                            sx={{ color: 'text.primary', borderColor: 'divider' }}
                        >
                            Github
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            sx={{ color: 'text.primary', borderColor: 'divider' }}
                        >
                            Google
                        </Button>
                    </Stack>

                    <Divider>
                        <Typography variant="caption" color="text.secondary">
                            OR CONTINUE WITH
                        </Typography>
                    </Divider>

                    <form onSubmit={handleLogin}>
                        <Stack spacing={2}>
                            {error && (
                                <Typography color="error" variant="body2" align="center">
                                    {error}
                                </Typography>
                            )}
                            <Box>
                                <Typography variant="caption" fontWeight="medium" sx={{ mb: 1, display: 'block' }}>
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight="medium" sx={{ mb: 1, display: 'block' }}>
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    id="password"
                                    type="password"
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Box>
                        </Stack>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                                <Typography variant="body2" color="primary" fontWeight="medium">
                                    Forgot password?
                                </Typography>
                            </Link>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            sx={{ fontWeight: 'bold', mt: 3 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Don&apos;t have an account?{' '}
                        <Link href={`/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} style={{ textDecoration: 'none' }}>
                            <Typography component="span" variant="body2" color="primary" fontWeight="medium">
                                Sign up
                            </Typography>
                        </Link>
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

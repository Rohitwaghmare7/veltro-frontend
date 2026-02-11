'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import api from '@/lib/api';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [inviteInfo, setInviteInfo] = useState<{ businessName: string } | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');

    // Extract token from returnUrl if it exists (e.g. /invite/TOKEN)
    const inviteToken = returnUrl?.startsWith('/invite/') ? returnUrl.split('/')[2] : null;

    useEffect(() => {
        if (inviteToken) {
            const fetchInviteInfo = async () => {
                try {
                    const res = await api.get(`/staff/invite/info/${inviteToken}`);
                    if (res.data.success) {
                        const { name, email, businessName } = res.data.data;
                        const [first, ...last] = name.split(' ');
                        setFirstName(first || '');
                        setLastName(last.join(' ') || '');
                        setEmail(email || '');
                        setInviteInfo({ businessName });
                    }
                } catch (err) {
                    console.error('Failed to fetch invite info', err);
                }
            };
            fetchInviteInfo();
        }
    }, [inviteToken]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const name = `${firstName} ${lastName}`.trim();
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                inviteToken
            });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect to returnUrl (the invite acceptance page) or dashboard
            router.push(returnUrl || (user.isOnboarded ? '/dashboard' : '/onboarding'));
        } catch (err: unknown) {
            let message = 'Registration failed';
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
        <Card sx={{ width: '100%', maxWidth: 500, mx: 'auto', p: 2 }}>
            <CardContent>
                <Stack spacing={3}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                            {inviteInfo ? 'Join the team' : 'Create an account'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {inviteInfo
                                ? `You've been invited to join ${inviteInfo.businessName}`
                                : 'Enter your details below to create your account'
                            }
                        </Typography>
                        {inviteInfo && (
                            <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                                You are registering as a team member. You won&apos;t need to create a separate business.
                            </Alert>
                        )}
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

                    <form onSubmit={handleRegister}>
                        <Stack spacing={2}>
                            {error && (
                                <Typography color="error" variant="body2" align="center">
                                    {error}
                                </Typography>
                            )}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" fontWeight="medium" sx={{ mb: 1, display: 'block' }}>
                                        First Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        id="firstName"
                                        placeholder="Max"
                                        variant="outlined"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" fontWeight="medium" sx={{ mb: 1, display: 'block' }}>
                                        Last Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        id="lastName"
                                        placeholder="Robinson"
                                        variant="outlined"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>

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

                            <FormControlLabel
                                control={<Checkbox id="terms" size="small" />}
                                label={
                                    <Typography variant="body2" color="text.secondary">
                                        I agree to the{' '}
                                        <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <Typography component="span" variant="body2" color="primary" fontWeight="medium">
                                                terms and conditions
                                            </Typography>
                                        </Link>
                                    </Typography>
                                }
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{ fontWeight: 'bold' }}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </Button>
                        </Stack>
                    </form>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Already have an account?{' '}
                        <Link href={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} style={{ textDecoration: 'none' }}>
                            <Typography component="span" variant="body2" color="primary" fontWeight="medium">
                                Sign in
                            </Typography>
                        </Link>
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
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
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '@/lib/api';
import SplineBackground from '@/components/SplineBackground';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteInfo, setInviteInfo] = useState<{ businessName: string } | null>(null);

    const returnUrl = searchParams.get('returnUrl');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
        setError(null);
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
        <Box
            sx={{
                minHeight: '100vh',
                position: 'relative',
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                overflow: 'hidden'
            }}
        >
            <SplineBackground scale="180%" opacity={0.8} />

            <Card
                sx={{
                    width: '100%',
                    maxWidth: 450,
                    bgcolor: 'rgba(5, 5, 5, 0.0)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0 0 80px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h5"
                                component="h1"
                                fontWeight="700"
                                gutterBottom
                                sx={{
                                    background: 'linear-gradient(to right, #FFFFFF, #00D2FF 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 0.5
                                }}
                            >
                                {inviteInfo ? 'Join the team' : 'Create an account'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                                {inviteInfo
                                    ? `You've been invited to join ${inviteInfo.businessName}`
                                    : 'Enter your details below to create your account'
                                }
                            </Typography>
                            {inviteInfo && (
                                <Alert severity="info" sx={{ mt: 2, textAlign: 'left', bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>
                                    You are registering as a team member. You won&apos;t need to create a separate business.
                                </Alert>
                            )}
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<GitHubIcon fontSize="small" />}
                                sx={{
                                    color: 'white',
                                    borderColor: '#333',
                                    textTransform: 'none',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    fontSize: '0.85rem',
                                    py: 1,
                                    '&:hover': {
                                        borderColor: '#fff',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Github
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<GoogleIcon fontSize="small" />}
                                sx={{
                                    color: 'white',
                                    borderColor: '#333',
                                    textTransform: 'none',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    fontSize: '0.85rem',
                                    py: 1,
                                    '&:hover': {
                                        borderColor: '#fff',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Google
                            </Button>
                        </Stack>

                        <Divider sx={{ '&::before, &::after': { borderColor: '#222' } }}>
                            <Typography variant="caption" sx={{ color: '#444', fontSize: '0.7rem' }}>
                                OR CONTINUE WITH
                            </Typography>
                        </Divider>

                        <form onSubmit={handleRegister}>
                            <Stack spacing={2.5}>
                                {error && (
                                    <Typography color="error" variant="caption" align="center">
                                        {error}
                                    </Typography>
                                )}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                            First Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="firstName"
                                            placeholder="Max"
                                            variant="outlined"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: '#050505',
                                                    color: 'white',
                                                    borderRadius: 1,
                                                    fontSize: '0.9rem',
                                                    '& fieldset': { borderColor: '#222' },
                                                    '&:hover fieldset': { borderColor: '#444' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FFFFFF' },
                                                },
                                                '& .MuiInputBase-input::placeholder': { color: '#444', opacity: 1 },
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <PersonIcon sx={{ color: '#444', fontSize: 18 }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                            Last Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            id="lastName"
                                            placeholder="Robinson"
                                            variant="outlined"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: '#050505',
                                                    color: 'white',
                                                    borderRadius: 1,
                                                    fontSize: '0.9rem',
                                                    '& fieldset': { borderColor: '#222' },
                                                    '&:hover fieldset': { borderColor: '#444' },
                                                    '&.Mui-focused fieldset': { borderColor: '#FFFFFF' },
                                                },
                                                '& .MuiInputBase-input::placeholder': { color: '#444', opacity: 1 },
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <PersonIcon sx={{ color: '#444', fontSize: 18 }} />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                        Email
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        variant="outlined"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: '#050505',
                                                color: 'white',
                                                borderRadius: 1,
                                                fontSize: '0.9rem',
                                                '& fieldset': { borderColor: '#222' },
                                                '&:hover fieldset': { borderColor: '#444' },
                                                '&.Mui-focused fieldset': { borderColor: '#FFFFFF' },
                                            },
                                            '& .MuiInputBase-input::placeholder': { color: '#444', opacity: 1 },
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{ color: '#444', fontSize: 18 }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                        Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        variant="outlined"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: '#050505',
                                                color: 'white',
                                                borderRadius: 1,
                                                fontSize: '0.9rem',
                                                '& fieldset': { borderColor: '#222' },
                                                '&:hover fieldset': { borderColor: '#444' },
                                                '&.Mui-focused fieldset': { borderColor: '#FFFFFF' },
                                            },
                                        }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#444', fontSize: 18 }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            onMouseDown={handleMouseDownPassword}
                                                            edge="end"
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                        >
                                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="medium"
                                    endIcon={!loading && <ArrowForwardIcon fontSize="small" />}
                                    sx={{
                                        fontWeight: '600',
                                        mt: 1,
                                        background: 'linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 100%)',
                                        color: 'black',
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        fontSize: '0.9rem',
                                        height: 40,
                                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
                                            boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
                                            transform: 'translateY(-1px)'
                                        },
                                        '&.Mui-disabled': {
                                            background: 'linear-gradient(180deg, #EEEEEE 0%, #CCCCCC 100%)',
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <CircularProgress size={20} sx={{ color: 'rgba(0, 0, 0, 0.5)' }} />
                                    ) : (
                                        'Create account'
                                    )}
                                </Button>
                            </Stack>
                        </form>

                        <Typography variant="caption" sx={{ color: '#666' }} align="center">
                            Already have an account?{' '}
                            <Link href={`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} style={{ textDecoration: 'none' }}>
                                <Typography component="span" variant="caption" sx={{ color: 'white', textDecoration: 'underline' }} fontWeight="medium">
                                    Sign in
                                </Typography>
                            </Link>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card >
        </Box >
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'black'
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        }>
            <RegisterForm />
        </Suspense>
    );
}

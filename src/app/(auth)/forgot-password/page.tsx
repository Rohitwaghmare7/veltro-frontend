'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';
import SplineBackground from '@/components/SplineBackground';

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
            let message = 'Failed to send reset email. Please try again.';
            if (err instanceof AxiosError) {
                message = err.response?.data?.message || message;
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
                    maxWidth: 380,
                    bgcolor: 'rgba(5, 5, 5, 0.0)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    boxShadow: '0 0 80px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        {success ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
                                <Typography variant="h5" fontWeight="700" sx={{ color: 'white', mb: 1 }}>
                                    Check Your Email
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                                    If an account exists for {email}, you&apos;ll receive a reset link shortly.
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component={Link}
                                    href="/login"
                                    startIcon={<ArrowBackIcon fontSize="small" />}
                                    sx={{
                                        color: 'white',
                                        borderColor: '#333',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                                    }}
                                >
                                    Back to Login
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h5"
                                        component="h1"
                                        fontWeight="700"
                                        gutterBottom
                                        sx={{
                                            color: 'white',
                                            mb: 0.5
                                        }}
                                    >
                                        Forgot Password?
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                                        Enter your email below to reset your password
                                    </Typography>
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={2.5}>
                                        {error && (
                                            <Typography color="error" variant="caption" align="center">
                                                {error}
                                            </Typography>
                                        )}
                                        <Box>
                                            <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                                Email Address
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
                                                autoFocus
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
                                                                <EmailIcon sx={{ color: '#444', fontSize: 18 }} />
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
                                                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                                                color: 'white',
                                                borderRadius: 1,
                                                textTransform: 'none',
                                                fontSize: '0.9rem',
                                                height: 40,
                                                boxShadow: '0 4px 12px rgba(255, 107, 74, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                                                    boxShadow: '0 0 15px rgba(255, 107, 74, 0.5)',
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
                                                <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </Button>

                                        <Typography variant="caption" sx={{ color: '#666' }} align="center">
                                            Remembered your password?{' '}
                                            <Link href="/login" style={{ textDecoration: 'none' }}>
                                                <Typography component="span" variant="caption" sx={{ color: 'white', textDecoration: 'underline' }} fontWeight="medium">
                                                    Sign in
                                                </Typography>
                                            </Link>
                                        </Typography>
                                    </Stack>
                                </form>
                            </>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

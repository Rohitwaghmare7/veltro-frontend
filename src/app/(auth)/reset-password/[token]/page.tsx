'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '@/lib/api';
import SplineBackground from '@/components/SplineBackground';

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
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err: any) {
            let message = 'Failed to reset password. The link may be invalid or expired.';
            if (err instanceof AxiosError) {
                message = err.response?.data?.message || message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
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
                                    Success!
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Password reset successful. Redirecting you...
                                </Typography>
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
                                            background: 'linear-gradient(to right, #FFFFFF, #FF6B4A 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 0.5
                                        }}
                                    >
                                        Reset Password
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                                        Enter your new password below
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
                                                New Password
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
                                                                <LockIcon sx={{ color: '#444', fontSize: 18 }} />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={handleClickShowPassword}
                                                                    onMouseDown={handleMouseDownPassword}
                                                                    sx={{ color: '#666' }}
                                                                >
                                                                    {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" fontWeight="medium" sx={{ mb: 0.5, display: 'block', color: '#888' }}>
                                                Confirm Password
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                variant="outlined"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                                                    size="small"
                                                                    onClick={handleClickShowConfirmPassword}
                                                                    onMouseDown={handleMouseDownPassword}
                                                                    sx={{ color: '#666' }}
                                                                >
                                                                    {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
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
                                                'Update Password'
                                            )}
                                        </Button>

                                        <Typography variant="caption" sx={{ color: '#666' }} align="center">
                                            Remember your password?{' '}
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

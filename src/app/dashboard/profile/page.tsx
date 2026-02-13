'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Avatar,
    Divider,
    Stack,
    useTheme,
    Snackbar,
    Alert,
    CircularProgress,
    Backdrop,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface UserProfile {
    name: string;
    email: string;
    role?: string;
}

export default function ProfilePage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        role: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    useEffect(() => {
        // Load user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setProfile({
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || '',
                });
            } catch (error) {
                console.error('Failed to parse user data:', error);
            }
        }
        setLoading(false);
    }, []);

    const handleChange = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // TODO: Implement API call to update profile
            // For now, just update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const updatedUser = { ...user, name: profile.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setToast({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            console.error('Failed to update profile:', error);
            setToast({ open: true, message: 'Failed to update profile', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            setToast({ open: true, message: 'Passwords do not match', severity: 'error' });
            return;
        }

        if (passwordData.new.length < 8) {
            setToast({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
            return;
        }

        try {
            setSaving(true);
            // TODO: Implement API call to change password
            setToast({ open: true, message: 'Password updated successfully!', severity: 'success' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Failed to update password:', error);
            setToast({ open: true, message: 'Failed to update password', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'owner':
                return { bg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe', color: '#8b5cf6' };
            case 'staff':
                return { bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', color: '#3b82f6' };
            default:
                return { bg: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: textSecondary };
        }
    };

    if (loading) {
        return (
            <Backdrop
                open={true}
                sx={{
                    color: '#8b5cf6',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                }}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress size={48} thickness={4} sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body1" sx={{ color: textPrimary, fontWeight: 600 }}>
                        Loading profile...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

    const roleBadge = getRoleBadgeColor(profile.role || '');

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: pageBgColor,
                p: { xs: 2, sm: 3, md: 4 },
            }}
        >
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                    Profile
                </Typography>
                <Typography variant="body2" color={textSecondary} fontWeight={500}>
                    Manage your personal information and account settings
                </Typography>
            </Box>

            {/* Main Content */}
            <Box display="flex" gap={3} flexDirection={{ xs: 'column', lg: 'row' }}>
                {/* Profile Card */}
                <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0 }}>
                    <Paper
                        sx={{
                            borderRadius: '16px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 3,
                                bgcolor: '#8b5cf6',
                                fontSize: 48,
                                fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                            }}
                        >
                            {profile.name ? getInitials(profile.name) : <PersonIcon sx={{ fontSize: 60 }} />}
                        </Avatar>
                        
                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                            {profile.name || 'User'}
                        </Typography>
                        
                        <Typography variant="body2" color={textSecondary} sx={{ mb: 2 }}>
                            {profile.email}
                        </Typography>

                        <Chip
                            label={profile.role || 'User'}
                            sx={{
                                bgcolor: roleBadge.bg,
                                color: roleBadge.color,
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                textTransform: 'capitalize',
                                px: 2,
                                height: 32,
                            }}
                        />

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: '12px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                }}
                            >
                                <EmailIcon sx={{ color: textSecondary, fontSize: 20 }} />
                                <Box flex={1} textAlign="left">
                                    <Typography variant="caption" color={textSecondary} display="block">
                                        Email
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color={textPrimary} sx={{ wordBreak: 'break-all' }}>
                                        {profile.email}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: '12px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                }}
                            >
                                <BadgeIcon sx={{ color: textSecondary, fontSize: 20 }} />
                                <Box flex={1} textAlign="left">
                                    <Typography variant="caption" color={textSecondary} display="block">
                                        Role
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color={textPrimary} sx={{ textTransform: 'capitalize' }}>
                                        {profile.role || 'User'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
                </Box>

                {/* Forms Section */}
                <Box flex={1}>
                    <Stack spacing={3}>
                        {/* Personal Information */}
                        <Paper
                            sx={{
                                borderRadius: '16px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                p: 4,
                            }}
                        >
                            <Box mb={3}>
                                <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                    Personal Information
                                </Typography>
                                <Typography variant="body2" color={textSecondary}>
                                    Update your personal details
                                </Typography>
                            </Box>

                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={handleChange('name')}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={profile.email}
                                    disabled
                                    helperText="Email cannot be changed"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <TextField
                                    fullWidth
                                    label="Role"
                                    value={profile.role}
                                    disabled
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                        '& input': { textTransform: 'capitalize' }
                                    }}
                                />

                                <Box display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={saving}
                                        startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            px: 4,
                                            bgcolor: '#8b5cf6',
                                            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                                            '&:hover': {
                                                bgcolor: '#7c3aed',
                                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                                            }
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Change Password */}
                        <Paper
                            sx={{
                                borderRadius: '16px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                p: 4,
                            }}
                        >
                            <Box mb={3}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <LockIcon sx={{ color: textSecondary, fontSize: 24 }} />
                                    <Typography variant="h6" fontWeight={700} color={textPrimary}>
                                        Change Password
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color={textSecondary}>
                                    Update your password to keep your account secure
                                </Typography>
                            </Box>

                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Current Password"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <TextField
                                    fullWidth
                                    type="password"
                                    label="New Password"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    helperText="Must be at least 8 characters"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Confirm New Password"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <Box display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handlePasswordChange}
                                        disabled={saving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                                        startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <LockIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            px: 4,
                                            bgcolor: '#8b5cf6',
                                            boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                                            '&:hover': {
                                                bgcolor: '#7c3aed',
                                                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                                            }
                                        }}
                                    >
                                        Update Password
                                    </Button>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Box>
            </Box>

            {/* Toast Notifications */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToast({ ...toast, open: false })}
                    severity={toast.severity}
                    sx={{
                        borderRadius: '12px',
                        boxShadow: isDark ? '0px 8px 24px rgba(0,0,0,0.4)' : '0px 8px 24px rgba(0,0,0,0.1)',
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from 'react-hot-toast';

interface UserProfile {
    name: string;
    email: string;
    role?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        role: '',
    });
    const [loading, setLoading] = useState(false);

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
    }, []);

    const handleChange = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call to update profile
            // For now, just update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const updatedUser = { ...user, name: profile.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
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

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Profile
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
                Manage your personal information
            </Typography>

            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
                <Box flex={{ xs: 1, md: '0 0 300px' }}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: 48,
                            }}
                        >
                            {profile.name ? getInitials(profile.name) : <PersonIcon sx={{ fontSize: 60 }} />}
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                            {profile.name || 'User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                            {profile.role || 'User'}
                        </Typography>
                    </Paper>
                </Box>

                <Box flex={1}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={profile.name}
                                onChange={handleChange('name')}
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                value={profile.email}
                                disabled
                                helperText="Email cannot be changed"
                            />

                            <TextField
                                fullWidth
                                label="Role"
                                value={profile.role}
                                disabled
                                sx={{ textTransform: 'capitalize' }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                Save Changes
                            </Button>
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Change Password
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Current Password"
                            />

                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                            />

                            <TextField
                                fullWidth
                                type="password"
                                label="Confirm New Password"
                            />

                            <Button variant="outlined">
                                Update Password
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

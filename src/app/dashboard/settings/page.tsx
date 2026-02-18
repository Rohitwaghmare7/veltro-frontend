'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Backdrop,
    CircularProgress,
    useTheme,
    Snackbar,
    Alert,
    Button,
    IconButton,
    Divider,
    Card,
    CardContent,
    Stack,
    Switch,
    FormControlLabel,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import { useSettingsStore } from '@/store/settingsStore';
import RBACGuard from '@/components/dashboard/RBACGuard';

export default function SettingsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const {
        business,
        profileData,
        services,
        workingHours,
        bookingUrl,
        loading,
        processing,
        fetchSettings,
        updateProfile,
        updateServices,
        updateWorkingHours,
        setProfileData,
        setServices,
        setWorkingHours,
    } = useSettingsStore();

    const [activeSection, setActiveSection] = useState('profile');
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const categories = [
        { value: 'salon', label: 'Salon' },
        { value: 'spa', label: 'Spa' },
        { value: 'barbershop', label: 'Barbershop' },
        { value: 'fitness', label: 'Fitness' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'photography', label: 'Photography' },
        { value: 'coaching', label: 'Coaching' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'other', label: 'Other' }
    ];

    const dayLabels: { [key: string]: string } = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    };

    const menuItems = [
        { id: 'profile', label: 'Business Profile', icon: BusinessIcon },
        { id: 'services', label: 'Services', icon: DesignServicesIcon },
        { id: 'hours', label: 'Working Hours', icon: AccessTimeIcon },
        { id: 'links', label: 'Public Links', icon: LinkIcon },
    ];

    const handleSaveProfile = async () => {
        const result = await updateProfile(profileData);
        if (result.success) {
            setToast({ open: true, message: 'Business profile updated successfully!', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to update profile', severity: 'error' });
        }
    };

    const handleAddService = () => {
        setServices([...services, { name: '', duration: 60, price: 0, description: '' }]);
    };

    const handleRemoveService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleServiceChange = (index: number, field: string, value: any) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const handleSaveServices = async () => {
        const result = await updateServices(services);
        if (result.success) {
            setToast({ open: true, message: 'Services updated successfully!', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to update services', severity: 'error' });
        }
    };

    const handleWorkingHoursChange = (index: number, field: string, value: any) => {
        const updated = [...workingHours];
        updated[index] = { ...updated[index], [field]: value };
        setWorkingHours(updated);
    };

    const handleSaveWorkingHours = async () => {
        const result = await updateWorkingHours(workingHours);
        if (result.success) {
            setToast({ open: true, message: 'Working hours updated successfully!', severity: 'success' });
        } else {
            setToast({ open: true, message: result.error || 'Failed to update working hours', severity: 'error' });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        setToast({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    };

    if (loading && !business) {
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
                        Loading settings...
                    </Typography>
                </Box>
            </Backdrop>
        );
    }

    return (
        <RBACGuard requireOwner>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: pageBgColor,
                    p: 2,
                }}
            >
                {/* Header */}
                <Box mb={2}>
                    <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                        Settings
                    </Typography>
                    <Typography variant="body2" color={textSecondary} fontWeight={500}>
                        Manage your business profile, services, and preferences
                    </Typography>
                </Box>

                {/* Top Navigation */}
                <Paper
                    sx={{
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        overflow: 'hidden',
                        mb: 2,
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 1,
                            p: 0.5,
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <Box
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        borderRadius: '12px',
                                        py: 0.875,
                                        px: 1.5,
                                        flex: 1,
                                        minWidth: 'auto',
                                        whiteSpace: 'nowrap',
                                        bgcolor: isActive
                                            ? (isDark ? 'rgba(255, 107, 107, 0.15)' : '#fee2e2')
                                            : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: isActive
                                                ? (isDark ? 'rgba(255, 107, 107, 0.2)' : '#fecaca')
                                                : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                                        },
                                    }}
                                >
                                    <Icon
                                        sx={{
                                            fontSize: 20,
                                            color: isActive
                                                ? '#ff6b6b'
                                                : textSecondary,
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontWeight: isActive ? 700 : 600,
                                            fontSize: '0.85rem',
                                            color: isActive
                                                ? '#ff6b6b'
                                                : textPrimary,
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Paper>

                {/* Content Area - Full Width */}
                <Paper
                    sx={{
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        p: 2.5,
                        py: 3,
                        minHeight: 500,
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                    }}
                >
                            {/* Business Profile Section */}
                            {activeSection === 'profile' && (
                                <Box>
                        

                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} alignItems="start">
                                        {/* Left Column - Business Profile */}
                                        <Box display="flex" flexDirection="column" gap={1.75}>
                                            <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.05rem', minHeight: '28px' }}>
                                                Business Information
                                            </Typography>
                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                Business Name
                                            </Typography>
                                            <Box
                                                component="input"
                                                value={profileData.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, name: e.target.value })}
                                                placeholder="Enter business name"
                                                sx={{
                                                    width: '100%',
                                                    p: 1.25,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    Category
                                                </Typography>
                                                <Box
                                                    component="select"
                                                    value={profileData.category}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProfileData({ ...profileData, category: e.target.value })}
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                </Box>
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    Phone
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.phone}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    Email
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, email: e.target.value })}
                                                    placeholder="Enter email address"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    Website
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.website}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, website: e.target.value })}
                                                    placeholder="https://example.com"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                Description
                                            </Typography>
                                            <Box
                                                component="textarea"
                                                rows={3}
                                                value={profileData.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfileData({ ...profileData, description: e.target.value })}
                                                placeholder="Brief description of your business"
                                                sx={{
                                                    width: '100%',
                                                    p: 1.25,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    resize: 'vertical',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block', textAlign: 'right', fontSize: '0.7rem' }}>
                                                {profileData.description.length}/500
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Right Column - Address */}
                                    <Box display="flex" flexDirection="column" gap={1.75}>
                                        <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.05rem', minHeight: '28px' }}>
                                            Address
                                        </Typography>

                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                Street Address
                                            </Typography>
                                            <Box
                                                component="input"
                                                value={profileData.address.street}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                    ...profileData,
                                                    address: { ...profileData.address, street: e.target.value }
                                                })}
                                                placeholder="Street address"
                                                sx={{
                                                    width: '100%',
                                                    p: 1.25,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    City
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.address.city}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, city: e.target.value }
                                                    })}
                                                    placeholder="City"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    State
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.address.state}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, state: e.target.value }
                                                    })}
                                                    placeholder="State"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    ZIP Code
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.address.zipCode}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, zipCode: e.target.value }
                                                    })}
                                                    placeholder="ZIP Code"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                                                    Country
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.address.country}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({
                                                        ...profileData,
                                                        address: { ...profileData.address, country: e.target.value }
                                                    })}
                                                    placeholder="Country"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.25,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                        '&:focus': {
                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                            borderWidth: '1px'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box display="flex" gap={2} mt={2}>
                                    <Box
                                        onClick={processing ? undefined : handleSaveProfile}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            px: 4,
                                            py: 1,
                                            borderRadius: '12px',
                                            background: processing ? '#9ca3af' : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            opacity: processing ? 0.6 : 1,
                                            transition: 'all 0.2s ease',
                                            '&:hover': processing ? {} : {
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                            }
                                        }}
                                    >
                                        {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
                                    </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={fetchSettings}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                                    color: textPrimary,
                                                    '&:hover': {
                                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Box>
                            )}

                            {/* Services Section */}
                            {activeSection === 'services' && (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.25rem' }}>
                                                Services Management
                                            </Typography>
                                            <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.875rem' }}>
                                                Add and manage the services you offer to customers
                                            </Typography>
                                        </Box>
                                        <Box
                                            onClick={handleAddService}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                px: 2.5,
                                                py: 0.875,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                                }
                                            }}
                                        >
                                            <AddIcon sx={{ fontSize: 18 }} />
                                            Add Service
                                        </Box>
                                    </Box>

                                    {services.length === 0 ? (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            py={3}
                                        >
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: '50%',
                                                    bgcolor: isDark ? 'rgba(255, 107, 107, 0.15)' : '#fee2e2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <DesignServicesIcon sx={{ fontSize: 28, color: '#ff6b6b' }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.05rem' }}>
                                                No services added yet
                                            </Typography>
                                            <Typography variant="body2" color={textSecondary} sx={{ mb: 2.5, fontSize: '0.9rem' }}>
                                                Add your first service to start accepting bookings
                                            </Typography>
                                            <Box
                                                onClick={handleAddService}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    px: 3,
                                                    py: 1,
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                                    }
                                                }}
                                            >
                                                <AddIcon sx={{ fontSize: 18 }} />
                                                Add Your First Service
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Stack spacing={1.5}>
                                            {services.map((service, index) => (
                                                <Card
                                                    key={index}
                                                    sx={{
                                                        borderRadius: '16px',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: isDark
                                                                ? '0 4px 12px rgba(0,0,0,0.3)'
                                                                : '0 4px 12px rgba(0,0,0,0.05)',
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 1.75 }}>
                                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                                            <Box display="flex" gap={1.5} alignItems="flex-start" flexDirection={{ xs: 'column', sm: 'row' }}>
                                                                <Box flex={1} width="100%">
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                        Service Name
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        value={service.name}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'name', e.target.value)}
                                                                        placeholder="e.g., Haircut, Massage"
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box width={{ xs: '100%', sm: 130 }}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                        Duration (min)
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="number"
                                                                        value={service.duration}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'duration', parseInt(e.target.value) || 0)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box width={{ xs: '100%', sm: 110 }}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                        Price ($)
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="number"
                                                                        value={service.price}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'price', parseInt(e.target.value) || 0)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <IconButton
                                                                    onClick={() => handleRemoveService(index)}
                                                                    size="small"
                                                                    sx={{
                                                                        color: '#ef4444',
                                                                        mt: { xs: 0, sm: 3 },
                                                                        '&:hover': {
                                                                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                                                </IconButton>
                                                            </Box>

                                                            <Box>
                                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                    Description
                                                                </Typography>
                                                                <Box
                                                                    component="textarea"
                                                                    rows={2}
                                                                    value={service.description}
                                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleServiceChange(index, 'description', e.target.value)}
                                                                    placeholder="Brief description of the service"
                                                                    sx={{
                                                                        width: '100%',
                                                                        p: 1,
                                                                        borderRadius: '12px',
                                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                        color: textPrimary,
                                                                        fontSize: '0.9rem',
                                                                        fontFamily: 'inherit',
                                                                        outline: 'none',
                                                                        resize: 'vertical',
                                                                        '&:focus': {
                                                                            borderColor: isDark ? '#ffffff' : '#000000',
                                                                            borderWidth: '1px'
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            <Box display="flex" gap={2}>
                                                <Box
                                                    onClick={processing ? undefined : handleSaveServices}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        px: 4,
                                                        py: 1,
                                                        borderRadius: '12px',
                                                        background: processing ? '#9ca3af' : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                                        color: '#ffffff',
                                                        fontWeight: 700,
                                                        fontSize: '0.875rem',
                                                        cursor: processing ? 'not-allowed' : 'pointer',
                                                        opacity: processing ? 0.6 : 1,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': processing ? {} : {
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                                        }
                                                    }}
                                                >
                                                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Services'}
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    onClick={fetchSettings}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                                        color: textPrimary,
                                                        '&:hover': {
                                                            borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                        </Stack>
                                    )}
                                </Box>
                            )}

                            {/* Working Hours Section */}
                            {activeSection === 'hours' && (
                                <Box>
                                    <Box mb={1.5}>
                                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.25rem' }}>
                                            Working Hours
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.875rem' }}>
                                            Set your business hours for each day of the week
                                        </Typography>
                                    </Box>

                                    <Stack spacing={1.25}>
                                        {workingHours.map((hours, index) => (
                                            <Card
                                                key={hours.day}
                                                sx={{
                                                    borderRadius: '16px',
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        boxShadow: isDark
                                                            ? '0 4px 12px rgba(0,0,0,0.3)'
                                                            : '0 4px 12px rgba(0,0,0,0.05)',
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{ p: 1.75 }}>
                                                    <Box display="flex" alignItems="center" gap={2.5} flexWrap="wrap">
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={hours.isOpen}
                                                                    onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#ff6b6b',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            bgcolor: '#ff6b6b',
                                                                        },
                                                                    }}
                                                                />
                                                            }
                                                            label={dayLabels[hours.day]}
                                                            sx={{
                                                                minWidth: 140,
                                                                '& .MuiFormControlLabel-label': {
                                                                    fontWeight: 700,
                                                                    fontSize: '0.95rem',
                                                                    color: textPrimary
                                                                }
                                                            }}
                                                        />

                                                        {hours.isOpen ? (
                                                            <Box display="flex" alignItems="center" gap={1.75} flex={1}>
                                                                <Box flex={1}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                        Start Time
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="time"
                                                                        value={hours.start}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWorkingHoursChange(index, 'start', e.target.value)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography color={textSecondary} fontWeight={600} sx={{ mt: 3, fontSize: '0.875rem' }}>to</Typography>
                                                                <Box flex={1}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                                        End Time
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="time"
                                                                        value={hours.end}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWorkingHoursChange(index, 'end', e.target.value)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.9rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        ) : (
                                                            <Typography color={textSecondary} fontWeight={600} fontSize="0.95rem">
                                                                Closed
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        <Box display="flex" gap={2}>
                                            <Box
                                                onClick={processing ? undefined : handleSaveWorkingHours}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    px: 4,
                                                    py: 1,
                                                    borderRadius: '12px',
                                                    background: processing ? '#9ca3af' : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    cursor: processing ? 'not-allowed' : 'pointer',
                                                    opacity: processing ? 0.6 : 1,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': processing ? {} : {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                                    }
                                                }}
                                            >
                                                {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Working Hours'}
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                onClick={fetchSettings}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                                    color: textPrimary,
                                                    '&:hover': {
                                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}

                            {/* Public Links Section */}
                            {activeSection === 'links' && (
                                <Box>
                                    <Box mb={1.5}>
                                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 0.5, fontSize: '1.25rem' }}>
                                            Public Links
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary} sx={{ fontSize: '0.875rem' }}>
                                            Share your booking page and manage public URLs
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                Public Booking Page
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    p: 0.5,
                                                    pl: 1,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                }}
                                            >
                                                <Box
                                                    component="input"
                                                    value={bookingUrl}
                                                    readOnly
                                                    sx={{
                                                        flex: 1,
                                                        border: 'none',
                                                        bg: 'transparent',
                                                        bgcolor: 'transparent',
                                                        color: textPrimary,
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={copyToClipboard}
                                                    size="small"
                                                    sx={{
                                                        color: '#ff6b6b',
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(255, 107, 107, 0.1)' : '#fee2e2',
                                                        }
                                                    }}
                                                >
                                                    <ContentCopyIcon sx={{ fontSize: 20 }} />
                                                </IconButton>
                                                <IconButton
                                                    component="a"
                                                    href={bookingUrl}
                                                    target="_blank"
                                                    size="small"
                                                    sx={{
                                                        color: '#ff6b6b',
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(255, 107, 107, 0.1)' : '#fee2e2',
                                                        }
                                                    }}
                                                >
                                                    <LaunchIcon sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                                Share this link with your customers to accept bookings
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>
                                                Business Slug
                                            </Typography>
                                            <Box
                                                component="input"
                                                value={business?.bookingSlug || ''}
                                                disabled
                                                readOnly
                                                sx={{
                                                    width: '100%',
                                                    p: 1,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textSecondary,
                                                    fontSize: '0.875rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                }}
                                            />
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                                This is your unique business identifier used in public URLs
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}
                </Paper>

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
                            borderRadius: '8px',
                            boxShadow: isDark ? '0px 8px 24px rgba(0,0,0,0.4)' : '0px 8px 24px rgba(0,0,0,0.1)',
                        }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>
            </Box>
        </RBACGuard>
    );
}

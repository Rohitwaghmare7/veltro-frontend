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
import WarningIcon from '@mui/icons-material/Warning';
import { useSettingsStore } from '@/store/settingsStore';
import RBACGuard from '@/components/dashboard/RBACGuard';
import ConfirmActionDialog from '@/components/team/ConfirmActionDialog';

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
        deactivateWorkspace,
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
    const [openDeactivate, setOpenDeactivate] = useState(false);
    const [deactivateConfirmText, setDeactivateConfirmText] = useState('');

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
        { id: 'danger', label: 'Danger Zone', icon: WarningIcon },
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

    const handleDeactivateConfirm = async () => {
        const result = await deactivateWorkspace(deactivateConfirmText);
        if (result.success) {
            setToast({ open: true, message: 'Workspace deactivated successfully!', severity: 'success' });
            setOpenDeactivate(false);
            setDeactivateConfirmText('');
        } else {
            setToast({ open: true, message: result.error || 'Failed to deactivate workspace', severity: 'error' });
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
                    p: { xs: 2, sm: 3, md: 4 },
                }}
            >
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" fontWeight={800} color={textPrimary} sx={{ mb: 0.5 }}>
                        Settings
                    </Typography>
                    <Typography variant="body2" color={textSecondary} fontWeight={500}>
                        Manage your business profile, services, and preferences
                    </Typography>
                </Box>

                {/* Main Content with Sidebar */}
                <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
                    {/* Sidebar Navigation */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: 280 },
                            flexShrink: 0,
                        }}
                    >
                        <Paper
                            sx={{
                                borderRadius: '24px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                overflow: 'hidden',
                                position: { xs: 'relative', md: 'sticky' },
                                top: { md: 20 },
                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                            }}
                        >
                            <List sx={{ p: 1 }}>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeSection === item.id;
                                    const isDanger = item.id === 'danger';

                                    return (
                                        <ListItemButton
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            sx={{
                                                borderRadius: '16px',
                                                mb: 0.5,
                                                py: 1.5,
                                                bgcolor: isActive
                                                    ? (isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe')
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: isActive
                                                        ? (isDark ? 'rgba(139, 92, 246, 0.2)' : '#ddd6fe')
                                                        : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Icon
                                                    sx={{
                                                        fontSize: 22,
                                                        color: isDanger
                                                            ? '#ef4444'
                                                            : isActive
                                                                ? '#8b5cf6'
                                                                : textSecondary,
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontWeight: isActive ? 700 : 600,
                                                    fontSize: '0.95rem',
                                                    color: isDanger
                                                        ? '#ef4444'
                                                        : isActive
                                                            ? '#8b5cf6'
                                                            : textPrimary,
                                                }}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Box>

                    {/* Content Area */}
                    <Box flex={1}>
                        <Paper
                            sx={{
                                borderRadius: '24px',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                p: { xs: 3, sm: 4 },
                                minHeight: 600,
                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                            }}
                        >
                            {/* Business Profile Section */}
                            {activeSection === 'profile' && (
                                <Box>
                                    <Box mb={4}>
                                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                            Business Profile
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary}>
                                            Update your business information and contact details
                                        </Typography>
                                    </Box>

                                    <Box display="flex" flexDirection="column" gap={3}>
                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                Business Name
                                            </Typography>
                                            <Box
                                                component="input"
                                                value={profileData.name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, name: e.target.value })}
                                                placeholder="Enter business name"
                                                sx={{
                                                    width: '100%',
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                    Category
                                                </Typography>
                                                <Box
                                                    component="select"
                                                    value={profileData.category}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProfileData({ ...profileData, category: e.target.value })}
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                    Phone
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.phone}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                    Website
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    value={profileData.website}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({ ...profileData, website: e.target.value })}
                                                    placeholder="https://example.com"
                                                    sx={{
                                                        width: '100%',
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    resize: 'vertical',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                                                {profileData.description.length}/500
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                            Address
                                        </Typography>

                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textPrimary,
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                    '&:focus': {
                                                        borderColor: isDark ? '#ffffff' : '#000000',
                                                        borderWidth: '1px'
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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

                                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                                            <Box>
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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
                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                        p: 1.5,
                                                        borderRadius: '12px',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                        color: textPrimary,
                                                        fontSize: '0.95rem',
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

                                        <Box display="flex" gap={2} mt={2}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveProfile}
                                                disabled={processing}
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
                                                {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Changes'}
                                            </Button>
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
                                </Box>
                            )}

                            {/* Services Section */}
                            {activeSection === 'services' && (
                                <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                                Services Management
                                            </Typography>
                                            <Typography variant="body2" color={textSecondary}>
                                                Add and manage the services you offer to customers
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddService}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                bgcolor: '#8b5cf6',
                                                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                                                '&:hover': {
                                                    bgcolor: '#7c3aed',
                                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                                                }
                                            }}
                                        >
                                            Add Service
                                        </Button>
                                    </Box>

                                    {services.length === 0 ? (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            py={8}
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 3,
                                                }}
                                            >
                                                <DesignServicesIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                                No services added yet
                                            </Typography>
                                            <Typography variant="body2" color={textSecondary} sx={{ mb: 3 }}>
                                                Add your first service to start accepting bookings
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={handleAddService}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    bgcolor: '#8b5cf6',
                                                    boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                                                    '&:hover': {
                                                        bgcolor: '#7c3aed',
                                                    }
                                                }}
                                            >
                                                Add Your First Service
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Stack spacing={3}>
                                            {services.map((service, index) => (
                                                <Card
                                                    key={index}
                                                    sx={{
                                                        borderRadius: '24px',
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
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box display="flex" flexDirection="column" gap={2.5}>
                                                            <Box display="flex" gap={2} alignItems="flex-start" flexDirection={{ xs: 'column', sm: 'row' }}>
                                                                <Box flex={1} width="100%">
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                                        Service Name
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        value={service.name}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'name', e.target.value)}
                                                                        placeholder="e.g., Haircut, Massage"
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.95rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box width={{ xs: '100%', sm: 140 }}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                                        Duration (min)
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="number"
                                                                        value={service.duration}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'duration', parseInt(e.target.value) || 0)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.95rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box width={{ xs: '100%', sm: 120 }}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                                        Price ($)
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="number"
                                                                        value={service.price}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'price', parseInt(e.target.value) || 0)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.95rem',
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
                                                                    sx={{
                                                                        color: '#ef4444',
                                                                        mt: { xs: 0, sm: 3.5 },
                                                                        '&:hover': {
                                                                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>

                                                            <Box>
                                                                <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
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
                                                                        p: 1.5,
                                                                        borderRadius: '12px',
                                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                        color: textPrimary,
                                                                        fontSize: '0.95rem',
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

                                            <Box display="flex" gap={2} mt={2}>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSaveServices}
                                                    disabled={processing}
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
                                                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Services'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={fetchSettings}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                                        color: textPrimary,
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
                                    <Box mb={4}>
                                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                            Working Hours
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary}>
                                            Set your business hours for each day of the week
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2}>
                                        {workingHours.map((hours, index) => (
                                            <Card
                                                key={hours.day}
                                                sx={{
                                                    borderRadius: '24px',
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
                                                <CardContent sx={{ p: 3 }}>
                                                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={hours.isOpen}
                                                                    onChange={(e) => handleWorkingHoursChange(index, 'isOpen', e.target.checked)}
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#8b5cf6',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            bgcolor: '#8b5cf6',
                                                                        },
                                                                    }}
                                                                />
                                                            }
                                                            label={dayLabels[hours.day]}
                                                            sx={{
                                                                minWidth: 160,
                                                                '& .MuiFormControlLabel-label': {
                                                                    fontWeight: 700,
                                                                    fontSize: '1rem',
                                                                    color: textPrimary
                                                                }
                                                            }}
                                                        />

                                                        {hours.isOpen ? (
                                                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                                                                <Box flex={1}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                                        Start Time
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="time"
                                                                        value={hours.start}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWorkingHoursChange(index, 'start', e.target.value)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.95rem',
                                                                            fontFamily: 'inherit',
                                                                            outline: 'none',
                                                                            '&:focus': {
                                                                                borderColor: isDark ? '#ffffff' : '#000000',
                                                                                borderWidth: '1px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography color={textSecondary} fontWeight={600} sx={{ mt: 3 }}>to</Typography>
                                                                <Box flex={1}>
                                                                    <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                                        End Time
                                                                    </Typography>
                                                                    <Box
                                                                        component="input"
                                                                        type="time"
                                                                        value={hours.end}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWorkingHoursChange(index, 'end', e.target.value)}
                                                                        sx={{
                                                                            width: '100%',
                                                                            p: 1.5,
                                                                            borderRadius: '12px',
                                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                                                            color: textPrimary,
                                                                            fontSize: '0.95rem',
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
                                                            <Typography color={textSecondary} fontWeight={600} fontSize="1rem">
                                                                Closed
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        <Box display="flex" gap={2} mt={3}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveWorkingHours}
                                                disabled={processing}
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
                                                {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Working Hours'}
                                            </Button>
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
                                    </Stack>
                                </Box>
                            )}

                            {/* Public Links Section */}
                            {activeSection === 'links' && (
                                <Box>
                                    <Box mb={4}>
                                        <Typography variant="h5" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                            Public Links
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary}>
                                            Share your booking page and manage public URLs
                                        </Typography>
                                    </Box>

                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                Public Booking Page
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    p: 0.5,
                                                    pl: 1.5,
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
                                                        fontSize: '0.95rem',
                                                        fontFamily: 'inherit',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={copyToClipboard}
                                                    sx={{
                                                        color: '#8b5cf6',
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#ede9fe',
                                                        }
                                                    }}
                                                >
                                                    <ContentCopyIcon />
                                                </IconButton>
                                                <IconButton
                                                    component="a"
                                                    href={bookingUrl}
                                                    target="_blank"
                                                    sx={{
                                                        color: '#8b5cf6',
                                                        '&:hover': {
                                                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.1)' : '#ede9fe',
                                                        }
                                                    }}
                                                >
                                                    <LaunchIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block' }}>
                                                Share this link with your customers to accept bookings
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="caption" color={textSecondary} sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                                                Business Slug
                                            </Typography>
                                            <Box
                                                component="input"
                                                value={business?.bookingSlug || ''}
                                                disabled
                                                readOnly
                                                sx={{
                                                    width: '100%',
                                                    p: 1.5,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
                                                    color: textSecondary,
                                                    fontSize: '0.95rem',
                                                    fontFamily: 'inherit',
                                                    outline: 'none',
                                                }}
                                            />
                                            <Typography variant="caption" color={textSecondary} sx={{ mt: 0.5, display: 'block' }}>
                                                This is your unique business identifier used in public URLs
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            )}

                            {/* Danger Zone Section */}
                            {activeSection === 'danger' && (
                                <Box>
                                    <Box mb={4}>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: '#ef4444', mb: 1 }}>
                                            Danger Zone
                                        </Typography>
                                        <Typography variant="body2" color={textSecondary}>
                                            Irreversible and destructive actions
                                        </Typography>
                                    </Box>

                                    <Card
                                        sx={{
                                            borderRadius: '24px',
                                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2',
                                            border: `2px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
                                        }}
                                    >
                                        <CardContent sx={{ p: 4 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                                <Box flex={1}>
                                                    <Typography variant="h6" fontWeight={700} color={textPrimary} sx={{ mb: 1 }}>
                                                        Deactivate Workspace
                                                    </Typography>
                                                    <Typography variant="body2" color={textSecondary}>
                                                        This will deactivate your workspace and stop accepting bookings. Your data will be preserved and you can reactivate it later.
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<WarningIcon />}
                                                    onClick={() => setOpenDeactivate(true)}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        bgcolor: '#ef4444',
                                                        boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                                                        '&:hover': {
                                                            bgcolor: '#dc2626',
                                                            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                                                        }
                                                    }}
                                                >
                                                    Deactivate
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>

                {/* Deactivate Confirmation Dialog */}
                <ConfirmActionDialog
                    open={openDeactivate}
                    onClose={() => {
                        setOpenDeactivate(false);
                        setDeactivateConfirmText('');
                    }}
                    onConfirm={handleDeactivateConfirm}
                    title="Deactivate Workspace"
                    message={`This will deactivate your workspace and stop accepting new bookings. Your data will be preserved and you can reactivate later. To confirm, please type your business name: ${business?.name}`}
                    confirmText="Deactivate Workspace"
                    type="danger"
                    processing={processing}
                />

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
        </RBACGuard>
    );
}

'use client';

import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    CardActionArea,
    CircularProgress,
    useTheme,
    Paper,
    Divider,
    Stack,
    Tooltip,
    IconButton
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';

import RBACGuard from '@/components/dashboard/RBACGuard';
import ConfirmDeleteDialog from '@/components/forms/ConfirmDeleteDialog';
import NotificationSnackbar from '@/components/forms/NotificationSnackbar';

export default function FormsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Theme colors
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : '#f8fafc';

    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<{ id: string; title: string } | null>(null);
    
    // Notification states
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchForms = async () => {
        try {
            const data = await formService.getForms();
            if (data.success) {
                setForms(data.data);
            }
        } catch (error) {
            console.error('Failed to load forms', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFormToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;

        try {
            await formService.deleteForm(formToDelete.id);
            setForms(forms.filter(f => f._id !== formToDelete.id));
            setNotification({
                open: true,
                message: 'Form deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Failed to delete form', error);
            setNotification({
                open: true,
                message: 'Failed to delete form',
                severity: 'error'
            });
        } finally {
            setDeleteDialogOpen(false);
            setFormToDelete(null);
        }
    };

    const handleShare = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const url = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(url);
        setNotification({
            open: true,
            message: 'Form link copied to clipboard!',
            severity: 'success'
        });
    };

    const handleExport = async (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            const blob = await formService.exportSubmissions(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_submissions.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export submissions', error);
            setNotification({
                open: true,
                message: 'Failed to export submissions. Make sure there are submissions to export.',
                severity: 'error'
            });
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={pageBgColor}>
            <CircularProgress />
        </Box>
    );

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box sx={{ minHeight: '100vh', bgcolor: pageBgColor, p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" color={textPrimary} gutterBottom>
                            Forms
                        </Typography>
                        <Typography variant="body1" color={textSecondary}>
                            Manage your client intake forms and responses
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={Link}
                        href="/dashboard/forms/builder"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1.5,
                            bgcolor: isDark ? '#667eea' : '#111827',
                            color: 'white',
                            boxShadow: isDark ? '0 4px 14px 0 rgba(102, 126, 234, 0.39)' : '0 4px 14px 0 rgba(17, 24, 39, 0.39)',
                            '&:hover': {
                                bgcolor: isDark ? '#7c8ef0' : '#000000',
                                boxShadow: isDark ? '0 6px 20px rgba(102, 126, 234, 0.5)' : '0 6px 20px rgba(0,0,0,0.23)'
                            }
                        }}
                    >
                        Create Form
                    </Button>
                </Box>

                {forms.length === 0 ? (
                    <Box
                        textAlign="center"
                        py={12}
                        bgcolor={cardBg}
                        borderRadius="24px"
                        border={`1px dashed ${borderColor}`}
                    >
                        <Box
                            bgcolor={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}
                            width={80}
                            height={80}
                            borderRadius="50%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                        >
                            <DescriptionIcon sx={{ fontSize: 40, color: textSecondary, opacity: 0.5 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="700" color={textPrimary} gutterBottom>No forms created yet</Typography>
                        <Typography color={textSecondary} mb={4} maxWidth="400px" mx="auto">
                            Create your first form to start collecting information from your clients efficiently.
                        </Typography>
                        <Button
                            variant="outlined"
                            component={Link}
                            href="/dashboard/forms/builder"
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: borderColor,
                                color: textPrimary,
                                '&:hover': {
                                    borderColor: textPrimary,
                                    bgcolor: hoverBg
                                }
                            }}
                        >
                            Build your first form
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {forms.map((form) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={form._id}>
                                <Box
                                    component={Link}
                                    href={`/dashboard/forms/${form._id}`}
                                    sx={{
                                        display: 'block',
                                        textDecoration: 'none',
                                        bgcolor: cardBg,
                                        borderRadius: '20px',
                                        border: `1px solid ${borderColor}`,
                                        transition: 'all 0.2s',
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.1)',
                                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                                        }
                                    }}
                                >
                                    <Box p={3}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                                                    color: '#3b82f6'
                                                }}
                                            >
                                                <DescriptionIcon />
                                            </Box>

                                            <Tooltip title="Delete Form">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDelete(form._id, form.title, e)}
                                                    sx={{
                                                        color: textSecondary,
                                                        backgroundColor: 'transparent',
                                                        '&:hover': { color: '#ef4444', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        <Typography variant="h6" fontWeight="700" color={textPrimary} noWrap gutterBottom>
                                            {form.title}
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                                            <Typography variant="caption" fontWeight="500" sx={{
                                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                color: textSecondary,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '6px'
                                            }}>
                                                {form.submissionsCount} Responses
                                            </Typography>
                                            <Typography variant="caption" color={textSecondary}>
                                                • {new Date(form.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ borderColor: borderColor, mb: 2 }} />

                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                startIcon={<ShareIcon fontSize="small" />}
                                                onClick={(e) => handleShare(form._id, e)}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: '8px',
                                                    color: textSecondary,
                                                    textTransform: 'none',
                                                    borderColor: borderColor,
                                                    '&:hover': { bgcolor: hoverBg, color: textPrimary }
                                                }}
                                            >
                                                Share
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<DownloadIcon fontSize="small" />}
                                                onClick={(e) => handleExport(form._id, form.title, e)}
                                                sx={{
                                                    flex: 1,
                                                    borderRadius: '8px',
                                                    color: textSecondary,
                                                    textTransform: 'none',
                                                    borderColor: borderColor,
                                                    '&:hover': { bgcolor: hoverBg, color: textPrimary }
                                                }}
                                            >
                                                Export
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
                
                {/* Confirmation Dialog */}
                <ConfirmDeleteDialog
                    open={deleteDialogOpen}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setFormToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Form"
                    message={`Are you sure you want to delete "${formToDelete?.title}"? All submissions will be permanently deleted.`}
                />
                
                {/* Notification Snackbar */}
                <NotificationSnackbar
                    open={notification.open}
                    onClose={() => setNotification({ ...notification, open: false })}
                    message={notification.message}
                    severity={notification.severity}
                />
            </Box>
        </RBACGuard>
    );
}

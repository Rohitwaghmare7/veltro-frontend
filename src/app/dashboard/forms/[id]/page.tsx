'use client';

import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Grid,
    useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';
import { useParams } from 'next/navigation';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function FormSubmissionsPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const params = useParams();
    const id = params?.id as string;

    // Theme colors
    const pageBgColor = isDark ? '#0f1117' : '#F2F1EB';
    const cardBg = isDark ? '#1a1d29' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const [form, setForm] = useState<Form | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // Fetch form details
                const formData = await formService.getForm(id);
                if (formData.success) {
                    setForm(formData.data);
                }

                // Fetch submissions
                const subData = await formService.getSubmissions(id);
                if (subData.success) {
                    setSubmissions(subData.data);
                }
            } catch (error) {
                console.error('Failed to load submissions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleExportCSV = () => {
        if (!form || submissions.length === 0) return;

        // Define Headers
        const headers = ['Client Name', 'Email', 'Submitted At', ...form.fields.map(f => f.label)];

        // Map Rows
        const rows = submissions.map(sub => [
            sub.contactId?.name || 'Guest',
            sub.contactId?.email || 'N/A',
            new Date(sub.createdAt).toLocaleString(),
            ...form.fields.map(field => {
                const val = sub.data[field.id];
                return Array.isArray(val) ? `"${val.join(', ')}"` : `"${val || ''}"`;
            })
        ]);

        // Combine into CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_Submissions.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={pageBgColor}>
                <CircularProgress />
            </Box>
        );
    }

    if (!form) {
        return (
            <Box p={4} bgcolor={pageBgColor} minHeight="100vh">
                <Typography color="error">Form not found or you don't have access.</Typography>
                <Button component={Link} href="/dashboard/forms" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                    Back to Forms
                </Button>
            </Box>
        );
    }

    const latestSubmissionDate = submissions.length > 0
        ? new Date(Math.max(...submissions.map(s => new Date(s.createdAt).getTime()))).toLocaleDateString()
        : 'N/A';

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box sx={{ 
                height: '100vh', 
                bgcolor: pageBgColor, 
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Box mb={3} flexShrink={0}>
                    <Button
                        component={Link}
                        href="/dashboard/forms"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            mb: 2,
                            ml: -1,
                            color: textSecondary,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { color: textPrimary, bgcolor: 'transparent', textDecoration: 'underline' }
                        }}
                    >
                        Back to Forms
                    </Button>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h5" fontWeight="700" color={textPrimary} letterSpacing="-0.5px">
                                {form.title}
                            </Typography>
                            <Typography variant="body2" color={textSecondary} mt={0.5} fontSize="0.875rem">
                                Manage and review form submissions
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCSV}
                            disabled={submissions.length === 0}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                color: 'white',
                                boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
                                border: 'none',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #ff5252 0%, #ff7043 100%)',
                                    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)'
                                },
                                '&:disabled': {
                                    background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                    color: textSecondary
                                }
                            }}
                        >
                            Export CSV
                        </Button>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2} mb={2.5} flexShrink={0}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="600" color={textSecondary} textTransform="uppercase" fontSize="0.7rem">Total Submissions</Typography>
                            <Typography variant="h6" fontWeight="bold" color={textPrimary} mt={0.5}>{submissions.length}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', color: '#3b82f6' }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                {submissions.length}
                            </Box>
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Typography variant="caption" fontWeight="600" color={textSecondary} textTransform="uppercase" fontSize="0.7rem">Latest Submission</Typography>
                            <Typography variant="h6" fontWeight="bold" color={textPrimary} mt={0.5}>{latestSubmissionDate}</Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5', color: '#10b981' }}>
                            <AccessTimeIcon />
                        </Box>
                    </Paper>
                </Box>

                {/* Responses Table - Scrollable */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '20px',
                        border: `1px solid ${borderColor}`,
                        bgcolor: cardBg,
                        overflow: 'hidden',
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Client / Contact</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted At</TableCell>
                                    <TableCell sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</TableCell>
                                    <TableCell align="right" sx={{ color: textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                            <Typography color={textSecondary}>No submissions yet.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((row) => (
                                        <TableRow
                                            key={row._id}
                                            sx={{
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600" color={textPrimary} gutterBottom>
                                                        {row.contactId?.name || 'Guest User'}
                                                    </Typography>
                                                    <Chip
                                                        label={row.contactId?.email || 'No email provided'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                                            color: textSecondary,
                                                            fontSize: '0.75rem',
                                                            height: 22,
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, color: textPrimary }}>
                                                {new Date(row.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: `1px solid ${borderColor}`, color: textSecondary, maxWidth: 300 }}>
                                                <Typography variant="body2" sx={{ 
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {Object.entries(row.data).map(([key, value]) => {
                                                        const field = form.fields.find(f => f.id === key);
                                                        const label = field?.label || key;
                                                        const displayValue = Array.isArray(value) ? value.join(', ') : value;
                                                        return `${label}: ${displayValue}`;
                                                    }).join(' | ')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: `1px solid ${borderColor}` }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSelectedSubmission(row)}
                                                    sx={{
                                                        color: textSecondary,
                                                        '&:hover': { color: 'primary.main', bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eff6ff' }
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Submission Details Dialog */}
                <Dialog
                    open={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            bgcolor: cardBg,
                            backgroundImage: 'none'
                        }
                    }}
                >
                    <DialogTitle sx={{ borderBottom: `1px solid ${borderColor}`, p: 2, pb: 1.5 }}>
                        <Typography variant="h6" fontWeight="bold" fontSize="1rem">Submission Details</Typography>
                    </DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        {selectedSubmission && (
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={2} p={1.5} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                                    <Box>
                                        <Typography variant="caption" color={textSecondary} fontWeight="600" textTransform="uppercase" display="block" mb={0.5} fontSize="0.65rem">Submitter</Typography>
                                        <Typography variant="subtitle2" fontWeight="bold" fontSize="0.9rem">{selectedSubmission.contactId?.name || 'Guest'}</Typography>
                                        <Typography variant="body2" color={textSecondary} fontSize="0.8rem">{selectedSubmission.contactId?.email}</Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography variant="caption" color={textSecondary} fontWeight="600" textTransform="uppercase" display="block" mb={0.5} fontSize="0.65rem">Date Submitted</Typography>
                                        <Typography variant="subtitle2" fontWeight="bold" fontSize="0.9rem">{new Date(selectedSubmission.createdAt).toLocaleDateString()}</Typography>
                                        <Typography variant="body2" color={textSecondary} fontSize="0.8rem">{new Date(selectedSubmission.createdAt).toLocaleTimeString()}</Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }} fontSize="0.95rem">Form Responses</Typography>
                                <Grid container spacing={2}>
                                    {form.fields.map((field) => (
                                        <Grid size={{ xs: 12 }} key={field.id}>
                                            <Typography variant="subtitle2" color={textSecondary} gutterBottom fontWeight="600" fontSize="0.75rem">{field.label}</Typography>
                                            <Box sx={{
                                                p: 1.5,
                                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '12px',
                                                border: `1px solid ${borderColor}`,
                                                color: textPrimary
                                            }}>
                                                <Typography variant="body2" fontSize="0.85rem">
                                                    {Array.isArray(selectedSubmission.data[field.id])
                                                        ? selectedSubmission.data[field.id].join(', ')
                                                        : selectedSubmission.data[field.id]?.toString() || '(No Response)'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ borderTop: `1px solid ${borderColor}`, p: 1.5 }}>
                        <Button
                            onClick={() => setSelectedSubmission(null)}
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                px: 3,
                                py: 0.75,
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                color: 'white',
                                boxShadow: '0 4px 14px 0 rgba(255, 107, 107, 0.39)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #ff5252 0%, #ff7043 100%)',
                                    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)'
                                }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

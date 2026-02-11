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
    Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';
import { useParams } from 'next/navigation';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function FormSubmissionsPage() {
    const params = useParams();
    const id = params?.id as string;
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

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'reviewed': return 'success';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

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
            <Box p={4} display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!form) {
        return (
            <Box p={4}>
                <Typography color="error">Form not found or you don't have access.</Typography>
                <Button component={Link} href="/dashboard/forms" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                    Back to Forms
                </Button>
            </Box>
        );
    }

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box>
                <Button
                    component={Link}
                    href="/dashboard/forms"
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 2 }}
                >
                    Back to Forms
                </Button>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">{form.title}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Viewing {submissions.length} submissions
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportCSV}
                        disabled={submissions.length === 0}
                    >
                        Export CSV
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Client / Contact</TableCell>
                                <TableCell>Submitted At</TableCell>
                                <TableCell>Preview</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="textSecondary">No submissions yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            {row.contactId?.name || 'Guest User'}
                                            <Typography variant="caption" display="block" color="textSecondary">
                                                {row.contactId?.email || 'No email provided'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                                {Object.values(row.data).slice(0, 3).join(', ')}...
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => setSelectedSubmission(row)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Submission Details Dialog */}
                <Dialog open={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} maxWidth="md" fullWidth>
                    <DialogTitle>Submission Details</DialogTitle>
                    <DialogContent dividers>
                        {selectedSubmission && (
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={3}>
                                    <Box>
                                        <Typography variant="overline" color="textSecondary">Submitter</Typography>
                                        <Typography variant="h6">{selectedSubmission.contactId?.name || 'Guest'}</Typography>
                                        <Typography variant="body2">{selectedSubmission.contactId?.email}</Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography variant="overline" color="textSecondary">Date</Typography>
                                        <Typography variant="body1">{new Date(selectedSubmission.createdAt).toLocaleString()}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Typography variant="h6" gutterBottom>Form Responses</Typography>
                                <Grid container spacing={2}>
                                    {form.fields.map((field) => (
                                        <Grid size={{ xs: 12 }} key={field.id}>
                                            <Typography variant="subtitle2" color="textSecondary">{field.label}</Typography>
                                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                {Array.isArray(selectedSubmission.data[field.id])
                                                    ? selectedSubmission.data[field.id].join(', ')
                                                    : selectedSubmission.data[field.id]?.toString() || '(No Response)'}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedSubmission(null)} variant="contained">Close</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RBACGuard>
    );
}

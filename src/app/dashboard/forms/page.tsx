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
    IconButton
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this form?')) return;

        try {
            await formService.deleteForm(id);
            setForms(forms.filter(f => f._id !== id));
        } catch (error) {
            console.error('Failed to delete form', error);
        }
    };

    const handleShare = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const url = `${window.location.origin}/form/${id}`;
        navigator.clipboard.writeText(url);
        alert('Form link copied to clipboard!');
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <RBACGuard permission={['canEditBookings', 'canEditLeads']}>
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Forms</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        component={Link}
                        href="/dashboard/forms/builder"
                    >
                        Create Form
                    </Button>
                </Box>

                {forms.length === 0 ? (
                    <Box textAlign="center" py={8} bgcolor="grey.50" borderRadius={2}>
                        <Typography color="textSecondary" mb={2}>No forms created yet.</Typography>
                        <Button variant="outlined" component={Link} href="/dashboard/forms/builder">Build your first form</Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {forms.map((form) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={form._id}>
                                <Card variant="outlined">
                                    <CardActionArea component={Link} href={`/dashboard/forms/${form._id}`}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Box
                                                    p={1}
                                                    bgcolor="primary.light"
                                                    color="primary.contrastText"
                                                    borderRadius={1}
                                                    mr={2}
                                                >
                                                    <DescriptionIcon />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" noWrap>{form.title}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {form.submissionsCount} responses • {new Date(form.updatedAt || Date.now()).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                    <CardActions>
                                        <Button size="small" startIcon={<ShareIcon />} onClick={(e) => handleShare(form._id, e)}>
                                            Share
                                        </Button>
                                        <Box flexGrow={1} />
                                        <IconButton size="small" color="error" onClick={(e) => handleDelete(form._id, e)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </RBACGuard>
    );
}

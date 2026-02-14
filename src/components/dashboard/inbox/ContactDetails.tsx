'use client';

import {
    Box,
    Paper,
    Typography,
    Avatar,
    Divider,
    Button,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import { Conversation } from '@/lib/services/inbox.service';
import { useState, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';
import api from '@/lib/api';

interface ContactDetailsProps {
    conversation: Conversation | null;
    businessSlug: string | null;
    onResolve: () => void;
    onReopen: () => void;
    onSendBookingLink: () => void;
    onFormSent?: () => void;
}

export default function ContactDetails({
    conversation,
    businessSlug,
    onResolve,
    onReopen,
    onSendBookingLink,
    onFormSent
}: ContactDetailsProps) {
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);
    const [sendingForm, setSendingForm] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

    useEffect(() => {
        if (formDialogOpen) {
            fetchForms();
        }
    }, [formDialogOpen]);

    const fetchForms = async () => {
        setLoadingForms(true);
        try {
            const response = await formService.getForms();
            if (response.success) {
                setForms(response.data.filter((f: Form) => f.isActive));
            }
        } catch (error) {
            console.error('Failed to fetch forms:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load forms',
                severity: 'error'
            });
        } finally {
            setLoadingForms(false);
        }
    };

    const handleSendForm = async (formId: string) => {
        if (!conversation?.contactId?.email) {
            setSnackbar({
                open: true,
                message: 'Contact email not found',
                severity: 'error'
            });
            return;
        }

        setSendingForm(true);
        try {
            const response = await api.post('/inbox/send-form', {
                conversationId: conversation._id,
                contactEmail: conversation.contactId.email,
                contactName: conversation.contactId.name,
                formId
            });

            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'Form sent successfully!',
                    severity: 'success'
                });
                setFormDialogOpen(false);
                
                // Trigger callback to refresh messages
                if (onFormSent) {
                    onFormSent();
                }
            }
        } catch (error: any) {
            console.error('Failed to send form:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to send form',
                severity: 'error'
            });
        } finally {
            setSendingForm(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (!conversation) return null;

    const { contactId } = conversation;

    return (
        <Paper sx={{
            height: '100%',
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                        fontSize: '2rem',
                        fontWeight: 700,
                        bgcolor: '#7c3aed',
                        border: '4px solid',
                        borderColor: (theme) => theme.palette.background.paper,
                        boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)'
                    }}
                >
                    {contactId?.name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {contactId?.name || 'Unknown Contact'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {contactId?.email}
                </Typography>
                {contactId?.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                        {contactId.phone}
                    </Typography>
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', color: 'text.secondary' }}>
                Quick Actions
            </Typography>

            <Stack spacing={1.5}>
                <Button
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    onClick={onSendBookingLink}
                    disabled={!businessSlug}
                    fullWidth
                    sx={{
                        borderRadius: '12px',
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }
                    }}
                >
                    Send Booking Link
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => setFormDialogOpen(true)}
                    fullWidth
                    sx={{
                        borderRadius: '12px',
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }
                    }}
                >
                    Send Form
                </Button>

                {conversation.status === 'open' ? (
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={onResolve}
                        fullWidth
                        sx={{
                            borderRadius: '12px',
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Mark as Resolved
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<PlayCircleOutlineIcon />}
                        onClick={onReopen}
                        fullWidth
                        sx={{
                            borderRadius: '12px',
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Reopen Conversation
                    </Button>
                )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', color: 'text.secondary' }}>
                Channel
            </Typography>

            <Box>
                <Chip
                    label={conversation.channel.toUpperCase()}
                    color="primary"
                    size="small"
                    sx={{
                        borderRadius: '8px',
                        fontWeight: 600,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)',
                        color: '#7c3aed',
                        border: '1px solid rgba(124, 58, 237, 0.2)'
                    }}
                />
            </Box>

            {/* Send Form Dialog */}
            <Dialog
                open={formDialogOpen}
                onClose={() => !sendingForm && setFormDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Send Form to {contactId?.name}
                </DialogTitle>
                <DialogContent>
                    {loadingForms ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : forms.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No active forms available
                        </Typography>
                    ) : (
                        <List sx={{ pt: 0 }}>
                            {forms.map((form) => (
                                <ListItem key={form._id} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSendForm(form._id)}
                                        disabled={sendingForm}
                                        sx={{
                                            borderRadius: '12px',
                                            mb: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)'
                                            }
                                        }}
                                    >
                                        <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <ListItemText
                                            primary={form.title}
                                            secondary={form.description}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setFormDialogOpen(false)}
                        disabled={sendingForm}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 8 }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        borderRadius: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
}

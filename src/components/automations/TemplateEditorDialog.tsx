'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    useTheme,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import { AutomationSetting } from '@/lib/services/automation.service';

interface TemplateEditorDialogProps {
    open: boolean;
    onClose: () => void;
    automationKey: string;
    automation: AutomationSetting | null;
    onSave: (key: string, subject: string, template: string) => Promise<void>;
    processing: boolean;
}

export default function TemplateEditorDialog({
    open,
    onClose,
    automationKey,
    automation,
    onSave,
    processing,
}: TemplateEditorDialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [emailSubject, setEmailSubject] = useState('');
    const [emailTemplate, setEmailTemplate] = useState('');

    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    useEffect(() => {
        if (automation) {
            setEmailSubject(automation.emailSubject || '');
            setEmailTemplate(automation.emailTemplate || '');
        }
    }, [automation]);

    const handleSave = async () => {
        await onSave(automationKey, emailSubject, emailTemplate);
    };

    // Sample data for preview
    const previewData: Record<string, string> = {
        contactName: 'John Doe',
        businessName: 'Acme Business',
        serviceType: 'Consultation',
        date: 'Monday, February 12, 2026',
        timeSlot: '10:00 AM',
        duration: '60',
        location: '123 Main St',
        formName: 'Client Intake Form',
        formLink: 'https://example.com/form/123',
        itemName: 'Office Supplies',
        currentStock: '5',
        threshold: '10',
    };

    const replaceVars = (text: string) => {
        let result = text;
        Object.entries(previewData).forEach(([varKey, value]) => {
            result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), value);
        });
        return result;
    };

    const previewSubject = replaceVars(emailSubject);
    const previewBody = replaceVars(emailTemplate);

    if (!automation) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '24px',
                        bgcolor: bgColor,
                        boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                        maxHeight: '90vh',
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#ede9fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <EditIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary}>
                            Edit Email Template
                        </Typography>
                        <Typography variant="caption" color={textSecondary}>
                            {automation.name}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3} mt={1}>
                    <Alert
                        severity="info"
                        sx={{
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
                            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#93c5fd'}`,
                        }}
                    >
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Available Variables
                        </Typography>
                        <Typography variant="caption" component="div">
                            {'{{contactName}}'}, {'{{businessName}}'}, {'{{serviceType}}'}, {'{{date}}'}, {'{{timeSlot}}'}, {'{{formName}}'}, {'{{formLink}}'}, {'{{itemName}}'}, {'{{currentStock}}'}, {'{{threshold}}'}
                        </Typography>
                    </Alert>

                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                        {/* Editor */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color={textPrimary} sx={{ mb: 2 }}>
                                Template Editor
                            </Typography>
                            <TextField
                                fullWidth
                                label="Email Subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                                helperText="Use {{variables}} for dynamic content"
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={12}
                                label="Email Template"
                                value={emailTemplate}
                                onChange={(e) => setEmailTemplate(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    }
                                }}
                                helperText="HTML supported. Use {{variables}} for dynamic content"
                            />
                        </Box>

                        {/* Live Preview */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color={textPrimary} sx={{ mb: 2 }}>
                                Live Preview
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                    borderRadius: '12px',
                                    minHeight: 400,
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                }}
                            >
                                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" color={textSecondary}>
                                        Subject:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} color={textPrimary}>
                                        {previewSubject || '(No subject)'}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: isDark ? '#1a1d29' : 'white',
                                        p: 2,
                                        borderRadius: '8px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                        minHeight: 280,
                                        '& p': { margin: '8px 0' },
                                        '& h2': { margin: '12px 0 8px' },
                                        '& strong': { fontWeight: 'bold' },
                                        '& a': { color: '#8b5cf6', textDecoration: 'underline' }
                                    }}
                                >
                                    {previewBody ? (
                                        <div dangerouslySetInnerHTML={{ __html: previewBody }} />
                                    ) : (
                                        <Typography variant="body2" color={textSecondary} fontStyle="italic">
                                            (No content)
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" color={textSecondary} fontStyle="italic">
                                        Preview uses sample data. Actual emails will use real contact information.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
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
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        bgcolor: '#8b5cf6',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                        '&:hover': {
                            bgcolor: '#7c3aed',
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                        }
                    }}
                >
                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Template'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

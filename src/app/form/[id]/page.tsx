'use client';

import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Checkbox,
    FormGroup,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    Divider,
    Avatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formService, Form } from '@/lib/services/form.service';

export default function PublicFormPage() {
    const params = useParams();
    const id = params?.id as string;

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchForm = async () => {
            try {
                const data = await formService.getPublicForm(id);
                if (data.success) {
                    setForm(data.data);
                }
            } catch (error) {
                console.error('Failed to load form', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [id]);

    const handleAnswerChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleSubmit = async () => {
        if (!id) return;

        setSubmitting(true);
        try {
            await formService.submitForm(id, answers);
            setSubmitted(true);
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                }}
            >
                <CircularProgress sx={{ color: '#667eea' }} size={40} />
            </Box>
        );
    }

    if (submitted) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: '16px',
                            bgcolor: 'white',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                bgcolor: '#d1fae5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="700" color="#111827" gutterBottom>
                            Thank You!
                        </Typography>
                        <Typography variant="body2" color="#6B7280" sx={{ mb: 3 }}>
                            Your response has been recorded successfully.
                        </Typography>
                        {form?.business && (
                            <Typography variant="caption" color="#9CA3AF" sx={{ fontSize: '0.75rem' }}>
                                {form.business.name} will get back to you soon.
                            </Typography>
                        )}
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (!form) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#F3F4F6',
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: '16px',
                            bgcolor: 'white',
                            border: '1px solid #E5E7EB',
                        }}
                    >
                        <Typography variant="h6" color="#6B7280">
                            Form not found or no longer available.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F3F4F6',
                py: 6,
                px: 2,
            }}
        >
            <Container maxWidth="md">
                {/* Business Header Card */}
                {form.business && (
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="700" color="#111827" gutterBottom>
                            {form.business.name}
                        </Typography>
                        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={3} mt={1}>
                            {form.business.email && (
                                <Typography variant="body2" color="#6B7280" sx={{ fontSize: '0.875rem' }}>
                                    {form.business.email}
                                </Typography>
                            )}
                            {form.business.phone && (
                                <Typography variant="body2" color="#6B7280" sx={{ fontSize: '0.875rem' }}>
                                    {form.business.phone}
                                </Typography>
                            )}
                            {form.business.website && (
                                <Typography
                                    component="a"
                                    href={form.business.website}
                                    target="_blank"
                                    variant="body2"
                                    sx={{
                                        fontSize: '0.875rem',
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    {form.business.website.replace(/^https?:\/\//, '')}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Form Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: '16px',
                        bgcolor: 'white',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    {/* Form Header */}
                    <Box mb={4}>
                        <Typography
                            variant="h4"
                            fontWeight="800"
                            color="#111827"
                            gutterBottom
                            sx={{ letterSpacing: '-0.5px', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}
                        >
                            {form.title}
                        </Typography>
                        {form.description && (
                            <Typography variant="body1" color="#6B7280" sx={{ mt: 1, lineHeight: 1.6, fontSize: '0.95rem' }}>
                                {form.description}
                            </Typography>
                        )}
                    </Box>

                    {/* Form Fields */}
                    <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                        {form.fields.map((field, index) => (
                            <Box key={field.id}>
                                {field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' || field.type === 'date' ? (
                                    <Box>
                                        <InputLabel
                                            shrink={false}
                                            sx={{
                                                mb: 0.5,
                                                color: '#374151',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                transform: 'none',
                                                position: 'static'
                                            }}
                                        >
                                            {field.label}
                                        </InputLabel>
                                        <TextField
                                            fullWidth
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                            variant="outlined"
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': {
                                                        borderColor: '#E5E7EB',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#D1D5DB',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea',
                                                        borderWidth: '1px',
                                                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                                    },
                                                    '& input': {
                                                        py: 1.2,
                                                        px: 1.5,
                                                        fontSize: '0.875rem',
                                                        color: '#111827',
                                                    }
                                                },
                                            }}
                                        />
                                    </Box>
                                ) : field.type === 'textarea' ? (
                                    <Box>
                                        <InputLabel
                                            shrink={false}
                                            sx={{
                                                mb: 0.5,
                                                color: '#374151',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                transform: 'none',
                                                position: 'static'
                                            }}
                                        >
                                            {field.label}
                                        </InputLabel>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    bgcolor: 'white',
                                                    '& fieldset': {
                                                        borderColor: '#E5E7EB',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#D1D5DB',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#667eea',
                                                        borderWidth: '1px',
                                                        boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                                    },
                                                    '& textarea': {
                                                        fontSize: '0.875rem',
                                                        color: '#111827',
                                                    }
                                                },
                                            }}
                                        />
                                    </Box>
                                ) : field.type === 'select' ? (
                                    <Box>
                                        <InputLabel
                                            shrink={false}
                                            sx={{
                                                mb: 0.5,
                                                color: '#374151',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                transform: 'none',
                                                position: 'static'
                                            }}
                                        >
                                            {field.label}
                                        </InputLabel>
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                            sx={{
                                                borderRadius: '8px',
                                                bgcolor: 'white',
                                                fontSize: '0.875rem',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#E5E7EB',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#D1D5DB',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#667eea',
                                                    borderWidth: '1px',
                                                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                                },
                                            }}
                                        >
                                            <MenuItem disabled value="">
                                                <Typography color="#9CA3AF" fontSize="0.875rem">Select an option</Typography>
                                            </MenuItem>
                                            {field.options?.map(opt => (
                                                <MenuItem key={opt} value={opt} sx={{ fontSize: '0.875rem' }}>{opt}</MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                ) : field.type === 'checkbox' ? (
                                    <FormControl component="fieldset">
                                        <FormLabel
                                            component="legend"
                                            sx={{
                                                color: '#374151',
                                                fontWeight: 600,
                                                mb: 1,
                                                fontSize: '0.875rem',
                                                '&.Mui-focused': {
                                                    color: '#374151',
                                                },
                                            }}
                                        >
                                            {field.label}
                                        </FormLabel>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        onChange={(e) => handleAnswerChange(field.id, e.target.checked)}
                                                        sx={{
                                                            color: '#D1D5DB',
                                                            '&.Mui-checked': {
                                                                color: '#667eea',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={<Typography sx={{ fontSize: '0.875rem', color: '#4B5563' }}>{field.placeholder || 'Yes, I agree'}</Typography>}
                                            />
                                        </FormGroup>
                                    </FormControl>
                                ) : null}
                            </Box>
                        ))}

                        <Button
                            variant="contained"
                            fullWidth
                            disabled={submitting}
                            onClick={handleSubmit}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                bgcolor: '#7C3AED', // Deeper purple for button
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#6D28D9',
                                    boxShadow: 'none',
                                },
                                '&:disabled': {
                                    bgcolor: '#E5E7EB',
                                    color: '#9CA3AF'
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Box mt={4} pt={3} sx={{ textAlign: 'center' }}>
                        {/* Removed distracting border top */}
                        <Typography variant="caption" color="#9CA3AF" sx={{ fontSize: '0.75rem' }}>
                            Powered by Veltro
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

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
    InputLabel
} from '@mui/material';
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

        try {
            await formService.submitForm(id, answers);
            setSubmitted(true);
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit form.');
        }
    };

    if (loading) return <Container sx={{ py: 8 }}><CircularProgress /></Container>;

    if (submitted) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" gutterBottom>Thank You!</Typography>
                    <Typography variant="body1">Your response has been recorded successfully.</Typography>
                </Paper>
            </Container>
        );
    }

    if (!form) return <Container sx={{ py: 8 }}><Typography>Form not found.</Typography></Container>;

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box mb={4} textAlign="center">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {form.title}
                    </Typography>
                    {form.description && (
                        <Typography variant="body1" color="textSecondary">
                            {form.description}
                        </Typography>
                    )}
                </Box>

                <Box component="form" display="flex" flexDirection="column" gap={3}>
                    {form.fields.map((field) => (
                        <Box key={field.id}>
                            {field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' || field.type === 'date' ? (
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                    variant="outlined"
                                    required={field.required}
                                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                />
                            ) : field.type === 'textarea' ? (
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                />
                            ) : field.type === 'select' ? (
                                <FormControl fullWidth>
                                    <InputLabel>{field.label}</InputLabel>
                                    <Select
                                        label={field.label}
                                        onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                                    >
                                        {field.options?.map(opt => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : field.type === 'checkbox' ? (
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">{field.label}</FormLabel>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Checkbox onChange={(e) => handleAnswerChange(field.id, e.target.checked)} />}
                                            label={field.label} // Using label as checkbox text for simple boolean checkbox
                                        />
                                    </FormGroup>
                                </FormControl>
                            ) : null}
                        </Box>
                    ))}

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleSubmit}
                    >
                        Submit Form
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

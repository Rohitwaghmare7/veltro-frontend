'use client';

import {
    Box,
    Paper,
    Typography,
    Avatar,
    Divider,
    Button,
    Stack,
    Chip
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Conversation } from '@/lib/services/inbox.service';

interface ContactDetailsProps {
    conversation: Conversation | null;
    businessSlug: string | null;
    onResolve: () => void;
    onReopen: () => void;
    onSendBookingLink: () => void;
}

export default function ContactDetails({
    conversation,
    businessSlug,
    onResolve,
    onReopen,
    onSendBookingLink
}: ContactDetailsProps) {

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
        </Paper>
    );
}

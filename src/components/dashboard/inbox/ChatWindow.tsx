'use client';

import {
    Box,
    Paper,
    Typography,
    Avatar,
    IconButton,
    TextField,
    Button,
    Chip,
    CircularProgress,
    Tooltip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddIcon from '@mui/icons-material/Add';
import { Conversation, Message } from '@/lib/services/inbox.service';
import { useState, useRef, useEffect } from 'react';
import { formService, Form } from '@/lib/services/form.service';
import api from '@/lib/api';

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string, attachments?: File[]) => void;
    sending: boolean;
    onResolve: () => void;
    onReopen: () => void;
    onResumeAutomation: () => void;
    businessSlug: string | null;
    onSendBookingLink: () => void;
    onNewConversation?: () => void;
}
export default function ChatWindow({
    conversation,
    messages,
    onSendMessage,
    sending,
    onResolve,
    onReopen,
    onResumeAutomation,
    businessSlug,
    onSendBookingLink,
    onNewConversation
}: ChatWindowProps) {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);
    const [sendingForm, setSendingForm] = useState(false);

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || sending) return;
        onSendMessage(input, attachments);
        setInput('');
        setAttachments([]);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        
        // Check individual file sizes
        const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            alert(`The following files exceed 25MB limit:\n${oversizedFiles.map(f => f.name).join('\n')}`);
            return;
        }

        // Check total size
        const currentSize = attachments.reduce((sum, f) => sum + f.size, 0);
        const newSize = files.reduce((sum, f) => sum + f.size, 0);
        if (currentSize + newSize > MAX_TOTAL_SIZE) {
            alert('Total attachment size cannot exceed 25MB');
            return;
        }

        setAttachments(prev => [...prev, ...files]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const fetchForms = async () => {
        setLoadingForms(true);
        try {
            const response = await formService.getForms();
            if (response.success) {
                setForms(response.data.filter((f: Form) => f.isActive));
            }
        } catch (error) {
            console.error('Failed to fetch forms:', error);
        } finally {
            setLoadingForms(false);
        }
    };

    const handleSendForm = async (formId: string) => {
        if (!conversation?.contactId?.email) return;

        setSendingForm(true);
        try {
            const response = await api.post('/inbox/send-form', {
                conversationId: conversation._id,
                contactEmail: conversation.contactId.email,
                contactName: conversation.contactId.name,
                formId
            });

            if (response.data.success) {
                setFormDialogOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to send form:', error);
        } finally {
            setSendingForm(false);
        }
    };

    useEffect(() => {
        if (formDialogOpen) {
            fetchForms();
        }
    }, [formDialogOpen]);

    if (!conversation) {
        return (
            <Paper sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Box textAlign="center" sx={{ maxWidth: 500, px: 4 }}>
                    {/* Icon */}
                    <Box sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255, 107, 107, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px'
                    }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: '#ff6b6b' }} />
                    </Box>

                    {/* Heading */}
                    <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
                    }}>
                        Start a Conversation
                    </Typography>

                    {/* Description */}
                    <Typography variant="body1" sx={{ 
                        color: '#9ca3af',
                        mb: 4,
                        fontSize: '1rem',
                        lineHeight: 1.6
                    }}>
                        Select a conversation from the list or create a new one to get started
                    </Typography>

                    {/* New Conversation Button */}
                    <Box
                        onClick={onNewConversation}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: '#ff6b6b',
                            color: '#ffffff',
                            px: 4,
                            py: 1.5,
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: '#ff5252',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)'
                            }
                        }}
                    >
                        <AddIcon sx={{ fontSize: 20 }} />
                        New Conversation
                    </Box>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 1,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{
                        bgcolor: '#ff6b6b',
                        fontWeight: 600,
                        boxShadow: '0 0 10px rgba(255, 107, 107, 0.4)'
                    }}>
                        {conversation.contactId?.name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {conversation.contactId?.name || 'Unknown Contact'}
                            </Typography>
                            {conversation.metadata?.gmailThreadId && (
                                <Chip
                                    icon={<EmailOutlinedIcon sx={{ fontSize: 14 }} />}
                                    label="Gmail"
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem', borderRadius: '6px' }}
                                />
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.25 }}>
                            {conversation.contactId?.email || 'No email'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Warning Alert */}
            {conversation.automationPaused && (
                <Alert
                    severity="warning"
                    action={
                        <Button color="inherit" size="small" onClick={onResumeAutomation}>
                            RESUME
                        </Button>
                    }
                    sx={{ borderRadius: 0 }}
                >
                    Automation is paused for this contact.
                </Alert>
            )}

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ opacity: 0.5 }}>
                        <Typography variant="body2">No messages yet. Start the conversation!</Typography>
                    </Box>
                ) : (
                    messages.map((msg) => {
                        const isOutbound = msg.direction === 'outbound';
                        return (
                            <Box
                                key={msg._id}
                                sx={{
                                    alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%'
                                }}
                            >
                                <Paper sx={{
                                    p: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? 0 : 1.5,
                                    borderRadius: '4px',
                                    bgcolor: isOutbound
                                        ? (msg.type === 'automated' ? 'rgba(255, 107, 107, 0.15)' : '#ff6b6b')
                                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                                    color: isOutbound && msg.type !== 'automated' ? '#fff' : 'text.primary',
                                    border: 'none',
                                    position: 'relative',
                                    boxShadow: 'none',
                                    overflow: 'hidden',
                                    minWidth: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? '300px' : 'auto',
                                    width: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? '100%' : 'auto'
                                }}>
                                    {msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? (
                                        <Box sx={{ width: '100%', height: '400px', bgcolor: '#fff' }}>
                                            <iframe
                                                srcDoc={msg.content}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none',
                                                    borderRadius: '12px'
                                                }}
                                                title="Message Content"
                                                sandbox="allow-popups allow-popups-to-escape-sandbox"
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere',
                                            fontSize: '0.875rem'
                                        }}>
                                            {msg.content}
                                        </Typography>
                                    )}
                                </Paper>
                                <Box display="flex" justifyContent={isOutbound ? 'flex-end' : 'flex-start'} mt={0.5} gap={0.5} sx={{ opacity: 0.7 }}>
                                    <Typography variant="caption" fontSize="0.7rem">
                                        {formatTime(msg.sentAt)}
                                    </Typography>
                                    {isOutbound && msg.type === 'manual' && (
                                        <PersonOutlineIcon sx={{ fontSize: 12 }} />
                                    )}
                                </Box>
                            </Box>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {attachments.map((file, index) => (
                            <Chip
                                key={index}
                                label={`${file.name} (${formatFileSize(file.size)})`}
                                onDelete={() => handleRemoveAttachment(index)}
                                size="small"
                                sx={{
                                    maxWidth: '200px',
                                    fontSize: '0.75rem',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
                
                <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    p: 0.5,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'flex-end'
                }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="*/*"
                    />
                    <Tooltip title="Attach files">
                        <IconButton
                            size="small"
                            sx={{ color: '#9ca3af' }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending || conversation?.status === 'resolved'}
                        >
                            <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Send booking link">
                        <IconButton
                            size="small"
                            sx={{ color: '#9ca3af' }}
                            onClick={onSendBookingLink}
                            disabled={sending || conversation?.status === 'resolved' || !businessSlug}
                        >
                            <LinkIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Send form">
                        <IconButton
                            size="small"
                            sx={{ color: '#9ca3af' }}
                            onClick={() => setFormDialogOpen(true)}
                            disabled={sending || conversation?.status === 'resolved'}
                        >
                            <DescriptionIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={sending || conversation?.status === 'resolved'}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                p: 1,
                                fontSize: '0.875rem',
                                '& fieldset': { border: 'none' },
                                '& textarea': {
                                    fontSize: '0.875rem'
                                }
                            },
                            '& .MuiInputBase-input::placeholder': {
                                fontSize: '0.875rem',
                                color: '#9ca3af'
                            }
                        }}
                    />
                    <IconButton
                        size="small"
                        onClick={handleSend}
                        disabled={!input.trim() || sending || conversation?.status === 'resolved'}
                        sx={{
                            bgcolor: '#ff6b6b',
                            color: 'white',
                            '&:hover': { bgcolor: '#ff5252' },
                            '&.Mui-disabled': { bgcolor: '#d1d5db', color: '#9ca3af' }
                        }}
                    >
                        {sending ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                </Box>
            </Box>

            {/* Send Form Dialog */}
            <Dialog
                open={formDialogOpen}
                onClose={() => !sendingForm && setFormDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '16px',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff'
                        }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', pb: 1 }}>
                    Send Form to {conversation?.contactId?.name}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {loadingForms ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : forms.length === 0 ? (
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }} textAlign="center" py={4}>
                            No active forms available
                        </Typography>
                    ) : (
                        <List sx={{ pt: 0 }}>
                            {forms.map((form) => (
                                <ListItem key={form._id} disablePadding sx={{ mb: 0.75 }}>
                                    <ListItemButton
                                        onClick={() => handleSendForm(form._id)}
                                        disabled={sendingForm}
                                        sx={{
                                            borderRadius: '8px',
                                            py: 1,
                                            px: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                borderColor: '#ff6b6b',
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)'
                                            }
                                        }}
                                    >
                                        <DescriptionIcon sx={{ mr: 1.5, color: '#ff6b6b', fontSize: 20 }} />
                                        <ListItemText
                                            primary={form.title}
                                            secondary={form.description}
                                            primaryTypographyProps={{ 
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}
                                            secondaryTypographyProps={{
                                                sx: { 
                                                    color: '#9ca3af',
                                                    fontSize: '0.75rem',
                                                    mt: 0.25
                                                }
                                            }}
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
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            color: '#000000',
                            fontSize: '0.875rem'
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

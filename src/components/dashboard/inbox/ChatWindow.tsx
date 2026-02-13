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
    Alert
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import { Conversation, Message } from '@/lib/services/inbox.service';
import { useState, useRef, useEffect } from 'react';

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string, attachments?: File[]) => void;
    sending: boolean;
    onResolve: () => void;
    onReopen: () => void;
    onResumeAutomation: () => void;
}

export default function ChatWindow({
    conversation,
    messages,
    onSendMessage,
    sending,
    onResolve,
    onReopen,
    onResumeAutomation
}: ChatWindowProps) {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!conversation) {
        return (
            <Paper sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '24px',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff',
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Box textAlign="center">
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Select a conversation
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Choose a contact from the list to start messaging
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
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
                        bgcolor: '#7c3aed',
                        fontWeight: 600,
                        boxShadow: '0 0 10px rgba(124, 58, 237, 0.4)'
                    }}>
                        {conversation.contactId.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {conversation.contactId.name}
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
                        <Typography variant="caption" color="text.secondary">
                            {conversation.contactId.email}
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
                                    p: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? 0 : 2,
                                    borderRadius: '16px',
                                    borderTopRightRadius: isOutbound ? '4px' : '16px',
                                    borderTopLeftRadius: !isOutbound ? '4px' : '16px',
                                    bgcolor: isOutbound
                                        ? (msg.type === 'automated' ? 'rgba(124, 58, 237, 0.1)' : '#7c3aed')
                                        : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                                    color: isOutbound && msg.type !== 'automated' ? '#fff' : 'text.primary',
                                    border: msg.type === 'automated' ? '1px dashed rgba(124, 58, 237, 0.4)' : 'none',
                                    position: 'relative',
                                    boxShadow: 'none',
                                    overflow: 'hidden',
                                    minWidth: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? '300px' : 'auto',
                                    width: msg.content.trim().toLowerCase().startsWith('<!doctype') || msg.content.trim().toLowerCase().startsWith('<html') ? '100%' : 'auto'
                                }}>
                                    {msg.type === 'automated' && (
                                        <Tooltip title="Automated Message">
                                            <SmartToyOutlinedIcon sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -5,
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                                fontSize: 18,
                                                color: 'primary.main',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                zIndex: 1
                                            }} />
                                        </Tooltip>
                                    )}
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
                                            lineHeight: 1.6,
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere'
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
                    gap: 1,
                    p: 0.5,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="*/*"
                    />
                    <Tooltip title="Attach files (max 25MB total)">
                        <IconButton
                            sx={{ color: 'text.secondary', alignSelf: 'flex-end', mb: 0.5 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending || conversation.status === 'resolved'}
                        >
                            <AttachFileOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={sending || conversation.status === 'resolved'}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                p: 1.5,
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={!input.trim() || sending || conversation.status === 'resolved'}
                        sx={{
                            alignSelf: 'flex-end',
                            mb: 0.5,
                            bgcolor: '#7c3aed',
                            color: 'white',
                            '&:hover': { bgcolor: '#6d28d9' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        {sending ? <CircularProgress size={24} color="inherit" /> : <SendOutlinedIcon />}
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
}

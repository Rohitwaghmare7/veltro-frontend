'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Divider,
    TextField,
    IconButton,
    Chip,
    Stack,
    Grid,
    CircularProgress,
    Badge,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { inboxService, Conversation, Message } from '@/lib/services/inbox.service';
import { initializeSocket, onNewMessage, onConversationUpdate, offNewMessage, offConversationUpdate } from '@/lib/socket';
import RBACGuard from '@/components/dashboard/RBACGuard';

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Initialize Socket.io
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const socket = initializeSocket(token);

            // Listen for new messages
            onNewMessage((message: Message) => {
                if (selectedConversation && message.conversationId === selectedConversation._id) {
                    setMessages(prev => [...prev, message]);
                }
                // Update conversation list
                fetchConversations();
            });

            // Listen for conversation updates
            onConversationUpdate((conversation: Conversation) => {
                setConversations(prev =>
                    prev.map(c => c._id === conversation._id ? conversation : c)
                );
            });
        }

        return () => {
            offNewMessage();
            offConversationUpdate();
        };
    }, [selectedConversation]);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const response = await inboxService.getConversations({
                search: searchQuery || undefined
            });
            if (response.success) {
                setConversations(response.data);
                // Auto-select first conversation if none selected
                if (!selectedConversation && response.data.length > 0) {
                    setSelectedConversation(response.data[0]);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedConversation]);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async () => {
        if (!selectedConversation) return;

        try {
            const response = await inboxService.getMessages(selectedConversation._id);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch messages:', err);
        }
    }, [selectedConversation]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
        }
    }, [selectedConversation, fetchMessages]);

    const handleSend = async () => {
        if (!input.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const response = await inboxService.sendReply(selectedConversation._id, {
                content: input,
                channel: selectedConversation.channel
            });

            if (response.success) {
                setMessages(prev => [...prev, response.data]);
                setInput('');
                // Refresh conversations to update last message
                fetchConversations();
            }
        } catch (err: any) {
            console.error('Failed to send message:', err);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <RBACGuard permission="canViewInbox">
            <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
                {/* Conversation List Panel */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box p={2}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                            />
                        </Box>
                        <Divider />
                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {conversations.length === 0 ? (
                                <Box p={3} textAlign="center">
                                    <Typography variant="body2" color="textSecondary">
                                        No conversations yet
                                    </Typography>
                                </Box>
                            ) : (
                                conversations.map((conv) => (
                                    <ListItem key={conv._id} disablePadding>
                                        <ListItemButton
                                            selected={selectedConversation?._id === conv._id}
                                            onClick={() => setSelectedConversation(conv)}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    badgeContent={conv.unreadCount}
                                                    color="primary"
                                                    invisible={conv.unreadCount === 0}
                                                >
                                                    <Avatar alt={conv.contactId.name}>
                                                        {conv.contactId.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle2" fontWeight={conv.unreadCount > 0 ? 'bold' : 'normal'}>
                                                            {conv.contactId.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {formatTime(conv.lastMessageAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            color="textSecondary"
                                                            noWrap
                                                            fontWeight={conv.unreadCount > 0 ? 'bold' : 'normal'}
                                                        >
                                                            {conv.lastMessage?.content || 'No messages yet'}
                                                        </Typography>
                                                        {conv.automationPaused && (
                                                            <Chip
                                                                icon={<PauseCircleIcon />}
                                                                label="Automation Paused"
                                                                size="small"
                                                                color="warning"
                                                                sx={{ mt: 0.5, height: 20 }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Chat Window Panel */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom={1} borderColor="divider">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar>
                                            {selectedConversation.contactId.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {selectedConversation.contactId.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {selectedConversation.contactId.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton>
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                {/* Messages Area */}
                                <Box flexGrow={1} p={2} sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {messages.length === 0 ? (
                                        <Box textAlign="center" py={4}>
                                            <Typography variant="body2" color="textSecondary">
                                                No messages yet. Start the conversation!
                                            </Typography>
                                        </Box>
                                    ) : (
                                        messages.map((msg) => (
                                            <Box
                                                key={msg._id}
                                                alignSelf={msg.direction === 'outbound' ? 'flex-end' : 'flex-start'}
                                                maxWidth="70%"
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: msg.direction === 'outbound' ? 'primary.main' : 'grey.100',
                                                        color: msg.direction === 'outbound' ? 'white' : 'text.primary',
                                                        borderRadius: 2,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {msg.type === 'automated' && (
                                                        <Chip
                                                            icon={<SmartToyIcon />}
                                                            label="Automated"
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -10,
                                                                right: 8,
                                                                height: 20,
                                                                fontSize: '0.7rem'
                                                            }}
                                                            color="info"
                                                        />
                                                    )}
                                                    <Typography variant="body1">{msg.content}</Typography>
                                                </Paper>
                                                <Box display="flex" alignItems="center" gap={0.5} ml={1} mt={0.5}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {formatTime(msg.sentAt)}
                                                    </Typography>
                                                    {msg.type === 'manual' && (
                                                        <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                {/* Input Area */}
                                <Box p={2} borderTop={1} borderColor="divider">
                                    <Stack direction="row" spacing={1}>
                                        <IconButton disabled>
                                            <AttachFileIcon />
                                        </IconButton>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Type a message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
                                            disabled={sending}
                                        />
                                        <IconButton
                                            color="primary"
                                            onClick={handleSend}
                                            disabled={!input.trim() || sending}
                                        >
                                            {sending ? <CircularProgress size={24} /> : <SendIcon />}
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <Typography variant="body1" color="textSecondary">
                                    Select a conversation to start messaging
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Contact Details Panel */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
                    <Paper sx={{ height: '100%', p: 2, overflow: 'auto' }}>
                        {selectedConversation ? (
                            <>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                                    <Avatar
                                        sx={{ width: 80, height: 80, mb: 1, fontSize: '2rem' }}
                                    >
                                        {selectedConversation.contactId.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="h6">{selectedConversation.contactId.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {selectedConversation.contactId.email}
                                    </Typography>
                                    {selectedConversation.contactId.phone && (
                                        <Typography variant="body2" color="textSecondary">
                                            {selectedConversation.contactId.phone}
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" gutterBottom>Channel</Typography>
                                <Chip
                                    label={selectedConversation.channel.toUpperCase()}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />

                                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                                <Chip
                                    label={selectedConversation.status.toUpperCase()}
                                    size="small"
                                    color={selectedConversation.status === 'open' ? 'success' : 'default'}
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />

                                {selectedConversation.automationPaused && (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>Automation</Typography>
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            Automation is paused for this contact
                                        </Alert>
                                    </>
                                )}

                                {selectedConversation.contactId.notes && (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>Initial Message</Typography>
                                        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'grey.50' }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {selectedConversation.contactId.notes}
                                            </Typography>
                                        </Paper>
                                    </>
                                )}

                                {selectedConversation.contactId.source && (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>Source</Typography>
                                        <Chip
                                            label={selectedConversation.contactId.source.replace('_', ' ').toUpperCase()}
                                            size="small"
                                            color="default"
                                            variant="outlined"
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <Typography variant="body2" color="textSecondary" textAlign="center">
                                Select a conversation to view details
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </RBACGuard>
    );
}

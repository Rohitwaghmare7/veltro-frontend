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
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    Button,
    Menu,
    MenuItem,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    Card,
    CardContent,
    Tooltip,
    Link as MuiLink,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import { inboxService, Conversation, Message } from '@/lib/services/inbox.service';
import { initializeSocket, onNewMessage, onConversationUpdate, offNewMessage, offConversationUpdate } from '@/lib/socket';
import RBACGuard from '@/components/dashboard/RBACGuard';
import Link from 'next/link';

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
    const [channelMode, setChannelMode] = useState<'email' | 'sms'>('email');
    const [composeDrawerOpen, setComposeDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [linkedBookings, setLinkedBookings] = useState<any[]>([]);
    const [linkedForms, setLinkedForms] = useState<any[]>([]);
    const [loadingLinked, setLoadingLinked] = useState(false);
    const [businessSlug, setBusinessSlug] = useState<string>('');

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

    // Fetch business slug
    useEffect(() => {
        const fetchBusinessSlug = async () => {
            try {
                const response = await fetch('/api/onboarding/business', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (data.success && data.data.bookingSlug) {
                    setBusinessSlug(data.data.bookingSlug);
                }
            } catch (err) {
                console.error('Failed to fetch business slug:', err);
            }
        };
        fetchBusinessSlug();
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const response = await inboxService.getConversations({
                status: statusFilter === 'all' ? undefined : statusFilter,
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
    }, [searchQuery, statusFilter, selectedConversation]);

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

    // Fetch linked bookings and forms
    const fetchLinkedData = useCallback(async () => {
        if (!selectedConversation) return;

        setLoadingLinked(true);
        try {
            const [bookingsRes, formsRes] = await Promise.all([
                inboxService.getContactBookings(selectedConversation.contactId._id),
                inboxService.getContactSubmissions(selectedConversation.contactId._id),
            ]);

            if (bookingsRes.success) {
                setLinkedBookings(bookingsRes.data);
            }
            if (formsRes.success) {
                setLinkedForms(formsRes.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch linked data:', err);
        } finally {
            setLoadingLinked(false);
        }
    }, [selectedConversation]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
            fetchLinkedData();
        }
    }, [selectedConversation, fetchMessages, fetchLinkedData]);

    const handleSend = async () => {
        if (!input.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const response = await inboxService.sendReply(selectedConversation._id, {
                content: input,
                channel: channelMode
            });

            if (response.success) {
                setMessages(prev => [...prev, response.data]);
                setInput('');
                setComposeDrawerOpen(false);
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

    const handleResolve = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.resolveConversation(selectedConversation._id);
            setSelectedConversation(prev => prev ? { ...prev, status: 'resolved' } : null);
            fetchConversations();
            handleMenuClose();
        } catch (err) {
            console.error('Failed to resolve conversation:', err);
        }
    };

    const handleReopen = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.reopenConversation(selectedConversation._id);
            setSelectedConversation(prev => prev ? { ...prev, status: 'open' } : null);
            fetchConversations();
            handleMenuClose();
        } catch (err) {
            console.error('Failed to reopen conversation:', err);
        }
    };

    const handleResumeAutomation = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.resumeAutomation(selectedConversation._id);
            setSelectedConversation(prev => prev ? { ...prev, automationPaused: false } : null);
            fetchConversations();
            handleMenuClose();
        } catch (err) {
            console.error('Failed to resume automation:', err);
        }
    };

    const handleSendBookingLink = () => {
        if (!selectedConversation || !businessSlug) return;
        const bookingUrl = `${window.location.origin}/book/${businessSlug}`;
        setInput(`Hi! You can book an appointment here: ${bookingUrl}`);
        setComposeDrawerOpen(true);
        handleMenuClose();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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

    const filteredConversations = conversations;

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
            <Box>
                {/* Header with Filters */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" fontWeight="bold">Inbox</Typography>
                    <ToggleButtonGroup
                        value={statusFilter}
                        exclusive
                        onChange={(e, newFilter) => newFilter && setStatusFilter(newFilter)}
                        size="small"
                    >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="open">Open</ToggleButton>
                        <ToggleButton value="resolved">Resolved</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={2} sx={{ height: 'calc(100vh - 180px)' }}>
                    {/* Conversation List Panel */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box p={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                                />
                            </Box>
                            <Divider />
                            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {filteredConversations.length === 0 ? (
                                    <Box p={3} textAlign="center">
                                        <Typography variant="body2" color="textSecondary">
                                            No conversations yet
                                        </Typography>
                                    </Box>
                                ) : (
                                    filteredConversations.map((conv) => (
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
                                                            <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                                                {conv.status === 'resolved' && (
                                                                    <Chip
                                                                        icon={<CheckCircleIcon />}
                                                                        label="Resolved"
                                                                        size="small"
                                                                        color="success"
                                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                                    />
                                                                )}
                                                                {conv.automationPaused && (
                                                                    <Chip
                                                                        icon={<PauseCircleIcon />}
                                                                        label="Paused"
                                                                        size="small"
                                                                        color="warning"
                                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                                    />
                                                                )}
                                                            </Box>
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
                                                <Box display="flex" gap={1} alignItems="center">
                                                    <Typography variant="caption" color="textSecondary">
                                                        {selectedConversation.contactId.email}
                                                    </Typography>
                                                    {selectedConversation.status === 'resolved' && (
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label="Resolved"
                                                            size="small"
                                                            color="success"
                                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <IconButton onClick={handleMenuOpen}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Automation Paused Alert */}
                                    {selectedConversation.automationPaused && (
                                        <Alert
                                            severity="warning"
                                            sx={{ m: 2, mb: 0 }}
                                            action={
                                                <Button size="small" onClick={handleResumeAutomation}>
                                                    Resume
                                                </Button>
                                            }
                                        >
                                            Automation is paused for this contact
                                        </Alert>
                                    )}

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
                                                        elevation={msg.type === 'automated' ? 0 : 1}
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: msg.direction === 'outbound'
                                                                ? (msg.type === 'automated' ? 'info.light' : 'primary.main')
                                                                : 'grey.100',
                                                            color: msg.direction === 'outbound' ? 'white' : 'text.primary',
                                                            borderRadius: 2,
                                                            position: 'relative',
                                                            border: msg.type === 'automated' ? '1px dashed' : 'none',
                                                            borderColor: msg.type === 'automated' ? 'info.main' : 'transparent',
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
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {msg.content}
                                                        </Typography>
                                                    </Paper>
                                                    <Box display="flex" alignItems="center" gap={0.5} ml={1} mt={0.5}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {formatTime(msg.sentAt)}
                                                        </Typography>
                                                        {msg.type === 'manual' && (
                                                            <Tooltip title="Manual message">
                                                                <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ))
                                        )}
                                    </Box>

                                    {/* Quick Reply Input */}
                                    <Box p={2} borderTop={1} borderColor="divider">
                                        <Stack direction="row" spacing={1}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Type a quick reply..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !sending && handleSend()}
                                                disabled={sending || selectedConversation.status === 'resolved'}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={() => setComposeDrawerOpen(true)}
                                                disabled={selectedConversation.status === 'resolved'}
                                            >
                                                Compose
                                            </Button>
                                            <IconButton
                                                color="primary"
                                                onClick={handleSend}
                                                disabled={!input.trim() || sending || selectedConversation.status === 'resolved'}
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

                                    {/* Quick Actions */}
                                    <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
                                    <Stack spacing={1} mb={2}>
                                        <Button
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            startIcon={<LinkIcon />}
                                            onClick={handleSendBookingLink}
                                            disabled={!businessSlug}
                                        >
                                            Send Booking Link
                                        </Button>
                                        {selectedConversation.status === 'open' ? (
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={handleResolve}
                                            >
                                                Mark Resolved
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                startIcon={<PlayCircleIcon />}
                                                onClick={handleReopen}
                                            >
                                                Reopen
                                            </Button>
                                        )}
                                    </Stack>

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

                                    <Divider sx={{ my: 2 }} />

                                    {/* Linked Bookings */}
                                    <Typography variant="subtitle2" gutterBottom>
                                        Linked Bookings ({linkedBookings.length})
                                    </Typography>
                                    {loadingLinked ? (
                                        <CircularProgress size={20} />
                                    ) : linkedBookings.length > 0 ? (
                                        <Stack spacing={1} mb={2}>
                                            {linkedBookings.slice(0, 3).map((booking) => (
                                                <Card key={booking._id} variant="outlined" sx={{ cursor: 'pointer' }}>
                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                            <EventIcon fontSize="small" color="primary" />
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {booking.serviceType}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                                                        </Typography>
                                                        <Chip
                                                            label={booking.status}
                                                            size="small"
                                                            color={booking.status === 'confirmed' ? 'success' : 'default'}
                                                            sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                                                        />
                                                        <Link href={`/dashboard/bookings/${booking._id}`} passHref>
                                                            <MuiLink variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                                View Details →
                                                            </MuiLink>
                                                        </Link>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {linkedBookings.length > 3 && (
                                                <Typography variant="caption" color="textSecondary">
                                                    +{linkedBookings.length - 3} more bookings
                                                </Typography>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" mb={2}>
                                            No bookings yet
                                        </Typography>
                                    )}

                                    {/* Linked Forms */}
                                    <Typography variant="subtitle2" gutterBottom>
                                        Form Submissions ({linkedForms.length})
                                    </Typography>
                                    {loadingLinked ? (
                                        <CircularProgress size={20} />
                                    ) : linkedForms.length > 0 ? (
                                        <Stack spacing={1}>
                                            {linkedForms.slice(0, 3).map((submission) => (
                                                <Card key={submission._id} variant="outlined">
                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                            <DescriptionIcon fontSize="small" color="secondary" />
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {submission.formId?.name || 'Form'}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="textSecondary" display="block">
                                                            {new Date(submission.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            {linkedForms.length > 3 && (
                                                <Typography variant="caption" color="textSecondary">
                                                    +{linkedForms.length - 3} more submissions
                                                </Typography>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No form submissions yet
                                        </Typography>
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

                {/* Actions Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    {selectedConversation?.status === 'open' ? (
                        <MenuItem onClick={handleResolve}>
                            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                            Mark as Resolved
                        </MenuItem>
                    ) : (
                        <MenuItem onClick={handleReopen}>
                            <PlayCircleIcon fontSize="small" sx={{ mr: 1 }} />
                            Reopen Conversation
                        </MenuItem>
                    )}
                    {selectedConversation?.automationPaused && (
                        <MenuItem onClick={handleResumeAutomation}>
                            <PlayCircleIcon fontSize="small" sx={{ mr: 1 }} />
                            Resume Automation
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleSendBookingLink} disabled={!businessSlug}>
                        <LinkIcon fontSize="small" sx={{ mr: 1 }} />
                        Send Booking Link
                    </MenuItem>
                </Menu>

                {/* Compose Drawer */}
                <Drawer
                    anchor="bottom"
                    open={composeDrawerOpen}
                    onClose={() => setComposeDrawerOpen(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            height: '50vh',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                        }
                    }}
                >
                    <Box p={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Compose Message</Typography>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Channel</InputLabel>
                                <Select
                                    value={channelMode}
                                    label="Channel"
                                    onChange={(e) => setChannelMode(e.target.value as 'email' | 'sms')}
                                    startAdornment={
                                        channelMode === 'email' ? <EmailIcon fontSize="small" sx={{ mr: 0.5 }} /> : <SmsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    }
                                >
                                    <MenuItem value="email">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <EmailIcon fontSize="small" />
                                            Email
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="sms">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <SmsIcon fontSize="small" />
                                            SMS
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            placeholder="Type your message here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={sending}
                        />
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                            <Button onClick={() => setComposeDrawerOpen(false)}>Cancel</Button>
                            <Button
                                variant="contained"
                                startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                            >
                                Send
                            </Button>
                        </Box>
                    </Box>
                </Drawer>
            </Box>
        </RBACGuard>
    );
}

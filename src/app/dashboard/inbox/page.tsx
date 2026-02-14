'use client';

import { useEffect, useCallback, useState } from 'react';
import { Box, Typography, Alert, CircularProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar } from '@mui/material';
import { inboxService } from '@/lib/services/inbox.service';
import { initializeSocket, onNewMessage, onConversationUpdate, offNewMessage, offConversationUpdate } from '@/lib/socket';
import RBACGuard from '@/components/dashboard/RBACGuard';
import api from '@/lib/api';
import { useInboxStore } from '@/store/inboxStore';
import ConversationList from '@/components/dashboard/inbox/ConversationList';
import ChatWindow from '@/components/dashboard/inbox/ChatWindow';
import ContactDetails from '@/components/dashboard/inbox/ContactDetails';

export default function InboxPage() {
    const theme = useTheme();
    
    // Local state for new conversation dialog
    const [newConversationDialog, setNewConversationDialog] = useState(false);
    const [newContactEmail, setNewContactEmail] = useState('');
    const [newContactName, setNewContactName] = useState('');
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [syncing, setSyncing] = useState(false);

    // Zustand store
    const {
        conversations,
        selectedConversation,
        messages,
        businessSlug,
        searchQuery,
        statusFilter,
        loading,
        sending,
        error,
        setConversations,
        setSelectedConversation,
        setMessages,
        addMessage,
        setBusinessSlug,
        setSearchQuery,
        setStatusFilter,
        setLoading,
        setSending,
        setError,
        updateConversation,
        updateConversationStatus,
        updateConversationAutomation
    } = useInboxStore();

    // Initialize Socket.io
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            initializeSocket(token);

            // Listen for new messages
            onNewMessage((message) => {
                if (selectedConversation && message.conversationId === selectedConversation._id) {
                    addMessage(message);
                }
                // Update conversation list
                fetchConversations();
            });

            // Listen for conversation updates
            onConversationUpdate((conversation) => {
                updateConversation(conversation);
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
                // Get businesses list (works for both owner and staff)
                const businessesRes = await api.get('/staff/businesses');
                if (businessesRes.data.success && businessesRes.data.data.length > 0) {
                    // Get selected business ID from localStorage or use first business
                    const selectedBusinessId = localStorage.getItem('selectedBusinessId');
                    const business = selectedBusinessId
                        ? businessesRes.data.data.find((b: any) => b._id === selectedBusinessId)
                        : businessesRes.data.data[0];

                    if (business?.bookingSlug) {
                        setBusinessSlug(business.bookingSlug);
                    }
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
                // Don't auto-select any conversation - let user click to select
            }
        } catch (err: any) {
            console.error('Failed to fetch conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, selectedConversation, loading]);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async () => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        try {
            const response = await inboxService.getMessages(selectedConversation._id);
            if (response.success) {
                setMessages(response.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch messages:', err);
            // If conversation not found (404), it was likely deleted
            if (err.response?.status === 404) {
                setSelectedConversation(null);
                setMessages([]);
            }
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

    const handleSend = async (content: string, attachments?: File[]) => {
        if (!content.trim() || !selectedConversation) return;

        setSending(true);
        try {
            // If there are attachments, we need to send via FormData
            if (attachments && attachments.length > 0) {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('channel', selectedConversation.channel);

                attachments.forEach((file) => {
                    formData.append('attachments', file);
                });

                const response = await api.post(
                    `/inbox/conversations/${selectedConversation._id}/reply`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data.success) {
                    addMessage(response.data.data);
                    fetchConversations();
                }
            } else {
                // No attachments, use regular JSON
                const response = await inboxService.sendReply(selectedConversation._id, {
                    content,
                    channel: selectedConversation.channel
                });

                if (response.success) {
                    addMessage(response.data);
                    fetchConversations();
                }
            }
        } catch (err: any) {
            console.error('Failed to send message:', err);
            alert(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.resolveConversation(selectedConversation._id);
            updateConversationStatus(selectedConversation._id, 'resolved');
            fetchConversations();
        } catch (err) {
            console.error('Failed to resolve conversation:', err);
        }
    };

    const handleReopen = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.reopenConversation(selectedConversation._id);
            updateConversationStatus(selectedConversation._id, 'open');
            fetchConversations();
        } catch (err) {
            console.error('Failed to reopen conversation:', err);
        }
    };

    const handleResumeAutomation = async () => {
        if (!selectedConversation) return;
        try {
            await inboxService.resumeAutomation(selectedConversation._id);
            updateConversationAutomation(selectedConversation._id, false);
            fetchConversations();
        } catch (err) {
            console.error('Failed to resume automation:', err);
        }
    };

    const handleSendBookingLink = () => {
        if (!selectedConversation || !businessSlug) return;
        const bookingUrl = `${window.location.origin}/book/${businessSlug}`;
        handleSend(`Hi! You can book an appointment here: ${bookingUrl}`);
    };

    const handleCreateConversation = async () => {
        if (!newContactEmail.trim()) {
            setSnackbar({ open: true, message: 'Email is required', severity: 'error' });
            return;
        }

        setCreatingConversation(true);
        try {
            const response = await api.post('/inbox/create-conversation', {
                email: newContactEmail,
                name: newContactName || newContactEmail.split('@')[0]
            });

            if (response.data.success) {
                setSnackbar({ open: true, message: 'Conversation created!', severity: 'success' });
                setNewConversationDialog(false);
                setNewContactEmail('');
                setNewContactName('');
                
                // Refresh conversations list
                const conversationsResponse = await inboxService.getConversations({
                    status: statusFilter === 'all' ? undefined : statusFilter,
                    search: searchQuery || undefined
                });
                
                if (conversationsResponse.success) {
                    setConversations(conversationsResponse.data);
                    
                    // Select the newly created conversation
                    if (response.data.data.conversation) {
                        const newConv = response.data.data.conversation;
                        setSelectedConversation(newConv);
                        
                        // Fetch messages for the new conversation
                        const messagesResponse = await inboxService.getMessages(newConv._id);
                        if (messagesResponse.success) {
                            setMessages(messagesResponse.data);
                        }
                    }
                }
            }
        } catch (error: any) {
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || 'Failed to create conversation', 
                severity: 'error' 
            });
        } finally {
            setCreatingConversation(false);
        }
    };

    const handleSyncGmail = async () => {
        setSyncing(true);
        try {
            const response = await api.post('/integrations/gmail/sync');
            if (response.data) {
                setSnackbar({ open: true, message: 'Gmail synced successfully!', severity: 'success' });
                // Refresh conversations after sync
                await fetchConversations();
            }
        } catch (error: any) {
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || 'Failed to sync Gmail', 
                severity: 'error' 
            });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" gap={2}>
                <CircularProgress size={40} thickness={4} sx={{ color: '#667eea' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading Inbox...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const pageBgColor = theme.palette.mode === 'light' ? '#F2F1EB' : '#0f1117';

    return (
        <RBACGuard permission="canViewInbox">
            <Box sx={{
                p: { xs: 2, sm: 3 },
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: pageBgColor,
                boxSizing: 'border-box',
                width: '100%',
                maxWidth: 'calc(100vw - 300px)' // Subtract sidebar width
            }}>
                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden', width: '100%', maxWidth: '100%' }}>

                    {/* Left: Conversation List - Full width when nothing selected, fixed width when selected */}
                    <Box sx={{ 
                        width: selectedConversation ? { xs: '100%', md: '360px' } : '100%',
                        maxWidth: selectedConversation ? { xs: '100%', md: '360px' } : '100%',
                        flexShrink: 0, 
                        height: '100%', 
                        display: { xs: selectedConversation ? 'none' : 'block', md: 'block' },
                        transition: 'width 0.3s ease',
                        overflow: 'hidden'
                    }}>
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?._id}
                            onSelect={setSelectedConversation}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onFilterChange={setStatusFilter}
                            onNewConversation={() => setNewConversationDialog(true)}
                            onSyncGmail={handleSyncGmail}
                            syncing={syncing}
                            onBulkResolve={async (ids) => {
                                try {
                                    await Promise.all(ids.map(id => inboxService.resolveConversation(id)));
                                    fetchConversations();
                                    if (selectedConversation && ids.includes(selectedConversation._id)) {
                                        updateConversationStatus(selectedConversation._id, 'resolved');
                                    }
                                } catch (err) {
                                    console.error('Bulk resolve failed:', err);
                                }
                            }}
                            onBulkReopen={async (ids) => {
                                try {
                                    await Promise.all(ids.map(id => inboxService.reopenConversation(id)));
                                    fetchConversations();
                                    if (selectedConversation && ids.includes(selectedConversation._id)) {
                                        updateConversationStatus(selectedConversation._id, 'open');
                                    }
                                } catch (err) {
                                    console.error('Bulk reopen failed:', err);
                                }
                            }}
                            onBulkDelete={async (ids) => {
                                try {
                                    await inboxService.bulkDeleteConversations(ids);
                                    
                                    // Refresh conversations first
                                    const response = await inboxService.getConversations({
                                        status: statusFilter === 'all' ? undefined : statusFilter,
                                        search: searchQuery || undefined
                                    });
                                    
                                    if (response.success) {
                                        setConversations(response.data);
                                        
                                        // If deleted conversation was selected, select next available conversation
                                        if (selectedConversation && ids.includes(selectedConversation._id)) {
                                            if (response.data.length > 0) {
                                                // Select the first conversation in the updated list
                                                setSelectedConversation(response.data[0]);
                                            } else {
                                                // No conversations left
                                                setSelectedConversation(null);
                                                setMessages([]);
                                            }
                                        }
                                    }
                                    
                                    setSnackbar({ open: true, message: `${ids.length} conversation(s) deleted`, severity: 'success' });
                                } catch (err: any) {
                                    console.error('Bulk delete failed:', err);
                                    setSnackbar({ 
                                        open: true, 
                                        message: err.response?.data?.message || 'Failed to delete conversations', 
                                        severity: 'error' 
                                    });
                                }
                            }}
                        />
                    </Box>

                    {/* Middle: Chat Window - Only show when conversation is selected */}
                    {selectedConversation && (
                        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
                            <ChatWindow
                                conversation={selectedConversation}
                                messages={messages}
                                onSendMessage={handleSend}
                                sending={sending}
                                onResolve={handleResolve}
                                onReopen={handleReopen}
                                onResumeAutomation={handleResumeAutomation}
                            />
                        </Box>
                    )}

                    {/* Right: Contact Details - Only show when conversation is selected */}
                    {selectedConversation && (
                        <Box sx={{ width: '320px', flexShrink: 0, height: '100%', display: { xs: 'none', lg: 'block' } }}>
                            <ContactDetails
                                conversation={selectedConversation}
                                businessSlug={businessSlug}
                                onResolve={handleResolve}
                                onReopen={handleReopen}
                                onSendBookingLink={handleSendBookingLink}
                                onFormSent={fetchMessages}
                            />
                        </Box>
                    )}

                </Box>
            </Box>

            {/* New Conversation Dialog */}
            <Dialog
                open={newConversationDialog}
                onClose={() => !creatingConversation && setNewConversationDialog(false)}
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
                    New Conversation
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Contact Email"
                            type="email"
                            required
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                            placeholder="contact@example.com"
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Contact Name (Optional)"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            placeholder="John Doe"
                        />
                        <Typography variant="caption" color="text.secondary">
                            If the contact doesn't exist, a new one will be created.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setNewConversationDialog(false)}
                        disabled={creatingConversation}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateConversation}
                        variant="contained"
                        disabled={creatingConversation || !newContactEmail.trim()}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#7c3aed',
                            '&:hover': { bgcolor: '#6d28d9' }
                        }}
                    >
                        {creatingConversation ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 8 }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
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
        </RBACGuard>
    );
}

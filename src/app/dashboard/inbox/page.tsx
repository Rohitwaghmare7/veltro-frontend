'use client';

import { useEffect, useCallback } from 'react';
import { Box, Typography, Alert, CircularProgress, useTheme } from '@mui/material';
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
                // Auto-select first conversation if none selected AND not loading initial
                // We typically want to select the first one on initial load if none selected
                if (!selectedConversation && response.data.length > 0 && loading) {
                    setSelectedConversation(response.data[0]);
                }
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
                boxSizing: 'border-box'
            }}>
                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>

                    {/* Left: Conversation List */}
                    <Box sx={{ width: { xs: '100%', md: '360px' }, flexShrink: 0, height: '100%', display: { xs: selectedConversation ? 'none' : 'block', md: 'block' } }}>
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?._id}
                            onSelect={setSelectedConversation}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            statusFilter={statusFilter}
                            onFilterChange={setStatusFilter}
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
                        />
                    </Box>

                    {/* Middle: Chat Window */}
                    <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: { xs: selectedConversation ? 'block' : 'none', md: 'block' } }}>
                        {/* Mobile Back Button Logic could be added here if needed, or handled inside ChatWindow */}
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

                    {/* Right: Contact Details (Desktop Only for now) */}
                    <Box sx={{ width: '320px', flexShrink: 0, height: '100%', display: { xs: 'none', lg: 'block' } }}>
                        <ContactDetails
                            conversation={selectedConversation}
                            businessSlug={businessSlug}
                            onResolve={handleResolve}
                            onReopen={handleReopen}
                            onSendBookingLink={handleSendBookingLink}
                        />
                    </Box>

                </Box>
            </Box>
        </RBACGuard>
    );
}

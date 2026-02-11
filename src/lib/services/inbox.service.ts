import api from '../api';

export interface Conversation {
    _id: string;
    businessId: string;
    contactId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        notes?: string;
        source?: string;
        status?: string;
        tags?: string[];
    };
    channel: 'email' | 'sms';
    status: 'open' | 'resolved';
    lastMessageAt: string;
    automationPaused: boolean;
    unreadCount: number;
    lastMessage?: {
        _id: string;
        content: string;
        direction: 'inbound' | 'outbound';
        type: 'manual' | 'automated';
        sentAt: string;
    };
}

export interface Message {
    _id: string;
    conversationId: string;
    direction: 'inbound' | 'outbound';
    type: 'manual' | 'automated';
    content: string;
    channel: 'email' | 'sms';
    sentAt: string;
    readAt?: string;
    metadata?: any;
}

export const inboxService = {
    // Get all conversations
    getConversations: async (filters?: {
        status?: 'open' | 'resolved';
        search?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        
        const response = await api.get(`/inbox/conversations?${params.toString()}`);
        return response.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId: string) => {
        const response = await api.get(`/inbox/conversations/${conversationId}/messages`);
        return response.data;
    },

    // Send a reply
    sendReply: async (conversationId: string, data: {
        content: string;
        channel: 'email' | 'sms';
    }) => {
        const response = await api.post(`/inbox/conversations/${conversationId}/reply`, data);
        return response.data;
    },

    // Mark conversation as resolved
    resolveConversation: async (conversationId: string) => {
        const response = await api.patch(`/inbox/conversations/${conversationId}/resolve`);
        return response.data;
    },

    // Reopen a resolved conversation
    reopenConversation: async (conversationId: string) => {
        const response = await api.patch(`/inbox/conversations/${conversationId}/reopen`);
        return response.data;
    },

    // Resume automation for a conversation
    resumeAutomation: async (conversationId: string) => {
        const response = await api.patch(`/inbox/conversations/${conversationId}/resume-automation`);
        return response.data;
    },

    // Get linked bookings for a contact
    getContactBookings: async (contactId: string) => {
        const response = await api.get(`/inbox/contacts/${contactId}/bookings`);
        return response.data;
    },

    // Get linked form submissions for a contact
    getContactSubmissions: async (contactId: string) => {
        const response = await api.get(`/inbox/contacts/${contactId}/submissions`);
        return response.data;
    },
};

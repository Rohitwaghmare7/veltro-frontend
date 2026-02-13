import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Conversation, Message } from '@/lib/services/inbox.service';

interface InboxState {
    // Data
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    messages: Message[];
    businessSlug: string | null;
    
    // Filters
    searchQuery: string;
    statusFilter: 'all' | 'open' | 'resolved';
    
    // Loading states
    loading: boolean;
    sending: boolean;
    error: string | null;
    
    // Actions
    setConversations: (conversations: Conversation[]) => void;
    setSelectedConversation: (conversation: Conversation | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    setBusinessSlug: (slug: string) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (filter: 'all' | 'open' | 'resolved') => void;
    setLoading: (loading: boolean) => void;
    setSending: (sending: boolean) => void;
    setError: (error: string | null) => void;
    updateConversation: (conversation: Conversation) => void;
    updateConversationStatus: (conversationId: string, status: 'open' | 'resolved') => void;
    updateConversationAutomation: (conversationId: string, paused: boolean) => void;
    reset: () => void;
}

const initialState = {
    conversations: [],
    selectedConversation: null,
    messages: [],
    businessSlug: null,
    searchQuery: '',
    statusFilter: 'all' as const,
    loading: true,
    sending: false,
    error: null,
};

export const useInboxStore = create<InboxState>()(
    devtools(
        (set, get) => ({
            ...initialState,
            
            setConversations: (conversations) => set({ conversations }),
            
            setSelectedConversation: (conversation) => set({ 
                selectedConversation: conversation,
                messages: [] // Clear messages when switching conversations
            }),
            
            setMessages: (messages) => set({ messages }),
            
            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),
            
            setBusinessSlug: (businessSlug) => set({ businessSlug }),
            
            setSearchQuery: (searchQuery) => set({ searchQuery }),
            
            setStatusFilter: (statusFilter) => set({ statusFilter }),
            
            setLoading: (loading) => set({ loading }),
            
            setSending: (sending) => set({ sending }),
            
            setError: (error) => set({ error }),
            
            updateConversation: (conversation) => set((state) => ({
                conversations: state.conversations.map(c => 
                    c._id === conversation._id ? conversation : c
                ),
                selectedConversation: state.selectedConversation?._id === conversation._id 
                    ? conversation 
                    : state.selectedConversation
            })),
            
            updateConversationStatus: (conversationId, status) => set((state) => ({
                conversations: state.conversations.map(c =>
                    c._id === conversationId ? { ...c, status } : c
                ),
                selectedConversation: state.selectedConversation?._id === conversationId
                    ? { ...state.selectedConversation, status }
                    : state.selectedConversation
            })),
            
            updateConversationAutomation: (conversationId, automationPaused) => set((state) => ({
                conversations: state.conversations.map(c =>
                    c._id === conversationId ? { ...c, automationPaused } : c
                ),
                selectedConversation: state.selectedConversation?._id === conversationId
                    ? { ...state.selectedConversation, automationPaused }
                    : state.selectedConversation
            })),
            
            reset: () => set(initialState),
        }),
        { name: 'InboxStore' }
    )
);

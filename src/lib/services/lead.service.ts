import api from '@/lib/api';

export interface Lead {
    _id: string;
    businessId: string;
    name: string;
    email?: string;
    phone?: string;
    source: 'contact_form' | 'booking' | 'manual' | 'form_submission';
    status: 'new' | 'contacted' | 'qualified' | 'booked' | 'closed';
    notes?: string;
    tags?: string[];
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    } | string;
    createdAt: string;
    updatedAt: string;
    // UI Fields
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    term?: string; // e.g., "Short-term", "Long-term"
    commentsCount?: number;
    linksCount?: number;
    attachmentsCount?: number;
}

export interface CreateLeadData {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status?: string;
    notes?: string;
    tags?: string[];
    assignedTo?: string;
}

export const leadService = {
    // Get all leads with optional filtering
    getLeads: async (filters?: { status?: string; source?: string }) => {
        const response = await api.get('/leads', { params: filters });
        return response.data;
    },

    // Create a new lead
    createLead: async (data: CreateLeadData) => {
        const response = await api.post('/leads', data);
        return response.data;
    },

    // Update a lead
    updateLead: async (id: string, data: Partial<CreateLeadData>) => {
        const response = await api.patch(`/leads/${id}`, data);
        return response.data;
    },

    // Update lead status specifically (optimized for drag-and-drop)
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/leads/${id}/status`, { status });
        return response.data;
    },

    // Delete a lead
    deleteLead: async (id: string) => {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
    }
};

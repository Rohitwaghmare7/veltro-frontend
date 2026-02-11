import api from '@/lib/api';

export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'multiselect';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
}

export interface Form {
    _id: string;
    title: string;
    description?: string;
    fields: FormField[];
    isActive: boolean;
    submissionsCount: number;
    linkedServices?: string[];
    isRequiredForBooking?: boolean;
    autoSendAfterBooking?: boolean;
    sendDelay?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFormData {
    title: string;
    description?: string;
    fields: FormField[];
    isActive?: boolean;
    linkedServices?: string[];
    isRequiredForBooking?: boolean;
    autoSendAfterBooking?: boolean;
    sendDelay?: number;
}

export const formService = {
    // Get all forms
    getForms: async () => {
        const response = await api.get('/forms');
        return response.data;
    },

    // Get single form by ID
    getForm: async (id: string) => {
        const response = await api.get(`/forms/${id}`);
        return response.data;
    },

    // Create a new form
    createForm: async (data: CreateFormData) => {
        const response = await api.post('/forms', data);
        return response.data;
    },

    // Update a form
    updateForm: async (id: string, data: Partial<CreateFormData>) => {
        const response = await api.put(`/forms/${id}`, data);
        return response.data;
    },

    // Delete a form
    deleteForm: async (id: string) => {
        const response = await api.delete(`/forms/${id}`);
        return response.data;
    },

    // Get submissions for a form
    getSubmissions: async (id: string) => {
        const response = await api.get(`/forms/${id}/submissions`);
        return response.data;
    },

    // Public: Get form definition
    getPublicForm: async (id: string) => {
        const response = await api.get(`/forms/public/${id}`);
        return response.data;
    },

    // Public: Submit form data
    submitForm: async (id: string, data: any) => {
        const response = await api.post(`/forms/public/${id}/submit`, { data });
        return response.data;
    },

    // Export submissions as CSV
    exportSubmissions: async (id: string) => {
        const response = await api.get(`/forms/${id}/export`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Get forms linked to a booking
    getBookingForms: async (bookingId: string) => {
        const response = await api.get(`/forms/booking/${bookingId}`);
        return response.data;
    }
};

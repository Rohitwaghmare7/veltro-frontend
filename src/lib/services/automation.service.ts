import api from '../api';

export interface AutomationSetting {
    enabled: boolean;
    name: string;
    description: string;
    emailSubject?: string;
    emailTemplate?: string;
}

export interface AutomationSettings {
    _id: string;
    businessId: string;
    automations: {
        NEW_CONTACT: AutomationSetting;
        BOOKING_CREATED: AutomationSetting;
        BOOKING_REMINDER: AutomationSetting;
        FORM_PENDING: AutomationSetting;
        INVENTORY_LOW: AutomationSetting;
    };
    createdAt: string;
    updatedAt: string;
}

export const automationService = {
    // Get automation settings
    getSettings: async () => {
        const response = await api.get('/automations/settings');
        return response.data;
    },

    // Update automation settings
    updateSettings: async (automations: any) => {
        const response = await api.patch('/automations/settings', { automations });
        return response.data;
    },

    // Get automation logs
    getLogs: async (filters?: {
        trigger?: string;
        success?: boolean;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters?.trigger) params.append('trigger', filters.trigger);
        if (filters?.success !== undefined) params.append('success', String(filters.success));
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.limit) params.append('limit', String(filters.limit));

        const response = await api.get(`/automations/logs?${params.toString()}`);
        return response.data;
    },

    // Get automation statistics
    getStats: async () => {
        const response = await api.get('/automations/stats');
        return response.data;
    },
};

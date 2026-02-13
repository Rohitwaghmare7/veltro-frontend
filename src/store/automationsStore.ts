import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { automationService, AutomationSettings } from '@/lib/services/automation.service';

interface AutomationsState {
    settings: AutomationSettings | null;
    logs: any[];
    stats: any | null;
    loading: boolean;
    logsLoading: boolean;
    statsLoading: boolean;
    processing: boolean;
    error: string | null;
    
    // Actions
    fetchSettings: () => Promise<void>;
    updateAutomation: (automationKey: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
    updateTemplate: (automationKey: string, emailSubject: string, emailTemplate: string) => Promise<{ success: boolean; error?: string }>;
    fetchLogs: (filters?: any) => Promise<void>;
    fetchStats: () => Promise<void>;
    clearError: () => void;
}

export const useAutomationsStore = create<AutomationsState>()(
    devtools(
        (set, get) => ({
            settings: null,
            logs: [],
            stats: null,
            loading: false,
            logsLoading: false,
            statsLoading: false,
            processing: false,
            error: null,

            fetchSettings: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await automationService.getSettings();
                    if (response.success) {
                        set({ settings: response.data, loading: false });
                    } else {
                        set({ error: 'Failed to fetch settings', loading: false });
                    }
                } catch (error: any) {
                    set({ 
                        error: error.response?.data?.message || 'Failed to fetch settings', 
                        loading: false 
                    });
                }
            },

            updateAutomation: async (automationKey, enabled) => {
                const { settings } = get();
                if (!settings) return { success: false, error: 'No settings loaded' };

                set({ processing: true, error: null });
                try {
                    const updatedAutomations = {
                        ...settings.automations,
                        [automationKey]: {
                            ...settings.automations[automationKey as keyof typeof settings.automations],
                            enabled,
                        },
                    };

                    const response = await automationService.updateSettings(updatedAutomations);
                    if (response.success) {
                        set({ settings: response.data, processing: false });
                        return { success: true };
                    } else {
                        set({ error: 'Failed to update automation', processing: false });
                        return { success: false, error: 'Failed to update automation' };
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update automation';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            updateTemplate: async (automationKey, emailSubject, emailTemplate) => {
                const { settings } = get();
                if (!settings) return { success: false, error: 'No settings loaded' };

                set({ processing: true, error: null });
                try {
                    const updatedAutomations = {
                        ...settings.automations,
                        [automationKey]: {
                            ...settings.automations[automationKey as keyof typeof settings.automations],
                            emailSubject,
                            emailTemplate,
                        },
                    };

                    const response = await automationService.updateSettings(updatedAutomations);
                    if (response.success) {
                        set({ settings: response.data, processing: false });
                        return { success: true };
                    } else {
                        set({ error: 'Failed to update template', processing: false });
                        return { success: false, error: 'Failed to update template' };
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update template';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            fetchLogs: async (filters = {}) => {
                set({ logsLoading: true, error: null });
                try {
                    const response = await automationService.getLogs(filters);
                    if (response.success) {
                        set({ logs: response.data, logsLoading: false });
                    } else {
                        set({ error: 'Failed to fetch logs', logsLoading: false });
                    }
                } catch (error: any) {
                    set({ 
                        error: error.response?.data?.message || 'Failed to fetch logs', 
                        logsLoading: false 
                    });
                }
            },

            fetchStats: async () => {
                set({ statsLoading: true, error: null });
                try {
                    const response = await automationService.getStats();
                    if (response.success) {
                        set({ stats: response.data, statsLoading: false });
                    } else {
                        set({ error: 'Failed to fetch stats', statsLoading: false });
                    }
                } catch (error: any) {
                    set({ 
                        error: error.response?.data?.message || 'Failed to fetch stats', 
                        statsLoading: false 
                    });
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'AutomationsStore' }
    )
);

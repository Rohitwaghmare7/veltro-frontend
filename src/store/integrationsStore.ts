import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { integrationService, Integration, FailedConnection } from '@/lib/services/integration.service';

interface IntegrationWithDetails extends Integration {
    description: string;
    icon: string;
    configurable: boolean;
}

interface IntegrationsState {
    integrations: Record<string, IntegrationWithDetails>;
    failedConnections: FailedConnection[];
    loading: boolean;
    processing: boolean;
    error: string | null;
    
    // Actions
    fetchStatus: () => Promise<void>;
    fetchFailedConnections: () => Promise<void>;
    testConnection: (integrationId: string) => Promise<{ success: boolean; message: string }>;
    disconnect: (integrationId: string) => Promise<{ success: boolean; error?: string }>;
    syncGmail: () => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

const integrationDefinitions: Record<string, Omit<IntegrationWithDetails, 'status' | 'lastSync' | 'error'>> = {
    email: {
        id: 'email',
        name: 'Email (SMTP)',
        description: 'Send automated emails and notifications',
        icon: 'email',
        configurable: false,
    },
    gmail: {
        id: 'gmail',
        name: 'Gmail',
        description: 'View inbox and send emails from your business Gmail',
        icon: 'gmail',
        configurable: true,
    },
    'google-calendar': {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync bookings with Google Calendar',
        icon: 'calendar',
        configurable: true,
    },
};

export const useIntegrationsStore = create<IntegrationsState>()(
    devtools(
        (set, get) => ({
            integrations: Object.fromEntries(
                Object.entries(integrationDefinitions).map(([key, def]) => [
                    key,
                    { ...def, status: 'disconnected' as const }
                ])
            ),
            failedConnections: [],
            loading: false,
            processing: false,
            error: null,

            fetchStatus: async () => {
                set({ loading: true, error: null });
                try {
                    const statuses = await integrationService.getStatus();
                    
                    const updatedIntegrations = Object.fromEntries(
                        Object.entries(integrationDefinitions).map(([key, def]) => [
                            key,
                            {
                                ...def,
                                status: statuses[key]?.status || 'disconnected',
                                lastSync: statuses[key]?.lastSync,
                                error: statuses[key]?.error,
                            }
                        ])
                    );

                    set({ integrations: updatedIntegrations, loading: false });
                } catch (error: any) {
                    set({ 
                        error: error.response?.data?.message || 'Failed to fetch integration status', 
                        loading: false 
                    });
                }
            },

            fetchFailedConnections: async () => {
                try {
                    const failed = await integrationService.getFailedConnections();
                    set({ failedConnections: failed });
                } catch (error: any) {
                    console.error('Failed to fetch failed connections', error);
                }
            },

            testConnection: async (integrationId) => {
                set({ processing: true, error: null });
                try {
                    const result = await integrationService.testConnection(integrationId);
                    set({ processing: false });
                    return result;
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Connection test failed';
                    set({ error: errorMessage, processing: false });
                    return { success: false, message: errorMessage };
                }
            },

            disconnect: async (integrationId) => {
                set({ processing: true, error: null });
                try {
                    if (integrationId === 'gmail') {
                        await integrationService.disconnectGmail();
                    } else {
                        await integrationService.disconnect(integrationId);
                    }
                    
                    // Refresh status after disconnect
                    await get().fetchStatus();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to disconnect';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            syncGmail: async () => {
                set({ processing: true, error: null });
                try {
                    await integrationService.syncGmail();
                    await get().fetchStatus();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to sync Gmail';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'IntegrationsStore' }
    )
);

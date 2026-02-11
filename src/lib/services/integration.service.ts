import api from '@/lib/api';

export interface Integration {
    id: string;
    name: string;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastSync?: string;
    error?: string;
}

export interface IntegrationConfig {
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
}

export interface FailedConnection {
    integration: string;
    error: string;
    timestamp: string;
}

export const integrationService = {
    // Get all integration statuses
    async getStatus(): Promise<Record<string, Integration>> {
        const response = await api.get('/integrations/status');
        return response.data;
    },

    // Test connection
    async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
        const response = await api.post(`/integrations/${integrationId}/test`);
        return response.data;
    },

    // Configure integration
    async configure(integrationId: string, config: IntegrationConfig): Promise<void> {
        await api.post(`/integrations/${integrationId}/configure`, config);
    },

    // Disconnect integration
    async disconnect(integrationId: string): Promise<void> {
        await api.post(`/integrations/${integrationId}/disconnect`);
    },

    // Get Google Calendar OAuth URL
    async getGoogleCalendarUrl(): Promise<string> {
        const response = await api.get('/integrations/google-calendar/connect');
        return response.data.url;
    },

    // Get failed connections
    async getFailedConnections(): Promise<FailedConnection[]> {
        const response = await api.get('/integrations/failed');
        return response.data;
    },
};

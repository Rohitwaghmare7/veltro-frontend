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
    async getGoogleUrl(): Promise<string> {
        const response = await api.get('/integrations/google/connect');
        return response.data.url;
    },

    // Legacy method - can be removed later or aliased
    async getGoogleCalendarUrl(): Promise<string> {
        return this.getGoogleUrl();
    },

    // Gmail Integration
    async getGmailUrl(): Promise<string> {
        const response = await api.get('/integrations/gmail/connect');
        return response.data.url;
    },

    async disconnectGmail(): Promise<void> {
        await api.delete('/integrations/gmail/disconnect');
    },

    async getGmailStatus(): Promise<{ connected: boolean; email: string | null; lastSync: string | null; syncStatus: string; syncError: string | null }> {
        const response = await api.get('/integrations/gmail/status');
        return response.data;
    },

    async syncGmail(): Promise<{ message: string; lastSync: string; syncStatus: string }> {
        const response = await api.post('/integrations/gmail/sync');
        return response.data;
    },

    async sendGmailEmail(data: { to: string; subject: string; body: string; attachments?: any[] }): Promise<{ messageId: string; threadId: string }> {
        const response = await api.post('/integrations/gmail/send', data);
        return response.data;
    },

    async replyGmailEmail(conversationId: string, data: { body: string; attachments?: any[] }): Promise<{ messageId: string; threadId: string }> {
        const response = await api.post(`/integrations/gmail/reply/${conversationId}`, data);
        return response.data;
    },

    async getGmailAttachment(messageId: string, attachmentId: string): Promise<Blob> {
        const response = await api.get(`/integrations/gmail/attachment/${messageId}/${attachmentId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Get failed connections
    async getFailedConnections(): Promise<FailedConnection[]> {
        const response = await api.get('/integrations/failed');
        return response.data;
    },
};

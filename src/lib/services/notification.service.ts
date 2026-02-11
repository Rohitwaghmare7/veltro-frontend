import api from '../api';

export interface Notification {
    _id: string;
    type: 'booking' | 'message' | 'form' | 'automation' | 'system' | 'staff';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    unreadCount: number;
}

class NotificationService {
    async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationResponse> {
        const response = await api.get('/notifications', {
            params: { page, limit, unreadOnly },
        });
        return response.data;
    }

    async getUnreadCount(): Promise<number> {
        const response = await api.get('/notifications/unread-count');
        return response.data.count;
    }

    async markAsRead(id: string): Promise<Notification> {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    }

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/mark-all-read');
    }

    async deleteNotification(id: string): Promise<void> {
        await api.delete(`/notifications/${id}`);
    }
}

export const notificationService = new NotificationService();

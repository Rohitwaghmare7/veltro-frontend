import api from '../api';

export interface DashboardStats {
    bookings: {
        today: number;
        upcoming: number;
        completed: number;
        noShow: number;
    };
    leads: {
        new24h: number;
        openConversations: number;
        unanswered: number;
    };
    forms: {
        pending: number;
        overdue: number;
        completed: number;
    };
    inventory: {
        lowStock: Array<{
            _id: string;
            name: string;
            quantity: number;
            threshold: number;
            unit: string;
        }>;
    };
}

export interface Alert {
    id: string;
    type: 'message' | 'booking' | 'form' | 'inventory';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    link: string;
    createdAt: string;
}

export const dashboardService = {
    // Get dashboard overview stats
    getOverview: async () => {
        const response = await api.get('/dashboard/overview');
        return response.data;
    },

    // Get key alerts
    getAlerts: async () => {
        const response = await api.get('/dashboard/alerts');
        return response.data;
    },
};

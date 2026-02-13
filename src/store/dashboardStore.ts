import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface DashboardStats {
    bookings: {
        today: number;
        upcoming: number;
        completed: number;
    };
    leads: {
        new24h: number;
        openConversations: number;
        unanswered: number;
    };
    inventory: {
        lowStock: Array<{
            _id: string;
            name: string;
            currentStock: number;
            minStock: number;
        }>;
    };
}

export interface Alert {
    _id: string;
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    createdAt: string;
    link?: string;
}

interface DashboardState {
    // Data
    stats: DashboardStats | null;
    alerts: Alert[];
    businessSlug: string | null;
    
    // Loading states
    loading: boolean;
    error: string | null;
    
    // Actions
    setStats: (stats: DashboardStats) => void;
    setAlerts: (alerts: Alert[]) => void;
    setBusinessSlug: (slug: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    stats: null,
    alerts: [],
    businessSlug: null,
    loading: true,
    error: null,
};

export const useDashboardStore = create<DashboardState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                
                setStats: (stats) => set({ stats }),
                setAlerts: (alerts) => set({ alerts }),
                setBusinessSlug: (businessSlug) => set({ businessSlug }),
                setLoading: (loading) => set({ loading }),
                setError: (error) => set({ error }),
                reset: () => set(initialState),
            }),
            {
                name: 'dashboard-storage',
                partialize: (state) => ({
                    businessSlug: state.businessSlug,
                }),
            }
        ),
        { name: 'DashboardStore' }
    )
);

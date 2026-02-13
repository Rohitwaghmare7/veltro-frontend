import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { leadService, Lead } from '@/lib/services/lead.service';

interface LeadsState {
    leads: Lead[];
    loading: boolean;
    error: string | null;
    movingLeads: boolean;
    
    // Actions
    fetchLeads: () => Promise<void>;
    createLead: (data: any) => Promise<{ success: boolean; data?: Lead; error?: string }>;
    updateLead: (id: string, data: any) => Promise<void>;
    updateLeadStatus: (id: string, status: string) => Promise<void>;
    moveAllLeads: (fromStatus: string, toStatus: string) => Promise<{ success: boolean; count: number; error?: string }>;
    deleteLead: (id: string) => Promise<void>;
    clearError: () => void;
}

// Helper to enrich leads with mock data for UI
const enrichLeadWithMockData = (lead: Lead): Lead => {
    const idNum = parseInt(lead._id.substring(lead._id.length - 4), 16) || 0;
    return {
        ...lead,
        priority: idNum % 3 === 0 ? 'High' : idNum % 3 === 1 ? 'Medium' : 'Low',
        dueDate: new Date(Date.now() + (idNum % 10 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: idNum % 8,
        linksCount: idNum % 3,
        attachmentsCount: idNum % 4,
    };
};

export const useLeadsStore = create<LeadsState>()(
    devtools(
        persist(
            (set, get) => ({
                leads: [],
                loading: false,
                error: null,
                movingLeads: false,

                fetchLeads: async () => {
                    set({ loading: true, error: null });
                    try {
                        const response = await leadService.getLeads();
                        if (response.success) {
                            const enriched = response.data.map(enrichLeadWithMockData);
                            set({ leads: enriched, loading: false });
                        } else {
                            set({ error: 'Failed to fetch leads', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to fetch leads', 
                            loading: false 
                        });
                    }
                },

                createLead: async (data) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await leadService.createLead(data);
                        if (response.success) {
                            const enriched = enrichLeadWithMockData(response.data);
                            set((state) => ({
                                leads: [...state.leads, enriched],
                                loading: false
                            }));
                            return { success: true, data: enriched };
                        } else {
                            set({ error: 'Failed to create lead', loading: false });
                            return { success: false, error: 'Failed to create lead' };
                        }
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Failed to create lead';
                        set({ error: errorMessage, loading: false });
                        return { success: false, error: errorMessage };
                    }
                },

                updateLead: async (id, data) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await leadService.updateLead(id, data);
                        if (response.success) {
                            set((state) => ({
                                leads: state.leads.map((lead) =>
                                    lead._id === id ? enrichLeadWithMockData({ ...lead, ...response.data }) : lead
                                ),
                                loading: false
                            }));
                        } else {
                            set({ error: 'Failed to update lead', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to update lead', 
                            loading: false 
                        });
                    }
                },

                updateLeadStatus: async (id, status) => {
                    // Optimistic update
                    set((state) => ({
                        leads: state.leads.map((lead) =>
                            lead._id === id ? { ...lead, status: status as any } : lead
                        )
                    }));

                    try {
                        await leadService.updateStatus(id, status);
                    } catch (error: any) {
                        // Revert on error
                        get().fetchLeads();
                        set({ error: error.response?.data?.message || 'Failed to update lead status' });
                    }
                },

                moveAllLeads: async (fromStatus, toStatus) => {
                    const leadsToMove = get().leads.filter(l => l.status === fromStatus);
                    const count = leadsToMove.length;

                    if (count === 0) {
                        return { success: false, count: 0, error: 'No leads to move' };
                    }

                    set({ movingLeads: true, error: null });

                    // Optimistic update
                    set((state) => ({
                        leads: state.leads.map((lead) =>
                            lead.status === fromStatus ? { ...lead, status: toStatus as any } : lead
                        )
                    }));

                    try {
                        // Update all leads in parallel
                        await Promise.all(
                            leadsToMove.map(lead => leadService.updateStatus(lead._id, toStatus))
                        );
                        set({ movingLeads: false });
                        return { success: true, count };
                    } catch (error: any) {
                        // Revert on error
                        get().fetchLeads();
                        const errorMessage = error.response?.data?.message || 'Failed to move leads';
                        set({ error: errorMessage, movingLeads: false });
                        return { success: false, count, error: errorMessage };
                    }
                },

                deleteLead: async (id) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await leadService.deleteLead(id);
                        if (response.success) {
                            set((state) => ({
                                leads: state.leads.filter((lead) => lead._id !== id),
                                loading: false
                            }));
                        } else {
                            set({ error: 'Failed to delete lead', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to delete lead', 
                            loading: false 
                        });
                    }
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: 'leads-storage',
                partialize: (state) => ({}), // Don't persist anything for now
            }
        ),
        { name: 'LeadsStore' }
    )
);

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { staffService, StaffMember, StaffPermissions } from '@/lib/services/staff.service';

interface TeamState {
    staff: StaffMember[];
    loading: boolean;
    error: string | null;
    processing: boolean;
    
    // Actions
    fetchStaff: () => Promise<void>;
    inviteStaff: (data: { name: string; email: string; permissions: StaffPermissions }) => Promise<{ success: boolean; error?: string }>;
    updatePermissions: (memberId: string, permissions: StaffPermissions) => Promise<{ success: boolean; error?: string }>;
    deactivateStaff: (memberId: string) => Promise<{ success: boolean; error?: string }>;
    reactivateStaff: (memberId: string) => Promise<{ success: boolean; error?: string }>;
    removeStaff: (memberId: string) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

export const useTeamStore = create<TeamState>()(
    devtools(
        (set) => ({
            staff: [],
            loading: false,
            error: null,
            processing: false,

            fetchStaff: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await staffService.getStaff();
                    if (response.success) {
                        set({ staff: response.data, loading: false });
                    } else {
                        set({ error: 'Failed to fetch staff', loading: false });
                    }
                } catch (error: any) {
                    set({ 
                        error: error.response?.data?.message || 'Failed to fetch staff', 
                        loading: false 
                    });
                }
            },

            inviteStaff: async (data) => {
                set({ processing: true, error: null });
                try {
                    const response = await staffService.inviteStaff(data);
                    if (response.success) {
                        set((state) => ({
                            staff: [...state.staff, response.data],
                            processing: false
                        }));
                        return { success: true };
                    } else {
                        set({ error: 'Failed to invite staff', processing: false });
                        return { success: false, error: 'Failed to invite staff' };
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to invite staff';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            updatePermissions: async (memberId, permissions) => {
                set({ processing: true, error: null });
                try {
                    const response = await staffService.updateStaff(memberId, permissions);
                    if (response.success) {
                        set((state) => ({
                            staff: state.staff.map((member) =>
                                member._id === memberId ? { ...member, permissions } : member
                            ),
                            processing: false
                        }));
                        return { success: true };
                    } else {
                        set({ error: 'Failed to update permissions', processing: false });
                        return { success: false, error: 'Failed to update permissions' };
                    }
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update permissions';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            deactivateStaff: async (memberId) => {
                set({ processing: true, error: null });
                try {
                    await staffService.deactivateStaff(memberId);
                    set((state) => ({
                        staff: state.staff.map((member) =>
                            member._id === memberId ? { ...member, status: 'deactivated' } : member
                        ),
                        processing: false
                    }));
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to deactivate staff';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            reactivateStaff: async (memberId) => {
                set({ processing: true, error: null });
                try {
                    await staffService.reactivateStaff(memberId);
                    set((state) => ({
                        staff: state.staff.map((member) =>
                            member._id === memberId ? { ...member, status: 'active' } : member
                        ),
                        processing: false
                    }));
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to reactivate staff';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            removeStaff: async (memberId) => {
                set({ processing: true, error: null });
                try {
                    await staffService.removeStaff(memberId);
                    set((state) => ({
                        staff: state.staff.filter((member) => member._id !== memberId),
                        processing: false
                    }));
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to remove staff';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'TeamStore' }
    )
);

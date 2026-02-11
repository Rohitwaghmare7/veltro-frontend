import api from '@/lib/api';

export interface StaffPermissions {
    canViewBookings: boolean;
    canEditBookings: boolean;
    canViewLeads: boolean;
    canEditLeads: boolean;
    canViewInbox: boolean;
    canSendEmails: boolean;
    canManageInventory: boolean;
    canViewReports: boolean;
    canManageAutomations: boolean;
}

export interface StaffMember {
    _id: string;
    name: string;
    email: string;
    role?: string; // Derived from User if linked, else 'Staff'
    inviteStatus: 'pending' | 'accepted' | 'expired';
    status: 'active' | 'inactive' | 'deactivated';
    permissions: StaffPermissions;
    avatar?: string;
    createdAt: string;
}

export interface InviteStaffData {
    name: string;
    email: string;
    permissions?: Partial<StaffPermissions>;
}

export const staffService = {
    // Get all staff
    getStaff: async () => {
        const response = await api.get('/staff');
        return response.data;
    },

    // Invite new staff
    inviteStaff: async (data: InviteStaffData) => {
        const response = await api.post('/staff', data);
        return response.data;
    },

    // Update staff permissions
    updateStaff: async (id: string, permissions: Partial<StaffPermissions>) => {
        const response = await api.put(`/staff/${id}`, { permissions });
        return response.data;
    },

    // Get current user's staff profile
    getMe: async () => {
        const response = await api.get('/staff/me');
        return response.data;
    },

    // Accept invitation
    acceptInvite: async (token: string) => {
        const response = await api.post(`/staff/accept/${token}`);
        return response.data;
    },

    // Remove staff
    removeStaff: async (id: string) => {
        const response = await api.delete(`/staff/${id}`);
        return response.data;
    },

    // Deactivate staff
    deactivateStaff: async (id: string) => {
        const response = await api.put(`/staff/${id}/deactivate`);
        return response.data;
    },

    // Reactivate staff
    reactivateStaff: async (id: string) => {
        const response = await api.put(`/staff/${id}/reactivate`);
        return response.data;
    }
};

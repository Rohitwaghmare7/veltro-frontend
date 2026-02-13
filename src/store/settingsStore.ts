import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/lib/api';

interface Service {
    name: string;
    duration: number;
    price: number;
    description: string;
}

interface WorkingHours {
    day: string;
    start: string;
    end: string;
    isOpen: boolean;
}

interface BusinessProfile {
    name: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    category: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

interface SettingsState {
    business: any | null;
    profileData: BusinessProfile;
    services: Service[];
    workingHours: WorkingHours[];
    bookingUrl: string;
    loading: boolean;
    processing: boolean;
    error: string | null;
    
    // Actions
    fetchSettings: () => Promise<void>;
    updateProfile: (data: BusinessProfile) => Promise<{ success: boolean; error?: string }>;
    updateServices: (services: Service[]) => Promise<{ success: boolean; error?: string }>;
    updateWorkingHours: (hours: WorkingHours[]) => Promise<{ success: boolean; error?: string }>;
    deactivateWorkspace: (businessName: string) => Promise<{ success: boolean; error?: string }>;
    setProfileData: (data: BusinessProfile) => void;
    setServices: (services: Service[]) => void;
    setWorkingHours: (hours: WorkingHours[]) => void;
    clearError: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    devtools(
        (set, get) => ({
            business: null,
            profileData: {
                name: '',
                phone: '',
                email: '',
                website: '',
                description: '',
                category: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                }
            },
            services: [],
            workingHours: [],
            bookingUrl: '',
            loading: false,
            processing: false,
            error: null,

            fetchSettings: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await api.get('/onboarding/progress');
                    if (response.data.success) {
                        const biz = response.data.data.business;
                        
                        const profileData: BusinessProfile = {
                            name: biz.name || '',
                            phone: biz.phone || '',
                            email: biz.email || '',
                            website: biz.website || '',
                            description: biz.description || '',
                            category: biz.category || 'other',
                            address: {
                                street: biz.address?.street || '',
                                city: biz.address?.city || '',
                                state: biz.address?.state || '',
                                zipCode: biz.address?.zipCode || '',
                                country: biz.address?.country || ''
                            }
                        };

                        const bookingUrl = biz.bookingSlug 
                            ? `${window.location.origin}/book/${biz.bookingSlug}`
                            : '';

                        set({
                            business: biz,
                            profileData,
                            services: biz.services || [],
                            workingHours: biz.workingHours || [],
                            bookingUrl,
                            loading: false
                        });
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

            updateProfile: async (data) => {
                set({ processing: true, error: null });
                try {
                    await api.put('/onboarding/step/1', data);
                    await get().fetchSettings();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update profile';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            updateServices: async (services) => {
                const { business } = get();
                set({ processing: true, error: null });
                try {
                    await api.put('/onboarding/step/4', {
                        services,
                        workingHours: business?.workingHours || []
                    });
                    await get().fetchSettings();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update services';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            updateWorkingHours: async (hours) => {
                const { business } = get();
                set({ processing: true, error: null });
                try {
                    await api.put('/onboarding/step/4', {
                        services: business?.services || [],
                        workingHours: hours
                    });
                    await get().fetchSettings();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to update working hours';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            deactivateWorkspace: async (businessName) => {
                const { business } = get();
                if (businessName !== business?.name) {
                    return { success: false, error: 'Business name does not match' };
                }

                set({ processing: true, error: null });
                try {
                    await api.put('/onboarding/progress', { isSetupComplete: false });
                    await get().fetchSettings();
                    set({ processing: false });
                    return { success: true };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to deactivate workspace';
                    set({ error: errorMessage, processing: false });
                    return { success: false, error: errorMessage };
                }
            },

            setProfileData: (data) => set({ profileData: data }),
            setServices: (services) => set({ services }),
            setWorkingHours: (hours) => set({ workingHours: hours }),
            clearError: () => set({ error: null }),
        }),
        { name: 'SettingsStore' }
    )
);

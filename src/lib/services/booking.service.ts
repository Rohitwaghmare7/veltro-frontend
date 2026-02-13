import api from '@/lib/api';

export interface Booking {
    _id: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceType: string;
    date: string; // ISO date string
    timeSlot: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
    location?: string;
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    contactId?: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        source?: string;
        status?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingData {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceType: string;
    date: string;
    timeSlot: string;
    duration?: number;
    notes?: string;
}

export const bookingService = {
    // Public: Get business info for booking page
    getPublicBusinessInfo: async (slug: string) => {
        const response = await api.get(`/public/book/${slug}`);
        return response.data;
    },

    // Public: Create a new booking
    createPublicBooking: async (slug: string, data: CreateBookingData) => {
        const response = await api.post(`/public/book/${slug}`, data);
        return response.data;
    },

    // Dashboard: Get all bookings
    getAllBookings: async (filters?: { 
        status?: string; 
        from?: string; 
        to?: string;
        serviceType?: string;
        assignedTo?: string;
    }) => {
        const response = await api.get('/bookings', { params: filters });
        return response.data;
    },

    // Dashboard: Create a new booking (internal)
    createBooking: async (data: CreateBookingData) => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    // Dashboard: Get single booking by ID
    getBookingById: async (id: string) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    // Dashboard: Update booking
    updateBooking: async (id: string, data: Partial<Booking>) => {
        const response = await api.put(`/bookings/${id}`, data);
        return response.data;
    },

    // Dashboard: Update booking status
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/bookings/${id}/status`, { status });
        return response.data;
    },

    // Dashboard: Delete booking
    deleteBooking: async (id: string) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    }
};

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { bookingService, Booking, CreateBookingData } from '@/lib/services/booking.service';

interface BookingsState {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
    creating: boolean;
    filters: {
        status?: string;
        from?: string;
        to?: string;
        serviceType?: string;
        assignedTo?: string;
    };
    
    // Actions
    fetchBookings: (filters?: BookingsState['filters']) => Promise<void>;
    createBooking: (data: CreateBookingData) => Promise<{ success: boolean; data?: Booking; error?: string }>;
    updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
    updateBookingStatus: (id: string, status: string) => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
    setFilters: (filters: BookingsState['filters']) => void;
    clearError: () => void;
}

export const useBookingsStore = create<BookingsState>()(
    devtools(
        persist(
            (set, get) => ({
                bookings: [],
                loading: false,
                error: null,
                creating: false,
                filters: {},

                fetchBookings: async (filters) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await bookingService.getAllBookings(filters || get().filters);
                        if (response.success) {
                            set({ bookings: response.data, loading: false });
                        } else {
                            set({ error: 'Failed to fetch bookings', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to fetch bookings', 
                            loading: false 
                        });
                    }
                },

                createBooking: async (data) => {
                    set({ creating: true, error: null });
                    try {
                        const response = await bookingService.createBooking(data);
                        if (response.success) {
                            // Add the new booking to the list
                            set((state) => ({
                                bookings: [...state.bookings, response.data],
                                creating: false
                            }));
                            return { success: true, data: response.data };
                        } else {
                            set({ error: 'Failed to create booking', creating: false });
                            return { success: false, error: 'Failed to create booking' };
                        }
                    } catch (error: any) {
                        const errorMessage = error.response?.data?.message || 'Failed to create booking';
                        set({ error: errorMessage, creating: false });
                        return { success: false, error: errorMessage };
                    }
                },

                updateBooking: async (id, data) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await bookingService.updateBooking(id, data);
                        if (response.success) {
                            // Update the booking in the list
                            set((state) => ({
                                bookings: state.bookings.map((booking) =>
                                    booking._id === id ? { ...booking, ...response.data } : booking
                                ),
                                loading: false
                            }));
                        } else {
                            set({ error: 'Failed to update booking', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to update booking', 
                            loading: false 
                        });
                    }
                },

                updateBookingStatus: async (id, status) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await bookingService.updateStatus(id, status);
                        if (response.success) {
                            // Update the booking status in the list
                            set((state) => ({
                                bookings: state.bookings.map((booking) =>
                                    booking._id === id ? { ...booking, status: status as any } : booking
                                ),
                                loading: false
                            }));
                        } else {
                            set({ error: 'Failed to update booking status', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to update booking status', 
                            loading: false 
                        });
                    }
                },

                deleteBooking: async (id) => {
                    set({ loading: true, error: null });
                    try {
                        const response = await bookingService.deleteBooking(id);
                        if (response.success) {
                            // Remove the booking from the list
                            set((state) => ({
                                bookings: state.bookings.filter((booking) => booking._id !== id),
                                loading: false
                            }));
                        } else {
                            set({ error: 'Failed to delete booking', loading: false });
                        }
                    } catch (error: any) {
                        set({ 
                            error: error.response?.data?.message || 'Failed to delete booking', 
                            loading: false 
                        });
                    }
                },

                setFilters: (filters) => {
                    set({ filters });
                    get().fetchBookings(filters);
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: 'bookings-storage',
                partialize: (state) => ({ filters: state.filters }), // Only persist filters
            }
        ),
        { name: 'BookingsStore' }
    )
);

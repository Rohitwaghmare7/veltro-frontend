import api from '@/lib/api';

export interface InventoryItem {
    _id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    threshold: number;
    vendorEmail?: string;
    lastRestocked?: string;
    alertSent?: boolean;
    updatedAt: string;
}

export interface CreateInventoryData {
    name: string;
    category?: string;
    stock?: number;
    unit?: string;
    threshold?: number;
    vendorEmail?: string;
}

export const inventoryService = {
    // Get all items
    getInventory: async () => {
        const response = await api.get('/inventory');
        return response.data;
    },

    // Add new item
    addItem: async (data: CreateInventoryData) => {
        const response = await api.post('/inventory', data);
        return response.data;
    },

    // Update item details
    updateItem: async (id: string, data: Partial<CreateInventoryData>) => {
        const response = await api.put(`/inventory/${id}`, data);
        return response.data;
    },

    // Delete item
    deleteItem: async (id: string) => {
        const response = await api.delete(`/inventory/${id}`);
        return response.data;
    },

    // Restock item
    restockItem: async (id: string, quantity: number, action: 'add' | 'set' | 'subtract' = 'add') => {
        const response = await api.put(`/inventory/${id}/restock`, { quantity, action });
        return response.data;
    }
};

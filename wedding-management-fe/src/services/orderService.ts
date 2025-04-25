import type {
    Order,
    CreateOrderDTO,
    UpdateOrderDTO,
    OrderFilters,
    OrderListResponse,
    OrderDetailsResponse,
} from '../types/order';
import { api } from './api';

const BASE_URL = '/orders';

const orderService = {
    getOrders: async (filters: OrderFilters): Promise<OrderListResponse> => {
        const response = await api.get(BASE_URL, { params: filters });
        return response.data.data;
    },

    getOrderById: async (id: string): Promise<OrderDetailsResponse> => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data.data;
    },

    createOrder: async (orderData: CreateOrderDTO): Promise<Order> => {
        const response = await api.post(BASE_URL, orderData);
        return response.data.data;
    },

    updateOrder: async (id: string, updateData: UpdateOrderDTO): Promise<Order> => {
        const response = await api.patch(`${BASE_URL}/${id}`, updateData);
        return response.data.data;
    },

    // Delete order
    deleteOrder: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    // Get order statistics
    getOrderStats: async (params?: {
        startDate?: string;
        endDate?: string;
        timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }) => {
        const response = await api.get(`${BASE_URL}/stats/overview`, { params });
        return response.data.data;
    },
};

export default orderService; 
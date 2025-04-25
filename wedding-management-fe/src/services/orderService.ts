import type {
    Order,
    CreateOrderDTO,
    UpdateOrderDTO,
    OrderFilters,
    OrderListResponse,
    OrderDetailsResponse,
    OrderStats,
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
        try {
            const response = await api.post(BASE_URL, {
                ...orderData,
                items: orderData.items.map(item => ({
                    costumeId: item.costumeId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        }
    },

    updateOrder: async (id: string, updateData: UpdateOrderDTO): Promise<Order> => {
        try {
            const response = await api.patch(`${BASE_URL}/${id}`, {
                ...updateData,
                items: updateData.items?.map(item => ({
                    costumeId: item.costumeId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đơn hàng');
        }
    },

    deleteOrder: async (id: string): Promise<void> => {
        try {
            await api.delete(`${BASE_URL}/${id}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn hàng');
        }
    },

    getOrderStats: async (params?: {
        startDate?: string;
        endDate?: string;
        timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    }): Promise<OrderStats> => {
        try {
            const response = await api.get(`${BASE_URL}/stats/overview`, { params });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thống kê đơn hàng');
        }
    },

    validateOrder: async (orderData: Partial<CreateOrderDTO>): Promise<{ valid: boolean; message?: string }> => {
        try {
            const response = await api.post(`${BASE_URL}/validate`, orderData);
            return response.data.data;
        } catch (error: any) {
            return {
                valid: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra đơn hàng',
            };
        }
    },
};

export default orderService; 
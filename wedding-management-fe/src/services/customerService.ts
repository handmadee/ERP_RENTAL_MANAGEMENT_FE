import { api } from './api';

export const translateOrderStatus = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'Chờ xử lý';
        case 'active':
            return 'Đang thuê';
        case 'completed':
            return 'Hoàn thành';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return status;
    }
};

export interface OrderStats {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
}

export interface OrderItem {
    costumeId: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Order {
    _id: string;
    orderCode: string;
    status: string;
    total: number;
    orderDate: string;
    returnDate: string;
    items: OrderItem[];
}

export interface Customer {
    _id: string;
    customerCode: string;
    fullName: string;
    phone: string;
    address: string;
    note?: string;
    createdAt: string;
    totalSpent: number;
    orderStats: OrderStats;
    orders: Order[];
    status: 'active' | 'inactive';
}

export interface CustomerResponse {
    success: boolean;
    data: {
        data: Customer[];
        metadata: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface CreateCustomerDto {
    fullName: string;
    phone: string;
    address: string;
    note?: string;
}

export interface UpdateCustomerDto {
    fullName?: string;
    phone?: string;
    address?: string;
    note?: string;
    status?: 'active' | 'inactive';
}

export interface CustomerStats {
    totalSpent?: number;
    totalOrders?: number;
    successfulOrders?: number;
    canceledOrders?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface CustomerDetails extends Customer {
    orders: Order[];
}

export class CustomerService {
    private readonly API_URL = '/customers';

    async getCustomers(page: number = 1, limit: number = 10, search?: string) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        const response = await api.get<CustomerResponse>(`${this.API_URL}?${params}`);
        return response.data;
    }

    async getCustomerById(id: string) {
        const response = await api.get<{ success: boolean; data: Customer }>(`${this.API_URL}/${id}`);
        return response.data;
    }

    async getCustomerOrders(id: string) {
        const response = await api.get<ApiResponse<CustomerDetails>>(`${this.API_URL}/${id}/orders`);
        return response.data;
    }

    async createCustomer(data: CreateCustomerDto) {
        const response = await api.post<{ success: boolean; data: Customer }>(this.API_URL, data);
        return response.data;
    }

    async updateCustomer(id: string, data: UpdateCustomerDto) {
        try {
            const response = await api.patch<ApiResponse<Customer>>(`${this.API_URL}/${id}`, {
                ...data
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Cập nhật thông tin khách hàng thất bại');
            }

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin khách hàng');
        }
    }

    async deleteCustomer(id: string) {
        const response = await api.delete<{ success: boolean }>(`${this.API_URL}/${id}`);
        return response.data;
    }

    async getCustomerStats() {
        const response = await api.get<{ success: boolean; data: any }>(`${this.API_URL}/stats`);
        return response.data;
    }

    async updateCustomerStats(id: string, stats: CustomerStats) {
        const response = await api.patch<{ success: boolean; data: Customer }>(`${this.API_URL}/${id}/stats`, stats);
        return response.data;
    }
}

export const customerService = new CustomerService(); 
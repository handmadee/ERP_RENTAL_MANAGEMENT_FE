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

export interface DetailedCustomerResponse {
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

    async getCustomers(params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    } = {}) {
        const queryParams = new URLSearchParams();

        // Set default values if not provided
        queryParams.append('page', (params.page || 1).toString());
        queryParams.append('limit', (params.limit || 10).toString());

        if (params.search) {
            queryParams.append('search', params.search);
        }

        if (params.sortBy) {
            queryParams.append('sortBy', params.sortBy);
        }

        if (params.sortOrder) {
            queryParams.append('sortOrder', params.sortOrder);
        }

        const response = await api.get<ApiResponse<{
            data: Customer[];
            metadata: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>>(`${this.API_URL}?${queryParams}`);

        return response.data.data;
    }

    async getCustomersWithStats(search?: string) {
        const params = new URLSearchParams();
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<DetailedCustomerResponse>(`${this.API_URL}/detailed-list?${params}`);
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
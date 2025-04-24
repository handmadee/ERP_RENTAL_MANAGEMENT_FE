import { api } from './api';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
}

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    note?: string;
    eventDate?: Date;
    deliveryAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    READY_FOR_DELIVERY = 'ready_for_delivery',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
    REFUNDED = 'refunded'
}

export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    MOMO = 'momo',
    ZALO_PAY = 'zalo_pay'
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface OrderListResponse {
    items: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateOrderDto {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    items: Omit<OrderItem, 'id'>[];
    paymentMethod: PaymentMethod;
    note?: string;
    eventDate?: Date;
    deliveryAddress?: string;
}

export interface UpdateOrderDto {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items?: OrderItem[];
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    note?: string;
    eventDate?: Date;
    deliveryAddress?: string;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
    note?: string;
}

class OrderService {
    private readonly API_URL = '/api/orders';

    async createOrder(data: CreateOrderDto): Promise<Order> {
        const response = await api.post<Order>(this.API_URL, data);
        return response.data;
    }

    async getOrders(filters: OrderFilters = {}): Promise<OrderListResponse> {
        const response = await api.get<OrderListResponse>(this.API_URL, {
            params: {
                ...filters,
                startDate: filters.startDate?.toISOString(),
                endDate: filters.endDate?.toISOString()
            }
        });
        return response.data;
    }

    async getOrder(id: string): Promise<Order> {
        const response = await api.get<Order>(`${this.API_URL}/${id}`);
        return response.data;
    }

    async updateOrder(id: string, data: UpdateOrderDto): Promise<Order> {
        const response = await api.patch<Order>(`${this.API_URL}/${id}`, data);
        return response.data;
    }

    async updateOrderStatus(id: string, data: UpdateOrderStatusDto): Promise<Order> {
        const response = await api.patch<Order>(`${this.API_URL}/${id}/status`, data);
        return response.data;
    }

    async deleteOrder(id: string): Promise<void> {
        await api.delete(`${this.API_URL}/${id}`);
    }

    // Helper methods
    getStatusColor(status: OrderStatus): string {
        const colors = {
            [OrderStatus.PENDING]: '#ffa726', // Orange
            [OrderStatus.CONFIRMED]: '#29b6f6', // Light Blue
            [OrderStatus.IN_PROGRESS]: '#66bb6a', // Light Green
            [OrderStatus.READY_FOR_DELIVERY]: '#ab47bc', // Purple
            [OrderStatus.DELIVERED]: '#26a69a', // Teal
            [OrderStatus.COMPLETED]: '#4caf50', // Green
            [OrderStatus.CANCELLED]: '#ef5350', // Red
            [OrderStatus.REFUNDED]: '#78909c' // Blue Grey
        };
        return colors[status] || '#9e9e9e'; // Default Grey
    }

    getStatusText(status: OrderStatus): string {
        const texts = {
            [OrderStatus.PENDING]: 'Chờ xác nhận',
            [OrderStatus.CONFIRMED]: 'Đã xác nhận',
            [OrderStatus.IN_PROGRESS]: 'Đang xử lý',
            [OrderStatus.READY_FOR_DELIVERY]: 'Sẵn sàng giao hàng',
            [OrderStatus.DELIVERED]: 'Đã giao hàng',
            [OrderStatus.COMPLETED]: 'Hoàn thành',
            [OrderStatus.CANCELLED]: 'Đã hủy',
            [OrderStatus.REFUNDED]: 'Đã hoàn tiền'
        };
        return texts[status] || 'Không xác định';
    }

    getPaymentStatusText(status: PaymentStatus): string {
        const texts = {
            [PaymentStatus.PENDING]: 'Chưa thanh toán',
            [PaymentStatus.PARTIAL]: 'Thanh toán một phần',
            [PaymentStatus.PAID]: 'Đã thanh toán',
            [PaymentStatus.REFUNDED]: 'Đã hoàn tiền'
        };
        return texts[status] || 'Không xác định';
    }

    getPaymentMethodText(method: PaymentMethod): string {
        const texts = {
            [PaymentMethod.CASH]: 'Tiền mặt',
            [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
            [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng',
            [PaymentMethod.MOMO]: 'Ví MoMo',
            [PaymentMethod.ZALO_PAY]: 'ZaloPay'
        };
        return texts[method] || 'Không xác định';
    }
}

export const orderService = new OrderService(); 
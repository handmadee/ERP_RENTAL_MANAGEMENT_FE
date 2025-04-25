export enum ORDER_STATUS {
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface OrderItem {
    costumeId: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface OrderTimeline {
    date: string;
    status: string;
    note: string;
    formattedDate: string;
}

export interface Order {
    _id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string; 
    address?: string;
    orderDate: string;
    returnDate: string;
    items: OrderItem[];
    total: number;
    deposit: number;
    remainingAmount: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    note?: string;
    timeline: OrderTimeline[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderDTO {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address?: string;
    orderDate: string;
    returnDate: string;
    items: Omit<OrderItem, 'subtotal'>[];
    total: number;
    deposit: number;
    remainingAmount: number;
    status?: string;
    note?: string;
}

export interface UpdateOrderDTO {
    customerName?: string;
    customerPhone?: string;
    address?: string;
    orderDate?: string;
    returnDate?: string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    deposit?: number;
    note?: string;
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface OrderListResponse {
    data: Order[];
    total: number;
    page: number;
    limit: number;
}

export interface OrderDetailsResponse {
    orderDetails: {
        _id: string;
        orderCode: string;
        customerId: {
            customerCode: string;
            fullName: string;
            phone: string;
            email?: string;
            address?: string;
        };
        items: Array<{
            costumeCode: string;
            costumeName: string;
            quantity: number;
            price: number;
            subtotal: number;
            availability: {
                total: number;
                available: number;
                rented: number;
                percentageRented: string;
            };
        }>;
        total: number;
        deposit: number;
        remainingAmount: number;
        status: string;
        orderDate: string;
        returnDate: string;
    };
    rentalMetrics: {
        rentalDuration: number;
        daysUntilReturn: number;
        isOverdue: boolean;
        status: string;
        daysLabel: string;
    };
    financialMetrics: {
        total: number;
        deposit: number;
        remainingAmount: number;
        paymentStatus: string;
        paymentPercentage: string;
    };
    customerHistory: {
        previousOrders: Array<{
            orderCode: string;
            orderDate: string;
            total: number;
            status: string;
        }>;
        totalOrders: number;
        isReturningCustomer: boolean;
    };
    timeline: OrderTimeline[];
} 
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
    costumeName?: string;
    costumeImage?: string;
}

export interface TimelineEntry {
    status: ORDER_STATUS;
    date: Date;
    note?: string;
}

export interface Order {
    id: string;
    orderCode: string;
    customerId: string;
    customerName?: string;
    accountId: string;
    orderDate: Date;
    returnDate: Date;
    items: OrderItem[];
    total: number;
    deposit: number;
    remainingAmount: number;
    status: ORDER_STATUS;
    note?: string;
    timeline: TimelineEntry[];
    isOverdue?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderListResponse {
    data: Order[];
    total: number;
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: ORDER_STATUS;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} 
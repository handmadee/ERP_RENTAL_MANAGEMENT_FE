export interface Customer {
    id: string;
    customerCode: string;
    fullName: string;
    phone: string;
    address?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerStats {
    totalCustomers: number;
    totalSpent: number;
    topCustomers: Array<{
        customerCode: string;
        fullName: string;
        totalSpent: number;
        totalOrders: number;
    }>;
}

export interface CustomerOrder {
    orderCode: string;
    status: string;
    total: number;
    orderDate: Date;
    returnDate: Date;
    items: Array<any>;
}

export interface CustomerWithOrders extends Customer {
    totalSpent: number;
    orderStats: {
        total: number;
        pending: number;
        active: number;
        completed: number;
        cancelled: number;
    };
    orders: CustomerOrder[];
}

export interface CustomerListResponse {
    data: Customer[];
    total: number;
}

export interface CustomerFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
} 
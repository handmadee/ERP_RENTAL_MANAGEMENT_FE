export enum ORDER_STATUS {
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface OrderItem {
    costumeId: string;
    quantity: number;
    price: number;
    subtotal?: number;
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
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderDate: string;
    returnDate: string;
    items: OrderItem[];
    total: number;
    deposit: number;
    remainingAmount: number;
    status: ORDER_STATUS;
    note?: string;
    timeline?: {
        date: string;
        status: string;
        note: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderDTO {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderDate: string;
    returnDate: string;
    items: OrderItem[];
    deposit: number;
    note?: string;
    status?: ORDER_STATUS;
}

export interface UpdateOrderDTO {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    orderDate?: string;
    returnDate?: string;
    items?: OrderItem[];
    deposit?: number;
    note?: string;
    status?: ORDER_STATUS;
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: ORDER_STATUS;
    startDate?: string;
    endDate?: string;
}

export interface OrderListResponse {
    data: Order[];
    total: number;
}

export interface OrderDetailsResponse {
    orderDetails: Order;
}

export interface OrderStats {
    summary: {
        totalOrders: number;
        pendingOrders: number;
        activeOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        monthlyRevenue: number;
        avgOrderValue: number;
        depositCollectionRate: string;
    };
    performance: {
        orderCompletion: {
            completed: number;
            total: number;
            rate: string;
        };
        financials: {
            totalRevenue: number;
            collectedAmount: number;
            pendingAmount: number;
            avgOrderValue: number;
        };
        customerMetrics: {
            topCustomers: Array<{
                customerInfo: {
                    customerCode: string;
                    fullName: string;
                    phone: string;
                    address?: string;
                    note?: string;
                };
                orderCount: number;
                totalSpent: number;
                avgOrderValue: number;
                lastOrderDate: string;
            }>;
            topCostumes: Array<{
                rentCount: number;
                revenue: number;
                avgPrice: number;
            }>;
        };
    };
    trends: {
        daily: Array<{
            date: string;
            revenue: number;
            orders: number;
            deposits: number;
            pending: number;
        }>;
        weekly: Array<{
            period: string;
            orderCount: number;
            revenue: number;
            avgOrderValue: number;
        }>;
        monthly: Array<{
            period: string;
            orderCount: number;
            revenue: number;
            avgOrderValue: number;
        }>;
    };
    recentOrders: Array<{
        orderCode: string;
        customerName: string;
        customerPhone: string;
        orderDate: string;
        returnDate: string;
        status: string;
        total: number;
        deposit: number;
        remainingAmount: number;
        items: number;
        createdBy: string;
    }>;
} 
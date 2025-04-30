import { api } from './api';
import { TimeRange } from '../pages/DashboardPage';

export interface DashboardData {
    totalRevenue: number;
    revenuePercentChange: number;
    totalOrders: number;
    ordersPercentChange: number;
    totalCustomers: number;
    customersPercentChange: number;
    totalCostumes: number;
    weeklyStatistics: Array<{
        date: string;
        revenue: number;
        orders: number;
        customers: number;
    }>;
    categoryDistribution: Array<{
        name: string;
        color: string;
        productCount: number;
        percentage: number;
    }>;
    recentOrders: Array<{
        _id: string;
        orderCode: string;
        orderDate: string;
        total: number;
        status: string;
        customerName: string;
    }>;
    categoryRevenue: Array<{
        name: string;
        color: string;
        revenue: number;
        percentage: number;
    }>;
    revenueForecast: Array<{
        date: string;
        revenue: number;
    }>;
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

const dashboardService = {
    getDashboardData: async (timeRange: TimeRange = TimeRange.DAYS_7): Promise<DashboardData> => {
        try {
            const params = { timeRange };
            const response = await api.get('/dashboard', { params });
            // The API has nested data structure
            return response.data.data.data;
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    },
};

export default dashboardService; 
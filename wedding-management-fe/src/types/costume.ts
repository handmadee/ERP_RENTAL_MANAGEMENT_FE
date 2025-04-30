export interface Category {
    _id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    productCount: number;
    products?: Costume[];
}

export interface Costume {
    _id: string;
    code: string;
    name: string;
    categoryId?: string;
    category?: Category;
    price: number;
    size: string;
    status: 'available' | 'rented' | 'maintenance';
    imageUrl?: string;
    listImageUrl?: string[];
    description: string;
    quantityAvailable: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    path: string;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export interface CostumeFilters {
    page?: number;
    limit?: number;
    name?: string;
    categoryId?: string;
    status?: 'available' | 'rented' | 'maintenance';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryStats {
    totalProducts: number;
    availableProducts: number;
    rentedProducts: number;
}

export interface StatusStat {
    status: string;
    count: number;
}

export interface CategoryStat {
    categoryId: string;
    categoryName: string;
    count: number;
}

export interface CostumeStats {
    totalCostumes: number;
    availableCostumes: number;
    rentedCostumes: number;
    maintenanceCostumes: number;
    categoryStats: CategoryStats[];
}

export interface CostumeBasicInfo {
    listImageUrl: string[];
    _id: string;
    code: string;
    name: string;
    categoryId: {
        _id: string;
        name: string;
        description: string;
    };
    price: number;
    size: string;
    status: string;
    imageUrl: string;
    description: string;
    quantityAvailable: number;
    quantityRented: number;
    createdAt: string;
    updatedAt: string;
    category: {
        _id: string;
        name: string;
        description: string;
    };
}

export interface InventoryMetrics {
    totalQuantity: number;
    available: number;
    rented: number;
    utilizationRate: string;
    restockNeeded: boolean;
    recommendedRestock: number;
}

export interface FinancialMetrics {
    currentPrice: number;
    totalRevenue: number;
    averageRevenuePerRental: number;
    profitabilityScore: string;
}

export interface RentalMetrics {
    totalRentals: number;
    activeRentals: number;
    currentUtilization: string;
    popularityScore: string;
}

export interface MaintenanceInfo {
    status: string;
    lastMaintenance: string;
    nextMaintenance: string;
}

export interface RentalHistory {
    orderCode: string;
    orderDate: string;
    returnDate: string;
    status: string;
}

export interface CostumeMetadata {
    createdAt: string;
    lastUpdated: string;
    lastStatusChange: string;
}

export interface CostumeDetail {
    basicInfo: CostumeBasicInfo;
    inventoryMetrics: InventoryMetrics;
    financialMetrics: FinancialMetrics;
    rentalMetrics: RentalMetrics;
    maintenanceInfo: MaintenanceInfo;
    currentRentals: any[]; // You can define a specific type if needed
    recentHistory: RentalHistory[];
    metadata: CostumeMetadata;
} 
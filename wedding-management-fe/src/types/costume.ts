export interface Costume {
    _id: string;
    code: string;
    name: string;
    categoryId: string;
    category: {
        _id: string;
        name: string;
        color: string;
    };
    price: number;
    size: string;
    status: 'available' | 'rented' | 'maintenance';
    imageUrl: string;
    description: string;
    quantityAvailable: number;
    quantityRented: number;
    createdAt: string;
    updatedAt: string;
}

export interface CostumeCategory {
    _id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CostumeStats {
    totalCostumes: number;
    totalCategories: number;
    totalStock: number;
    averagePrice: number;
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
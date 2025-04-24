import { Costume as CostumeType, CostumeCategory, CostumeStats, StatusStat, CategoryStat } from '../types/costume';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Interfaces para las categorías
export interface Category {
    _id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    productCount: number;
}

export interface CreateCategoryDto {
    name: string;
    color: string;
    description?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    color?: string;
    description?: string;
}

// Reutilizamos la interfaz de Costume importada como CostumeType
export interface Costume {
    _id: string;
    code: string;
    name: string;
    categoryId: string;
    category: Category;
    price: number;
    rentPrice: number;
    depositFee: number;
    size: string[];
    colors: string[];
    material: string;
    style: string;
    condition: 'new' | 'good' | 'fair' | 'poor';
    status: 'available' | 'rented' | 'maintenance' | 'reserved';
    imageUrls: string[];
    thumbnailUrl: string;
    description: string;
    features: string[];
    careInstructions: string;
    notes: string;
    quantityAvailable: number;
    quantityRented: number;
    quantityReserved: number;
    totalRentals: number;
    lastRentalDate?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCostumeDto {
    name: string;
    categoryId: string;
    code?: string;
    price: number;
    rentPrice: number;
    depositFee: number;
    size: string[];
    colors: string[];
    material: string;
    style: string;
    condition: 'new' | 'good' | 'fair' | 'poor';
    status: 'available' | 'rented' | 'maintenance' | 'reserved';
    imageUrls: string[];
    thumbnailUrl: string;
    description: string;
    features: string[];
    careInstructions: string;
    notes: string;
    quantityAvailable: number;
}

export interface UpdateCostumeDto {
    name?: string;
    categoryId?: string;
    price?: number;
    rentPrice?: number;
    depositFee?: number;
    size?: string[];
    colors?: string[];
    material?: string;
    style?: string;
    condition?: 'new' | 'good' | 'fair' | 'poor';
    status?: 'available' | 'rented' | 'maintenance' | 'reserved';
    imageUrls?: string[];
    thumbnailUrl?: string;
    description?: string;
    features?: string[];
    careInstructions?: string;
    notes?: string;
    quantityAvailable?: number;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
}

export interface CostumeFilterParams {
    code?: string;
    name?: string;
    categoryId?: string;
    status?: 'available' | 'rented' | 'maintenance';
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

// Interfaces para los parámetros de búsqueda y respuestas
export interface CostumeSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CostumeResponse {
    data: Costume[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    };
}

// Interfaz para las opciones de filtrado en la lista de disfraces
interface GetCostumesOptions {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

// Obtener lista de categorías
export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Obtener categoría por ID
export const getCategoryById = async (id: string): Promise<Category> => {
    try {
        const response = await api.get(`${API_URL}/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching category with id ${id}:`, error);
        throw error;
    }
};

// Crear categoría
export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
    try {
        const response = await api.post(`${API_URL}/categories`, category);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Actualizar categoría
export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    try {
        const response = await api.patch(`${API_URL}/categories/${id}`, category);
        return response.data;
    } catch (error) {
        console.error(`Error updating category with id ${id}:`, error);
        throw error;
    }
};

// Eliminar categoría
export const deleteCategory = async (id: string): Promise<void> => {
    try {
        await api.delete(`${API_URL}/categories/${id}`);
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};

// Obtener lista de disfraces con paginación y filtros
export const getCostumes = async (params: CostumeFilterParams = {}): Promise<PaginatedResponse<Costume>> => {
    try {
        const response = await api.get(`${API_URL}/costumes`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching costumes:', error);
        throw error;
    }
};

// Obtener un disfraz por ID
export const getCostumeById = async (id: string): Promise<Costume> => {
    try {
        const response = await api.get(`${API_URL}/costumes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching costume with id ${id}:`, error);
        throw error;
    }
};

// Obtener un disfraz por código
export const getCostumeByCode = async (code: string): Promise<Costume> => {
    try {
        const response = await api.get(`${API_URL}/costumes/code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching costume with code ${code}:`, error);
        throw error;
    }
};

// Crear un nuevo disfraz
export const createCostume = async (costume: CreateCostumeDto): Promise<Costume> => {
    try {
        const response = await api.post(`${API_URL}/costumes`, costume);
        return response.data;
    } catch (error) {
        console.error('Error creating costume:', error);
        throw error;
    }
};

// Actualizar un disfraz existente
export const updateCostume = async (id: string, costume: UpdateCostumeDto): Promise<Costume> => {
    try {
        const response = await api.patch(`${API_URL}/costumes/${id}`, costume);
        return response.data;
    } catch (error) {
        console.error(`Error updating costume with id ${id}:`, error);
        throw error;
    }
};

// Eliminar un disfraz
export const deleteCostume = async (id: string): Promise<void> => {
    try {
        await api.delete(`${API_URL}/costumes/${id}`);
    } catch (error) {
        console.error(`Error deleting costume with id ${id}:`, error);
        throw error;
    }
};

// Obtener estadísticas de disfraces por estado
export const getCostumeStatsByStatus = async (): Promise<StatusStat[]> => {
    try {
        const response = await api.get(`${API_URL}/costumes/stats/by-status`);
        return response.data;
    } catch (error) {
        console.error('Error fetching costume status statistics:', error);
        throw error;
    }
};

// Obtener estadísticas de disfraces por categoría
export const getCostumeStatsByCategory = async (): Promise<CategoryStat[]> => {
    try {
        const response = await api.get(`${API_URL}/costumes/stats/by-category`);
        return response.data;
    } catch (error) {
        console.error('Error fetching costume category statistics:', error);
        throw error;
    }
};

// Servicio para manejar las operaciones con disfraces
const costumeService = {
    // Categorías
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,

    // Disfraces
    getCostumes,
    getCostumeById,
    getCostumeByCode,
    createCostume,
    updateCostume,
    deleteCostume,

    // Estadísticas
    getCostumeStatsByStatus,
    getCostumeStatsByCategory,

    // Get costume statistics
    getCostumeStats: async (): Promise<CostumeStats> => {
        try {
            const response = await api.get(`${API_URL}/costumes/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching costume statistics:', error);
            throw error;
        }
    },

    // Get costume maintenance history
    getCostumeMaintenanceHistory: async (id: string): Promise<any[]> => {
        try {
            const response = await api.get(`${API_URL}/costumes/${id}/maintenance-history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching costume maintenance history:', error);
            throw error;
        }
    },

    // Get costume rental history
    getCostumeRentalHistory: async (id: string): Promise<any[]> => {
        try {
            const response = await api.get(`${API_URL}/costumes/${id}/rental-history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching costume rental history:', error);
            throw error;
        }
    },

    // Schedule maintenance
    scheduleMaintenance: async (id: string, date: string, notes: string): Promise<void> => {
        try {
            await api.post(`${API_URL}/costumes/${id}/schedule-maintenance`, { date, notes });
        } catch (error) {
            console.error('Error scheduling maintenance:', error);
            throw error;
        }
    },

    // Complete maintenance
    completeMaintenance: async (id: string, notes: string): Promise<void> => {
        try {
            await api.post(`${API_URL}/costumes/${id}/complete-maintenance`, { notes });
        } catch (error) {
            console.error('Error completing maintenance:', error);
            throw error;
        }
    },

    // Reserve costume
    reserveCostume: async (id: string, quantity: number, fromDate: string, toDate: string): Promise<void> => {
        try {
            await api.post(`${API_URL}/costumes/${id}/reserve`, { quantity, fromDate, toDate });
        } catch (error) {
            console.error('Error reserving costume:', error);
            throw error;
        }
    }
};

export default costumeService; 
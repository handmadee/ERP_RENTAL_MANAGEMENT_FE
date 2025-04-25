import { Costume, Category, ApiResponse, PaginatedResponse, CostumeFilters, CostumeStats, CostumeDetail } from '../types/costume';
import { api } from './api';

// Image Upload Types
interface ImageThumbnail {
    size: string;
    url: string;
}

interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    thumbnails: ImageThumbnail[];
    originalSize?: number;
}

interface ImageUploadResponse {
    _id: string;
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    compressed: boolean;
    status: 'pending' | 'processing' | 'completed';
    url: string;
    metadata: ImageMetadata;
    createdAt: string;
    updatedAt: string;
}

interface UploadImageOptions {
    entityId?: string;
    entityType?: 'costume' | 'category';
    compress?: boolean;
}

// Image Upload Service
export const uploadImage = async (file: File, options?: UploadImageOptions): Promise<ImageUploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        if (options?.entityId) {
            formData.append('entityId', options.entityId);
        }
        if (options?.entityType) {
            formData.append('entityType', options.entityType);
        }
        if (options?.compress !== undefined) {
            formData.append('compress', String(options.compress));
        }
        const response = await api.post<ApiResponse<ImageUploadResponse>>('/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("🚀 ~ uploadImage ~ response:", response)
        return response.data.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const uploadMultipleImages = async (files: File[], options?: UploadImageOptions): Promise<ImageUploadResponse[]> => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, options));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getCategoryById = async (id: string): Promise<Category> => {
    try {
        const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching category with id ${id}:`, error);
        throw error;
    }
};

export const createCategory = async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<Category> => {
    try {
        const response = await api.post<ApiResponse<Category>>('/categories', category);
        return response.data.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
    try {
        const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, category);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating category with id ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        await api.delete(`/categories/${id}`);
    } catch (error) {
        console.error(`Error deleting category with id ${id}:`, error);
        throw error;
    }
};

// Costumes
export const getCostumes = async (filters: CostumeFilters = {}): Promise<PaginatedResponse<Costume>> => {
    try {
        const response = await api.get<ApiResponse<PaginatedResponse<Costume>>>('/costumes', { params: filters });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching costumes:', error);
        throw error;
    }
};

export const getCostumeById = async (id: string) => {
    try {
        const response = await api.get(`/costumes/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching costume with id ${id}:`, error);
        throw error;
    }
};

export const createCostume = async (
    costume: Omit<Costume, '_id' | 'createdAt' | 'updatedAt' | 'quantityRented'>,
    images?: File[]
): Promise<Costume> => {
    try {
        if (images && images.length > 0) {
            const uploadedImages = await uploadMultipleImages(images, { entityType: 'costume' });
            const originalUrls = uploadedImages.map(img => img.url);
            const thumbnail300 = uploadedImages[0].metadata.thumbnails.find(t => t.size === '300x300');
            costume.imageUrl = thumbnail300 ? thumbnail300.url : uploadedImages[0].url;
            costume.listImageUrl = originalUrls;
        }
        const response = await api.post<ApiResponse<Costume>>('/costumes', costume);
        return response.data.data;
    } catch (error) {
        console.error('Error creating costume:', error);
        throw error;
    }
};

export const updateCostume = async (
    id: string,
    costume: Partial<Costume>,
    newImages?: File[]
): Promise<Costume> => {
    try {
        // Upload new images if provided
        if (newImages && newImages.length > 0) {
            const uploadedImages = await uploadMultipleImages(newImages, {
                entityId: id,
                entityType: 'costume'
            });
            // Use original URLs for listImageUrl
            const originalUrls = uploadedImages.map(img => img.url);
            // Use 300x300 thumbnail for the main imageUrl (first image)
            const thumbnail300 = uploadedImages[0].metadata.thumbnails.find(t => t.size === '300x300');

            // Update the image URLs
            costume.imageUrl = thumbnail300 ? thumbnail300.url : uploadedImages[0].url;
            costume.listImageUrl = originalUrls;
        }

        const response = await api.patch<ApiResponse<Costume>>(`/costumes/${id}`, costume);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating costume with id ${id}:`, error);
        throw error;
    }
};

export const deleteCostume = async (id: string): Promise<void> => {
    try {
        await api.delete(`/costumes/${id}`);
    } catch (error) {
        console.error(`Error deleting costume with id ${id}:`, error);
        throw error;
    }
};

// Statistics
export const getCostumeStats = async (): Promise<CostumeStats> => {
    try {
        const response = await api.get<ApiResponse<CostumeStats>>('/costumes/stats');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching costume statistics:', error);
        throw error;
    }
};

export const getCostumeDetail = async (id: string): Promise<CostumeDetail> => {
    try {
        const response = await api.get<ApiResponse<CostumeDetail>>(`/costumes/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching costume detail with id ${id}:`, error);
        throw error;
    }
};

const costumeService = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCostumes,
    getCostumeById,
    createCostume,
    updateCostume,
    deleteCostume,
    getCostumeStats,
    getCostumeDetail,
    uploadImage,
    uploadMultipleImages,
};

export default costumeService; 
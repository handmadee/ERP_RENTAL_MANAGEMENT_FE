import { api, ApiResponse } from "./api";

export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
    secretCode: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileDto {
    fullName: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
}

export interface SecuritySettings {
    twoFactorEnabled: boolean;
}

export interface Settings {
    _id: string;
    registrationSecret: string;
    notifications: NotificationSettings;
    security: SecuritySettings;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    language: string;
    createdAt: string;
    updatedAt: string;
    twoFactorEnabled: boolean;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: string;
    phone?: string;
    address?: string;
    avatar?: string;
    isEmailVerified: boolean;
    lastLogin: Date;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}

class AuthService {
    private readonly API_URL = '/auth';
    private readonly SETTINGS_URL = '/settings';

    async register(registerData: RegisterDto): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            `${this.API_URL}/register`,
            registerData
        );

        const authData = response.data.data;

        if (authData.accessToken && authData.refreshToken) {
            this.saveTokens(authData.accessToken, authData.refreshToken);
            this.saveUser(authData.user);
        }

        return authData;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, {
            email,
            password,
        });

        const authData = response.data.data;

        if (authData.accessToken && authData.refreshToken) {
            this.saveTokens(authData.accessToken, authData.refreshToken);
            this.saveUser(authData.user);
        }

        return authData;
    }

    async logout(): Promise<void> {
        try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                await api.post(`${this.API_URL}/logout`, { refreshToken });
            }
        } finally {
            this.clearTokens();
        }
    }

    async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(
            `${this.API_URL}/forgot-password`,
            data
        );
        return response.data;
    }

    async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(
            `${this.API_URL}/reset-password`,
            data
        );
        return response.data;
    }

    async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>(
            `${this.API_URL}/change-password`,
            data
        );
        return response.data;
    }

    async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
        const response = await api.put<UserProfile>(`${this.API_URL}/profile`, data);
        this.saveUser(response.data);
        return response.data;
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post<{ avatarUrl: string }>(
            `${this.API_URL}/upload-avatar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async getSettings(): Promise<Settings> {
        const response = await api.get<ApiResponse<Settings>>(this.SETTINGS_URL);
        return response.data.data;
    }

    async updateSettings(data: Partial<Settings>): Promise<Settings> {
        const response = await api.put<ApiResponse<Settings>>(this.SETTINGS_URL, data);
        return response.data.data;
    }

    async updateNotificationSettings(notifications: NotificationSettings): Promise<Settings> {
        return this.updateSettings({ notifications });
    }

    async updateSecuritySettings(security: SecuritySettings): Promise<Settings> {
        return this.updateSettings({ security });
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<{
            accessToken: string;
            refreshToken: string;
        }>>(`${this.API_URL}/refresh-token`, {
            refreshToken,
        });

        const authData = response.data.data;

        if (authData.accessToken && authData.refreshToken) {
            this.saveTokens(authData.accessToken, authData.refreshToken);
        }

        return {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            user: this.getCurrentUser() as UserProfile
        };
    }

    async getProfile(): Promise<UserProfile> {
        const response = await api.get<ApiResponse<UserProfile>>(`${this.API_URL}/profile`);

        const userData = response.data.data;
        this.saveUser(userData);
        return userData;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Decode JWT and check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    getCurrentUser(): UserProfile | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    saveUser(user: UserProfile): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearTokens(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
}

export const authService = new AuthService();
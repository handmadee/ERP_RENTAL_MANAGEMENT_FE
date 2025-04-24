import { api } from './api';

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
    currency: string;
    language: string;
    twoFactorEnabled: boolean;
    registrationSecret: string;
    notifications: NotificationSettings;
    security: SecuritySettings;
    createdAt: string;
    updatedAt: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    __v: number;
}

export interface UpdateSettingsDto {
    currency?: string;
    language?: string;
    registrationSecret?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    twoFactorEnabled?: boolean;
    notifications?: NotificationSettings;
    security?: SecuritySettings;
}

class SettingsService {
    private readonly API_URL = '/settings';
    private cachedSettings: Settings | null = null;

    async getSettings(): Promise<Settings> {
        const response = await api.get<Settings>(this.API_URL);
        this.cachedSettings = response.data;
        return response.data;
    }

    async updateSettings(settings: UpdateSettingsDto): Promise<Settings> {
        if (!this.cachedSettings) {
            await this.getSettings();
        }

        const updateData = {
            companyName: settings.companyName || this.cachedSettings?.companyName || '',
            email: settings.email || this.cachedSettings?.email || '',
            phone: settings.phone || this.cachedSettings?.phone || '',
            address: settings.address || this.cachedSettings?.address || '',
            twoFactorEnabled: settings.twoFactorEnabled !== undefined
                ? settings.twoFactorEnabled
                : (settings.security?.twoFactorEnabled !== undefined
                    ? settings.security.twoFactorEnabled
                    : this.cachedSettings?.twoFactorEnabled || false),
            ...settings
        };

        const response = await api.put<Settings>(this.API_URL, updateData);
        this.cachedSettings = response.data;
        return response.data;
    }
}

export const settingsService = new SettingsService(); 
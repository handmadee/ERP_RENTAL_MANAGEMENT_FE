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
    confirmPassword: string;
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
    lastLogin: string | Date;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}

class AuthService {
    private readonly API_URL = '/auth';
    private readonly SETTINGS_URL = '/settings';
    private readonly TOKEN_KEY = 'token';
    private readonly REFRESH_TOKEN_KEY = 'refreshToken';
    private readonly USER_KEY = 'user';

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
        try {
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
        } catch (error: any) {
            // Make sure to properly propagate the error with the server message
            if (error.response && error.response.data) {
                console.error('Login error from server:', error.response.data);
            }
            throw error; // Important: rethrow error to be handled by the calling code
        }
    }

    /**
     * Logs out the user by invalidating tokens on the server and clearing local storage
     * @param reason Optional reason for logout (e.g., session expired)
     * @returns Promise<void>
     */
    async logout(reason?: string): Promise<void> {
        try {
            const refreshToken = this.getRefreshToken();
            const accessToken = this.getToken();

            // Only attempt to call the server if we have tokens
            if (refreshToken && accessToken) {
                // Set the authorization header for this request
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                try {
                    // Send logout request to invalidate tokens on server
                    await api.post(`${this.API_URL}/logout`, {
                        refreshToken,
                        all_devices: true, // Invalidate tokens on all devices
                        deviceInfo: this.getDeviceInfo(),
                        reason: reason || 'user_logout'
                    });
                    console.log('Server-side logout successful');
                } catch (error) {
                    // Even if server logout fails, continue with client-side logout
                    console.error('Error during server logout, continuing with client-side logout:', error);
                }
            }
        } finally {
            // Always clear local storage data regardless of server response
            this.clearAllUserData();
        }
    }

    /**
     * Gets enhanced device information for security tracking
     * This helps identify and prevent session hijacking
     */
    private getDeviceInfo(): Record<string, string> {
        try {
            // Generate a simple fingerprint from browser properties
            const fingerprint = this.generateBrowserFingerprint();

            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                colorDepth: String(window.screen.colorDepth),
                pixelRatio: String(window.devicePixelRatio || 1),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                doNotTrack: navigator.doNotTrack || 'unknown',
                cookiesEnabled: String(navigator.cookieEnabled),
                timestamp: new Date().toISOString(),
                fingerprint: fingerprint,
                vendor: navigator.vendor || 'unknown',
                oscpu: (navigator as any).oscpu || 'unknown',
                referrer: document.referrer || 'direct'
            };
        } catch (e) {
            // Fallback if there's an error accessing some browser properties
            return {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                error: 'Error generating complete device info'
            };
        }
    }

    /**
     * Generate a simple browser fingerprint
     * For enhanced security against session hijacking
     */
    private generateBrowserFingerprint(): string {
        try {
            // Collect browser-specific attributes
            const attributes = [
                navigator.userAgent,
                navigator.language,
                String(window.screen.colorDepth),
                String(window.screen.width) + 'x' + String(window.screen.height),
                String(new Date().getTimezoneOffset()),
                String(navigator.hardwareConcurrency || 'unknown'),
                navigator.vendor,
                navigator.platform,
                String(navigator.cookieEnabled),
                (navigator as any).doNotTrack || 'unknown',
            ].join('|||');

            // Create simple hash
            return this.simpleHash(attributes);
        } catch (e) {
            console.error('Error generating fingerprint:', e);
            return 'fingerprint-error';
        }
    }

    /**
     * Simple hashing function to generate device fingerprint
     */
    private simpleHash(text: string): string {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Convert to positive hex string
        return (hash >>> 0).toString(16);
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

    async updatePasswordInSettings(data: ChangePasswordDto): Promise<any> {
        const response = await api.post(`${this.API_URL}/forgot-password-by-admin`, data);
        return response.data;
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

    /**
     * Check if the current user is authenticated
     * @param requireAdmin If true, requires the user to have admin role
     * @returns true if user is authenticated (and has admin role if required)
     */
    isAuthenticated(requireAdmin: boolean = false): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Decode JWT and check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isTokenValid = payload.exp * 1000 > Date.now();

            // If token is valid and admin role is required, check user role
            if (isTokenValid && requireAdmin) {
                const user = this.getCurrentUser();
                return !!user && user.role === 'admin';
            }

            return isTokenValid;
        } catch {
            return false;
        }
    }

    /**
     * Check if the user has the specified role
     * @param role The role to check for
     * @returns true if the user has the specified role
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return !!user && user.role === role;
    }

    /**
     * Check if the user is an admin
     * @returns true if the user has the admin role
     */
    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    getCurrentUser(): UserProfile | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    saveTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    saveUser(user: UserProfile): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    clearTokens(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }


    /**
     * Completely clear all user-related data from storage
     * Ensures all tokens, especially refresh tokens, and session data are removed
     */
    clearAllUserData(): void {
        // Clear tokens from localStorage
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);

        // Clear tokens from sessionStorage
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);

        // Clear user info
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.USER_KEY);

        // Clear login tracking data
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutUntil');
        localStorage.removeItem('lastLoginTime');
        localStorage.removeItem('lastActivity');

        // Clear all auth-related data
        const authRelatedKeys = [
            'authState',
            'user_preferences',
            'user_settings',
            'session_id',
            'remember_me',
            'auth_redirect'
        ];

        // Remove specific auth-related keys
        authRelatedKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        // Find and remove any keys with auth/user prefixes
        const keysToRemove = [];
        const prefixesToRemove = ['auth_', 'user_', 'token_', 'session_'];

        // From localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && prefixesToRemove.some(prefix => key.startsWith(prefix))) {
                keysToRemove.push(key);
            }
        }

        // Remove collected keys
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear cookies that might contain tokens
        this.clearAuthCookies();

        // Remove Authorization header from future API requests
        delete api.defaults.headers.common['Authorization'];

        // Dispatch logout event for other components to react
        window.dispatchEvent(new Event('userLogout'));

        // For security, try to run garbage collection (though not guaranteed)
        if (window.gc) {
            try {
                window.gc();
            } catch (e) {
                console.log('GC not available');
            }
        }

        console.log('All user data and tokens cleared successfully');
    }

    /**
     * Clear any auth-related cookies
     */
    private clearAuthCookies(): void {
        const cookiesToClear = ['token', 'refreshToken', 'auth', 'session'];

        cookiesToClear.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    }

    /**
     * Handle a failed login attempt
     * @param errorData The error data from the server
     * @param loginAttempts The current number of failed login attempts
     */
    handleFailedLogin(errorData: any, loginAttempts: number): void {
        // Ensure any partial auth data is cleared
        this.clearAllUserData();

        // Log the failed attempt for security monitoring
        console.warn(`Failed login attempt (${loginAttempts}):`, errorData?.message || 'Unknown error');

        // Store the failed attempt count in localStorage
        localStorage.setItem('loginAttempts', String(loginAttempts));

        // Apply lockout if needed (handled by the UI component)
        if (loginAttempts >= 5) {
            console.warn('Multiple failed login attempts detected. Temporary lockout applied.');
        }

        // Clear any existing auth headers
        delete api.defaults.headers.common['Authorization'];
    }
}

export const authService = new AuthService();
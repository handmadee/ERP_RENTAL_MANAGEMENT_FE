import { authService } from '../services/authService';

/**
 * Session Manager provides utilities for handling user sessions,
 * including session timeouts, activity tracking, and secure logout
 */
class SessionManager {
    private static instance: SessionManager;
    private sessionCheckInterval: number | null = null;
    private SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes of inactivity
    private readonly STORAGE_ACTIVITY_KEY = 'lastActivity';
    private readonly STORAGE_SESSION_ID = 'sessionId';

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * Initialize session monitoring
     * @param customTimeout Override default timeout (in milliseconds)
     */
    public initSessionMonitoring(customTimeout?: number): void {
        if (customTimeout) {
            this.SESSION_TIMEOUT = customTimeout;
        }

        // Generate a unique session ID for this browser session
        if (!sessionStorage.getItem(this.STORAGE_SESSION_ID)) {
            sessionStorage.setItem(
                this.STORAGE_SESSION_ID,
                `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
            );
        }

        // Set up activity listeners
        this.setupActivityTracking();

        // Record initial activity
        this.updateActivityTimestamp();

        // Set up periodic session check
        this.startSessionCheck();
    }

    /**
     * Update the last activity timestamp
     */
    private updateActivityTimestamp(): void {
        localStorage.setItem(this.STORAGE_ACTIVITY_KEY, Date.now().toString());
    }

    /**
     * Set up event listeners for user activity
     */
    private setupActivityTracking(): void {
        const activityEvents = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];

        // Remove any existing listeners first (if reinitializing)
        this.removeActivityTracking();

        // Add activity listeners to document
        activityEvents.forEach(eventType => {
            document.addEventListener(eventType, this.handleUserActivity);
        });

        // Listen for storage events (for multi-tab synchronization)
        window.addEventListener('storage', this.handleStorageChange);
    }

    /**
     * Remove activity tracking listeners
     */
    private removeActivityTracking(): void {
        const activityEvents = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];

        activityEvents.forEach(eventType => {
            document.removeEventListener(eventType, this.handleUserActivity);
        });

        window.removeEventListener('storage', this.handleStorageChange);

        if (this.sessionCheckInterval !== null) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    /**
     * Handle user activity by updating the timestamp
     */
    private handleUserActivity = (): void => {
        this.updateActivityTimestamp();
    };

    /**
     * Handle storage changes (for multi-tab logout)
     */
    private handleStorageChange = (e: StorageEvent): void => {
        // If auth token was removed in another tab
        if (e.key === 'token' && e.newValue === null) {
            this.performLogout('Phiên đăng nhập đã kết thúc ở tab khác');
        }
    };

    /**
     * Start periodic session checks
     */
    private startSessionCheck(): void {
        if (this.sessionCheckInterval !== null) {
            clearInterval(this.sessionCheckInterval);
        }

        // Check every minute
        this.sessionCheckInterval = window.setInterval(() => {
            this.checkSessionExpiration();
        }, 60000);
    }

    /**
     * Check if the session has expired due to inactivity
     */
    private checkSessionExpiration(): void {
        // Only check if the user is authenticated
        if (!authService.isAuthenticated()) return;

        const lastActivity = parseInt(localStorage.getItem(this.STORAGE_ACTIVITY_KEY) || '0', 10);
        const now = Date.now();

        // If user has been inactive longer than the timeout
        if (now - lastActivity > this.SESSION_TIMEOUT) {
            this.performLogout('Phiên làm việc đã hết hạn do không hoạt động');
        }
    }

    /**
     * Perform secure logout with reason
     */
    public async performLogout(reason: string = 'Bạn đã đăng xuất thành công'): Promise<void> {
        // Stop session monitoring
        this.removeActivityTracking();

        try {
            // Call auth service logout
            await authService.logout();

            // Clear any remaining session data
            sessionStorage.clear();

            // Redirect to login page with reason
            window.location.href = `/auth/login?message=${encodeURIComponent(reason)}`;
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = `/auth/login?message=${encodeURIComponent(
                'Đã xảy ra lỗi trong quá trình đăng xuất, nhưng bạn đã được đăng xuất khỏi thiết bị này'
            )}`;
        }
    }

    /**
     * Clean up any resources when component unmounts
     */
    public cleanup(): void {
        this.removeActivityTracking();
    }
}

export default SessionManager.getInstance(); 
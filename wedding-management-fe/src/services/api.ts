import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  path?: string;
  timestamp?: string;
  message?: string;
  errors?: Record<string, string[]>;
}
class TokenRefreshMutex {
  private isRefreshing = false;
  private subscribers: ((token: string) => void)[] = [];

  lock(): boolean {
    if (this.isRefreshing) {
      return false;
    }
    this.isRefreshing = true;
    return true;
  }

  release(): void {
    this.isRefreshing = false;
  }

  subscribe(callback: (token: string) => void): void {
    this.subscribers.push(callback);
  }

  onRefreshed(token: string): void {
    this.subscribers.forEach((callback) => callback(token));
    this.subscribers = [];
  }
}

const tokenRefreshMutex = new TokenRefreshMutex();

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 30000;
  } catch (error) {
    return true;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();

    // Check if token exists and is not expired
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (tokenRefreshMutex.lock()) {
        originalRequest._retry = true;
        try {
          const refreshToken = authService.getRefreshToken();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authService.refreshToken(refreshToken);
          const newAccessToken = response.accessToken;
          tokenRefreshMutex.onRefreshed(newAccessToken);
          tokenRefreshMutex.release();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
          }
          return api(originalRequest);
        } catch (refreshError) {
          tokenRefreshMutex.release();
          authService.clearTokens();

          // Only redirect if in browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }

          return Promise.reject(refreshError);
        }
      } else {
        // If another request is already refreshing the token, wait for it
        return new Promise((resolve) => {
          tokenRefreshMutex.subscribe((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${token}` };
            }
            resolve(api(originalRequest));
          });
        });
      }
    }

    // Network errors handling
    if (error.code === 'ECONNABORTED' || !error.response) {
      // Custom error for timeouts and network issues
      return Promise.reject({
        ...error,
        customError: true,
        message: 'Network error or server timeout. Please check your connection and try again.'
      });
    }

    return Promise.reject(error);
  }
); 
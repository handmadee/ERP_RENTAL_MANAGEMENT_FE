import { PathRouteProps } from 'react-router-dom';

// Define route types
export interface AppRoute extends Omit<PathRouteProps, 'children'> {
  title?: string;
  children?: AppRoute[];
  requireAuth?: boolean;
  permissions?: string[];
  layout?: React.ComponentType;
}

// Define route paths
export const ROUTE_PATHS = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    COSTUMES: '/dashboard/costumes',
    ORDERS: '/dashboard/orders',
    SETTINGS: '/dashboard/settings',
    CUSTOMERS: '/dashboard/customers',
  },
} as const;

// Define route metadata
export const META = {
  AUTH_REDIRECT: ROUTE_PATHS.AUTH.LOGIN,
  DEFAULT_REDIRECT: ROUTE_PATHS.DASHBOARD.ROOT,
} as const; 
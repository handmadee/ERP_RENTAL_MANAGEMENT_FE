import { lazy } from 'react';
import { AppRoute, ROUTE_PATHS } from '../config';
import DashboardLayout from '@/layouts/DashboardLayout';

const Dashboard = lazy(() => import('@/pages/DashboardPage'));
const Costumes = lazy(() => import('@/pages/CostumesPage'));
const Orders = lazy(() => import('@/pages/OrdersPage'));
const Settings = lazy(() => import('@/pages/SettingsPage'));
const Customers = lazy(() => import("@/pages/CustomersPage"));

export const dashboardRoutes: AppRoute[] = [
  {
    path: ROUTE_PATHS.DASHBOARD.ROOT,
    element: <Dashboard />,
    layout: DashboardLayout as React.ComponentType,
    requireAuth: true,
  },
  {
    path: ROUTE_PATHS.DASHBOARD.COSTUMES,
    element: <Costumes />,
    layout: DashboardLayout as React.ComponentType,
    requireAuth: true,
    permissions: ["view:costumes"],
  },
  {
    path: ROUTE_PATHS.DASHBOARD.ORDERS,
    element: <Orders />,
    layout: DashboardLayout as React.ComponentType,
    requireAuth: true,
    permissions: ["view:orders"],
  },
  {
    path: ROUTE_PATHS.DASHBOARD.CUSTOMERS,
    element: <Customers />,
    layout: DashboardLayout as React.ComponentType,
    requireAuth: true,
    permissions: ["view:customers"],
  },
  {
    path: ROUTE_PATHS.DASHBOARD.SETTINGS,
    element: <Settings />,
    layout: DashboardLayout as React.ComponentType,
    requireAuth: true,
    permissions: ["view:settings"],
  },
]; 
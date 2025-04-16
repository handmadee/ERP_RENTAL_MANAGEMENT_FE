import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { authRoutes } from './modules/auth.routes';
import { dashboardRoutes } from './modules/dashboard.routes';
import { AppRoute, META, ROUTE_PATHS } from './config';
import { AuthGuard } from './middleware/AuthGuard';
import LoadingScreen from '@/components/common/LoadingScreen';

type LayoutComponent = React.ComponentType<{ children: React.ReactNode }>;

const wrapWithLayout = (element: React.ReactElement, Layout?: LayoutComponent) => {
  if (!Layout) return element;
  return <Layout>{element}</Layout>;
};

const wrapWithAuth = (element: React.ReactElement, requireAuth?: boolean, permissions?: string[]) => {
  if (!requireAuth) return element;
  return (
    <AuthGuard permissions={permissions}>
      {element}
    </AuthGuard>
  );
};

const wrapWithSuspense = (element: React.ReactElement) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {element}
    </Suspense>
  );
};

const convertRoute = (route: AppRoute): RouteObject => {
  const { element, layout: Layout, requireAuth, permissions, children, ...rest } = route;

  if (!React.isValidElement(element)) {
    throw new Error(`Invalid element in route: ${route.path}`);
  }

  let finalElement = element;
  finalElement = wrapWithLayout(finalElement, Layout as LayoutComponent);
  finalElement = wrapWithAuth(finalElement, requireAuth, permissions);
  finalElement = wrapWithSuspense(finalElement);

  return {
    ...rest,
    element: finalElement,
    children: children?.map(convertRoute),
  } as RouteObject;
};

const routes: AppRoute[] = [
  {
    path: ROUTE_PATHS.HOME,
    element: <Navigate to={META.DEFAULT_REDIRECT} replace />,
  },
  ...authRoutes,
  ...dashboardRoutes,
  {
    path: '*',
    element: <Navigate to={META.DEFAULT_REDIRECT} replace />,
  },
];

export const router = createBrowserRouter(routes.map(convertRoute)); 
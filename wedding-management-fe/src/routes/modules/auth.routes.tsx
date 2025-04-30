import { lazy } from 'react';
import { AppRoute, ROUTE_PATHS } from '../config';
import AuthLayout from '@/layouts/AuthLayout';
import React from 'react';

// Create a higher-order component to wrap the layout
const withAuthLayout = (Component: React.ComponentType) => {
  // Return a component that renders the layout with the original component as children
  return function WithAuthLayout(props: any) {
    return (
      <AuthLayout>
        <Component {...props} />
      </AuthLayout>
    );
  };
};

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

export const authRoutes: AppRoute[] = [
  {
    path: ROUTE_PATHS.AUTH.LOGIN,
    element: withAuthLayout(LoginPage)({}),
  },
  {
    path: ROUTE_PATHS.AUTH.REGISTER,
    element: withAuthLayout(RegisterPage)({}),
  },
  {
    path: ROUTE_PATHS.AUTH.FORGOT_PASSWORD,
    element: withAuthLayout(ForgotPasswordPage)({}),
  },
]; 
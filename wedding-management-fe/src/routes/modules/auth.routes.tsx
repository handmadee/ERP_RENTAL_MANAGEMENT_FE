import { lazy } from 'react';
import { AppRoute, ROUTE_PATHS } from '../config';
import AuthLayout from '@/layouts/AuthLayout';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

export const authRoutes: AppRoute[] = [
  {
    path: ROUTE_PATHS.AUTH.LOGIN,
    element: <LoginPage />,
    layout: AuthLayout,
  },
  {
    path: ROUTE_PATHS.AUTH.REGISTER,
    element: <RegisterPage />,
    layout: AuthLayout,
  },
  {
    path: ROUTE_PATHS.AUTH.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
    layout: AuthLayout,
  },
]; 
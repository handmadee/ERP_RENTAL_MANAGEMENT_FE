import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { META } from '../config';

interface AuthGuardProps {
  children: ReactNode;
  permissions?: string[];
}

// Define all available permissions
const ALL_PERMISSIONS = [
  "view:costumes",
  "view:orders",
  "view:settings",
  "edit:costumes",
  "edit:orders",
  "edit:settings",
  "delete:costumes",
  "delete:orders",
  "view:customers",
  "admin",
];

export const AuthGuard = ({ children, permissions = [] }: AuthGuardProps) => {
  const location = useLocation();
  
  const isAuthenticated = localStorage.getItem('token') !== null;
  // Grant all permissions to authenticated users
  const userPermissions: string[] = isAuthenticated ? ALL_PERMISSIONS : [];

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={META.AUTH_REDIRECT} state={{ from: location }} replace />;
  }

  // Check permissions
  if (permissions.length > 0) {
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return <Navigate to={META.DEFAULT_REDIRECT} replace />;
    }
  }

  return <>{children}</>;
}; 
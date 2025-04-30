import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { CircularProgress, Box } from '@mui/material';

interface AuthGuardProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

/**
 * AuthGuard component to protect routes
 * Redirects to login if user is not authenticated
 * Can also require admin role by setting adminOnly prop
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, adminOnly = true }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Add a small delay to avoid flickering if auth is quick
                await new Promise(resolve => setTimeout(resolve, 100));

                // Check if user is authenticated
                const isAuthenticated = authService.isAuthenticated();

                // If admin role is required, check for it
                const hasRequiredRole = adminOnly ? authService.isAdmin() : true;

                // User is authorized if authenticated and has required role
                setIsAuthorized(isAuthenticated && hasRequiredRole);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthorized(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [adminOnly, location.pathname]);

    // Show loading indicator while checking
    if (isChecking) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // If not authorized, redirect to login with a message
    if (!isAuthorized) {
        const message = adminOnly
            ? 'Chỉ tài khoản quản trị viên mới có thể truy cập hệ thống này.'
            : 'Vui lòng đăng nhập để tiếp tục.';

        return (
            <Navigate
                to={`/auth/login?message=${encodeURIComponent(message)}`}
                state={{ from: location }}
                replace
            />
        );
    }

    // If authorized, render children
    return <>{children}</>;
};

export default AuthGuard; 
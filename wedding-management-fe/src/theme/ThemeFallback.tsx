import React from 'react';
import { createTheme, Theme } from '@mui/material/styles';

// Tạo một theme mặc định để sử dụng khi theme chính không có sẵn
export const fallbackTheme = createTheme({
    palette: {
        primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
        warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
        error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
        success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
        info: { main: '#03a9f4', light: '#4fc3f7', dark: '#0288d1' },
        grey: { 500: '#9e9e9e' },
        text: { primary: '#212121', secondary: '#757575' },
        divider: '#e0e0e0',
        action: { hover: 'rgba(0, 0, 0, 0.04)' }
    }
});

// Hàm helper để lấy màu trạng thái từ theme hoặc fallback
export const getStatusColor = (status: string, theme?: Theme): string => {
    try {
        // Định nghĩa màu mặc định cho các trạng thái
        const defaultColors = {
            pending: fallbackTheme.palette.warning.main,    // warning
            active: fallbackTheme.palette.info.main,        // info
            completed: fallbackTheme.palette.success.main,  // success
            cancelled: fallbackTheme.palette.error.main,    // error
            default: fallbackTheme.palette.grey[500]        // grey
        };

        // Nếu theme tồn tại, sử dụng màu từ theme
        if (theme?.palette) {
            switch (status) {
                case 'pending': return theme.palette.warning.main;
                case 'active': return theme.palette.info.main;
                case 'completed': return theme.palette.success.main;
                case 'cancelled': return theme.palette.error.main;
                default: return theme.palette.grey[500];
            }
        }

        // Nếu không có theme, sử dụng màu mặc định
        return defaultColors[status as keyof typeof defaultColors] || defaultColors.default;
    } catch (error) {
        // Fallback nếu có lỗi khi truy cập theme
        console.warn('Theme error:', error);
        const fallbackColors = {
            pending: '#ff9800',     // warning
            active: '#03a9f4',      // info
            completed: '#4caf50',   // success
            cancelled: '#f44336',   // error
            default: '#9e9e9e'      // grey
        };
        return fallbackColors[status as keyof typeof fallbackColors] || fallbackColors.default;
    }
};

export const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'active': return 'Đang thuê';
        case 'completed': return 'Đã hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
}; 
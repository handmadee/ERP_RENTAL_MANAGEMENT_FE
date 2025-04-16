import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { alpha, useTheme } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Custom toast options
const toastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Custom toast functions
export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      ...toastOptions,
      icon: <SuccessIcon sx={{ color: 'success.main' }} />,
    }),
  error: (message: string) =>
    toast.error(message, {
      ...toastOptions,
      icon: <ErrorIcon sx={{ color: 'error.main' }} />,
    }),
  info: (message: string) =>
    toast.info(message, {
      ...toastOptions,
      icon: <InfoIcon sx={{ color: 'info.main' }} />,
    }),
  warning: (message: string) =>
    toast.warning(message, {
      ...toastOptions,
      icon: <WarningIcon sx={{ color: 'warning.main' }} />,
    }),
};

// Toast container component with custom styling
export const Toast = () => {
  const theme = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{ zIndex: theme.zIndex.tooltip + 1 }}
      toastStyle={{
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.1)}`,
        borderRadius: 8,
        fontSize: 14,
      }}
    />
  );
};

export default Toast; 
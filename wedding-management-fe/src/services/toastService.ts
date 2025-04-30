import { toast, ToastOptions } from 'react-toastify';

// Configuración predeterminada para los toasts
const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

// Servicio para mostrar notificaciones toast
const showToast = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, { ...defaultOptions, ...options });
    },
    error: (message: string, options?: ToastOptions) => {
        return toast.error(message, { ...defaultOptions, ...options });
    },
    info: (message: string, options?: ToastOptions) => {
        return toast.info(message, { ...defaultOptions, ...options });
    },
    warning: (message: string, options?: ToastOptions) => {
        return toast.warning(message, { ...defaultOptions, ...options });
    },
};

export default showToast; 
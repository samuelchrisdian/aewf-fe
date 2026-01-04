import toast from 'react-hot-toast';

/**
 * Notification utilities using react-hot-toast
 */
export const notify = {
    success: (message: string) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
            },
        });
    },

    error: (message: string) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#EF4444',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
            },
        });
    },

    warning: (message: string) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
            },
        });
    },

    info: (message: string) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
            },
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            position: 'top-right',
            style: {
                background: '#6B7280',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
            },
        });
    },

    dismiss: (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    },
};

export default notify;

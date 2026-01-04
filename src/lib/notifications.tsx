import toast from 'react-hot-toast';

/**
 * Notification helper using react-hot-toast
 * Clean, modern, and easy to use throughout the application
 */

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

class Notifications {
  /**
   * Show success notification
   */
  success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  }

  /**
   * Show error notification
   */
  error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 3500,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  }

  /**
   * Show loading notification
   * Returns toast ID that can be used to dismiss or update
   */
  loading(message: string, options?: ToastOptions) {
    return toast.loading(message, {
      position: options?.position || 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  }

  /**
   * Show promise-based notification
   * Automatically shows loading, success, or error based on promise result
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: options?.position || 'top-right',
        style: {
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        },
        loading: {
          style: {
            background: '#6B7280',
            color: '#fff',
          },
        },
      }
    );
  }

  /**
   * Dismiss a specific toast by ID
   */
  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  /**
   * Custom notification with custom styling
   */
  custom(message: string, options?: ToastOptions & { icon?: string; style?: any }) {
    return toast(message, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
      icon: options?.icon,
      style: options?.style || {
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  }

  /**
   * Show confirmation dialog
   * Returns a promise that resolves to true if confirmed, false if cancelled
   */
  async confirm(
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      title?: string;
      type?: 'danger' | 'warning' | 'info' | 'success';
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const type = options?.type || 'warning';

      // Icon and color based on type
      const iconConfig = {
        danger: { icon: '🗑️', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700' },
        warning: { icon: '⚠️', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600', btnColor: 'bg-amber-600 hover:bg-amber-700' },
        info: { icon: 'ℹ️', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600', btnColor: 'bg-blue-600 hover:bg-blue-700' },
        success: { icon: '✓', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600', btnColor: 'bg-green-600 hover:bg-green-700' },
      };

      const config = iconConfig[type];

      toast(
        (t) => (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header with Icon */}
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center text-2xl`}>
                {config.icon}
              </div>
              <div className="flex-1">
                {options?.title && (
                  <h3 className={`text-lg font-bold ${config.textColor} mb-1`}>
                    {options.title}
                  </h3>
                )}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
              >
                {options?.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className={`flex-1 px-4 py-2.5 ${config.btnColor} text-white rounded-lg transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105`}
              >
                {options?.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
          style: {
            background: '#fff',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '400px',
            maxWidth: '500px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          },
        }
      );
    });
  }
}

// Export singleton instance
export const notify = new Notifications();

// Export toast directly for advanced usage
export { toast };


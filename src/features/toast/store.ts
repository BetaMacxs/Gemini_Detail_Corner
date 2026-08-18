import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'cart' | 'order';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  image?: string;
  action?: ToastAction;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toastData) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: ToastItem = {
      ...toastData,
      id,
      duration: toastData.duration ?? 4500,
      createdAt: Date.now(),
    };

    set((state) => {
      // Limit to 4 simultaneous toasts to avoid clutter
      const filtered = state.toasts.slice(-3);
      return { toasts: [...filtered, newToast] };
    });

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience helper object for quick imports
export const toast = {
  success: (title: string, message?: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'title' | 'message' | 'createdAt'>>) => {
    return useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  },
  error: (title: string, message?: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'title' | 'message' | 'createdAt'>>) => {
    return useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      ...options,
    });
  },
  info: (title: string, message?: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'title' | 'message' | 'createdAt'>>) => {
    return useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  },
  cart: (productName: string, details?: { variant?: string; quantity?: number; image?: string; priceFormatted?: string }) => {
    const quantityStr = details?.quantity && details.quantity > 1 ? ` (${details.quantity}x)` : '';
    const variantStr = details?.variant ? ` • ${details.variant}` : '';
    const subtitle = [details?.priceFormatted, variantStr.replace(' • ', '')].filter(Boolean).join(' • ');

    return useToastStore.getState().addToast({
      type: 'cart',
      title: 'Added to Cart',
      message: `${productName}${quantityStr}${subtitle ? ` — ${subtitle}` : ''}`,
      image: details?.image,
      duration: 5000,
      action: {
        label: 'View Cart',
        href: '/cart',
      },
    });
  },
  order: (orderNumber: string, message?: string, details?: { orderId?: string }) => {
    return useToastStore.getState().addToast({
      type: 'order',
      title: 'Order Confirmed!',
      message: message || `Order #${orderNumber} has been successfully placed.`,
      duration: 6000,
      action: details?.orderId ? {
        label: 'View Order',
        href: `/account/orders/${details.orderId}`,
      } : {
        label: 'Track Order',
        href: '/track',
      },
    });
  },
  dismiss: (id: string) => {
    useToastStore.getState().removeToast(id);
  },
};

import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

const AUTO_DISMISS_MS = 5000;

export interface UseToastsResult {
  toasts: ToastItem[];
  showToast: (variant: ToastVariant, message: string) => void;
  dismissToast: (id: string) => void;
}

/**
 * Lightweight, dependency-free toast queue. Each toast auto-dismisses
 * after AUTO_DISMISS_MS, or can be dismissed early by the user.
 */
export function useToasts(): UseToastsResult {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, message: string) => {
      nextId.current += 1;
      const id = `toast-${nextId.current.toString()}`;

      setToasts((current) => [...current, { id, variant, message }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  return { toasts, showToast, dismissToast };
}

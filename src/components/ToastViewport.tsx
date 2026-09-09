import type { FC } from 'react';
import type { ToastItem } from '../hooks/useToasts';
import './toast.css';

interface ToastViewportProps {
  toasts: readonly ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastViewport: FC<ToastViewportProps> = ({ toasts, onDismiss }) => (
  <div className="toast-viewport" aria-live="polite" aria-atomic="false">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`toast toast--${toast.variant}`}
        role={toast.variant === 'error' ? 'alert' : 'status'}
      >
        <span className="toast-message">{toast.message}</span>
        <button
          type="button"
          className="toast-dismiss"
          aria-label="Dismiss notification"
          onClick={() => {
            onDismiss(toast.id);
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

export default ToastViewport;

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertIcon, CheckIcon, CloseIcon } from './Icon';
import { ToastContext, type ToastVariant, type UseToast } from '../../hooks/useToast';
import styles from './Toast.module.css';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value: UseToast = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' && toasts.length > 0) {
        onDismiss(toasts[toasts.length - 1].id);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className={styles.viewport}
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.variant]}`}
          role={t.variant === 'error' ? 'alert' : 'status'}
        >
          <span className={styles.icon} aria-hidden="true">
            {t.variant === 'success' ? (
              <CheckIcon size={16} />
            ) : (
              <AlertIcon size={16} />
            )}
          </span>
          <span className={styles.message}>{t.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

import { createContext, useContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface UseToast {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<UseToast | null>(null);

/**
 * Hook for showing toasts. Must be used inside a <ToastProvider>.
 */
export function useToast(): UseToast {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

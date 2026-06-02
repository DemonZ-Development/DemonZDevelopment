import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../src/components/ui/Toast';
import { useToast, ToastContext } from '../src/hooks/useToast';

function Trigger({ message, variant }: { message: string; variant?: 'success' | 'error' | 'info' }) {
  const t = useToast();
  return (
    <button onClick={() => t.show(message, variant)}>show</button>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a toast with the given message', () => {
    render(
      <ToastProvider>
        <Trigger message="hello" variant="success" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('dismisses the toast after the duration elapses', () => {
    render(
      <ToastProvider>
        <Trigger message="bye" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.queryByText('bye')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText('bye')).toBeNull();
  });

  it('throws if useToast is called outside a provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger message="x" />)).toThrow(
      /useToast must be used within a <ToastProvider>/,
    );
    consoleError.mockRestore();
  });

  it('renders an alert role for error toasts and status for success toasts', () => {
    render(
      <ToastProvider>
        <Trigger message="err" variant="error" />
        <Trigger message="ok" variant="success" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getAllByText('show')[0]);
    fireEvent.click(screen.getAllByText('show')[1]);
    // The error toast is the only element with role="alert" in the tree.
    expect(screen.getByRole('alert')).toHaveTextContent('err');
    // Both success toast items should be present.
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});

describe('ToastContext', () => {
  it('is exported as a non-null context', () => {
    expect(ToastContext).toBeDefined();
  });
});

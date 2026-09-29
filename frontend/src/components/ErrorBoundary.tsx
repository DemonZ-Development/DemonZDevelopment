import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}


export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleHome = (): void => {
    this.setState({ error: null });
    window.location.hash = '';
    window.location.href = '/';
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body, sans-serif)',
          color: 'var(--color-text, #eee)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Something went wrong</h1>
        <p style={{ color: 'var(--color-text-muted, #999)', maxWidth: 480, margin: 0 }}>
          An unexpected error occurred while rendering this page. You can try
          reloading, or head back to the home page.
        </p>
        {import.meta.env.DEV && (
          <pre
            style={{
              maxWidth: 640,
              overflow: 'auto',
              fontSize: '0.8rem',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.6rem 1.4rem',
              background: 'var(--color-accent, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reload page
          </button>
          <button
            onClick={this.handleHome}
            style={{
              padding: '0.6rem 1.4rem',
              background: 'transparent',
              color: 'var(--color-text, #eee)',
              border: '1px solid var(--color-border, #2a2a35)',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Go home
          </button>
        </div>
      </div>
    );
  }
}

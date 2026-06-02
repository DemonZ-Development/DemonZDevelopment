import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'article' | 'section';
}

/**
 * Page-level layout wrapper. Provides consistent top padding for the fixed
 * navbar and container-width content. Pages should render their hero sections
 * outside this component if they want edge-to-edge headers.
 */
export function PageShell({ children, className, as: Tag = 'main' }: PageShellProps) {
  return (
    <Tag className={[styles.shell, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>{children}</div>
    </Tag>
  );
}

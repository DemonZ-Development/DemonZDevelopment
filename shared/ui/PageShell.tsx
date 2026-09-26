import type { ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'article' | 'section';
}


export function PageShell({ children, className, as: Tag = 'main' }: PageShellProps) {
  return (
    <Tag className={[styles.shell, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>{children}</div>
    </Tag>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass';
  children: ReactNode;
}

export function Card({ variant = 'solid', className, children, ...rest }: CardProps) {
  const classes = [
    styles.card,
    variant === 'glass' ? styles.glass : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

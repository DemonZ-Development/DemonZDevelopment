import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'default' | 'small';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'default', className, children, ...rest },
  ref,
) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'small' ? styles.small : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  );
});

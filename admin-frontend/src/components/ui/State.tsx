import type { ReactNode } from 'react';
import { AlertIcon, SpinnerIcon } from './Icon';
import styles from './State.module.css';

interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

function BaseState({ title, description, icon, className }: StateProps) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(' ')}>
      {icon}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function EmptyState({ icon, ...rest }: StateProps) {
  return (
    <BaseState
      icon={icon ?? <AlertIcon size={48} />}
      {...rest}
    />
  );
}

export function ErrorState({ icon, ...rest }: StateProps) {
  return (
    <BaseState
      icon={icon ?? <AlertIcon size={48} />}
      className={styles.error}
      {...rest}
    />
  );
}

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <SpinnerIcon />
    </div>
  );
}

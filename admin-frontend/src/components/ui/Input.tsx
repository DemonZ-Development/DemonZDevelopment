import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import { useId } from 'react';
import styles from './Input.module.css';

interface FieldProps {
  label?: string;
  children: (id: string) => ReactNode;
}

function Field({ label, children }: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      {children(id)}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className, ...rest }: InputProps) {
  return (
    <Field label={label}>
      {(generatedId) => (
        <input
          id={id ?? generatedId}
          className={[styles.input, className].filter(Boolean).join(' ')}
          {...rest}
        />
      )}
    </Field>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className, ...rest }: TextareaProps) {
  return (
    <Field label={label}>
      {(generatedId) => (
        <textarea
          id={id ?? generatedId}
          className={[styles.textarea, className].filter(Boolean).join(' ')}
          {...rest}
        />
      )}
    </Field>
  );
}

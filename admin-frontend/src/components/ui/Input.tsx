import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import { useId } from 'react';
import styles from './Input.module.css';

interface FieldProps {
  label?: string;
  helperText?: string;
  children: (id: string) => ReactNode;
}

function Field({ label, helperText, children }: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      {children(id)}
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function Input({ label, helperText, id, className, ...rest }: InputProps) {
  return (
    <Field label={label} helperText={helperText}>
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
  helperText?: string;
}

export function Textarea({ label, helperText, id, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} helperText={helperText}>
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

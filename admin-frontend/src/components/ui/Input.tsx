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

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, helperText, id, className, options, ...rest }: SelectProps) {
  return (
    <Field label={label} helperText={helperText}>
      {(generatedId) => (
        <select
          id={id ?? generatedId}
          className={[styles.input, className].filter(Boolean).join(' ')}
          style={{
            appearance: 'none',
            background: 'var(--color-surface) url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.5)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e") no-repeat right 1rem center / 1.2em',
            paddingRight: '2.5rem'
          }}
          {...rest as any}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--color-bg-raised)', color: 'var(--color-text)' }}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

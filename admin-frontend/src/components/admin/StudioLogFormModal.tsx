import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import {
  createStudioLogEntry,
  updateStudioLogEntry,
  type AdminStudioLogEntry,
  type StudioLogInput,
  type StudioLogTag,
} from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import styles from './ProjectFormModal.module.css';

interface StudioLogFormModalProps {
  open: boolean;
  token: string;
  entry: AdminStudioLogEntry | null;
  onClose: () => void;
  onSaved: (entry: AdminStudioLogEntry, isNew: boolean) => void;
}

const EMPTY: StudioLogInput = {
  entry_date: '',
  tag: 'game',
  title: '',
  body: '',
  display_order: 0,
  published: true,
};

function toFormState(e: AdminStudioLogEntry | null): StudioLogInput {
  if (!e) return EMPTY;
  return {
    entry_date: e.entry_date ?? '',
    tag: e.tag ?? 'game',
    title: e.title ?? '',
    body: e.body ?? '',
    display_order: e.display_order ?? 0,
    published: e.published ?? true,
  };
}

const TAG_OPTIONS: { value: StudioLogTag; label: string }[] = [
  { value: 'game', label: 'Game' },
  { value: 'lib', label: 'Library' },
  { value: 'ai', label: 'AI' },
  { value: 'site', label: 'Site' },
  { value: 'other', label: 'Other' },
];

export function StudioLogFormModal({
  open,
  token,
  entry,
  onClose,
  onSaved,
}: StudioLogFormModalProps) {
  const toast = useToast();
  const isEditing = entry !== null;
  const [form, setForm] = useState<StudioLogInput>(() => toFormState(entry));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(entry));
  }, [open, entry]);

  function update<K extends keyof StudioLogInput>(
    key: K,
    value: StudioLogInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim() || !form.entry_date.trim()) {
      toast.error('Date, title, and body are required');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && entry) {
        await updateStudioLogEntry(token, entry.id, form);
        toast.success(`Updated "${form.title}"`);
        onSaved({ ...entry, ...form } as AdminStudioLogEntry, false);
      } else {
        const created = await createStudioLogEntry(token, form);
        toast.success(`Created "${form.title}"`);
        onSaved(created as AdminStudioLogEntry, true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Studio Log Entry' : 'New Studio Log Entry'}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="studio-log-form" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Entry'}
          </Button>
        </>
      }
    >
      <form id="studio-log-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <Input
            label="Date *"
            value={form.entry_date}
            onChange={(e) => update('entry_date', e.target.value)}
            placeholder="Nov 2025"
            required
            helperText="Free-form, e.g. 'Nov 2025' or '2025-11-14'"
          />
          <Select
            label="Tag *"
            value={form.tag}
            onChange={(e) => update('tag', e.target.value as StudioLogTag)}
            options={TAG_OPTIONS}
          />
        </div>
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Boss rush mod — backporting v2.4"
          required
        />
        <Textarea
          label="Body *"
          value={form.body}
          onChange={(e) => update('body', e.target.value)}
          placeholder="What you're actually working on, in plain language."
          rows={5}
          required
        />
        <div className={styles.grid}>
          <Input
            label="Display order"
            type="number"
            value={String(form.display_order)}
            onChange={(e) =>
              update('display_order', parseInt(e.target.value, 10) || 0)
            }
            helperText="Lower numbers appear first. Ties broken by recency."
          />
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update('published', e.target.checked)}
              />
              <span>Published (visible on the home page)</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

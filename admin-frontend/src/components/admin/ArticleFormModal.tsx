import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import {
  createArticle,
  updateArticle,
  uploadMedia,
  type AdminArticle,
} from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import styles from './ProjectFormModal.module.css';

interface ArticleFormModalProps {
  open: boolean;
  token: string;
  article: AdminArticle | null; // null = creating
  onClose: () => void;
  onSaved: (article: AdminArticle, isNew: boolean) => void;
}

interface FormState {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  published: boolean;
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: '',
  image_url: '',
  published: false,
};

function toFormState(a: AdminArticle | null): FormState {
  if (!a) return EMPTY;
  return {
    title: a.title ?? '',
    slug: a.slug ?? '',
    summary: a.summary ?? '',
    content: a.content ?? '',
    category: a.category ?? '',
    image_url: a.image_url ?? '',
    published: a.published ?? false,
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ArticleFormModal({
  open,
  token,
  article,
  onClose,
  onSaved,
}: ArticleFormModalProps) {
  const toast = useToast();
  const isEditing = article !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(article));
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(article));
    setAutoSlug(!isEditing);
  }, [open, article, isEditing]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && autoSlug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        category: form.category.trim() || null,
        image_url: form.image_url.trim() || null,
      };
      if (isEditing && article) {
        await updateArticle(token, article.id, payload);
        toast.success(`Updated "${form.title}"`);
        onSaved({ ...article, ...form } as AdminArticle, false);
      } else {
        const created = await createArticle(token, payload);
        toast.success(`Created "${form.title}"`);
        onSaved(created as AdminArticle, true);
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
      title={isEditing ? 'Edit Article' : 'New Article'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="article-form"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Article'}
          </Button>
        </>
      }
    >
      <form id="article-form" onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="How to make a great plugin"
          required
        />
        <Input
          label="Slug *"
          value={form.slug}
          onChange={(e) => {
            setAutoSlug(false);
            update('slug', slugify(e.target.value));
          }}
          placeholder="how-to-make-a-great-plugin"
          required
          helperText="URL identifier, lowercase, hyphens only"
        />
        <Textarea
          label="Summary"
          value={form.summary}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="Short description shown in article cards"
          rows={2}
        />
        <Textarea
          label="Content *"
          value={form.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder="Full article body (Markdown supported)"
          rows={12}
        />
        <div className={styles.grid}>
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="tutorial, news, …"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Input
              label="Image URL"
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
              placeholder="https://…/cover.png"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="file"
                accept="image/*"
                id="article-image-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    toast.info('Uploading image...');
                    const url = await uploadMedia(token, file);
                    update('image_url', url);
                    toast.success('Image uploaded successfully!');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Upload failed');
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => document.getElementById('article-image-upload')?.click()}
              >
                📤 Upload Local Image
              </Button>
              {form.image_url && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                  Linked: {form.image_url.split('/').pop()}
                </span>
              )}
            </div>
          </div>
        </div>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update('published', e.target.checked)}
          />
          <span>Published (visible to the public)</span>
        </label>
      </form>
    </Modal>
  );
}

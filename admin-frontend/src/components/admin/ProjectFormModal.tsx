import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { createProject, updateProject, uploadMedia, type AdminProject } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import styles from './ProjectFormModal.module.css';

interface ProjectFormModalProps {
  open: boolean;
  token: string;
  project: AdminProject | null; // null = creating
  onClose: () => void;
  onSaved: (project: AdminProject, isNew: boolean) => void;
}

interface FormState {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  author: string;
  redirect_url: string;
  file_path: string;
  image_url: string;
  source_url: string;
  is_featured: boolean;
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: 'plugin',
  version: '1.0.0',
  author: 'DemonZ Development',
  redirect_url: '',
  file_path: '',
  image_url: '',
  source_url: '',
  is_featured: false,
};

function toFormState(p: AdminProject | null): FormState {
  if (!p) return EMPTY;
  return {
    name: p.name ?? '',
    slug: p.slug ?? '',
    tagline: p.tagline ?? '',
    description: p.description ?? '',
    category: p.category ?? 'plugin',
    version: p.version ?? '1.0.0',
    author: p.author ?? 'DemonZ Development',
    redirect_url: p.redirect_url ?? '',
    file_path: p.file_path ?? '',
    image_url: p.image_url ?? '',
    source_url: p.source_url ?? '',
    is_featured: p.is_featured ?? false,
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

export function ProjectFormModal({
  open,
  token,
  project,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const toast = useToast();
  const isEditing = project !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  useEffect(() => {
    if (!open) return;
    setForm(toFormState(project));
    setAutoSlug(!isEditing);
  }, [open, project, isEditing]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'name' && autoSlug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        redirect_url: form.redirect_url.trim() || null,
        file_path: form.file_path.trim() || null,
        image_url: form.image_url.trim() || null,
        source_url: form.source_url.trim() || null,
      };
      if (isEditing && project) {
        await updateProject(token, project.id, payload);
        toast.success(`Updated "${form.name}"`);
        onSaved({ ...project, ...form } as AdminProject, false);
      } else {
        const created = await createProject(token, payload);
        toast.success(`Created "${form.name}"`);
        onSaved(created as AdminProject, true);
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
      title={isEditing ? 'Edit Project' : 'New Project'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-form"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="DemonZ Plugin"
            required
          />
          <Input
            label="Slug *"
            value={form.slug}
            onChange={(e) => {
              setAutoSlug(false);
              update('slug', slugify(e.target.value));
            }}
            placeholder="demonz-plugin"
            required
            helperText="URL identifier, lowercase, hyphens only"
          />
        </div>

        <Input
          label="Tagline"
          value={form.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          placeholder="One-line description for the project card"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Detailed description shown on the project page"
          rows={5}
        />

        <div className={styles.grid}>
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="plugin, mod, tool, …"
          />
          <Input
            label="Version"
            value={form.version}
            onChange={(e) => update('version', e.target.value)}
            placeholder="1.0.0"
          />
          <Input
            label="Author"
            value={form.author}
            onChange={(e) => update('author', e.target.value)}
          />
        </div>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Links & Media</legend>
          <div className={styles.grid}>
            <Input
              label="Redirect URL"
              value={form.redirect_url}
              onChange={(e) => update('redirect_url', e.target.value)}
              placeholder="https://… (download link)"
            />
            <Input
              label="File Path"
              value={form.file_path}
              onChange={(e) => update('file_path', e.target.value)}
              placeholder="downloads/file.zip"
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
                  id="project-image-upload"
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
                  onClick={() => document.getElementById('project-image-upload')?.click()}
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
            <Input
              label="Source URL"
              value={form.source_url}
              onChange={(e) => update('source_url', e.target.value)}
              placeholder="https://github.com/…"
            />
          </div>
        </fieldset>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => update('is_featured', e.target.checked)}
          />
          <span>Feature this project on the homepage</span>
        </label>
      </form>
    </Modal>
  );
}

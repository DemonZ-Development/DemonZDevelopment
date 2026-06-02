import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { TrashIcon } from '../ui/Icon';
import {
  fetchChangelogs,
  createChangelog,
  deleteChangelog,
  type Changelog,
  type AdminProject,
} from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import styles from './ChangelogFormModal.module.css';

interface ChangelogFormModalProps {
  open: boolean;
  token: string;
  project: AdminProject | null;
  onClose: () => void;
}

export function ChangelogFormModal({
  open,
  token,
  project,
  onClose,
}: ChangelogFormModalProps) {
  const toast = useToast();
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [changes, setChanges] = useState('');

  useEffect(() => {
    if (!open || !project) return;
    loadChangelogs();
    // Default the version field to help user based on project's version
    setVersion(project.version || '1.0.0');
    setTitle('');
    setChanges('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  async function loadChangelogs() {
    if (!project) return;
    setLoading(true);
    try {
      const data = await fetchChangelogs(project.slug);
      // Sort by created_at descending (latest first)
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setChangelogs(sorted);
    } catch (err) {
      toast.error('Failed to load changelogs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    if (!version.trim() || !title.trim() || !changes.trim()) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      await createChangelog(token, {
        project_id: project.id,
        version: version.trim(),
        title: title.trim(),
        changes: changes.trim(),
      });
      toast.success('Changelog entry added!');
      // Reset form (except version maybe, or clear)
      setTitle('');
      setChanges('');
      // Reload list
      loadChangelogs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add changelog');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }
    try {
      await deleteChangelog(token, id);
      toast.success('Changelog entry deleted');
      loadChangelogs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (!project) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Changelog - ${project.name}`}
      size="lg"
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className={styles.container}>
        {/* Left Column: List of existing changelogs */}
        <div>
          <h3 className={styles.sectionTitle}>Changelog History</h3>
          <div className={styles.listSection}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)' }}>
                Loading history…
              </div>
            ) : changelogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No changelog entries yet. Releases will appear here.
              </div>
            ) : (
              changelogs.map((c) => (
                <div key={c.id} className={styles.changelogItem}>
                  <div className={styles.changelogContent}>
                    <div className={styles.headerRow}>
                      <span className={styles.versionBadge}>v{c.version}</span>
                      <span className={styles.changelogTitle}>{c.title}</span>
                    </div>
                    <div className={styles.changesText}>{c.changes}</div>
                    <span className={styles.date}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleDelete(c.id)}
                    title="Delete entry"
                    style={{ padding: '6px' }}
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Form to create new changelog */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Add New Release</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Version *"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 1.1.0"
              required
            />
            <Input
              label="Release Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Performance Update"
              required
            />
            <Textarea
              label="Changes / Release Notes * (Markdown supported)"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="e.g. - Added optimization for Geyser&#10;- Fixed download counter race condition&#10;- General cleanups"
              rows={8}
              required
            />
            <Button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? 'Adding Release…' : 'Publish Version Release'}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

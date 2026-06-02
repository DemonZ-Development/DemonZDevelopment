import { useState, useEffect } from 'react';
import { fetchChangelogs, type Changelog } from '../lib/api';
import { LoadingState, EmptyState } from './ui/State';
import styles from './ChangelogTimeline.module.css';

interface Props {
  projectSlug: string;
}

export default function ChangelogTimeline({ projectSlug }: Props) {
  const [entries, setEntries] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchChangelogs(projectSlug)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(() => {
        if (active) setEntries([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectSlug]);

  if (loading) return <LoadingState label="Loading changelog" />;
  if (entries.length === 0) {
    return <EmptyState title="No changelog entries yet." />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.line} />
      {entries.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.dot} />
          <span className={styles.version}>v{entry.version}</span>
          <h4 className={styles.title}>{entry.title}</h4>
          <p className={styles.date}>
            {new Date(entry.created_at).toLocaleDateString()}
          </p>
          <div className={styles.changes}>{entry.changes}</div>
        </div>
      ))}
    </div>
  );
}

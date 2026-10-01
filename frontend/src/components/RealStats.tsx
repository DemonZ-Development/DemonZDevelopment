import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '../lib/api';
import styles from './RealStats.module.css';



function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function RealStats() {
  const { data: stats, isError, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isError) {
    return (
      <div className={styles.section}>
        <div className={styles.error}>
          Updates are temporarily unavailable.
        </div>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className={styles.section}>
        <div className={styles.latestRow}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.latestCard}>
              <div className={styles.skeletonBar} style={{ height: 14, width: '28%' }} />
              <div className={styles.skeletonBar} style={{ height: 26, width: '65%' }} />
              <div className={styles.skeletonBar} style={{ height: 40, width: '100%' }} />
              <div className={styles.skeletonBar} style={{ height: 16, width: '35%', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats.latestProject && !stats.latestArticle) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.latestRow}>
        {stats.latestProject && (
          <Link
            to={`/projects/${stats.latestProject.slug}`}
            className={styles.latestCard}
          >
            <span className={styles.latestKicker}>Latest release</span>
            <h3 className={styles.latestTitle}>{stats.latestProject.name}</h3>
            {stats.latestProject.tagline && (
              <p className={styles.latestSummary}>{stats.latestProject.tagline}</p>
            )}
            <div className={styles.latestMeta}>
              <span>View project →</span>
            </div>
          </Link>
        )}
        {stats.latestArticle && (
          <Link
            to={`/articles/${stats.latestArticle.slug}`}
            className={styles.latestCard}
          >
            <span className={styles.latestKicker}>Latest article</span>
            <h3 className={styles.latestTitle}>{stats.latestArticle.title}</h3>
            {stats.latestArticle.summary && (
              <p className={styles.latestSummary}>{stats.latestArticle.summary}</p>
            )}
            <div className={styles.latestMeta}>
              {stats.latestArticle.category && <span>{stats.latestArticle.category}</span>}
              <span>{formatDate(stats.latestArticle.published_at)}</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

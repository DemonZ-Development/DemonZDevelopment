import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, type Stats } from '../lib/api';
import styles from './RealStats.module.css';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.error}>
          Stats are temporarily unavailable. The page still works — this is just a snapshot.
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.section}>
        <div className={styles.statsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.statCard}>
              <div
                style={{
                  height: 36,
                  width: '60%',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 4,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  height: 12,
                  width: '40%',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 4,
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatNumber(stats.projectCount)}</div>
          <div className={styles.statLabel}>Projects</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatNumber(stats.articleCount)}</div>
          <div className={styles.statLabel}>Articles</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatNumber(stats.totalDownloads)}</div>
          <div className={styles.statLabel}>Total Downloads</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatNumber(stats.commentCount)}</div>
          <div className={styles.statLabel}>Approved Comments</div>
        </div>
      </div>

      {(stats.latestProject || stats.latestArticle) && (
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
      )}
    </div>
  );
}

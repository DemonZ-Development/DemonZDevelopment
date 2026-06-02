import { Link } from 'react-router-dom';
import type { Project } from '../lib/api';
import { DownloadIcon, ChevronRightIcon, CubeIcon } from './ui/Icon';
import styles from './ProjectCard.module.css';

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const CATEGORY_LABELS: Record<string, string> = {
  games: 'Games & Mods',
  libraries: 'Libraries',
  ai: 'AI Telemetry',
  utilities: 'Utilities',
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={styles.card}
    >
      <div className={styles.imageWrap}>
        {project.image_url ? (
          <img
            className={styles.image}
            src={project.image_url}
            alt={project.name}
            loading="lazy"
          />
        ) : (
          <span className={styles.iconFallback}>
            <CubeIcon size={40} />
          </span>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.categoryBadge}>
          {CATEGORY_LABELS[project.category] ?? project.category}
        </span>
        <h3 className={styles.name}>{project.name}</h3>
        <p className={styles.tagline}>{project.tagline}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.downloads}>
          <DownloadIcon size={14} />
          {formatDownloads(project.downloads)}
        </span>
        <span className={styles.viewButton}>
          View details
          <ChevronRightIcon size={14} />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.imageWrap} />
      <div className={styles.body}>
        <div className={styles.name}>&nbsp;</div>
        <div className={styles.tagline}>&nbsp;</div>
      </div>
      <div className={styles.footer}>
        <span />
        <span />
      </div>
    </div>
  );
}

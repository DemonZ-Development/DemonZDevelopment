import {
  AlertIcon,
  CubeIcon,
  DownloadIcon,
  PackageIcon,
} from '../ui/Icon';
import styles from './StatsOverview.module.css';

interface StatsOverviewProps {
  projectCount: number;
  articleCount: number;
  pendingComments: number;
  unreadMessages: number;
  totalDownloads: number;
  onSelectTab?: (tab: 'projects' | 'articles' | 'comments' | 'messages') => void;
}

interface TileProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: 'default' | 'accent' | 'warning' | 'success';
  badge?: string;
  onClick?: () => void;
}

function Tile({ label, value, icon, tone = 'default', badge, onClick }: TileProps) {
  const className = `${styles.tile} ${styles[tone]} ${onClick ? styles.clickable : ''}`;
  const content = (
    <>
      <div className={styles.tileHeader}>
        <div className={styles.tileIcon}>{icon}</div>
        {badge && <span className={styles.tileBadge}>{badge}</span>}
      </div>
      <div className={styles.tileBody}>
        <div className={styles.tileValue}>{value}</div>
        <div className={styles.tileLabel}>{label}</div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={`${label}: ${value}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} aria-label={`${label}: ${value}`}>
      {content}
    </div>
  );
}

export function StatsOverview({
  projectCount,
  articleCount,
  pendingComments,
  unreadMessages,
  totalDownloads,
  onSelectTab,
}: StatsOverviewProps) {
  return (
    <div className={styles.grid}>
      <Tile
        label="Active Projects"
        value={projectCount}
        icon={<PackageIcon size={18} />}
        tone="accent"
        onClick={() => onSelectTab?.('projects')}
      />
      <Tile
        label="Published Articles"
        value={articleCount}
        icon={<CubeIcon size={18} />}
        onClick={() => onSelectTab?.('articles')}
      />
      <Tile
        label="Total Downloads"
        value={totalDownloads.toLocaleString()}
        icon={<DownloadIcon size={18} />}
        tone="success"
        onClick={() => onSelectTab?.('projects')}
      />
      <Tile
        label="Pending Comments"
        value={pendingComments}
        icon={<AlertIcon size={18} />}
        tone={pendingComments > 0 ? 'warning' : 'default'}
        badge={pendingComments > 0 ? `${pendingComments} pending` : undefined}
        onClick={() => onSelectTab?.('comments')}
      />
      <Tile
        label="Unread Messages"
        value={unreadMessages}
        icon={<AlertIcon size={18} />}
        tone={unreadMessages > 0 ? 'warning' : 'default'}
        badge={unreadMessages > 0 ? `${unreadMessages} unread` : undefined}
        onClick={() => onSelectTab?.('messages')}
      />
    </div>
  );
}

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
}

interface TileProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: 'default' | 'accent' | 'warning' | 'success';
  href?: string;
  onClick?: () => void;
}

function Tile({ label, value, icon, tone = 'default', href, onClick }: TileProps) {
  const className = `${styles.tile} ${styles[tone]}`;
  if (href) {
    return (
      <a className={className} href={href}>
        <div className={styles.tileIcon}>{icon}</div>
        <div className={styles.tileBody}>
          <div className={styles.tileValue}>{value}</div>
          <div className={styles.tileLabel}>{label}</div>
        </div>
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      <div className={styles.tileIcon}>{icon}</div>
      <div className={styles.tileBody}>
        <div className={styles.tileValue}>{value}</div>
        <div className={styles.tileLabel}>{label}</div>
      </div>
    </button>
  );
}

export function StatsOverview({
  projectCount,
  articleCount,
  pendingComments,
  unreadMessages,
  totalDownloads,
}: StatsOverviewProps) {
  return (
    <div className={styles.grid}>
      <Tile
        label="Projects"
        value={projectCount}
        icon={<PackageIcon size={20} />}
        tone="accent"
      />
      <Tile
        label="Articles"
        value={articleCount}
        icon={<CubeIcon size={20} />}
      />
      <Tile
        label="Total Downloads"
        value={totalDownloads.toLocaleString()}
        icon={<DownloadIcon size={20} />}
        tone="success"
      />
      <Tile
        label="Pending Comments"
        value={pendingComments}
        icon={<AlertIcon size={20} />}
        tone={pendingComments > 0 ? 'warning' : 'default'}
      />
      <Tile
        label="Unread Messages"
        value={unreadMessages}
        icon={<AlertIcon size={20} />}
        tone={unreadMessages > 0 ? 'warning' : 'default'}
      />
    </div>
  );
}

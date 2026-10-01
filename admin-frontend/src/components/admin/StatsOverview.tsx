import {
  FolderIcon,
  FileTextIcon,
  DownloadIcon,
  MessageSquareIcon,
  MailIcon,
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
  badge?: string;
  isBadgeAlert?: boolean;
  onClick?: () => void;
}

function Tile({ label, value, icon, badge, isBadgeAlert, onClick }: TileProps) {
  const className = `${styles.tile} ${onClick ? styles.clickable : ''}`;
  const content = (
    <>
      <div className={styles.tileHeader}>
        <div className={styles.tileIcon}>{icon}</div>
        {badge && (
          <span
            className={`${styles.tileBadge} ${
              isBadgeAlert ? styles.tileBadgeAlert : ''
            }`}
          >
            {badge}
          </span>
        )}
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
        icon={<FolderIcon size={18} />}
        onClick={() => onSelectTab?.('projects')}
      />
      <Tile
        label="Published Articles"
        value={articleCount}
        icon={<FileTextIcon size={18} />}
        onClick={() => onSelectTab?.('articles')}
      />
      <Tile
        label="Total Downloads"
        value={totalDownloads.toLocaleString()}
        icon={<DownloadIcon size={18} />}
        onClick={() => onSelectTab?.('projects')}
      />
      <Tile
        label="Pending Comments"
        value={pendingComments}
        icon={<MessageSquareIcon size={18} />}
        badge={pendingComments > 0 ? `${pendingComments} pending` : undefined}
        isBadgeAlert={pendingComments > 0}
        onClick={() => onSelectTab?.('comments')}
      />
      <Tile
        label="Unread Messages"
        value={unreadMessages}
        icon={<MailIcon size={18} />}
        badge={unreadMessages > 0 ? `${unreadMessages} unread` : undefined}
        isBadgeAlert={unreadMessages > 0}
        onClick={() => onSelectTab?.('messages')}
      />
    </div>
  );
}

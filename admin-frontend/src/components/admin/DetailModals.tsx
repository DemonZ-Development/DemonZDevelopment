import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TrashIcon } from '../ui/Icon';
import type { AdminMessage, AdminComment } from '../../lib/api';
import styles from './DetailModal.module.css';

interface MessageDetailModalProps {
  open: boolean;
  message: AdminMessage | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function MessageDetailModal({
  open,
  message,
  onClose,
  onDelete,
}: MessageDetailModalProps) {
  if (!message) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contact Message"
      size="md"
      footer={
        <>
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete(message.id);
                onClose();
              }}
            >
              <TrashIcon size={14} /> Delete
            </Button>
          )}
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className={styles.meta}>
        <div>
          <div className={styles.label}>From</div>
          <div className={styles.value}>{message.name}</div>
        </div>
        <div>
          <div className={styles.label}>Email</div>
          <a className={styles.link} href={`mailto:${message.email}`}>
            {message.email}
          </a>
        </div>
        <div>
          <div className={styles.label}>Received</div>
          <div className={styles.value}>
            {new Date(message.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <div className={styles.label}>Status</div>
          <span
            className={`${styles.badge} ${message.read ? styles.badgeRead : styles.badgeUnread}`}
          >
            {message.read ? 'Read' : 'Unread'}
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <pre className={styles.messageBody}>{message.message}</pre>
      </div>
    </Modal>
  );
}

interface CommentDetailModalProps {
  open: boolean;
  comment: AdminComment | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
}

export function CommentDetailModal({
  open,
  comment,
  onClose,
  onDelete,
  onApprove,
}: CommentDetailModalProps) {
  if (!comment) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Comment"
      size="md"
      footer={
        <>
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete(comment.id);
                onClose();
              }}
            >
              <TrashIcon size={14} /> Delete
            </Button>
          )}
          {onApprove && !comment.approved && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onApprove(comment.id);
                onClose();
              }}
            >
              Approve
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className={styles.meta}>
        <div>
          <div className={styles.label}>From</div>
          <div className={styles.value}>{comment.user_name}</div>
        </div>
        <div>
          <div className={styles.label}>Email</div>
          <a className={styles.link} href={`mailto:${comment.user_email}`}>
            {comment.user_email}
          </a>
        </div>
        <div>
          <div className={styles.label}>Posted</div>
          <div className={styles.value}>
            {new Date(comment.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <div className={styles.label}>Status</div>
          <span
            className={`${styles.badge} ${comment.approved ? styles.badgeApproved : styles.badgePending}`}
          >
            {comment.approved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <pre className={styles.messageBody}>{comment.comment_text}</pre>
      </div>
    </Modal>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { fetchComments, postComment, type Comment } from '../lib/api';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';
import { LoadingState, EmptyState } from './ui/State';
import styles from './CommentThread.module.css';

interface Props {
  projectSlug: string;
}

export default function CommentThread({ projectSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchComments(projectSlug)
      .then((data) => {
        if (active) setComments(data);
      })
      .catch(() => {
        if (active) setComments([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !text.trim()) return;
    if (website) return; // bot detected
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      await postComment(projectSlug, {
        user_name: name.trim(),
        user_email: email.trim(),
        comment_text: text.trim(),
      });
      setSubmitStatus('success');
      setName('');
      setEmail('');
      setText('');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading comments" />;

  return (
    <div className={styles.wrap}>
      {comments.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            title="No comments yet"
            description="Be the first to share your thoughts!"
          />
        </div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.userName}>{c.user_name}</span>
              <time className={styles.date} dateTime={c.created_at}>
                {new Date(c.created_at).toLocaleDateString()}
              </time>
            </div>
            <p className={styles.text}>{c.comment_text}</p>
          </div>
        ))
      )}

      <h3 className={styles.formTitle}>Leave a Comment</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
            autoComplete="email"
          />
        </div>
        <Textarea
          placeholder="Share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          required
          rows={5}
        />
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Website (leave blank)
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>
        <Button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
          {submitting ? 'Posting…' : 'Post Comment'}
        </Button>
        {submitStatus === 'success' && (
          <div className={styles.success}>
            Your comment has been submitted and is pending moderation. Thanks!
          </div>
        )}
        {submitStatus === 'error' && (
          <div className={styles.error}>
            Failed to submit comment. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}

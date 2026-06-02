import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { LoadingState, EmptyState } from '../components/ui/State';
import {
  EditIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../components/ui/Icon';
import { StatsOverview } from '../components/admin/StatsOverview';
import { ProjectFormModal } from '../components/admin/ProjectFormModal';
import { ArticleFormModal } from '../components/admin/ArticleFormModal';
import {
  CommentDetailModal,
  MessageDetailModal,
} from '../components/admin/DetailModals';
import { ToastProvider } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import {
  ApiError,
  adminLogin,
  approveComment,
  deleteArticle,
  deleteComment,
  deleteMessage,
  deleteProject,
  fetchAdminArticles,
  fetchAdminComments,
  fetchAdminMessages,
  fetchAdminProjects,
  fetchStats,
  markMessageRead,
  type AdminArticle,
  type AdminComment,
  type AdminMessage,
  type AdminProject,
  type Stats,
} from '../lib/api';
import styles from './Admin.module.css';

const TOKEN_KEY = 'dzd_admin_token';

type Tab = 'projects' | 'articles' | 'comments' | 'messages';

type DeleteTarget =
  | { kind: 'project'; id: string; name: string }
  | { kind: 'article'; id: string; title: string }
  | { kind: 'comment'; id: string }
  | { kind: 'message'; id: string; name: string }
  | null;

interface ProjectFormTarget {
  mode: 'create' | 'edit';
  project: AdminProject | null;
}

interface ArticleFormTarget {
  mode: 'create' | 'edit';
  article: AdminArticle | null;
}

// ─── Login ─────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const t = await adminLogin(password);
      onLogin(t);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? 'Invalid credentials'
          : err instanceof Error
            ? err.message
            : 'Connection error';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.loginWrap}>
      <h2 className={styles.loginTitle}>Admin Login</h2>
      {error && <p className={styles.loginError}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoFocus
          required
        />
        <Button type="submit" disabled={submitting} className={styles.loginButton}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────

function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  useDocumentTitle('Admin | DemonZ Development');

  const toast = useToast();
  const [tab, setTab] = useState<Tab>('projects');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormTarget | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleFormTarget | null>(null);
  const [viewComment, setViewComment] = useState<AdminComment | null>(null);
  const [viewMessage, setViewMessage] = useState<AdminMessage | null>(null);

  // Fetch stats once on mount.
  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    fetchStats()
      .then((s) => {
        if (active) setStats(s);
      })
      .catch(() => {
        if (active) toast.error('Failed to load stats');
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data for the active tab.
  useEffect(() => {
    let active = true;
    setTabLoading(true);
    setTabError(false);
    const load = async () => {
      try {
        let data;
        if (tab === 'projects') {
          data = await fetchAdminProjects(token);
          if (active) setProjects(data);
        } else if (tab === 'articles') {
          data = await fetchAdminArticles(token);
          if (active) setArticles(data);
        } else if (tab === 'comments') {
          data = await fetchAdminComments(token);
          if (active) setComments(data);
        } else if (tab === 'messages') {
          data = await fetchAdminMessages(token);
          if (active) setMessages(data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onLogout();
          return;
        }
        if (active) {
          setTabError(true);
          toast.error('Failed to load data');
        }
      } finally {
        if (active) setTabLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  // ---- Filtering ----
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [projects, search]);

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.category ?? '').toLowerCase().includes(q),
    );
  }, [articles, search]);

  const filteredComments = useMemo(() => {
    if (!search.trim()) return comments;
    const q = search.toLowerCase();
    return comments.filter(
      (c) =>
        c.user_name.toLowerCase().includes(q) ||
        c.user_email.toLowerCase().includes(q) ||
        c.comment_text.toLowerCase().includes(q),
    );
  }, [comments, search]);

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [messages, search]);

  // ---- Stats counts (derived from current data) ----
  const pendingCommentCount = comments.filter((c) => !c.approved).length;
  const unreadMessageCount = messages.filter((m) => !m.read).length;

  // ---- Action handlers ----
  async function handleApproveComment(id: string) {
    try {
      await approveComment(token, id);
      setComments((cs) =>
        cs.map((c) => (c.id === id ? { ...c, approved: true } : c)),
      );
      toast.success('Comment approved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    }
  }

  async function handleOpenMessage(m: AdminMessage) {
    setViewMessage(m);
    if (!m.read) {
      // Optimistic update, then server call.
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      try {
        await markMessageRead(token, m.id);
      } catch {
        setMessages((ms) =>
          ms.map((x) => (x.id === m.id ? { ...x, read: false } : x)),
        );
        toast.error('Failed to mark as read');
      }
    }
  }

  async function handleDeleteMessage(id: string) {
    try {
      await deleteMessage(token, id);
      setMessages((ms) => ms.filter((m) => m.id !== id));
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function handleProjectSaved(saved: AdminProject, isNew: boolean) {
    if (isNew) {
      setProjects((ps) => [saved, ...ps]);
    } else {
      setProjects((ps) => ps.map((p) => (p.id === saved.id ? saved : p)));
    }
    setProjectForm(null);
  }

  function handleArticleSaved(saved: AdminArticle, isNew: boolean) {
    if (isNew) {
      setArticles((as) => [saved, ...as]);
    } else {
      setArticles((as) => as.map((a) => (a.id === saved.id ? saved : a)));
    }
    setArticleForm(null);
  }

  async function performDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      if (target.kind === 'project') {
        await deleteProject(token, target.id);
        setProjects((ps) => ps.filter((p) => p.id !== target.id));
        toast.success('Project deleted');
      } else if (target.kind === 'article') {
        await deleteArticle(token, target.id);
        setArticles((as) => as.filter((a) => a.id !== target.id));
        toast.success('Article deleted');
      } else if (target.kind === 'comment') {
        await deleteComment(token, target.id);
        setComments((cs) => cs.filter((c) => c.id !== target.id));
        toast.success('Comment deleted');
      } else if (target.kind === 'message') {
        await deleteMessage(token, target.id);
        setMessages((ms) => ms.filter((m) => m.id !== target.id));
        toast.success('Message deleted');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function getDeleteDescription(): string {
    if (!deleteTarget) return '';
    switch (deleteTarget.kind) {
      case 'project':
        return `Delete project "${deleteTarget.name}"? This cannot be undone.`;
      case 'article':
        return `Delete article "${deleteTarget.title}"? This cannot be undone.`;
      case 'comment':
        return 'Delete this comment? This cannot be undone.';
      case 'message':
        return `Delete message from ${deleteTarget.name}? This cannot be undone.`;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <Button variant="ghost" size="small" onClick={onLogout}>
            <LogoutIcon size={14} /> Logout
          </Button>
        </div>

        {statsLoading && !stats ? (
          <LoadingState label="Loading stats" />
        ) : stats ? (
          <StatsOverview
            projectCount={stats.projectCount}
            articleCount={stats.articleCount}
            pendingComments={pendingCommentCount}
            unreadMessages={unreadMessageCount}
            totalDownloads={stats.totalDownloads}
          />
        ) : null}

        <div className={styles.tabs} role="tablist">
          {(['projects', 'articles', 'comments', 'messages'] as Tab[]).map((t) => {
            const badge =
              t === 'comments'
                ? pendingCommentCount
                : t === 'messages'
                  ? unreadMessageCount
                  : 0;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => {
                  setTab(t);
                  setSearch('');
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {badge > 0 && <span className={styles.tabBadge}>{badge}</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={
                tab === 'projects'
                  ? 'Search projects…'
                  : tab === 'articles'
                    ? 'Search articles…'
                    : tab === 'comments'
                      ? 'Search comments…'
                      : 'Search messages…'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Search ${tab}`}
            />
          </div>
          {tab === 'projects' && (
            <Button
              size="small"
              onClick={() => setProjectForm({ mode: 'create', project: null })}
            >
              <PlusIcon size={14} /> New Project
            </Button>
          )}
          {tab === 'articles' && (
            <Button
              size="small"
              onClick={() => setArticleForm({ mode: 'create', article: null })}
            >
              <PlusIcon size={14} /> New Article
            </Button>
          )}
        </div>

        {tabLoading ? (
          <LoadingState label={`Loading ${tab}`} />
        ) : tabError ? (
          <EmptyState
            title="Failed to load"
            description="Could not fetch data from the server."
          />
        ) : tab === 'projects' ? (
          <ProjectsTable
            projects={filteredProjects}
            onEdit={(p) => setProjectForm({ mode: 'edit', project: p })}
            onDelete={(p) =>
              setDeleteTarget({ kind: 'project', id: p.id, name: p.name })
            }
          />
        ) : tab === 'articles' ? (
          <ArticlesTable
            articles={filteredArticles}
            onEdit={(a) => setArticleForm({ mode: 'edit', article: a })}
            onDelete={(a) =>
              setDeleteTarget({ kind: 'article', id: a.id, title: a.title })
            }
          />
        ) : tab === 'comments' ? (
          <CommentsTable
            comments={filteredComments}
            onView={(c) => setViewComment(c)}
            onApprove={handleApproveComment}
            onDelete={(c) => setDeleteTarget({ kind: 'comment', id: c.id })}
          />
        ) : (
          <MessagesTable
            messages={filteredMessages}
            onView={handleOpenMessage}
            onDelete={(m) =>
              setDeleteTarget({ kind: 'message', id: m.id, name: m.name })
            }
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Confirm Delete"
        description={getDeleteDescription()}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={performDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {projectForm && (
        <ProjectFormModal
          open={projectForm !== null}
          token={token}
          project={projectForm.project}
          onClose={() => setProjectForm(null)}
          onSaved={handleProjectSaved}
        />
      )}

      {articleForm && (
        <ArticleFormModal
          open={articleForm !== null}
          token={token}
          article={articleForm.article}
          onClose={() => setArticleForm(null)}
          onSaved={handleArticleSaved}
        />
      )}

      <MessageDetailModal
        open={viewMessage !== null}
        message={viewMessage}
        onClose={() => setViewMessage(null)}
        onDelete={handleDeleteMessage}
      />

      <CommentDetailModal
        open={viewComment !== null}
        comment={viewComment}
        onClose={() => setViewComment(null)}
        onDelete={(id) => {
          setDeleteTarget({ kind: 'comment', id });
          setViewComment(null);
        }}
        onApprove={(id) => {
          handleApproveComment(id);
          setViewComment(null);
        }}
      />
    </div>
  );
}

// ─── Table subcomponents ──────────────────────────────────

function ProjectsTable({
  projects,
  onEdit,
  onDelete,
}: {
  projects: AdminProject[];
  onEdit: (p: AdminProject) => void;
  onDelete: (p: AdminProject) => void;
}) {
  if (projects.length === 0) {
    return <EmptyState title="No projects" description="No matching projects." />;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Downloads</th>
            <th>Status</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <div className={styles.primary}>{p.name}</div>
                <div className={styles.muted}>{p.slug}</div>
              </td>
              <td>
                <span className={`${styles.tag} ${styles.tagAccent}`}>
                  {p.category}
                </span>
              </td>
              <td>{p.downloads.toLocaleString()}</td>
              <td>
                {p.is_featured ? (
                  <span className={`${styles.tag} ${styles.tagSuccess}`}>
                    Featured
                  </span>
                ) : (
                  <span className={styles.muted}>—</span>
                )}
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button size="small" variant="ghost" onClick={() => onEdit(p)}>
                    <EditIcon size={12} /> Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(p)}
                  >
                    <TrashIcon size={12} /> Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArticlesTable({
  articles,
  onEdit,
  onDelete,
}: {
  articles: AdminArticle[];
  onEdit: (a: AdminArticle) => void;
  onDelete: (a: AdminArticle) => void;
}) {
  if (articles.length === 0) {
    return <EmptyState title="No articles" description="No matching articles." />;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Updated</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>
                <div className={styles.primary}>{a.title}</div>
                <div className={styles.muted}>{a.slug}</div>
              </td>
              <td>{a.category || <span className={styles.muted}>—</span>}</td>
              <td>
                <span
                  className={`${styles.tag} ${
                    a.published ? styles.tagSuccess : styles.tagWarning
                  }`}
                >
                  {a.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className={styles.muted}>
                {new Date(a.updated_at).toLocaleDateString()}
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button size="small" variant="ghost" onClick={() => onEdit(a)}>
                    <EditIcon size={12} /> Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(a)}
                  >
                    <TrashIcon size={12} /> Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommentsTable({
  comments,
  onView,
  onApprove,
  onDelete,
}: {
  comments: AdminComment[];
  onView: (c: AdminComment) => void;
  onApprove: (id: string) => void;
  onDelete: (c: AdminComment) => void;
}) {
  if (comments.length === 0) {
    return <EmptyState title="No comments" description="No matching comments." />;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Preview</th>
            <th>Status</th>
            <th>Posted</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id}>
              <td>
                <div className={styles.primary}>{c.user_name}</div>
                <div className={styles.muted}>{c.user_email}</div>
              </td>
              <td className={styles.preview}>
                <button
                  type="button"
                  className={styles.previewBtn}
                  onClick={() => onView(c)}
                  title="Click to view full comment"
                >
                  {c.comment_text.length > 80
                    ? `${c.comment_text.slice(0, 80)}…`
                    : c.comment_text}
                </button>
              </td>
              <td>
                <span
                  className={`${styles.tag} ${
                    c.approved ? styles.tagSuccess : styles.tagWarning
                  }`}
                >
                  {c.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td className={styles.muted}>
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => onView(c)}
                  >
                    View
                  </Button>
                  {!c.approved && (
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => onApprove(c.id)}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(c)}
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessagesTable({
  messages,
  onView,
  onDelete,
}: {
  messages: AdminMessage[];
  onView: (m: AdminMessage) => void;
  onDelete: (m: AdminMessage) => void;
}) {
  if (messages.length === 0) {
    return <EmptyState title="No messages" description="No matching messages." />;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>From</th>
            <th>Preview</th>
            <th>Received</th>
            <th>Status</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => (
            <tr
              key={m.id}
              className={!m.read ? styles.unread : undefined}
            >
              <td>
                <div className={styles.primary}>{m.name}</div>
                <div className={styles.muted}>{m.email}</div>
              </td>
              <td className={styles.preview}>
                <button
                  type="button"
                  className={styles.previewBtn}
                  onClick={() => onView(m)}
                  title="Click to view full message"
                >
                  {m.message.length > 100
                    ? `${m.message.slice(0, 100)}…`
                    : m.message}
                </button>
              </td>
              <td className={styles.muted}>
                {new Date(m.created_at).toLocaleDateString()}
              </td>
              <td>
                <span
                  className={`${styles.tag} ${
                    m.read ? styles.tagSuccess : styles.tagDanger
                  }`}
                >
                  {m.read ? 'Read' : 'Unread'}
                </span>
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button size="small" variant="ghost" onClick={() => onView(m)}>
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(m)}
                  >
                    <TrashIcon size={12} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Root component with ToastProvider ───────────────────

export default function Admin() {
  return (
    <ToastProvider>
      <AdminRoot />
    </ToastProvider>
  );
}

function AdminRoot() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(TOKEN_KEY),
  );

  function handleLogin(t: string) {
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return <AdminDashboard token={token} onLogout={logout} />;
}

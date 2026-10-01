import { useEffect, useMemo, useState, useCallback } from 'react';
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
  SpinnerIcon,
} from '../components/ui/Icon';
import { StatsOverview } from '../components/admin/StatsOverview';
import { ProjectFormModal } from '../components/admin/ProjectFormModal';
import { ArticleFormModal } from '../components/admin/ArticleFormModal';
import {
  CommentDetailModal,
  MessageDetailModal,
} from '../components/admin/DetailModals';
import { ChangelogFormModal } from '../components/admin/ChangelogFormModal';
import { StudioLogFormModal } from '../components/admin/StudioLogFormModal';
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
  deleteStudioLogEntry,
  fetchAdminArticles,
  fetchAdminComments,
  fetchAdminMessages,
  fetchAdminProjects,
  fetchAdminStudioLog,
  fetchStats,
  markMessageRead,
  exportBackup,
  restoreBackup,
  generateMcpToken,
  type AdminArticle,
  type AdminComment,
  type AdminMessage,
  type AdminProject,
  type AdminStudioLogEntry,
  type McpTokenResponse,
  type Stats,
} from '../lib/api';
import styles from './Admin.module.css';

const TOKEN_KEY = 'dzd_admin_token';

type Tab = 'projects' | 'articles' | 'studio-log' | 'comments' | 'messages' | 'backup' | 'mcp';

type DeleteTarget =
  | { kind: 'project'; id: string; name: string }
  | { kind: 'article'; id: string; title: string }
  | { kind: 'comment'; id: string }
  | { kind: 'message'; id: string; name: string }
  | { kind: 'studio-log'; id: string; title: string }
  | null;

interface ProjectFormTarget {
  mode: 'create' | 'edit';
  project: AdminProject | null;
}

interface ArticleFormTarget {
  mode: 'create' | 'edit';
  article: AdminArticle | null;
}

interface StudioLogFormTarget {
  mode: 'create' | 'edit';
  entry: AdminStudioLogEntry | null;
}

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
          ? 'Incorrect password'
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
      <div className={styles.loginHeader}>
        <img
          src="/dzd-logo.png"
          alt="DemonZ Development"
          className={styles.loginBadge}
        />
        <h2 className={styles.loginTitle}>DemonZ Admin</h2>
        <p className={styles.loginSubtext}>
          Enter your password to continue.
        </p>
      </div>

      {error && <div className={styles.loginError}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••••••"
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

function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  useDocumentTitle('DemonZ Admin');

  const toast = useToast();
  const [tab, setTab] = useState<Tab>('projects');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [studioLog, setStudioLog] = useState<AdminStudioLogEntry[]>([]);

  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormTarget | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleFormTarget | null>(null);
  const [studioLogForm, setStudioLogForm] = useState<StudioLogFormTarget | null>(null);
  const [viewComment, setViewComment] = useState<AdminComment | null>(null);
  const [viewMessage, setViewMessage] = useState<AdminMessage | null>(null);
  const [changelogProject, setChangelogProject] = useState<AdminProject | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fetchStats();
      setStats(s);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadTabData = useCallback(async () => {
    setTabLoading(true);
    setTabError(false);
    try {
      if (tab === 'projects') {
        const data = await fetchAdminProjects(token);
        setProjects(data);
      } else if (tab === 'articles') {
        const data = await fetchAdminArticles(token);
        setArticles(data);
      } else if (tab === 'comments') {
        const data = await fetchAdminComments(token);
        setComments(data);
      } else if (tab === 'messages') {
        const data = await fetchAdminMessages(token);
        setMessages(data);
      } else if (tab === 'studio-log') {
        const data = await fetchAdminStudioLog(token);
        setStudioLog(data);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onLogout();
        return;
      }
      setTabError(true);
      toast.error('Failed to load data');
    } finally {
      setTabLoading(false);
    }
  }, [token, tab, onLogout, toast]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  async function handleRefreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([loadStats(), loadTabData()]);
      toast.success('Refreshed');
    } finally {
      setRefreshing(false);
    }
  }

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
        (c.user_email ?? '').toLowerCase().includes(q) ||
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

  const filteredStudioLog = useMemo(() => {
    if (!search.trim()) return studioLog;
    const q = search.toLowerCase();
    return studioLog.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.entry_date.toLowerCase().includes(q),
    );
  }, [studioLog, search]);

  const pendingCommentCount = comments.filter((c) => !c.approved).length;
  const unreadMessageCount = messages.filter((m) => !m.read).length;

  async function handleApproveComment(id: string) {
    try {
      await approveComment(token, id);
      setComments((cs) =>
        cs.map((c) => (c.id === id ? { ...c, approved: true } : c)),
      );
      toast.success('Comment approved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve comment');
    }
  }

  async function handleOpenMessage(m: AdminMessage) {
    setViewMessage(m);
    if (!m.read) {
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      try {
        await markMessageRead(token, m.id);
      } catch {
        setMessages((ms) =>
          ms.map((x) => (x.id === m.id ? { ...x, read: false } : x)),
        );
        toast.error('Failed to mark message read');
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

  function handleStudioLogSaved(saved: AdminStudioLogEntry, isNew: boolean) {
    if (isNew) {
      setStudioLog((es) => [saved, ...es]);
    } else {
      setStudioLog((es) => es.map((e) => (e.id === saved.id ? saved : e)));
    }
    setStudioLogForm(null);
  }

  async function performDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      if (target.kind === 'project') {
        await deleteProject(token, target.id);
        setProjects((ps) => ps.filter((p) => p.id !== target.id));
        toast.success('Project removed');
      } else if (target.kind === 'article') {
        await deleteArticle(token, target.id);
        setArticles((as) => as.filter((a) => a.id !== target.id));
        toast.success('Article removed');
      } else if (target.kind === 'comment') {
        await deleteComment(token, target.id);
        setComments((cs) => cs.filter((c) => c.id !== target.id));
        toast.success('Comment removed');
      } else if (target.kind === 'message') {
        await deleteMessage(token, target.id);
        setMessages((ms) => ms.filter((m) => m.id !== target.id));
        toast.success('Message removed');
      } else if (target.kind === 'studio-log') {
        await deleteStudioLogEntry(token, target.id);
        setStudioLog((es) => es.filter((e) => e.id !== target.id));
        toast.success('Studio log entry removed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function getDeleteDescription(): string {
    if (!deleteTarget) return '';
    switch (deleteTarget.kind) {
      case 'project':
        return `Delete project "${deleteTarget.name}"? This action cannot be reverted.`;
      case 'article':
        return `Delete article "${deleteTarget.title}"? This action cannot be reverted.`;
      case 'comment':
        return 'Delete this comment record? This action cannot be reverted.';
      case 'message':
        return `Delete message from "${deleteTarget.name}"? This action cannot be reverted.`;
      case 'studio-log':
        return `Delete studio log entry "${deleteTarget.title}"? This action cannot be reverted.`;
    }
  }

  const tabCount = {
    projects: projects.length,
    articles: articles.length,
    'studio-log': studioLog.length,
    comments: comments.length,
    messages: messages.length,
    backup: 0,
    mcp: 0,
  };

  const currentFilteredCount =
    tab === 'projects'
      ? filteredProjects.length
      : tab === 'articles'
        ? filteredArticles.length
        : tab === 'studio-log'
          ? filteredStudioLog.length
          : tab === 'comments'
            ? filteredComments.length
            : tab === 'messages'
              ? filteredMessages.length
              : 0;

  return (
    <div className={styles.page}>
      <header className={styles.commandBar}>
        <div className={styles.commandBarInner}>
          <div className={styles.brandCluster}>
            <img
              src="/dzd-logo.png"
              alt="DemonZ Logo"
              className={styles.brandLogo}
            />
            <div className={styles.brandTitles}>
              <span className={styles.brandName}>DemonZ</span>
              <span className={styles.brandBadge}>Admin</span>
            </div>
          </div>

          <div className={styles.topActionsCluster}>
            <a
              href="https://demonz.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.siteLink}
            >
              demonz.org ↗
            </a>
            <button
              type="button"
              className={styles.syncBtn}
              onClick={handleRefreshAll}
              disabled={refreshing || tabLoading}
              title="Refresh data"
            >
              {refreshing ? <SpinnerIcon size={12} /> : '↻'} Refresh
            </button>
            <Button variant="ghost" size="small" onClick={onLogout}>
              <LogoutIcon size={14} /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Manage projects, articles, comments, messages, and MCP access.
            </p>
          </div>
        </div>

        {statsLoading && !stats ? (
          <LoadingState label="Loading overview…" />
        ) : stats ? (
          <StatsOverview
            projectCount={stats.projectCount}
            articleCount={stats.articleCount}
            pendingComments={pendingCommentCount}
            unreadMessages={unreadMessageCount}
            totalDownloads={stats.totalDownloads}
            onSelectTab={(selectedTab) => {
              setTab(selectedTab);
              setSearch('');
            }}
          />
        ) : null}

        <div className={styles.tabsWrap} role="tablist">
          {(
            [
              'projects',
              'articles',
              'studio-log',
              'comments',
              'messages',
              'backup',
              'mcp',
            ] as Tab[]
          ).map((t) => {
            const isAlert =
              (t === 'comments' && pendingCommentCount > 0) ||
              (t === 'messages' && unreadMessageCount > 0);
            const alertCount =
              t === 'comments'
                ? pendingCommentCount
                : t === 'messages'
                  ? unreadMessageCount
                  : 0;

            const label =
              t === 'studio-log'
                ? 'Studio Log'
                : t === 'backup'
                  ? 'Backup & Data'
                  : t === 'mcp'
                    ? 'MCP Server'
                    : t.charAt(0).toUpperCase() + t.slice(1);

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
                {label}
                {t !== 'backup' && t !== 'mcp' && (
                  <span
                    className={`${styles.tabBadge} ${
                      isAlert ? styles.tabBadgeAlert : ''
                    }`}
                  >
                    {isAlert ? alertCount : tabCount[t]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab !== 'backup' && tab !== 'mcp' && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon} aria-hidden="true">
                  <SearchIcon size={14} />
                </span>
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder={
                    tab === 'projects'
                      ? 'Search projects…'
                      : tab === 'articles'
                        ? 'Search articles…'
                        : tab === 'studio-log'
                          ? 'Search studio logs…'
                          : tab === 'comments'
                            ? 'Search comments…'
                            : 'Search messages…'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={`Search ${tab}`}
                />
                {search && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className={styles.itemCountBadge}>
                {search
                  ? `${currentFilteredCount} of ${tabCount[tab]} found`
                  : `${tabCount[tab]} total`}
              </span>
            </div>

            <div className={styles.toolbarRight}>
              {tab === 'projects' && (
                <Button
                  size="small"
                  onClick={() => setProjectForm({ mode: 'create', project: null })}
                >
                  <PlusIcon size={14} /> Add Project
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
              {tab === 'studio-log' && (
                <Button
                  size="small"
                  onClick={() => setStudioLogForm({ mode: 'create', entry: null })}
                >
                  <PlusIcon size={14} /> New Log Entry
                </Button>
              )}
            </div>
          </div>
        )}

        {tabLoading ? (
          <LoadingState label={`Loading ${tab}…`} />
        ) : tabError ? (
          <EmptyState
            title="Failed to Load Data"
            description="Could not connect to the API. Please try again."
          />
        ) : tab === 'projects' ? (
          <ProjectsTable
            projects={filteredProjects}
            onEdit={(p) => setProjectForm({ mode: 'edit', project: p })}
            onDelete={(p) =>
              setDeleteTarget({ kind: 'project', id: p.id, name: p.name })
            }
            onManageChangelog={(p) => setChangelogProject(p)}
          />
        ) : tab === 'articles' ? (
          <ArticlesTable
            articles={filteredArticles}
            onEdit={(a) => setArticleForm({ mode: 'edit', article: a })}
            onDelete={(a) =>
              setDeleteTarget({ kind: 'article', id: a.id, title: a.title })
            }
          />
        ) : tab === 'studio-log' ? (
          <StudioLogTable
            entries={filteredStudioLog}
            onEdit={(e) => setStudioLogForm({ mode: 'edit', entry: e })}
            onDelete={(e) =>
              setDeleteTarget({ kind: 'studio-log', id: e.id, title: e.title })
            }
          />
        ) : tab === 'comments' ? (
          <CommentsTable
            comments={filteredComments}
            onView={(c) => setViewComment(c)}
            onApprove={handleApproveComment}
            onDelete={(c) => setDeleteTarget({ kind: 'comment', id: c.id })}
          />
        ) : tab === 'backup' ? (
          <BackupSection token={token} />
        ) : tab === 'mcp' ? (
          <McpSection token={token} />
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

      {changelogProject && (
        <ChangelogFormModal
          open={changelogProject !== null}
          token={token}
          project={changelogProject}
          onClose={() => setChangelogProject(null)}
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

      {studioLogForm && (
        <StudioLogFormModal
          open={studioLogForm !== null}
          token={token}
          entry={studioLogForm.entry}
          onClose={() => setStudioLogForm(null)}
          onSaved={handleStudioLogSaved}
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

function ProjectsTable({
  projects,
  onEdit,
  onDelete,
  onManageChangelog,
}: {
  projects: AdminProject[];
  onEdit: (p: AdminProject) => void;
  onDelete: (p: AdminProject) => void;
  onManageChangelog: (p: AdminProject) => void;
}) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Add your first project to get started."
      />
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Project</th>
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
                <span className={styles.slugChip}>{p.slug}</span>
              </td>
              <td>
                <span className={`${styles.tag} ${styles.tagAccent}`}>
                  {p.category}
                </span>
              </td>
              <td>
                <span className={styles.monoNumber}>
                  {(p.downloads ?? 0).toLocaleString()}
                </span>
              </td>
              <td>
                {p.is_featured ? (
                  <span className={`${styles.tag} ${styles.tagAccent}`}>
                    <span className={styles.tagDot} />
                    Featured
                  </span>
                ) : (
                  <span className={styles.mutedDash}>—</span>
                )}
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => onManageChangelog(p)}
                    title="Manage changelog"
                  >
                    Changelog
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => onEdit(p)}
                    title="Edit project"
                  >
                    <EditIcon size={12} /> Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(p)}
                    title="Delete project"
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
    return (
      <EmptyState
        title="No articles yet"
        description="Write your first article to publish content."
      />
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Article</th>
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
                <span className={styles.slugChip}>{a.slug}</span>
              </td>
              <td>
                {a.category ? (
                  <span className={`${styles.tag} ${styles.tagAccent}`}>
                    {a.category}
                  </span>
                ) : (
                  <span className={styles.mutedDash}>—</span>
                )}
              </td>
              <td>
                <span
                  className={`${styles.tag} ${
                    a.published ? styles.tagSuccess : styles.tagWarning
                  }`}
                >
                  <span className={styles.tagDot} />
                  {a.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td>
                <span className={styles.monoDate}>
                  {new Date(a.updated_at).toLocaleDateString()}
                </span>
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => onEdit(a)}
                    title="Edit article"
                  >
                    <EditIcon size={12} /> Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(a)}
                    title="Delete article"
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
    return (
      <EmptyState
        title="No comments yet"
        description="User discussions will appear here for review."
      />
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Author</th>
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
                <span className={styles.monoDate}>{c.user_email}</span>
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
                  <span className={styles.tagDot} />
                  {c.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td>
                <span className={styles.monoDate}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
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
    return (
      <EmptyState
        title="No contact messages"
        description="Public contact submissions will register here."
      />
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sender</th>
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
                <span className={styles.monoDate}>{m.email}</span>
              </td>
              <td className={styles.preview}>
                <button
                  type="button"
                  className={styles.previewBtn}
                  onClick={() => onView(m)}
                  title="Click to view message"
                >
                  {m.message.length > 100
                    ? `${m.message.slice(0, 100)}…`
                    : m.message}
                </button>
              </td>
              <td>
                <span className={styles.monoDate}>
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </td>
              <td>
                <span
                  className={`${styles.tag} ${
                    m.read ? styles.tagSuccess : styles.tagDanger
                  }`}
                >
                  <span className={styles.tagDot} />
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

function StudioLogTable({
  entries,
  onEdit,
  onDelete,
}: {
  entries: AdminStudioLogEntry[];
  onEdit: (e: AdminStudioLogEntry) => void;
  onDelete: (e: AdminStudioLogEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No studio log entries"
        description="Add changelogs and studio notes to display on the timeline."
      />
    );
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Tag</th>
            <th>Title & Excerpt</th>
            <th>Status</th>
            <th>Order</th>
            <th className={styles.actionsCol}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>
                <span className={styles.monoDate}>{e.entry_date}</span>
              </td>
              <td>
                <span className={`${styles.tag} ${styles.tagAccent}`}>
                  {e.tag}
                </span>
              </td>
              <td>
                <div className={styles.primary}>{e.title}</div>
                <div className={styles.subtitle}>
                  {e.body.length > 90 ? `${e.body.slice(0, 90)}…` : e.body}
                </div>
              </td>
              <td>
                <span
                  className={`${styles.tag} ${
                    e.published ? styles.tagSuccess : styles.tagWarning
                  }`}
                >
                  <span className={styles.tagDot} />
                  {e.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td>
                <span className={styles.monoNumber}>{e.display_order}</span>
              </td>
              <td className={styles.actionsCol}>
                <div className={styles.actions}>
                  <Button size="small" variant="ghost" onClick={() => onEdit(e)}>
                    <EditIcon size={12} /> Edit
                  </Button>
                  <Button size="small" variant="danger" onClick={() => onDelete(e)}>
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

function BackupSection({ token }: { token: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await exportBackup(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dzd_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Database backup exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export backup');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;

      if (
        !window.confirm(
          'Restore database: This operation will overwrite matching table rows with backup data. Proceed?',
        )
      ) {
        return;
      }

      setRestoring(true);
      try {
        const backupData = JSON.parse(text);
        const res = await restoreBackup(token, backupData);
        toast.success(res.message || 'Database restored successfully');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to restore backup');
      } finally {
        setRestoring(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className={styles.backupContainer}>
      <div className={styles.backupCard}>
        <div className={styles.backupHeader}>
          <h3 className={styles.backupCardTitle}>Export Database Backup</h3>
        </div>
        <p className={styles.backupCardText}>
          Download a complete JSON export of projects, changelogs, articles,
          comments, studio notes, and messages.
        </p>
        <div>
          <Button onClick={handleExport} disabled={loading || restoring}>
            {loading ? 'Exporting…' : 'Export Backup JSON'}
          </Button>
        </div>
      </div>

      <div className={styles.backupCard}>
        <div className={styles.backupHeader}>
          <h3 className={styles.backupCardTitle}>Restore Database Backup</h3>
        </div>
        <p className={styles.backupCardText}>
          Select a previously exported JSON backup file to restore database records.
        </p>
        <div className={styles.restoreActions}>
          <label className={styles.fileInputLabel}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={loading || restoring}
              style={{ display: 'none' }}
            />
            {restoring ? 'Restoring Snapshot…' : 'Select Backup File & Restore'}
          </label>
        </div>
      </div>
    </div>
  );
}

function McpSection({ token }: { token: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [mcpData, setMcpData] = useState<McpTokenResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  async function handleGenerateKey() {
    setLoading(true);
    try {
      const data = await generateMcpToken(token);
      setMcpData(data);
      toast.success('Generated 12-hour MCP secret key');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate key');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyKey() {
    if (!mcpData?.token) return;
    navigator.clipboard.writeText(mcpData.token);
    setCopiedKey(true);
    toast.success('MCP key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  }

  const sampleConfig = useMemo(() => {
    const key = mcpData?.token || '<GENERATE_12H_KEY_ABOVE>';
    return JSON.stringify(
      {
        mcpServers: {
          demonz: {
            command: 'npx',
            args: [
              '-y',
              'mcp-remote',
              mcpData?.server_url || 'https://dzd-api.demonzdevelopment.workers.dev/api/mcp',
              '--header',
              `Authorization: Bearer ${key}`,
            ],
          },
        },
      },
      null,
      2,
    );
  }, [mcpData]);

  function handleCopyConfig() {
    navigator.clipboard.writeText(sampleConfig);
    setCopiedConfig(true);
    toast.success('MCP config copied to clipboard');
    setTimeout(() => setCopiedConfig(false), 2000);
  }

  const tools = [
    { name: 'dzd_list_projects', desc: 'List software projects, games, and tools with download counts' },
    { name: 'dzd_get_project', desc: 'Get detailed project information, download URLs, and changelogs' },
    { name: 'dzd_check_update', desc: 'Check for software updates against an installed client version' },
    { name: 'dzd_list_articles', desc: 'Browse published technical articles, tutorials, and posts' },
    { name: 'dzd_get_article', desc: 'Read full markdown content of any published article' },
    { name: 'dzd_search', desc: 'Search projects and articles across the entire knowledge base' },
    { name: 'dzd_get_stats', desc: 'Get live project counts, article counts, and download metrics' },
    { name: 'dzd_list_unread_messages', desc: 'List unread user contact and inquiry messages' },
    { name: 'dzd_list_pending_comments', desc: 'List user comments awaiting admin moderation' },
    { name: 'dzd_approve_comment', desc: 'Approve pending comments for public display' },
    { name: 'dzd_update_project_version', desc: 'Update a project release version string' },
    { name: 'dzd_create_changelog', desc: 'Publish release notes and version changelogs' },
  ];

  return (
    <div className={styles.mcpContainer}>
      <div className={styles.mcpCard}>
        <div className={styles.mcpHeader}>
          <div>
            <h3 className={styles.mcpCardTitle}>12-Hour Secret Access Key</h3>
            <p className={styles.mcpCardText}>
              Generate a temporary secret key for team members to authenticate their local MCP clients.
              For security, each key automatically expires after 12 hours.
            </p>
          </div>
          <Button onClick={handleGenerateKey} disabled={loading}>
            {loading ? <SpinnerIcon size={14} /> : null}
            {mcpData ? 'Regenerate 12h Key' : 'Generate 12-Hour Key'}
          </Button>
        </div>

        {mcpData && (
          <div className={styles.tokenSection}>
            <div className={styles.tokenBox}>
              <span className={styles.tokenValue}>{mcpData.token}</span>
              <Button size="small" variant="ghost" onClick={handleCopyKey}>
                {copiedKey ? 'Copied ✓' : 'Copy Key'}
              </Button>
            </div>
            <div className={styles.tokenMeta}>
              <span className={styles.tokenBadge}>Expires in 12 hours</span>
              <span>
                Valid until {new Date(mcpData.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(mcpData.expires_at).toLocaleDateString()})
              </span>
              <span>Endpoint: {mcpData.server_url}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.mcpCard}>
        <div className={styles.mcpHeader}>
          <div>
            <h3 className={styles.mcpCardTitle}>Client Configuration (Claude Desktop / Cursor)</h3>
            <p className={styles.mcpCardText}>
              Add this block to your <code>claude_desktop_config.json</code> or your agent's MCP settings to connect.
            </p>
          </div>
          <Button size="small" variant="ghost" onClick={handleCopyConfig}>
            {copiedConfig ? 'Copied ✓' : 'Copy Config'}
          </Button>
        </div>
        <pre className={styles.configBlock}>{sampleConfig}</pre>
      </div>

      <div className={styles.mcpCard}>
        <div className={styles.mcpHeader}>
          <div>
            <h3 className={styles.mcpCardTitle}>Available MCP Tools ({tools.length})</h3>
            <p className={styles.mcpCardText}>
              Connected agents and team members can invoke these tools to inspect and manage DemonZ Development content:
            </p>
          </div>
        </div>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <div key={tool.name} className={styles.toolCard}>
              <div className={styles.toolName}>{tool.name}</div>
              <p className={styles.toolDesc}>{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

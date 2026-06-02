import { useState, useEffect, type FormEvent } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const API_BASE = import.meta.env.VITE_API_URL || 'https://dzd-api.demonzdevelopment.workers.dev';

type Tab = 'projects' | 'articles' | 'comments' | 'messages';

interface AdminProject {
  id: string;
  slug: string;
  name: string;
  category: string;
  downloads: number;
}
interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  category: string | null;
  published_at: string | null;
  updated_at: string;
}
interface AdminComment {
  id: string;
  user_name: string;
  user_email: string;
  comment_text: string;
  approved: boolean;
  created_at: string;
}
interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', paddingTop: '90px' },
  container: { maxWidth: 1000, margin: '0 auto', padding: '0 20px 80px' },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2.2rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 32,
  },
  loginWrap: {
    maxWidth: 400,
    margin: '80px auto',
    padding: 40,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
  },
  loginTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.6rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: '0.9rem',
    marginBottom: 12,
    textAlign: 'center',
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid var(--color-border)',
    marginBottom: 24,
  },
  tab: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--color-accent)',
    borderBottomColor: 'var(--color-accent)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    color: 'var(--color-text)',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgeGreen: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  badgeYellow: { background: 'rgba(234,179,8,0.15)', color: '#eab308' },
  badgeRed: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  actions: { display: 'flex', gap: 6 },
  empty: {
    padding: 40,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  logoutBtn: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    color: 'var(--color-text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  statusCell: {
    cursor: 'pointer',
  },
};

async function adminFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) throw new Error('Unauthorized');
  return res;
}

export default function Admin() {
  useDocumentTitle('Admin | DemonZ Development');

  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem('dzd_admin_token'),
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('projects');
  const [confirmDelete, setConfirmDelete] = useState<
    | { kind: 'project'; id: string; name: string }
    | { kind: 'comment'; id: string }
    | null
  >(null);

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError('Invalid credentials');
        return;
      }
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem('dzd_admin_token', t);
    } catch {
      setLoginError('Connection error');
    }
  };

  const logout = () => {
    setToken(null);
    sessionStorage.removeItem('dzd_admin_token');
  };

  // Load data for current tab
  useEffect(() => {
    if (!token) return;
    let active = true;
    const load = async () => {
      try {
        if (tab === 'projects') {
          const res = await adminFetch('/projects', token);
          if (res.ok && active) setProjects(await res.json());
        } else if (tab === 'articles') {
          // Use the dedicated admin route that returns published + drafts.
          const res = await adminFetch('/admin/articles', token);
          if (res.ok && active) setArticles(await res.json());
        } else if (tab === 'comments') {
          const res = await adminFetch('/admin/comments', token);
          if (res.ok && active) setComments(await res.json());
        } else if (tab === 'messages') {
          const res = await adminFetch('/admin/messages', token);
          if (res.ok && active) setMessages(await res.json());
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'Unauthorized') logout();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token, tab]);

  const approveComment = async (id: string) => {
    if (!token) return;
    await adminFetch(`/admin/comments/${id}/approve`, token, { method: 'PUT' });
    setComments((c) => c.map((x) => (x.id === id ? { ...x, approved: true } : x)));
  };

  const performDelete = async () => {
    if (!token || !confirmDelete) return;
    if (confirmDelete.kind === 'project') {
      await adminFetch(`/admin/projects/${confirmDelete.id}`, token, {
        method: 'DELETE',
      });
      setProjects((p) => p.filter((x) => x.id !== confirmDelete.id));
    } else if (confirmDelete.kind === 'comment') {
      await adminFetch(`/admin/comments/${confirmDelete.id}`, token, {
        method: 'DELETE',
      });
      setComments((c) => c.filter((x) => x.id !== confirmDelete.id));
    }
    setConfirmDelete(null);
  };

  const markRead = async (id: string) => {
    if (!token) return;
    await adminFetch(`/admin/messages/${id}/read`, token, { method: 'PUT' });
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.loginWrap}>
          <h2 style={s.loginTitle}>Admin Login</h2>
          {loginError && <p style={s.error}>{loginError}</p>}
          <form onSubmit={handleLogin}>
            <input
              style={s.input}
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" style={{ width: '100%' }}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.headerRow}>
          <h1 style={{ ...s.title, marginBottom: 0 }}>Admin Dashboard</h1>
          <button style={s.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        <div style={s.tabs} role="tablist">
          {(['projects', 'articles', 'comments', 'messages'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'comments' &&
                comments.filter((c) => !c.approved).length > 0 && (
                  <span style={{ ...s.badge, ...s.badgeYellow, marginLeft: 6 }}>
                    {comments.filter((c) => !c.approved).length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {tab === 'projects' &&
          (projects.length === 0 ? (
            <div style={s.empty}>No projects yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Downloads</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...s.badgeGreen }}>{p.category}</span>
                    </td>
                    <td style={s.td}>{p.downloads}</td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() =>
                            setConfirmDelete({ kind: 'project', id: p.id, name: p.name })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {tab === 'articles' &&
          (articles.length === 0 ? (
            <div style={s.empty}>No articles yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td style={s.td}>{a.title}</td>
                    <td style={s.td}>{a.category || '—'}</td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(a.published ? s.badgeGreen : s.badgeYellow),
                        }}
                      >
                        {a.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {tab === 'comments' &&
          (comments.length === 0 ? (
            <div style={s.empty}>No comments yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>User</th>
                  <th style={s.th}>Comment</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c.id}>
                    <td style={s.td}>
                      {c.user_name}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {c.user_email}
                      </span>
                    </td>
                    <td
                      style={{
                        ...s.td,
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.comment_text}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(c.approved ? s.badgeGreen : s.badgeYellow),
                        }}
                      >
                        {c.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        {!c.approved && (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => approveComment(c.id)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() =>
                            setConfirmDelete({ kind: 'comment', id: c.id })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}

        {tab === 'messages' &&
          (messages.length === 0 ? (
            <div style={s.empty}>No messages yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>From</th>
                  <th style={s.th}>Message</th>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => markRead(m.id)}
                    style={s.statusCell}
                  >
                    <td style={s.td}>
                      {m.name}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {m.email}
                      </span>
                    </td>
                    <td style={{ ...s.td, maxWidth: 400 }}>
                      {m.message.substring(0, 120)}
                      {m.message.length > 120 ? '...' : ''}
                    </td>
                    <td style={s.td}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td style={s.td}>
                      <span
                        style={{
                          ...s.badge,
                          ...(m.read ? s.badgeGreen : s.badgeRed),
                        }}
                      >
                        {m.read ? 'Read' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete?"
        description={
          confirmDelete?.kind === 'project'
            ? `Delete "${confirmDelete.name}"? This cannot be undone.`
            : 'Delete this comment? This cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, CloseIcon } from './ui/Icon';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface SearchResult {
  type: 'project' | 'article' | 'page';
  title: string;
  subtitle?: string;
  path: string;
}

const STATIC_PAGES: SearchResult[] = [
  { type: 'page', title: 'Home', path: '/' },
  { type: 'page', title: 'Project Store', path: '/projects' },
  { type: 'page', title: 'Articles & News', path: '/articles' },
  { type: 'page', title: 'Privacy Policy', path: '/privacy' },
  { type: 'page', title: 'Terms of Service', path: '/terms' },
  { type: 'page', title: 'Admin Dashboard', path: '/admin' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'https://dzd-api.demonzdevelopment.workers.dev/api';

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    width: '100%',
    maxWidth: 560,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'scaleIn 0.15s ease',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-border)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '1.05rem',
  },
  kbd: {
    padding: '2px 8px',
    borderRadius: 4,
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
  results: {
    maxHeight: 360,
    overflowY: 'auto',
    padding: '8px 0',
  },
  group: {
    padding: '8px 20px 4px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  itemActive: { background: 'var(--color-surface-elevated)' },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-surface-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: '0.95rem', color: 'var(--color-text)', fontWeight: 500 },
  itemSub: { fontSize: '0.8rem', color: 'var(--color-text-secondary)' },
  empty: {
    padding: '32px 20px',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
  },
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'var(--color-accent)',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
    zIndex: 999,
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(STATIC_PAGES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const containerRef = useFocusTrap<HTMLDivElement>(open);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults(STATIC_PAGES);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(
        STATIC_PAGES.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())),
      );
      return;
    }

    const pageResults = STATIC_PAGES.filter((p) =>
      p.title.toLowerCase().includes(q.toLowerCase()),
    );

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        const projectResults: SearchResult[] = (data.projects || []).map(
          (p: { slug: string; name: string; tagline: string }) => ({
            type: 'project' as const,
            title: p.name,
            subtitle: p.tagline,
            path: `/projects/${p.slug}`,
          }),
        );
        const articleResults: SearchResult[] = (data.articles || []).map(
          (a: { slug: string; title: string; category: string }) => ({
            type: 'article' as const,
            title: a.title,
            subtitle: a.category,
            path: `/articles/${a.slug}`,
          }),
        );
        setResults([...pageResults, ...projectResults, ...articleResults]);
      } else {
        setResults(pageResults);
      }
    } catch {
      setResults(pageResults);
    }
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 200);
    return () => clearTimeout(timeout);
  }, [query, search]);

  const select = (result: SearchResult) => {
    setOpen(false);
    navigate(result.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      select(results[activeIndex]);
    }
  };

  const icons: Record<string, string> = { project: '📦', article: '📝', page: '📄' };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key =
      r.type === 'project' ? 'Projects' : r.type === 'article' ? 'Articles' : 'Pages';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <>
      <button
        ref={fabRef}
        style={{ ...s.fab, display: isMobile ? 'flex' : 'none' }}
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        🔍
      </button>

      {open && (
        <div
          style={s.overlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={containerRef}
            style={s.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
          >
            <div style={s.inputWrap}>
              <SearchIcon size={18} />
              <input
                ref={inputRef}
                style={s.input}
                type="text"
                placeholder="Search projects, articles, pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search query"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close search"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <CloseIcon size={18} />
              </button>
              <span style={s.kbd}>Esc</span>
            </div>
            <div style={s.results} role="listbox">
              {results.length === 0 ? (
                <div style={s.empty}>No results found.</div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div style={s.group}>{group}</div>
                    {items.map((r) => {
                      const idx = flatIndex++;
                      return (
                        <div
                          key={r.path}
                          role="option"
                          aria-selected={idx === activeIndex}
                          style={{ ...s.item, ...(idx === activeIndex ? s.itemActive : {}) }}
                          onClick={() => select(r)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <div style={s.itemIcon}>{icons[r.type]}</div>
                          <div style={s.itemText}>
                            <div style={s.itemTitle}>{r.title}</div>
                            {r.subtitle && <div style={s.itemSub}>{r.subtitle}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

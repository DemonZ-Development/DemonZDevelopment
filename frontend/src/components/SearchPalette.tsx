import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSite, type SearchResult } from '../lib/api';
import { SearchIcon, CloseIcon } from './ui/Icon';
import s from './SearchPalette.module.css';

interface Hit {
  label: string;
  sub?: string;
  to: string;
}

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults(null);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let active = true;
    const t = setTimeout(() => {
      searchSite(q)
        .then((r) => {
          if (active) setResults(r);
        })
        .catch(() => {
          if (active) setResults({ projects: [], articles: [] });
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  const hits: Hit[] = useMemo(() => {
    const out: Hit[] = [];
    for (const p of results?.projects ?? []) {
      out.push({ label: p.name, sub: p.tagline, to: `/projects/${p.slug}` });
    }
    for (const a of results?.articles ?? []) {
      out.push({ label: a.title, sub: a.category ?? 'Article', to: `/articles/${a.slug}` });
    }
    return out;
  }, [results]);

  if (!open) return null;

  const go = (hit: Hit) => {
    setOpen(false);
    navigate(hit.to);
  };

  return (
    <div
      className={s.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className={s.palette} role="dialog" aria-modal="true" aria-label="Site search">
        <div className={s.inputRow}>
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            type="text"
            className={s.input}
            placeholder="Search projects and articles…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter' && hits[active]) {
                go(hits[active]);
              }
            }}
          />
          <button className={s.close} onClick={() => setOpen(false)} aria-label="Close search">
            <CloseIcon size={16} />
          </button>
        </div>
        {hits.length > 0 && (
          <ul className={s.hits} role="listbox">
            {hits.map((hit, i) => (
              <li key={`${hit.to}-${i}`}>
                <button
                  className={`${s.hit} ${i === active ? s.hitActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit)}
                >
                  <span className={s.hitLabel}>{hit.label}</span>
                  {hit.sub && <span className={s.hitSub}>{hit.sub}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {results !== null && hits.length === 0 && (
          <p className={s.empty}>No results for “{query}”.</p>
        )}
        <div className={s.hint}>
          <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close
        </div>
      </div>
    </div>
  );
}

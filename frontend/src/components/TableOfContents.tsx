import { useEffect, useState, useMemo } from 'react';
import styles from './TableOfContents.module.css';

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    const regex = /^(##|###)\s+(.*)$/gm;
    const matches = Array.from(content.matchAll(regex));
    return matches.map((match) => {
      const level = match[1].length;
      let text = match[2].trim();
      // Remove GitHub alerts prefixes if any
      text = text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
      // Simple slugify matching rehype-slug
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return { id, text, level };
    });
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    // Wait a tick for markdown to render
    setTimeout(() => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc}>
      <h3 className={styles.title}>On this page</h3>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${styles.item} ${heading.level === 3 ? styles.nested : ''}`}
          >
            <a
              href={`#${heading.id}`}
              className={`${styles.link} ${activeId === heading.id ? styles.active : ''}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

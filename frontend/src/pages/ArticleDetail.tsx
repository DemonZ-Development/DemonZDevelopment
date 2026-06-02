import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle, type Article } from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LoadingState, ErrorState } from '../components/ui/State';
import s from './ArticleDetail.module.css';

function getReadingTime(content: string | null | undefined): string {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    const matches = [
      boldMatch ? { type: 'bold', index: boldMatch.index!, match: boldMatch } : null,
      codeMatch ? { type: 'code', index: codeMatch.index!, match: codeMatch } : null,
      linkMatch ? { type: 'link', index: linkMatch.index!, match: linkMatch } : null,
    ]
      .filter((m): m is { type: string; index: number; match: RegExpMatchArray } => m !== null)
      .sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0];
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === 'bold') {
      parts.push(
        <strong key={key++} className={s.bold}>
          {first.match[1]}
        </strong>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === 'code') {
      parts.push(
        <code key={key++} className={s.inlineCode}>
          {first.match[1]}
        </code>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === 'link') {
      parts.push(
        <a
          key={key++}
          href={first.match[2]}
          className={s.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {first.match[1]}
        </a>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className={s.h3}>
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className={s.h2}>
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className={s.h2}>
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        let quoteLine = lines[i].slice(1);
        if (quoteLine.startsWith(' ')) {
          quoteLine = quoteLine.slice(1);
        }
        quoteLines.push(quoteLine);
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className={s.blockquote}>
          {quoteLines.map((ql, idx) => (
            <p key={idx} className={s.paragraph}>
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++; // skip opening backticks
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        i++; // skip closing backticks
      }
      elements.push(
        <pre key={`code-${i}`} className={s.codeBlock}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Unordered lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className={s.listUl}>
          {listItems.map((item, idx) => (
            <li key={idx} className={s.listItem}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className={s.listOl}>
          {listItems.map((item, idx) => (
            <li key={idx} className={s.listItem}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Plain text paragraphs (collect contiguous text lines)
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('* ') &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    elements.push(
      <p key={`p-${i}`} className={s.paragraph}>
        {renderInline(paragraphLines.join(' '))}
      </p>
    );
  }

  return elements;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchArticle(slug)
      .then((data) => {
        setArticle(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useDocumentTitle(
    article
      ? `${article.title} | DemonZ Development`
      : 'Article | DemonZ Development',
  );

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.loading}>
          <LoadingState label="Loading article" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={s.page}>
        <div className={`${s.container} ${s.error}`}>
          <ErrorState
            title="Article Not Found"
            description="The article you're looking for doesn't exist."
          />
          <Link to="/articles" className={s.link} style={{ marginTop: 16, display: 'inline-block' }}>
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.container}>
        <Link to="/articles" className={s.backLink}>
          ← Back to Articles
        </Link>

        <article className={s.glassContainer}>
          <header className={s.header}>
            {article.category && <span className={s.badge}>{article.category}</span>}
            <h1 className={s.title}>{article.title}</h1>
            <div className={s.meta}>
              <span>
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </span>
              <span className={s.bullet}>•</span>
              <span>{getReadingTime(article.content)}</span>
            </div>
          </header>

          {article.image_url && (
            <img src={article.image_url} alt={article.title} className={s.heroImage} />
          )}

          <div className={s.content}>{renderMarkdown(article.content)}</div>
        </article>
      </div>
    </div>
  );
}

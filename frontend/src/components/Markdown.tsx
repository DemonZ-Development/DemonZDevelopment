import React from 'react';
import s from './Markdown.module.css';

interface MarkdownProps {
  content: string | null | undefined;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*(.+?)\*/);
    const underscoreItalicMatch = remaining.match(/_(.+?)_/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const imageMatch = remaining.match(/!\[(.+?)\]\((.+?)\)/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    const matches = [
      boldMatch ? { type: 'bold', index: boldMatch.index!, match: boldMatch } : null,
      italicMatch ? { type: 'italic', index: italicMatch.index!, match: italicMatch } : null,
      underscoreItalicMatch ? { type: 'italic', index: underscoreItalicMatch.index!, match: underscoreItalicMatch } : null,
      codeMatch ? { type: 'code', index: codeMatch.index!, match: codeMatch } : null,
      imageMatch ? { type: 'image', index: imageMatch.index!, match: imageMatch } : null,
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
    } else if (first.type === 'italic') {
      parts.push(
        <em key={key++}>
          {first.match[1]}
        </em>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === 'code') {
      parts.push(
        <code key={key++} className={s.inlineCode}>
          {first.match[1]}
        </code>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === 'image') {
      parts.push(
        <img
          key={key++}
          src={first.match[2]}
          alt={first.match[1]}
          className={s.contentImage}
        />
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

function parseMarkdown(text: string): React.ReactNode[] {
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

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className={s.hr} />);
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
        <h1 key={`h1-${i}`} className={s.h1}>
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
      !lines[i].trim().startsWith('---') &&
      !lines[i].trim().startsWith('***') &&
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

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;
  return <div className={s.content}>{parseMarkdown(content)}</div>;
}

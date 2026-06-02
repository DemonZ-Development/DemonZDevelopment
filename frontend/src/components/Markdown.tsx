import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkGithubAlerts from 'remark-github-alerts';
import s from './Markdown.module.css';

interface MarkdownProps {
  content: string | null | undefined;
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  return (
    <div className={s.content}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGithubAlerts]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: ({ ...props }) => <h1 className={s.h1} {...props} />,
          h2: ({ ...props }) => <h2 className={s.h2} {...props} />,
          h3: ({ ...props }) => <h3 className={s.h3} {...props} />,
          p: ({ ...props }) => <p className={s.paragraph} {...props} />,
          ul: ({ ...props }) => <ul className={s.listUl} {...props} />,
          ol: ({ ...props }) => <ol className={s.listOl} {...props} />,
          li: ({ ...props }) => <li className={s.listItem} {...props} />,
          blockquote: ({ ...props }) => <blockquote className={s.blockquote} {...props} />,
          pre: ({ ...props }) => <pre className={s.codeBlock} {...props} />,
          code: ({ className, ...props }) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className={s.inlineCode} {...props} />
            ) : (
              <code className={className} {...props} />
            );
          },
          a: ({ ...props }) => <a className={s.link} target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ ...props }) => <img className={s.contentImage} loading="lazy" {...props} />,
          hr: ({ ...props }) => <hr className={s.hr} {...props} />,
          table: ({ ...props }) => <div className={s.tableWrapper}><table className={s.table} {...props} /></div>,
          th: ({ ...props }) => <th className={s.th} {...props} />,
          td: ({ ...props }) => <td className={s.td} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

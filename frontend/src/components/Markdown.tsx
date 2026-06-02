import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import s from './Markdown.module.css';

interface MarkdownProps {
  content: string | null | undefined;
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  return (
    <div className={s.content}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => <h1 className={s.h1} {...props} />,
          h2: ({ node, ...props }) => <h2 className={s.h2} {...props} />,
          h3: ({ node, ...props }) => <h3 className={s.h3} {...props} />,
          p: ({ node, ...props }) => <p className={s.paragraph} {...props} />,
          ul: ({ node, ...props }) => <ul className={s.listUl} {...props} />,
          ol: ({ node, ...props }) => <ol className={s.listOl} {...props} />,
          li: ({ node, ...props }) => <li className={s.listItem} {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className={s.blockquote} {...props} />,
          pre: ({ node, ...props }) => <pre className={s.codeBlock} {...props} />,
          code: ({ node, className, ...props }) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className={s.inlineCode} {...props} />
            ) : (
              <code className={className} {...props} />
            );
          },
          a: ({ node, ...props }) => <a className={s.link} target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ node, ...props }) => <img className={s.contentImage} loading="lazy" {...props} />,
          hr: ({ node, ...props }) => <hr className={s.hr} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

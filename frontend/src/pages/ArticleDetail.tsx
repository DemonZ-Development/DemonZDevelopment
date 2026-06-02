import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle, type Article } from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LoadingState, ErrorState } from '../components/ui/State';
import Markdown from '../components/Markdown';
import s from './ArticleDetail.module.css';

function getReadingTime(content: string | null | undefined): string {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
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

          <div className={s.content}><Markdown content={article.content} /></div>
        </article>
      </div>
    </div>
  );
}

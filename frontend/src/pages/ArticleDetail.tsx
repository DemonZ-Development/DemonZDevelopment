import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchArticle } from '../lib/api';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import TableOfContents from '../components/TableOfContents';
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

  const { data: article, isLoading: loading, isError: error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticle(slug!),
    enabled: !!slug,
  });

  if (loading) {
    return (
      <PageTransition className={s.page}>
        <div className={s.loading}>
          <LoadingState label="Loading article" />
        </div>
      </PageTransition>
    );
  }

  if (error || !article) {
    return (
      <PageTransition className={s.page}>
        <SEO title="Article Not Found" noindex={true} />
        <div className={`${s.container} ${s.error}`}>
          <ErrorState
            title="Article Not Found"
            description="The article you're looking for doesn't exist."
          />
          <Link to="/articles" className={s.link} style={{ marginTop: 16, display: 'inline-block' }}>
            ← Back to Articles
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className={s.page}>
      <SEO 
        title={article.title}
        description={article.summary}
        image={article.image_url || undefined}
        url={`https://demonzdevelopment.online/articles/${article.slug}`}
        type="article"
      />
      <div className={s.container}>
        <Link to="/articles" className={s.backLink}>
          ← Back to Articles
        </Link>

        <div className={s.layoutWrapper}>
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
              <img
                src={article.image_url}
                alt={article.title}
                className={`${s.heroImage} ${article.image_url.endsWith('.svg') && article.image_url.includes('logo') ? s.imageSvg : ''}`}
              />
            )}

            <div className={s.content}><Markdown content={article.content} /></div>
          </article>

          <aside className={s.sidebar}>
            <TableOfContents content={article.content} />
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}

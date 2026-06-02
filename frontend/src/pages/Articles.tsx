import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, type Article } from '../lib/api';
import ScrollReveal from '../components/ScrollReveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EmptyState, LoadingState } from '../components/ui/State';
import s from './Articles.module.css';

const CATS = ['all', 'Tutorial', 'Announcement', 'Tech News'] as const;

function getReadingTime(content: string | null | undefined): string {
  if (!content) return '1 min read';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useDocumentTitle('Articles | DemonZ Development');

  useEffect(() => {
    setLoading(true);
    fetchArticles(category !== 'all' ? category : undefined)
      .then((data) => {
        // Sort articles by published_at or created_at desc to ensure latest is first
        const sorted = [...data].sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime();
          const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        setArticles(sorted);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category]);

  // Client-side search filtering
  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query)) ||
      (article.category && article.category.toLowerCase().includes(query))
    );
  });

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <h1 className={s.heroTitle}>Articles</h1>
        <p className={s.heroSub}>Tutorials, announcements, and insights from the team.</p>
      </section>

      <div className={s.controls}>
        <div className={s.searchBox}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
            />
          </svg>
        </div>

        <div className={s.chips}>
          {CATS.map((cat) => (
            <button
              key={cat}
              className={`${s.chip} ${category === cat ? s.chipActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading articles" />
      ) : filteredArticles.length === 0 ? (
        <div className={s.empty}>
          <EmptyState
            title="No articles found"
            description="Try adjusting your search or category."
          />
        </div>
      ) : (
        <>
          {/* Featured Articles */}
          {featuredArticle && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>Featured Articles</h2>
                <p className={s.sectionSubtitle}>Handpicked insights and announcements</p>
              </div>
              <ScrollReveal>
                <Link to={`/articles/${featuredArticle.slug}`} className={s.featuredCardLink}>
                  <article className={s.featuredCard}>
                    <div className={s.featuredImageContainer}>
                      {featuredArticle.image_url ? (
                        <img
                          src={featuredArticle.image_url}
                          alt={featuredArticle.title}
                          className={s.featuredImage}
                        />
                      ) : (
                        <div className={s.featuredPlaceholder}>📝</div>
                      )}
                    </div>
                    <div className={s.featuredBody}>
                      {featuredArticle.category && (
                        <span className={s.badge}>{featuredArticle.category}</span>
                      )}
                      <h3 className={s.featuredTitle}>{featuredArticle.title}</h3>
                      <p className={s.featuredSummary}>{featuredArticle.summary}</p>
                      <div className={s.featuredMeta}>
                        <span>
                          {featuredArticle.published_at
                            ? new Date(featuredArticle.published_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                        <span className={s.bullet}>•</span>
                        <span>{getReadingTime(featuredArticle.content)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </ScrollReveal>
            </section>
          )}

          {/* All Articles */}
          {remainingArticles.length > 0 && (
            <section className={s.section}>
              <div className={s.sectionHeader}>
                <h2 className={s.sectionTitle}>All Articles</h2>
                <p className={s.sectionSubtitle}>Browse our library of tutorials and news</p>
              </div>
              <div className={s.grid}>
                {remainingArticles.map((article) => (
                  <ScrollReveal key={article.id}>
                    <Link to={`/articles/${article.slug}`} className={s.cardLink}>
                      <article className={s.card}>
                        <div className={s.cardImageContainer}>
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className={s.cardImage}
                            />
                          ) : (
                            <div className={s.cardPlaceholder}>📝</div>
                          )}
                        </div>
                        <div className={s.cardBody}>
                          <h3 className={s.cardTitle}>{article.title}</h3>
                          <p className={s.cardSummary}>{article.summary}</p>
                          <div className={s.cardMeta}>
                            <span>
                              {article.published_at
                                ? new Date(article.published_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : ''}
                            </span>
                            <span>{getReadingTime(article.content)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}


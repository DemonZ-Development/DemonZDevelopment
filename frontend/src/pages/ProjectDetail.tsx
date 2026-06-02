import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProject, apiUrl } from '../lib/api';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import ChangelogTimeline from '../components/ChangelogTimeline';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState } from '../components/ui/State';
import { DownloadIcon, ArrowRightIcon } from '../components/ui/Icon';
import styles from './ProjectDetail.module.css';

type TabType = 'overview' | 'changelog';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<TabType>('overview');
  const queryClient = useQueryClient();

  const { data: project, isLoading: loading, isError: error } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => fetchProject(slug!),
    enabled: !!slug,
  });

  const handleDownloadClick = () => {
    if (!slug) return;
    // Optimistically update download count in UI
    queryClient.setQueryData(['project', slug], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        downloads: (old.downloads ?? 0) + 1,
      };
    });

    // Invalidate project and stats queries to fetch fresh counts in the background
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['project', slug] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }, 1500);
  };

  // Per-project structured data (SoftwareApplication). Only rendered once
  // we have the project loaded.
  const projectJsonLd = project
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: project.name,
        description: project.description,
        url: `https://demonzdevelopment.online/projects/${project.slug}`,
        applicationCategory: project.category,
        softwareVersion: project.version,
        image: project.image_url ?? undefined,
        downloadUrl: project.redirect_url ?? undefined,
        author: {
          '@type': 'Organization',
          name: project.author || 'DemonZ Development',
        },
      })
    : null;

  if (loading) {
    return (
      <PageTransition className={styles.page}>
        <div className={styles.container} style={{ minHeight: 400, display: 'flex', alignItems: 'center' }}>
          <LoadingState label="Loading project" />
        </div>
      </PageTransition>
    );
  }

  if (error || !project) {
    return (
      <PageTransition className={styles.page}>
        <div className={styles.container}>
          <ErrorState
            title="Project Not Found"
            description="The project you're looking for doesn't exist or has been removed."
            className={styles.error}
          />
          <div style={{ textAlign: 'center' }}>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <Button>
                <ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // We always route downloads through the backend tracker to increment download stats.
  const downloadUrl = apiUrl(`/projects/download/${project.slug}`);

  return (
    <PageTransition className={styles.page}>
      <SEO 
        title={project.name}
        description={project.tagline}
        image={project.image_url || undefined}
        url={`https://demonzdevelopment.online/projects/${project.slug}`}
      />
      {projectJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: projectJsonLd }}
        />
      )}
      <div className={styles.container}>
        <Link to="/projects" className={styles.backLink}>
          ← Back to Projects
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.imageWrap}>
            {project.image_url ? (
              <img src={project.image_url} alt={project.name} className={styles.image} />
            ) : (
              '📦'
            )}
          </div>
          <div className={styles.info}>
            <h1 className={styles.name}>{project.name}</h1>
            <p className={styles.tagline}>{project.tagline}</p>
            <div className={styles.metaRow}>
              <span className={styles.badge}>{project.category}</span>
              <span className={styles.versionBadge}>v{project.version}</span>
              <span className={styles.downloads}>
                <DownloadIcon size={14} />
                {project.downloads?.toLocaleString() || 0} downloads
              </span>
            </div>
            <div className={styles.actions}>
              <a
                href={downloadUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
                style={{ textDecoration: 'none' }}
              >
                <DownloadIcon size={16} />
                Download
              </a>
              {project.source_url && (
                <a
                  href={project.source_url}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  View Source
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {(['overview', 'changelog'] as TabType[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.body}>
          <div className={styles.mainCol}>
            {tab === 'overview' && (
              <div className={styles.description}><Markdown content={project.description} /></div>
            )}
            {tab === 'changelog' && <ChangelogTimeline projectSlug={project.slug} />}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Project Info</h3>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>Author</span>
                <span className={styles.sidebarValue}>{project.author || 'Unknown'}</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>Category</span>
                <span className={styles.sidebarValue}>{project.category}</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>Version</span>
                <span className={styles.sidebarValue}>{project.version}</span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>Created</span>
                <span className={styles.sidebarValue}>
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.sidebarItem}>
                <span className={styles.sidebarLabel}>Updated</span>
                <span className={styles.sidebarValue}>
                  {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
